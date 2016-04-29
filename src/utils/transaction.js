const async = require('async')
const bitcoin = require('bitcoinjs-lib')
const compose = require('lodash/fp/compose')
const filter = require('lodash/filter')
const get = require('lodash/fp/get')
const head = require('lodash/fp/head')
const isEqual = require('lodash/fp/isEqual')
const map = require('lodash/fp/map')
const merge = require('lodash/merge')
const set = require('lodash/set')
const uniq = require('lodash/fp/uniq')

const blockchainApi = require('utils/blockchainApi')
const Content = require('records/Content')
const Invoice = require('records/Invoice')
const trace = require('utils/trace')
const validates = require('utils/validates')

// TODO: we should calculate a new keypair, track it, and respond
const serviceAddress = () => '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'

// in Satoshi
const minimumPayoutBalance = 100000
const minersFee = 500

const calculateFee = (total) => ({
  payout: Math.floor((total - minersFee) * 0.91),
  service: Math.floor((total - minersFee) * 0.09)
})

const buildTransaction = (transactionInfo) => {
  const invoiceList = transactionInfo.inputsList
  const payoutAddress = transactionInfo.payoutAddress
  const serviceAddress = transactionInfo.serviceAddress
  console.assert(invoiceList.length > 0, 'invoiceList is empty')
  console.assert(validates.isBitcoinAddress(payoutAddress),
                 'payoutAddress must be valid Bitcoin Address', payoutAddress)
  console.assert(validates.isBitcoinAddress(serviceAddress),
                 'serviceAddress must be valid Bitcoin Address', serviceAddress)

  const tx = new bitcoin.TransactionBuilder()
  // Does 2 things - attach the TX hash to the output object (for convenience),
  // and returns all the tx outputs for all tx made to invoice
  var txo = (invoice) => (
    head(
      map((tx) => (map((out) => set(out, 'hash', tx.hash),
                       tx.out)),
          invoice.txs)))

  const myUtxo = (invoice) => (txo(invoice).filter((txo) => (
    !txo.spent && isEqual(txo.addr, invoice.address))))

  const listOfUTXO = (map(head, map(myUtxo, invoiceList)))
  listOfUTXO.forEach((utxo) => tx.addInput(utxo.hash, utxo.n))

  const totalPayout = invoiceList.reduce((sum, x) => sum + x['final_balance'], 0)
  console.assert(totalPayout > minimumPayoutBalance,
                 `totalPayout ${totalPayout} is less than the minimumPayoutBalance ${minimumPayoutBalance}`)
  const amount = calculateFee(totalPayout)
  console.assert(amount.payout > 0,
                 'Payout is empty, aborting. No money to pay out for this content right now')

  if (amount.payout > 0) {
    tx.addOutput(payoutAddress, amount.payout)
  }

  if (amount.service > 0) {
    tx.addOutput(serviceAddress, amount.service)
  }

  invoiceList.forEach((input, index) => {
    const keyPair = bitcoin.ECPair.fromWIF(input.privateKey)
    tx.sign(index, keyPair)
  })

  return tx.build().toHex()
}

const lookupAddressFromBlockchainApi = compose(blockchainApi.lookup, get('address'))

// add finalBalance, lastTransaction to every input
// Fetch and merge all TX data we need as input in our transactions
const addBlockchainInformationToInvoices = (invoiceList) => (
  new Promise((resolve, reject) => (
    async.mapLimit(invoiceList, 5,
      async.asyncify(lookupAddressFromBlockchainApi),
      (err, txInfo) => err ? reject(txInfo) : resolve(txInfo)
    )
  )).then((txInfo) => merge(invoiceList, txInfo))
)

const findInvoiceWithAddress = compose(Invoice.find, get('address'))

const payoutContent = (contentId) => (
  Invoice.findAll(contentId)
    .then((invoices) => Promise.all(map(findInvoiceWithAddress, invoices)))
    .then((invoices) => invoices.filter((invoice) => 'paymentTimestamp' in invoice))
    .then(uniq)
    .then(addBlockchainInformationToInvoices)
    .then((invoiceList) => filter(invoiceList, (invoice) => invoice.final_balance > 0))
    .then((inputsList) => (
      Content.find(contentId).then((content) => ({
        inputsList: inputsList.filter((x) => !!x), // filter undefined etc
        payoutAddress: content.payoutAddress,
        serviceAddress: serviceAddress()
      }))
    ))
    .then(buildTransaction)
    .then(trace('transaction: Broadcasting'))
    .then(blockchainApi.broadcastTransaction)
    .finally(trace('transacton: Message from blockchain.info'))
)

module.exports = {
  addBlockchainInformationToInvoices: addBlockchainInformationToInvoices,
  buildTransaction: buildTransaction,
  calculateFee: calculateFee,
  payoutContent: payoutContent
}
