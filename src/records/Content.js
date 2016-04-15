const properties = (function makeProperties () {
  const validates = require('utils/validates')
  return Object.freeze({
    contentId: validates.isString,
    content: validates.isString,
    price: validates.isInteger,
    currency: validates.isCurrency,
    payoutAddress: validates.isBitcoinAddress
  })
}())

const redisKey = 'content'

const Content = {
  // database
  find: (contentId) => {
    return require('config/content-database.js')[contentId]
  },
  save: (data) => {
    const redisDb = require('config/redis')
    return new Promise((resolve, reject) => {
      Content.validate(data)
      redisDb.hset(redisKey, data.contentId, JSON.stringify(data), (error) => {
        if (error) reject(error)
        resolve(data)
      })
    })
  },

  // helper
  fetchContent: (contentId) => {
    return Content.find(contentId).content
  },

  isValid: (data) => require('utils/isValid')(properties, data, { throwErrors: false }),
  validate: (data) => require('utils/isValid')(properties, data, { throwErrors: true })
}

module.exports = Content
