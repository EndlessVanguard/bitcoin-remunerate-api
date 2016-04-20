const isString = require('lodash/isString')
const isArray = require('lodash/isArray')
const isObject = require('lodash/isObject')
const compact = require('lodash/compact')
const set = require('lodash/set')

// in Satoshi
// const minimumPayoutBalance = 100000
const minimumPayoutBalance = 2750

const fetch = {
  getLastTransactionId: (inputData, callback) => {
    var bitcoinPrivateKeyWIF = inputData.privateKey
    const blockchainApi = require('utils/blockchainApi')
    const bitcoin = require('bitcoinjs-lib')
    // console.log('getLastTransactionId', inputData)
    const address = bitcoin.ECPair.fromWIF(bitcoinPrivateKeyWIF).getAddress()
    bitcoinPrivateKeyWIF = undefined

    return blockchainApi.lookup(address)
      .then((addressInfo) => callback(null, addressInfo))
      .catch((err) => callback(err, null))
  },
  contentPayoutAddress: (contentId) => {
    const contentDb = require('config/content-database')
    if ('payoutAddress' in contentDb[contentId]) {
      return contentDb[contentId].payoutAddress
    }
  },
  serviceAddress: () => {
    // TODO: we should calculate a new keypair, track it, and respond ꙲
    return '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
  }
}

function addressesPaidWithinTimeRange (contentId, timestamps, inputsList) {
  // Return inputsList, to be passed to buildTransaction
  // inputsList is an array of objects
  // {
  //    lastTransaction: bitcoin transactionId hash,
  //    finalBalance: amount of satoshis,
  //    privateKey: The private key for this address,
  // }
  // TODO refactor this to only be the callback.
  // Someone else can do the inputsList.filter
  // Instead this function now has 2 purposes
  return inputsList.filter((record) => {
    console.assert(
      isObject(record),
      'TypeError: expected Object, got ' + (typeof record)
    )

    if (record.contentId === contentId) { return true }

    if (record.payment) {
      return record.payment.timestamp > timestamps.startTimestamp &&
             record.payment.timestamp < timestamps.stopTimestamp
    }
    return false
  })
}

// assumption is that upstream we have only allowed totals > 500
function calculateFee (total) {
  const minerFee = 500

  const feeMap = {
    payout: Math.floor((total - minerFee) * 0.91),
    service: Math.floor((total - minerFee) * 0.09)
  }
  return set(feeMap, 'miner', (total - (feeMap['payout'] + feeMap['service'])))
}

function buildTransaction (transactionInfo) {
  const bitcoin = require('bitcoinjs-lib')
  const inputsList = transactionInfo.inputsList
  const payoutAddress = transactionInfo.payoutAddress
  const serviceAddress = transactionInfo.serviceAddress
  const tx = new bitcoin.TransactionBuilder()
  console.assert(isArray(inputsList), 'TypeError: inputsList not an Array')
  console.assert(inputsList.length > 0, 'inputsList is empty')
  console.assert(isString(payoutAddress) && isString(serviceAddress))

  console.log('buildTransaction: addInput')
  inputsList.forEach((input, index) => {
    console.assert(input, 'can not build transaction, bad input')
    tx.addInput(input.lastTransaction, index)
  })

  console.log('buildTransaction: totalBalance')
  const totalBalance = inputsList.reduce((sum, x) => sum + x.finalBalance, 0)
  console.assert(totalBalance > minimumPayoutBalance, `totalBalance ${totalBalance} less than minimumPayoutBalance ${minimumPayoutBalance}`)

  console.log('buildTransaction: calculateFee')
  const amount = calculateFee(totalBalance)
  console.assert(amount.payout > 0, 'Payout is empty, aborting. No money to pay out for this content right now')

  console.log('buildTransaction: addOutput payoutAddress', amount.payout)
  if (amount.payout > 0) {
    tx.addOutput(payoutAddress, amount.payout)
  }
  console.log('buildTransaction: addOutput serviceAddress', amount.service)
  if (amount.service > 0) {
    tx.addOutput(serviceAddress, amount.service)
  }

  console.log('buildTransaction: sign')
  inputsList.forEach((input, index) => {
    const keyPair = bitcoin.ECPair.fromWIF(input.privateKey)
    tx.sign(index, keyPair)
  })
  console.log('buildTransaction: toHex')
  // return tx.build().toHex()
  const txRaw = tx.build()
  console.log(Object.keys(txRaw), typeof txRaw)
  return txRaw.toHex()
}

function isValidInput (inputObj) {
  if (!isObject(inputObj)) { return false }
  // type test of transaction input
  if (!('finalBalance' in inputObj)) { return false }
  if (!('privateKey' in inputObj)) { return false }
  if (!('lastTransaction' in inputObj)) { return false }
  return true
}

function addBlockchainInformationToInputs (invoiceList) {
  const async = require('async')
  // Fetch and merge all TX data we need as input in our transactions
  return new Promise((resolve, reject) => {
    async.mapLimit(invoiceList, 5, fetch.getLastTransactionId, (err, transactionInfo) => {
      if (!err) {
        resolve(
          transactionInfo.map((txInfo) => {
            return JSON.parse(txInfo.body)
          })
        )
      } else {
        reject(transactionInfo)
      }
    })
  }).then((rawListOfTxInfo) => {
    const listOfTxInfo = rawListOfTxInfo.filter((txInfo) => txInfo.txs.length > 0)

    if (listOfTxInfo.length < 1) {
      throw Error('listOfTxInfo is empty')
    }

    // Merge the results of getLastTransactionId with invoiceList
    return compact(
      invoiceList.map((invoice, index) => {
        if ('paymentTimestamp' in invoice) {
          if (listOfTxInfo[index] && 'final_balance' in listOfTxInfo[index]) {
            const txInput = invoice
            txInput.finalBalance = listOfTxInfo[index].final_balance

            // TODO make sure txs[0] is the newest, not oldest
            txInput.lastTransaction = listOfTxInfo[index].txs[0].hash
            console.assert(isValidInput(txInput), 'invalid txInput')

            return txInput
          }
        } else {
          return null
        }
      })
    )
  })
}

function payoutContent (contentId) {
  // side effecty. Pays out all outstanding balances we owe to contentId
  const blockchainApi = require('utils/blockchainApi')
  const Invoice = require('records/Invoice')
  const Content = require('records/Content')

  return Invoice.findAll(contentId)
    .then((addresses) => Promise.all(addresses.map(Invoice.find)))
    .then((addresses) => addresses.filter((address) => address.contentId === contentId))
    // TODO: check for empty addresses list
    .then(addBlockchainInformationToInputs)
    .then((inputsList) => {
      console.assert(inputsList, 'inputList is false after addBlockchainInformationToInputs')
      return {
        inputsList: inputsList.filter((x) => !!x),
        serviceAddress: fetch.serviceAddress()
      }
    })
    .then((transactionInfo) => (
      Content.find(contentId)
        .then((contentRecord) => set(transactionInfo, 'payoutAddress', contentRecord.payoutAddress))
    ))
    .then(buildTransaction)
    .then(blockchainApi.broadcastTransaction)
    .then((result) => {
      console.log('Message from blockchain.info:', result)
      return result
    })
    .catch((error) => console.error('payoutContent had an issue', error))
}

module.exports = {
  addressesPaidWithinTimeRange: addressesPaidWithinTimeRange,
  buildTransaction: buildTransaction,
  calculateFee: calculateFee,
  isValidInput: isValidInput,
  payoutContent: payoutContent
}
