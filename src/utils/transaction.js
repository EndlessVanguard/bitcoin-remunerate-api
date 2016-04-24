const async = require('async')
const isArray = require('lodash/isArray')
const filter = require('lodash/filter')
const merge = require('lodash/merge')
const compose = require('lodash/fp/compose')
const get = require('lodash/fp/get')

const Content = require('records/Content')
const Invoice = require('records/Invoice')
const validates = require('utils/validates.js')
const blockchainApi = require('utils/blockchainApi')

const fetch = {
  serviceAddress: () => {
    // TODO: we should calculate a new keypair, track it, and respond ꙲
    return '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
  }
}

// in Satoshi
const minimumPayoutBalance = 100000

function calculateFee (total) {
  const minersFee = 500
  return {
    payout: Math.floor((total - minersFee) * 0.91),
    service: Math.floor((total - minersFee) * 0.09)
  }
}

const bitcoin = require('bitcoinjs-lib')
function isKeypair (WIF, address) {
  const keyPair = bitcoin.ECPair.fromWIF(WIF)
  return keyPair.getAddress() === address
}

function buildTransaction (transactionInfo) {
  const inputsList = transactionInfo.inputsList
  const payoutAddress = transactionInfo.payoutAddress
  const serviceAddress = transactionInfo.serviceAddress
  const tx = new bitcoin.TransactionBuilder()
  console.assert(isArray(inputsList), 'TypeError: inputsList not an Array')
  console.assert(inputsList.length > 0, 'inputsList is empty')
  console.assert(validates.isBitcoinAddress(payoutAddress),
                 'payoutAddress must be valid Bitcoin Address', payoutAddress)
  console.assert(validates.isBitcoinAddress(serviceAddress),
                 'serviceAddress must be valid Bitcoin Address', serviceAddress)

  inputsList.forEach((input, index) => {
    console.assert(isKeypair(input.privateKey, input.address),
                   'keypair mismatch')
    tx.addInput(input.txs[0].hash, (index + 1))
  })

  const totalPayout = inputsList.reduce((sum, x) => sum + x['final_balance'], 0)
  console.assert(totalPayout > minimumPayoutBalance, `totalPayout ${totalPayout} is less than the minimumPayoutBalance ${minimumPayoutBalance}`)
  const amount = calculateFee(totalPayout)
  console.assert(amount.payout > 0, 'Payout is empty, aborting. No money to pay out for this content right now')

  /* if (amount.payout > 0) {
     tx.addOutput(payoutAddress, amount.payout)
     } */

  if (amount.service > 0) {
    tx.addOutput(serviceAddress, amount.payout + amount.service) // fixme
  }

  // THIS index is the lie that breaks transactions;
  inputsList.forEach((input, index) => {
    const keyPair = bitcoin.ECPair.fromWIF(input.privateKey)
    console.log('sign', (index + 1))
    tx.sign(index, keyPair)
  })
  return tx.build().toHex()
}

// add finalBalance, lastTransaction to every input
// Fetch and merge all TX data we need as input in our transactions
const addBlockchainInformationToInvoices = (invoiceList) => (
  new Promise((resolve, reject) => (async.mapLimit(
    invoiceList,
    5,
    async.asyncify(compose(blockchainApi.lookup, get('address'))),
    (error, transactionInfo) => error ? reject(transactionInfo) : resolve(transactionInfo)
  ))).then((transactionInfo) => merge(invoiceList, transactionInfo))
)

function payoutContent (contentId) {
  return Invoice.findAll(contentId)
    .then((invoices) => Promise.all(invoices.map(Invoice.find)))
    .then(addBlockchainInformationToInvoices)
    .then((invoiceList) => (filter(invoiceList, (invoice, index) => (
      invoice.n_tx > 0 && invoice.final_balance > 0 // I'm feeling Lispy
    ))))
    .then((inputsList) => {
      // Wish there was a better way to abort promise chains than throwing
      // It looks bad in the console for something that isn't an error
      console.assert(inputsList.length > 0,
                     'No invoices with paymentTimestamp. No one to payout to.')

      return Content.find(contentId).then((content) => ({
        inputsList: inputsList.filter((x) => !!x), // filter undefined etc
        payoutAddress: content.payoutAddress,
        serviceAddress: fetch.serviceAddress()
      }))
    })
    .then(buildTransaction)
    .then(blockchainApi.broadcastTransaction)
    .then((result) => {
      console.log('Message from blockchain.info:', result)
      return result
    })
}

module.exports = {
  addBlockchainInformationToInvoices: addBlockchainInformationToInvoices,
  buildTransaction: buildTransaction,
  calculateFee: calculateFee,
  payoutContent: payoutContent
}
