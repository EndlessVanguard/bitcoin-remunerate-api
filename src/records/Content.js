const validates = require('utils/validates')
const properties = (function makeProperties () {
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
      // Content.validate(data)
      if (Content.isValidContent(data)) {
        redisDb.hset(redisKey, data.contentId, JSON.stringify(data), (error) => {
          if (error) { reject(error) }
          resolve(data)
        })
      } else {
        reject(data)
      }
    })
  },

  fetchContent: (contentId) => Content.find(contentId).content,

  isValidContent: (contentData) => {
    const props = {
      contentId: validates.isString,
      content: validates.isString,
      price: validates.isInteger,
      currency: validates.isCurrency,
      payoutAddress: validates.isBitcoinAddress
    }

    return Object.keys(props).map((contentField) => {
      const predicate = props[contentField]

      return predicate(contentData[contentField])
    }).reduce((prevVal, nextVal) => prevVal && nextVal) // reduce to single bool
  },
  isValid: (data) => require('utils/isValid')(properties, data, { throwErrors: false }),
  validate: (data) => require('utils/isValid')(properties, data, { throwErrors: true })
}

module.exports = Content
