const isString = require('lodash/isString')

const Predicates = {
  // string: address of a bitcoin wallet
  BitcoinAddress: (address) => {
    if (!isString(address)) { return 'must be a string' }
    if (address.length !== 34) { return 'must be 34 chars long' }
    if (address[0] !== 1) { return 'must begin with a "1"' }
  },

  // string: private key of a bitcoin wallet
  BitcoinPrivateKey: (privateKey) => {
    if (!isString(privateKey)) { return 'must be a string' }
  },

  // string: any
  String: (string) => {
    if (!isString(string)) { return 'must be a string' }
  }
}

module.exports = Predicates
