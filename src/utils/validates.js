const isNumber = require('lodash/isNumber')
const isString = require('lodash/isString')
const isUndefined = require('lodash/isUndefined')

const errorsInBitcoinAddress = (address) => {
  var err = []
  if (!/^[13]/.test(address)) { err.push('Bitcoin Address must begin with a "1" or "3"') }
  if (!isString(address)) {
    err.push('Bitcoin Address must be a String')
  } else {
    if (address.length < 26) { err.push('Bitcoin Address can not be shorter than 26 chars') }
    if (address.length > 35) { err.push('Bitcoin Address can not be longer than 35 chars') }
  }
  return err
}

const errorsInPrivateKey = (privateKey) => {
  var err = []
  if (!isString(privateKey)) { err.push('must be a String') }
  if (!(/^[5KL]/).test(privateKey)) { err.push('must begin with one of: 5, K, L]') }
  if (privateKey.length < 51) { err.push('Private Key WIF must be at least 51 characters long') }
  if (privateKey.length > 52) { err.push('Private Key WIF can not be longer than 52 characters') }
  return err
}

const errorsInCurrency = (currency) => {
  const err = []
  if (currency !== 'satoshi') { err.push('Currency must be "satoshi"') }
  return err
}

const isInteger = require('lodash/isInteger')
const errorsInInteger = (int) => isInteger(int) ? [] : ['must be a Integer']

const errorsInLabel = (label) => {
  var err = []
  if (!isString(label)) { err.push('No label given') }
  if (isString(label) && label.length < 1) { err.push('No label given') }
  return err
}

const optional = (fn) => (value) => (isUndefined(value) ? [] : fn(value))

module.exports = {
  optional: optional,

  errorsInBitcoinAddress: errorsInBitcoinAddress,
  isBitcoinAddress: (address) => (errorsInBitcoinAddress(address).length === 0),

  errorsInPrivateKey: errorsInPrivateKey,
  isBitcoinPrivateKey: (privateKey) => (errorsInPrivateKey(privateKey).length === 0),

  errorsInCurrency: errorsInCurrency,
  isCurrency: (currency) => (errorsInCurrency(currency).length === 0),

  errorsInInteger: errorsInInteger,
  isInteger: isInteger,

  errorsInString: (str) => (isString(str) ? [] : ['must be a String']),
  isString: isString,

  errorsInContentId: (contentId) => {
    var err = []
    if (isNumber(contentId)) { err.push('contentId must be String, is Number') }
    if (!isString(contentId)) { err.push('contentId must be string') }
    if (/ /.test(contentId)) { err.push('contentId can not contain spaces') }
    return err
  },
  errorsInLabel: errorsInLabel,
  isLabel: (label) => (errorsInLabel(label).length === 0)
}
