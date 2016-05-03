const assoc = require('lodash/fp/assoc')
const bitcoin = require('bitcoinjs-lib')
const filter = require('lodash/fp/filter')
const isNil = require('lodash/isNil')
const mapValues = require('lodash/fp/mapValues')
const get = require('lodash/fp/get')

const isValid = require('utils/isValid')
const validates = require('utils/validates')

const redisKey = 'invoice'

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
    const redisDb = require('config/redis')
    return new Promise((resolve, reject) => {
      if (Invoice.isValidInvoice(invoice)) {
        redisDb.hset(redisKey, invoice.address, JSON.stringify(invoice), (error) => {
          error ? reject(error) : resolve(invoice)
        })
      }
    })
  },

  isAddressAndContentPaired: (address, contentId) => (
    Invoice.find(address)
      .then((invoice) => !isNil(invoice) && (invoice.contentId === contentId))),

  markInvoiceAsPaid: (invoice) => assoc(invoice, 'paymentTimestamp', Date.now()),

  // FIXME I think this function is never used, except for in the test
  isPaid: (invoice) => validates.isInteger(get('paymentTimestamp', invoice)),

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
