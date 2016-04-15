const validReturn = null

const validates = {
  // string: address of a bitcoin wallet
  isBitcoinAddress: (address) => {
    // https://en.bitcoin.it/wiki/List_of_address_prefixes
    const isString = require('lodash/isString')
    if (!isString(address)) { return 'must be a String' }
    if (!/^[1]/.test(address)) { return 'must begin with a "1"' }
    if (address.length !== 34) { return 'must be 34 chars long' }
    return validReturn
  },

  // string: private key of a bitcoin wallet
  isBitcoinPrivateKey: (privateKey, reportError) => {
    // https://en.bitcoin.it/wiki/Private_key
    const isString = require('lodash/isString')
    if (!isString(privateKey)) { return 'must be a String' }
    if (!(/^[5KL]/).test(privateKey)) { return 'must begin with one of: 5, K, L]' }
    if (!(privateKey.length === 51 || privateKey.length === 52)) {
      return 'must be 51 or 52 characters long'
    }
    return validReturn
  },

  // string: currency supported for payout
  isCurrency: (currency, validate) => {
    if (currency !== 'satoshi') { return 'must be "satoshi"' }
    return validReturn
  },

  // integer: any
  isInteger: (integer, reportError) => {
    const isInteger = require('lodash/isInteger')
    if (!isInteger(integer)) { return 'must be a Integer' }
    return validReturn
  },

  // string: any
  isString: (string, reportError) => {
    const isString = require('lodash/isString')
    if (!isString(string)) { return 'must be a String' }
    return validReturn
  }
}

module.exports = validates
