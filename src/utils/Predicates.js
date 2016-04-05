const isString = require('lodash/isString')

const Predicates = {
  // string: address of a bitcoin wallet
  BitcoinAddress: (address) => {
    if (!isString(address)) { return false }
    if (address.length !== 34) { return false }
    if (address[0] !== '1') { return false }
    return true
  },

  // string: private key of a bitcoin wallet
  BitcoinPrivateKey: (privateKey) => {
    if (!isString(privateKey)) { return false }
    return true
  }
}

module.exports = Predicates
