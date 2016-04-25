const validates = require('utils/validates')

const redisKey = 'invoice'
const isValid = require('utils/isValid')
const bitcoin = require('bitcoinjs-lib')
const assoc = require('lodash/fp/assoc')
const isNil = require('lodash/isNil')

const filter = require('lodash/fp/filter')
const mapValues = require('lodash/fp/mapValues')

const Invoice = {
  properties: Object.freeze({
    createdAt: validates.errorsInJavascriptTimestamp,
    address: validates.errorsInBitcoinAddress,
    contentId: validates.errorsInString,
    privateKey: validates.errorsInPrivateKey,
    paymentTimestamp: validates.optional(validates.errorsInJavascriptTimestamp)
  }),

  find: (address) => {
    const redisDb = require('config/redis')
    return new Promise((resolve, reject) => {
      redisDb.hget(redisKey, address, (error, invoiceData) => {
        if (error) reject(error)
        resolve(JSON.parse(invoiceData))
      })
    })
  },
  findAll: (contentId) => {
    const redisDb = require('config/redis')
    return new Promise((resolve, reject) => {
      redisDb.hgetall(redisKey, (error, invoiceMap) => {
        if (error) reject(error)
        resolve(mapValues(JSON.parse, invoiceMap))
      })
    })
      .then(filter((invoice) => invoice.contentId === contentId))
  },
  // MUTATING
  save: (invoice) => {
    // TODO this should return a promise, so we can check for errors
    const redisDb = require('config/redis')
    if (Invoice.isValidInvoice(invoice)) {
      redisDb.hset(redisKey, invoice.address, JSON.stringify(invoice))
      return true
    }
    return false
  },

  isAddressAndContentPaired: (address, contentId) => (
    Invoice.find(address)
      .then((invoice) => !isNil(invoice) && (invoice.contentId === contentId))),

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
