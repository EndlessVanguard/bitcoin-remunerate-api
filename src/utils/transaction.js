const isString = require('lodash/isString')
const isArray = require('lodash/isArray')
const isObject = require('lodash/isObject')

const fetch = {
  contentAddresses: (contentId) => {
    const redisDb = require('../config/redis')
    return new Promise((resolve, reject) => {
      redisDb.keys('*', (err, data) => { // TODO this is blocking, and you need to REPENT! ✞
        if (err) reject(err)
        resolve(data)
      })
    })
  },
  getLastTransactionId: (inputData, callback) => {
    var bitcoinPrivateKeyWIF = inputData.privateKey
    const blockchainApi = require('./blockchainApi')
    const bitcoin = require('bitcoinjs-lib')
    const address = bitcoin.ECPair.fromWIF(bitcoinPrivateKeyWIF).getAddress()
    bitcoinPrivateKeyWIF = undefined

    return blockchainApi.lookup(address)
    .then((addressInfo) => callback(null, addressInfo))
    .catch((err) => callback(err, null))
  },
  getInput: (bitcoinAddress) => {
    const redisDb = require('../config/redis')
    return new Promise((resolve, reject) => {
      redisDb.get(bitcoinAddress, (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })
  },
  inputsList: (contentId) => {
    // To get inputsList, we need to first fetch all the keys.
    // For each key, we need to fetch redisDb.get for that key
    return fetch.contentAddresses(contentId).then((addresses) => {
      return Promise.all(
        addresses.map((address) => {
          return fetch.getInput(address).then(JSON.parse)
        })
      )
    })
  },
  contentPayoutAddress: (contentId) => {
    const contentDb = require('../../config/content-database')
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

function calculateFee (total) {
  // TODO: is 1% a fair way to calculate the miner's fee?
  return {
    payout: (total * 0.9),
    service: (total * 0.09),
    miner: (total * 0.01)
  }
}

function buildTransaction (transactionInfo) {
  const bitcoin = require('bitcoinjs-lib')
  const inputsList = transactionInfo.inputsList
  const payoutAddress = transactionInfo.payoutAddress
  const serviceAddress = transactionInfo.serviceAddress
  var tx = new bitcoin.TransactionBuilder()
  console.assert(isArray(inputsList), 'TypeError: inputsList not an Array')
  console.assert(isString(payoutAddress) && isString(serviceAddress))
  inputsList.forEach((input, index) => {
    tx.addInput(input.lastTransaction, index)
  })

  const amount = calculateFee(
    inputsList.reduce((sum, x) => sum + x.finalBalance, 0)
  )

  if (amount.payout > 0) {
    tx.addOutput(payoutAddress, amount.payout)
  }
  if (amount.service > 0) {
    tx.addOutput(serviceAddress, amount.service)
  }

  inputsList.forEach((input, index) => {
    var keyPair = bitcoin.ECPair.fromWIF(input.privateKey)
    tx.sign(index, keyPair)
  })
  return tx.build().toHex()
}

function isValidInput (inputObj) {
  if (!isObject(inputObj)) { return false }
  // type test of transaction input
  if (!('finalBalance' in inputObj)) { return false }
  if (!('privateKey' in inputObj)) { return false }
  if (!('lastTransaction' in inputObj)) { return false }
  return true
}

function addBlockchainInformationToInputs (inputsList) {
  const async = require('async')
  // Fetch and merge all TX data we need as input in our transactions
  return new Promise((resolve, reject) => {
    async.mapLimit(inputsList, 5, fetch.getLastTransactionId, (err, transactionInfo) => {
      if (!err) {
        resolve(
          transactionInfo.map((txInfo) => {
            return JSON.parse(txInfo.body)
          })
        )
      } else {
        reject(transactionInfo)
        console.log('err!')
      }
    })
  }).then((listOfTxInfo) => {
    // Merge the results of getLastTransactionId with inputsList
    return inputsList.map((input, index) => {
      if ('paymentTimestamp' in input) {
        var newInput = input
        newInput.finalBalance = listOfTxInfo[index].final_balance
        // TODO make sure txs[0] is the newest, not oldest
        newInput.lastTransaction = listOfTxInfo[index].txs[0].hash
        console.assert(isValidInput(newInput))

        return newInput
      } else { return false }
    })
  })
}

function payoutContent (contentId) {
  // side effecty. Pays out all outstanding balances we owe to contentId
  const blockchainApi = require('./blockchainApi')
  return fetch.inputsList(contentId)
  .then(addBlockchainInformationToInputs)
  .then((inputsList) => {
    return {
      inputsList: inputsList,
      payoutAddress: fetch.contentPayoutAddress(contentId),
      serviceAddress: fetch.serviceAddress()
    }
  })
  .then(buildTransaction)
  .then(blockchainApi.broadcastTransaction)
  .then((result) => {
    console.log('Message from blockchain.info:', result)
    return result
  })
}

module.exports = {
  addressesPaidWithinTimeRange: addressesPaidWithinTimeRange,
  buildTransaction: buildTransaction,
  calculateFee: calculateFee,
  payoutContent: payoutContent,
  isValidInput: isValidInput
}
