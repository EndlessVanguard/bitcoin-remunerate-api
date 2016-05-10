const bitcoin = require('bitcoinjs-lib')
const filter = require('lodash/fp/filter')
const get = require('lodash/fp/get')
const isNil = require('lodash/fp/isNil')
const mapValues = require('lodash/fp/mapValues')
const assoc = require('lodash/fp/assoc')

const isValid = require('utils/isValid')
const redisDb = require('config/redis')
const validates = require('utils/validates')

const redisKey = 'invoice'

const Invoice = {

  // validation

  properties: Object.freeze({
    createdAt: validates.errorsInJavascriptTimestamp,
    address: validates.errorsInBitcoinAddress,
    contentId: validates.errorsInContentId,
    privateKey: validates.errorsInBitcoinPrivateKey,
    paymentTimestamp: validates.optional(validates.errorsInJavascriptTimestamp)
  }),

  errorsInInvoice: (invoiceData) => isValid.errorsInRecord(invoiceData, Invoice.properties),

  isValidInvoice: (invoiceData) => isValid.isValidRecord(invoiceData, Invoice.properties),

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

  save: (invoice) => (
    new Promise((resolve, reject) => {
      if (Invoice.isValidInvoice(invoice)) {
        redisDb.hset(redisKey, invoice.address, JSON.stringify(invoice), (error) => (
          error ? reject(error) : resolve(invoice)))
      } else {
        reject(Invoice.errorsInInvoice(invoice))
      }
    })
  ),

  // helpers

  create: (contentId) => {
    // TODO: this should be coming from a pool of prepared keys
    const keypair = bitcoin.ECPair.makeRandom()

    return {
      contentId,
      address: keypair.getAddress(),
      privateKey: keypair.toWIF(),
      createdAt: Date.now()
    }
  },

  isAddressAndContentPaired: (address, contentId) => (
    Invoice.find(address)
      .then((invoice) => !isNil(invoice) && (invoice.contentId === contentId))
  ),

  isPaid: (invoice) => validates.isInteger(get('paymentTimestamp', invoice)),

  markInvoiceAsPaid: assoc('paymentTimestamp', Date.now())

}

module.exports = Invoice
