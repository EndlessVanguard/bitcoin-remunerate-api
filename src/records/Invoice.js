const validates = require('utils/validates')

const redisKey = 'invoice'
const isValid = require('utils/isValid')

const Invoice = {
  properties: Object.freeze({
    createdAt: validates.errorsInJavascriptTimestamp,
    address: validates.errorsInBitcoinAddress,
    contentId: validates.errorsInString,
    privateKey: validates.errorsInPrivateKey,
    paymentTimestamp: validates.optional(validates.errorsInJavascriptTimestamp)
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
  findAll: () => {
    const redisDb = require('config/redis')
    return new Promise((resolve, reject) => {
      redisDb.hkeys(redisKey, (error, addressList) => {
        if (error) reject(error)
        resolve(addressList)
      })
    })
  },
  save: (data) => {
    // TODO this should return a promise, so we can check for errors
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
          Invoice.save(invoiceRecord)
        }
      })
  },

  newKeypair: (contentId) => {
    // This function should be rewritten, and we should not do save() from here
    /* Instead we should call as
       Invoice.save(Invoice.newKaypair(contentId))
     */
    // Since it has DB side effects, it's untestable (without mocking - but the lord sacrificed his only son so that we would not have to write mocks!)
    const bitcoin = require('bitcoinjs-lib')
    // generate a keypair
    const keypair = bitcoin.ECPair.makeRandom()
    const address = keypair.getAddress()
    const privateKey = keypair.toWIF()
    const createdAt = Date.now()

    Invoice.save({
      address,
      contentId,
      privateKey,
      createdAt
    })

    return address
  },

  // validation
  errorsInInvoice: (invoiceData) => isValid.errorsInRecord(invoiceData, Invoice.properties),
  isValidInvoice: (invoiceData) => isValid.isValidRecord(invoiceData, Invoice.properties)
}

module.exports = Invoice
