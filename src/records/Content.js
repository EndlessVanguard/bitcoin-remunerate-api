const isValid = require('utils/isValid')
const redisDb = require('config/redis')
const validates = require('utils/validates')

const redisKey = 'content'

const Content = {

  // validation

  properties: Object.freeze({
    contentId: validates.errorsInContentId,
    content: validates.errorsInString,
    price: validates.errorsInInteger,
    currency: validates.errorsInCurrency,
    label: validates.errorsInLabel,
    payoutAddress: validates.errorsInBitcoinAddress
  }),

  errorsInContent: (contentData) => isValid.errorsInRecord(contentData, Content.properties),

  isValidContent: (contentData) => isValid.isValidRecord(contentData, Content.properties),

  // database

  find: (contentId) => (
    new Promise((resolve, reject) => (
      redisDb.hget(redisKey, contentId, (error, contentData) => {
        if (error || !contentData) {
          var hardCodedContent = require('../../config/content-database')[contentId]
          hardCodedContent ? resolve(hardCodedContent) : reject(error)
        }
        resolve(JSON.parse(contentData))
      })
    ))
  ),

  save: (data) => (
    new Promise((resolve, reject) => {
      if (Content.isValidContent(data)) {
        redisDb.hset(redisKey, data.contentId, JSON.stringify(data), (error) => (
          error ? reject(error) : resolve(data)))
      } else {
        reject(Content.errorsInContent(data))
      }
    })
  )

}

module.exports = Content
