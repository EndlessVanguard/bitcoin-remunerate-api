const isNil = require('lodash/isNil')
const filter = require('lodash/fp/filter')
const mapValues = require('lodash/fp/mapValues')
const get = require('lodash/fp/get')

const isValid = require('utils/isValid')
const redisDb = require('config/redis')
const validates = require('utils/validates')

const redisKey = 'invoice'
const bitcoin = require('bitcoinjs-lib')
const assoc = require('lodash/fp/assoc')

const Invoice = {
  properties: Object.freeze({
    createdAt: validates.errorsInJavascriptTimestamp,
    address: validates.errorsInBitcoinAddress,
    contentId: validates.errorsInString,
    privateKey: validates.errorsInPrivateKey,
    paymentTimestamp: validates.optional(validates.errorsInJavascriptTimestamp)
  }),

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
  save: (invoice) => {
    const redisDb = require('config/redis')
    return new Promise((resolve, reject) => {
      if (Invoice.isValidInvoice(invoice)) {
        redisDb.hset(redisKey, invoice.address, JSON.stringify(invoice), (error) => (
          error ? reject(error) : resolve(invoice)))
      } else {
        reject(Invoice.errorsInInvoice(invoice))
      }
    })
  },

  // helpers
  isAddressAndContentPaired: (address, contentId) => (
    Invoice.find(address)
      .then((invoice) => !isNil(invoice) && (invoice.contentId === contentId))
  ),

  isPaid: (invoice) => validates.isInteger(get('paymentTimestamp', invoice)),

  markAsPaid: (address) => (
    Invoice.find(address)
      .then((invoiceRecord) => {
        if (!invoiceRecord.paymentTimestamp) {
          invoiceRecord.paymentTimestamp = Date.now()
          return Invoice.save(invoiceRecord)
        }
        return false
      })
  ),

  markInvoiceAsPaid: (invoice) => assoc(invoice, 'paymentTimestamp', Date.now()),

  create: (contentId) => {
    const keypair = bitcoin.ECPair.makeRandom()
    const address = keypair.getAddress()
    const privateKey = keypair.toWIF()
    const createdAt = Date.now()

    return {
      address,
      contentId,
      privateKey,
      createdAt
    }
  },

  // validation
  errorsInInvoice: (invoiceData) => isValid.errorsInRecord(invoiceData, Invoice.properties),
  isValidInvoice: (invoiceData) => isValid.isValidRecord(invoiceData, Invoice.properties)
}

module.exports = Invoice
