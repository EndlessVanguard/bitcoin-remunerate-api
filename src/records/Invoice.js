const redisDb = require('./config/redis')
const Predicates = require('utils/Predicates')
const isNumber = require('lodash/isNumber')

const redisKey = 'content'

const Invoice = {
  findAll: () => {
    return new Promise((resolve, reject) => {
      redisDb.hkeys(redisKey, (error, addressList) => {
        if (error) reject(error)
        resolve(addressList)
      })
    })
  },
  find: (address) => {
    return new Promise((resolve, reject) => {
      redisDb.hget(redisKey, address, (error, invoiceData) => {
        if (error) reject(error)
        resolve(JSON.parse(invoiceData))
      })
    })
  },
  save: (data) => {
    Invoice.validate(data)

    redisDb.hset(redisKey, data.address, JSON.stringify({
      address: data.address,
      contentId: data.contentId,
      privateKey: data.privateKey
    }))
  },
  validate: (invoice) => {
    return (
      Predicates.BitcoinAddress(invoice.address) &&
      Predicates.BitcoinPrivateKey(invoice.privateKey) &&
      Predicates.String(invoice.contentId) &&
      isNumber(invoice.paymentTimestamp)
    )
  }
}

module.exports = Invoice
