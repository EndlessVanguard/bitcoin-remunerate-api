const Predicates = require('utils/Predicates')

const Content = {
  validate: (content) => {
    return (
      Predicates.String(content.contentId) &&
      Predicates.String(content.content) &&
      Predicates.BitcoinAddress(content.payoutAddress)
    )
  }
}

module.exports = Content
