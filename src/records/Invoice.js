const properties = (function makeProperties () {
  const validates = require('utils/validates')
  return Object.freeze({
    address: validates.isBitcoinAddress,
    contentId: validates.isString,
    privateKey: validates.isBitcoinPrivateKey
    // optional: paymentTimestamp: validates.isInteger
  })
}())

const redisKey = 'invoice'

const Invoice = {
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
    const redisDb = require('config/redis')
    Invoice.validate(data)
    redisDb.hset(redisKey, data.address, JSON.stringify(data))
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
  isValid: (data) => require('utils/isValid')(properties, data, { throwErrors: false }),
  validate: (data) => require('utils/isValid')(properties, data, { throwErrors: true })
}

module.exports = Invoice
