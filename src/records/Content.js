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
  properties: {
    contentId: validates.errorsInString,
    content: validates.errorsInString,
    price: validates.errorsInInteger,
    currency: validates.errorsInCurrency,
    payoutAddress: validates.errorsInBitcoinAddress
  },

  // database
  find: (contentId) => {
    return require('config/content-database.js')[contentId]
  },
  save: (data) => {
    const redisDb = require('config/redis')
    return new Promise((resolve, reject) => {
      if (Content.isValidContent(data)) {
        redisDb.hset(redisKey, data.contentId, JSON.stringify(data), (error) => {
          if (error) { reject(error) }
          resolve(data)
        })
      } else {
        reject(Content.errorsInContent(data))
      }
    })
  },

  fetchContent: (contentId) => Content.find(contentId).content,

  errorsInContent: (contentData) => {
    // Returns a list of all errors in a content
    const flatMap = require('lodash/flatMap')
    return flatMap(
      Object.keys(Content.properties),
      (contentField) => {
        const errorGeneratingFn = Content.properties[contentField]
        return errorGeneratingFn(
          contentData[contentField]
        )
      }
    )
  },

  isValidContent: (contentData) => Content.errorsInContent(contentData).length === 0,

  isValid: (data) => require('utils/isValid')(properties, data, { throwErrors: false }),
  validate: (data) => require('utils/isValid')(properties, data, { throwErrors: true })
}

module.exports = Content
