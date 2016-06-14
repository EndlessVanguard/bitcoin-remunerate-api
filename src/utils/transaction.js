const async = require('async')
const bitcoin = require('bitcoinjs-lib')
const compose = require('lodash/fp/compose')
const filter = require('lodash/fp/filter')
const flatMap = require('lodash/fp/flatMap')
const get = require('lodash/fp/get')
const isEqual = require('lodash/fp/isEqual')
const merge = require('lodash/fp/merge')
const set = require('lodash/fp/set')

const blockchainApi = require('../utils/blockchainApi')
const Content = require('../records/Content')
const Invoice = require('../records/Invoice')
const trace = require('../utils/trace')
const validates = require('../utils/validates')

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
  const UTXO = transactionInfo.UTXO
  const payoutAddress = transactionInfo.payoutAddress
  const serviceAddress = transactionInfo.serviceAddress

  console.assert(UTXO.length > 0, 'UTXO is empty')
  console.assert(validates.isBitcoinAddress(payoutAddress),
                 'payoutAddress must be valid Bitcoin Address', payoutAddress)
  console.assert(validates.isBitcoinAddress(serviceAddress),
                 'serviceAddress must be valid Bitcoin Address', serviceAddress)

  const tx = new bitcoin.TransactionBuilder()

  UTXO.forEach((output) => tx.addInput(output.hash, output.n))

  const totalPayout = UTXO.reduce((sum, x) => sum + x['value'], 0)
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

  UTXO.forEach((input, index) => {
    const keyPair = bitcoin.ECPair.fromWIF(input.privateKey)
    tx.sign(index, keyPair)
  })

  return tx.build().toHex()
}

// returns all unspent transaction outputs
// annotated with the transaction hash and the Content privateKey
const getUTXO = flatMap((invoice) => (
  flatMap((tx) => (
    flatMap(
      compose(set('hash', tx.hash), set('privateKey', invoice.privateKey)),
      filter(
        (out) => (!out.spent && isEqual(out.addr, invoice.address)),
        tx.out))),
          invoice.txs)
))

// add finalBalance, lastTransaction to every input
// Fetch and merge all TX data we need as input in our transactions
const addBlockchainInformationToInvoices = (invoiceList) => (
  new Promise((resolve, reject) => (
    async.mapLimit(invoiceList, 5,
                   async.asyncify(compose(blockchainApi.getAddress, get('address'))),
                   (err, txInfo) => err ? reject(txInfo) : resolve(txInfo)
                  )
  )).then(merge(invoiceList))
)

const payoutContent = (contentId) => (
  Invoice.findAll(contentId)
    .then(filter(Invoice.isPaid))
    .then(addBlockchainInformationToInvoices)
    .then(filter((invoice) => invoice.final_balance > 0))
    .then((invoiceList) => (
      Content.find(contentId).then((content) => ({
        UTXO: getUTXO(invoiceList),
        payoutAddress: content.payoutAddress,
        serviceAddress: serviceAddress()
      }))
    ))
    .then(buildTransaction)
    .then(trace('transaction: Broadcasting'))
    .then(blockchainApi.broadcastTransaction)
    .then(trace('transacton: Message from blockchain.info'))
)

module.exports = {
  addBlockchainInformationToInvoices,
  buildTransaction,
  calculateFee,
  getUTXO,
  payoutContent
}
