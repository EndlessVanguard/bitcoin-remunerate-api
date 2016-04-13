const properties = (function makeProperties () {
  const predicates = require('utils/predicates')
  return Object.freeze({
    contentId: predicates.isString,
    content: predicates.isString,
    price: predicates.isInteger,
    currency: predicates.isCurrency,
    payoutAddress: predicates.isBitcoinAddress
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

  // validation
  isValid: (data) => require('utils/isValid')(properties, data, { throwErrors: false }),
  validate: (data) => require('utils/isValid')(properties, data, { throwErrors: true })
}

module.exports = Content
