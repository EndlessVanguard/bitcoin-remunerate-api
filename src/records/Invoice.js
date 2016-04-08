const properties = (function makeProperties () {
  const predicates = require('../utils/predicates')
  return Object.freeze({
    address: predicates.isBitcoinAddress,
    contentId: predicates.isString,
    privateKey: predicates.isBitcoinPrivateKey
    // optional: paymentTimestamp: predicates.isInteger
  })
}())

const redisKey = 'content'

const Invoice = {
  // database
  find: (address) => {
    const redisDb = require('./config/redis')
    return new Promise((resolve, reject) => {
      redisDb.hget(redisKey, address, (error, invoiceData) => {
        if (error) reject(error)
        resolve(JSON.parse(invoiceData))
      })
    })
  },
  findAll: () => {
    const redisDb = require('./config/redis')
    return new Promise((resolve, reject) => {
      redisDb.hkeys(redisKey, (error, addressList) => {
        if (error) reject(error)
        resolve(addressList)
      })
    })
  },
  save: (data) => {
    const redisDb = require('./config/redis')
    Invoice.validate(data)
    redisDb.hset(redisKey, data.address, JSON.stringify({
      address: data.address,
      contentId: data.contentId,
      privateKey: data.privateKey
    }))
  },

  // helpers
  isAddressAndContentPaired: (address, contentId) => {
    const isNil = require('lodash/isNil')
    return Invoice.find(address)
      .then((invoice) => !isNil(invoice) && (invoice.contentId === contentId))
  },

  markAsPaid: (address) => {
    return Invoice.find(address)
      .then((invoice) => {
        if (!invoice.paymentTimestamp) {
          invoice.paymentTimestamp = Date.now()
          Invoice.save(invoice)
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
  isValid: (data) => require('utils/isValid')(properties, data, false),
  validate: (data) => require('utils/isValid')(properties, data, true)
}

module.exports = Invoice
