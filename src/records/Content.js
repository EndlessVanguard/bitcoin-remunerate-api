const Predicates = require('utils/Predicates')
const isString = require('lodash/isString')

const Content = {
  validate: (content) => {
    return (
      isString(content.contentId) &&
      isString(content.content) &&
      Predicates.BitcoinAddress(content.payoutAddress)
    )
  }
}

module.exports = Content
