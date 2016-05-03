const validates = require('utils/validates')

const redisKey = 'invoice'
const isValid = require('utils/isValid')
const bitcoin = require('bitcoinjs-lib')

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
  findAll: () => {
    const redisDb = require('config/redis')
    return new Promise((resolve, reject) => {
      redisDb.hkeys(redisKey, (error, addressList) => {
        if (error) reject(error)
        resolve(addressList)
      })
    })
  },
  // MUTATING
  save: (data) => {
    // TODO this should return a promise, so we can check for errors
    const redisDb = require('config/redis')
    if (Invoice.isValidInvoice(data)) {
      redisDb.hset(redisKey, data.address, JSON.stringify(data))
      return true
    }
    return false
  },

  isAddressAndContentPaired: (address, contentId) => {
    const isNil = require('lodash/isNil')
    return Invoice.find(address)
      .then((invoice) => !isNil(invoice) && (invoice.contentId === contentId))
  },

  // MUTATING
  // TODO remove mutation from here. It be replaced with assoc(invoice, 'paymentTimestamp', Date.now())
  // Better if only Invoice.save does mutation - then we have no more than one place to worry about screwing up
  markAsPaid: (address) => {
    return Invoice.find(address)
      .then((invoiceRecord) => {
        if (!invoiceRecord.paymentTimestamp) {
          invoiceRecord.paymentTimestamp = Date.now()
          Invoice.save(invoiceRecord)
        }
      })
  },

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
