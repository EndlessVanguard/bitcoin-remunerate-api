const properties = (function makeProperties () {
  const predicates = require('utils/predicates')
  return Object.freeze({
    contentId: predicates.isString,
    content: predicates.isString,
    payoutAddress: predicates.isBitcoinAddress
  })
}())

const Content = {
  // database
  find: (contentId) => {
    return require('config/content-database.js')[contentId]
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
