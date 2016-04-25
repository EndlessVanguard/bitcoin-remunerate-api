const validates = require('utils/validates')

const redisKey = 'invoice'
const isValid = require('utils/isValid')

const filter = require('lodash/fp/filter')
const mapValues = require('lodash/fp/mapValues')

const Invoice = {
  properties: Object.freeze({
    address: validates.errorsInBitcoinAddress,
    contentId: validates.errorsInString,
    privateKey: validates.errorsInPrivateKey,
    paymentTimestamp: validates.optional(validates.errorsInInteger)
  }),

  // database
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
  save: (data) => {
    const redisDb = require('config/redis')
    if (Invoice.isValidInvoice(data)) {
      redisDb.hset(redisKey, data.address, JSON.stringify(data))
      return true
    }
    return false
  },

  // helpers
  isAddressAndContentPaired: (address, contentId) => {
    const isNil = require('lodash/isNil')
    return Invoice.find(address)
      .then((invoice) => !isNil(invoice) && (invoice.contentId === contentId))
  },

  markAsPaid: (address) => {
    return Invoice.find(address)
      .then((invoiceRecord) => {
        if (!invoiceRecord.paymentTimestamp) {
          invoiceRecord.paymentTimestamp = Date.now()
          return Invoice.save(invoiceRecord)
        }
      })
  },

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
