const isNil = require('lodash/isNil')
const filter = require('lodash/fp/filter')
const mapValues = require('lodash/fp/mapValues')

const isValid = require('utils/isValid')
const redisDb = require('config/redis')
const validates = require('utils/validates')

const redisKey = 'invoice'

const Invoice = {
  properties: Object.freeze({
    address: validates.errorsInBitcoinAddress,
    contentId: validates.errorsInString,
    privateKey: validates.errorsInPrivateKey,
    paymentTimestamp: validates.optional(validates.errorsInInteger)
  }),

  // database
  find: (address) => (
    new Promise((resolve, reject) => (
      redisDb.hget(redisKey, address, (error, invoiceData) => (
        error ? reject(error) : resolve(JSON.parse(invoiceData))))
    ))
  ),
  findAll: (contentId) => (
    new Promise((resolve, reject) => (
      redisDb.hgetall(redisKey, (error, invoiceMap) => (
        error ? reject(error) : resolve(mapValues(JSON.parse, invoiceMap))))
    )).then(filter((invoice) => invoice.contentId === contentId))
  ),
  save: (data) => (
    new Promise((resolve, reject) => {
      if (Invoice.isValidInvoice(data)) {
        redisDb.hset(redisKey, data.address, JSON.stringify(data), (error) => (
          error ? reject(error) : resolve(data)))
      } else {
        reject(Invoice.errorsInInvoice(data))
      }
    })
  ),

  // helpers
  isAddressAndContentPaired: (address, contentId) => (
    Invoice.find(address)
      .then((invoice) => !isNil(invoice) && (invoice.contentId === contentId))
  ),

  markAsPaid: (address) => (
    Invoice.find(address)
      .then((invoiceRecord) => {
        if (!invoiceRecord.paymentTimestamp) {
          invoiceRecord.paymentTimestamp = Date.now()
          return Invoice.save(invoiceRecord)
        }
      })
  ),

  // TODO: have a pool of keypairs available
  newKeypair: (contentId) => {
    const bitcoin = require('bitcoinjs-lib')
    // generate a keypair
    const keypair = bitcoin.ECPair.makeRandom()
    const address = keypair.getAddress()
    const privateKey = keypair.toWIF()

    Invoice.save({
      address,
      contentId,
      privateKey
    })

    return address
  },

  // validation
  errorsInInvoice: (invoiceData) => isValid.errorsInRecord(invoiceData, Invoice.properties),
  isValidInvoice: (invoiceData) => isValid.isValidRecord(invoiceData, Invoice.properties)
}

module.exports = Invoice
