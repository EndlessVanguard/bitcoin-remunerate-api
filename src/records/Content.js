const validates = require('../utils/validates.js')
const isValid = require('../utils/isValid')

const redisKey = 'content'

const Content = {
  properties: {
    contentId: validates.errorsInContentId,
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

  errorsInContent: (contentData) => isValid.errorsInRecord(contentData, Content.properties),
  isValidContent: (contentData) => isValid.isValidRecord(contentData, Content.properties)
}

Content.properties = Object.freeze(Content.properties)

module.exports = Content
