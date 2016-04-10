const predicates = {
  // string: address of a bitcoin wallet
  isBitcoinAddress: (address, reportError) => {
    // https://en.bitcoin.it/wiki/List_of_address_prefixes
    const isString = require('lodash/isString')
    if (!isString(address)) { return reportError ? 'must be a String' : false }
    if (!/^[1]/.test(address)) { return reportError ? 'must begin with a "1"' : false }
    if (address.length !== 34) { return reportError ? 'must be 34 chars long' : false }
    return reportError ? null : true
  },

  // string: private key of a bitcoin wallet
  isBitcoinPrivateKey: (privateKey, reportError) => {
    // https://en.bitcoin.it/wiki/Private_key
    const isString = require('lodash/isString')
    if (!isString(privateKey)) { return reportError ? 'must be a String' : false }
    if (!(/^[5KL]/).test(privateKey)) { return reportError ? 'must begin with one of: 5, K, L]' : false }
    if (!(privateKey.length === 51 || privateKey.length === 52)) {
      return reportError ? 'must be 51 or 52 characters long' : false
    }
    return reportError ? null : true
  },

  // integer: any
  isInteger: (integer, reportError) => {
    const isInteger = require('lodash/isInteger')
    if (!isInteger(integer)) { return reportError ? 'must be a Integer' : false }
    return reportError ? null : true
  },

  // string: any
  isString: (string, reportError) => {
    const isString = require('lodash/isString')
    if (!isString(string)) { return reportError ? 'must be a String' : false }
    return reportError ? null : true
  }
}

module.exports = predicates
