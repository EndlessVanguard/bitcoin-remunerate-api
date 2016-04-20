const validates = require('utils/validates')
const isValid = require('utils/isValid')

const redisKey = 'content'

const Content = {
  properties: Object.freeze({
    contentId: validates.errorsInContentId,
    content: validates.errorsInString,
    price: validates.errorsInInteger,
    currency: validates.errorsInCurrency,
    payoutAddress: validates.errorsInBitcoinAddress
  }),

  // database
  find: (contentId) => {
    const redisDb = require('config/redis')
    return new Promise((resolve, reject) => {
      redisDb.hget(redisKey, contentId, (error, contentData) => {
        // TODO: remove after demo time?
        if (error || !contentData) {
          var hardCodedContent = require('../../config/content-database')[contentId]
          hardCodedContent ? resolve(hardCodedContent) : reject(error)
        }
        resolve(contentData)
      })
    })
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

module.exports = Content
