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
  find: (address) => {
    return new Promise((resolve, reject) => {
      redisDb.hget(redisKey, address, (error, data) => {
        if (error) reject(error)
        resolve(JSON.parse(data))
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
