const Types = require('utils/Types')
const validateRecord = require('utils/validateRecord')

const Content = {
  properties: {
    contentId: Types.String,
    content: Types.String,
    payoutAddress: Types.BitcoinAddress
  },
  validate: validateRecord.bind(null, Content)
}

module.exports = Content
