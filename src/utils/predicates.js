const predicates = {
  // string: address of a bitcoin wallet
  isBitcoinAddress: (address, validate) => {
    // https://en.bitcoin.it/wiki/List_of_address_prefixes
    const isString = require('lodash/isString')
    if (!isString(address)) { return validate ? 'must be a String' : false }
    if (!/^[1]/.test(address)) { return validate ? 'must begin with a "1"' : false }
    if (address.length !== 34) { return validate ? 'must be 34 chars long' : false }
    return validate ? null : true
  },

  // string: private key of a bitcoin wallet
  isBitcoinPrivateKey: (privateKey, validate) => {
    // https://en.bitcoin.it/wiki/Private_key
    const isString = require('lodash/isString')
    if (!isString(privateKey)) { return validate ? 'must be a String' : false }
    if (!(/^[5KL]/).test(privateKey)) { return validate ? 'must begin with one of: 5, K, L]' : false }
    if (!(privateKey.length === 51 || privateKey.length === 52)) {
      return validate ? 'must be 51 or 52 characters long' : false
    }
    return validate ? null : true
  },

  // integer: any
  isInteger: (integer, validate) => {
    const isInteger = require('lodash/isInteger')
    if(!isInteger(integer)) { return validate ? 'must be a Integer' : false }
    return validate ? null : true
  },

  // string: any
  isString: (string, validate) => {
    const isString = require('lodash/isString')
    if (!isString(string)) { return validate ? 'must be a String' : false }
    return validate ? null : true
  }
}

module.exports = predicates
