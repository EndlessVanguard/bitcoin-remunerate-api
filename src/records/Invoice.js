const redisDb = require('./config/redis')
const Types = require('utils/Types')
const validateRecord = require('utils/validateRecord')

const redisKey = 'content'

const Invoice = {
  properties: {
    address: Types.BitcoinAddress,
    contentId: Types.String,
    privateKey: Types.BitcoinPrivateKey
    // optional: paymentTimestamp
  },
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
  validate: validateRecord.bind(null, Invoice)
}

module.exports = Invoice
