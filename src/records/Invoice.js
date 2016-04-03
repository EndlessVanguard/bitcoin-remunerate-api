const Types = require('utils/Types')
const validateRecord = require('utils/validateRecord')

const Invoice = {
  properties: {
    address: Types.BitcoinAddress,
    contentId: Types.String,
    privateKey: Types.BitcoinPrivateKey
  },
  validate: validateRecord.bind(null, Invoice)
}

module.exports = Invoice
