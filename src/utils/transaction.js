const isArray = require('lodash/isArray')
const isObject = require('lodash/isObject')
const Invoice = require('records/Invoice')
const Content = require('records/Content')
const filter = require('lodash/filter')
const validates = require('../utils/validates.js')

const fetch = {
  getLastTransactionId: (inputData, callback) => {
    var bitcoinPrivateKeyWIF = inputData.privateKey
    const blockchainApi = require('utils/blockchainApi')
    const bitcoin = require('bitcoinjs-lib')
    const address = bitcoin.ECPair.fromWIF(bitcoinPrivateKeyWIF).getAddress()
    bitcoinPrivateKeyWIF = undefined

    return blockchainApi.lookup(address)
      .then((addressInfo) => callback(null, addressInfo))
      .catch((err) => callback(err, null))
  },
  serviceAddress: () => {
    // TODO: we should calculate a new keypair, track it, and respond ꙲
    return '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
  }
}

function calculateFee (total) {
  const miners = 1000
  return {
    payout: ((total - miners) * 0.9),
    service: ((total - miners) * 0.09),
    miner: miners
  }
}

const bitcoin = require('bitcoinjs-lib')
function verifyKeypair (WIF, address) {
  var keyPair = bitcoin.ECPair.fromWIF(WIF)
  return keyPair.getAddress() === address
}

function buildTransaction (transactionInfo) {
  const inputsList = transactionInfo.inputsList
  const payoutAddress = transactionInfo.payoutAddress
  const serviceAddress = transactionInfo.serviceAddress
  var tx = new bitcoin.TransactionBuilder()
  console.assert(isArray(inputsList), 'TypeError: inputsList not an Array')
  console.assert(inputsList.length > 0, 'inputsList is empty')
  console.assert(validates.isBitcoinAddress(payoutAddress),
                 'payoutAddress must be valid Bitcoin Address', payoutAddress)
  console.assert(validates.isBitcoinAddress(serviceAddress),
                 'serviceAddress must be valid Bitcoin Address', serviceAddress)

  inputsList.forEach((input, index) => {
    console.assert(verifyKeypair(input.privateKey, input.address),
                   'keypair mismatch')
    tx.addInput(input.txs[0].hash, (index + 1))
  })

  const amount = calculateFee(
    inputsList.reduce((sum, x) => sum + x['final_balance'], 0)
  )
  console.assert(amount.payout > 0, 'Payout is empty, aborting. No money to pay out for this content right now')

  /* if (amount.payout > 0) {
     tx.addOutput(payoutAddress, amount.payout)
     } */

  if (amount.service > 0) {
    tx.addOutput(serviceAddress, amount.payout + amount.service) // fixme
  }

  inputsList.forEach((input, index) => {
    var keyPair = bitcoin.ECPair.fromWIF(input.privateKey)
    console.log('sign', (index + 1))
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

function addBlockchainInformationToInvoices (invoiceList) {
  // add finalBalance, lastTransaction to every input
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
        console.error('err!')
      }
    })
  })
  .then((listOfTxInfo) => {
    const merge = require('lodash/merge')
    return merge(invoiceList, listOfTxInfo)
  })
}

/* function pp (msg) {
   return function (x) {
   console.log('pp: ', msg, x)
   return x
   }
   } */

function payoutContent (contentId) {
  const blockchainApi = require('utils/blockchainApi')
  return Invoice.findAll(contentId)
    .then((addresses) => Promise.all(
      addresses.map((address) => Invoice.find(address))
    ))
    .then(addBlockchainInformationToInvoices)
    .then((invoiceList) => (filter(invoiceList, (invoice, index) => (
      invoice.n_tx > 0 && invoice.final_balance > 0 // I'm feeling Lispy
    ))))
    .then((inputsList) => {
      // Wish there was a better way to abort promise chains than throwing
      // It looks bad in the console for something that isn't an error
      console.assert(inputsList,
                     'No invoices with paymentTimestamp. No one to payout to.')

      return Content.findPromise(contentId).then((rawContent) => {
        const content = JSON.parse(rawContent)

        return {
          inputsList: inputsList.filter((x) => !!x), // filter undefined etc
          payoutAddress: content.payoutAddress,
          serviceAddress: fetch.serviceAddress()
        }
      })
    })
    .then(buildTransaction)
    .then(blockchainApi.broadcastTransaction)
    .then((result) => {
      console.log('Message from blockchain.info:', result)
      return result
    })
}

module.exports = {
  buildTransaction: buildTransaction,
  calculateFee: calculateFee,
  isValidInput: isValidInput,
  payoutContent: payoutContent
}
