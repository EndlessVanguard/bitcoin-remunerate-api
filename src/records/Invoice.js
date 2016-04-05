const Predicates = require('../utils/Predicates')
const isString = require('lodash/isString')

const redisKey = 'content'

const Invoice = {
  findAll: () => {
    return new Promise((resolve, reject) => {
      const redisDb = require('../config/redis')

      redisDb.hkeys(redisKey, (error, addressList) => {
        if (error) reject(error)
        resolve(addressList)
      })
    })
  },
  find: (address) => {
    return new Promise((resolve, reject) => {
      const redisDb = require('../config/redis')

      redisDb.hget(redisKey, address, (error, invoiceData) => {
        if (error) reject(error)
        resolve(JSON.parse(invoiceData))
      })
    })
  },
  save: (data) => {
    const redisDb = require('../config/redis')
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
      isString(invoice.contentId)
    )
  }
}

module.exports = Invoice
