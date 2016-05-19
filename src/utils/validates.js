const isEmpty = require('lodash/isEmpty')
const isNumber = require('lodash/isNumber')
const isString = require('lodash/isString')
const isUndefined = require('lodash/isUndefined')
const size = require('lodash/size')

const errorsInBitcoinAddress = (address) => {
  var err = []
  if (!/^[13]/.test(address)) { err.push('Bitcoin Address must begin with a "1" or "3"') }
  if (!isString(address)) {
    err.push('Bitcoin Address must be a String')
  } else {
    if (size(address) < 26) { err.push('Bitcoin Address can not be shorter than 26 chars') }
    if (size(address) > 35) { err.push('Bitcoin Address can not be longer than 35 chars') }
  }
  return err
}

const errorsInPrivateKey = (privateKey) => {
  var err = []
  if (!isString(privateKey)) { err.push('must be a String') }
  if (!(/^[5KL]/).test(privateKey)) { err.push('must begin with one of: 5, K, L]') }
  if (size(privateKey) < 51) { err.push('Private Key WIF must be at least 51 characters long') }
  if (size(privateKey) > 52) { err.push('Private Key WIF can not be longer than 52 characters') }
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
  if (isString(label) && size(label) < 1) { err.push('No label given') }
  return err
}

const errorsInJavascriptTimestamp = (timestamp) => {
  var err = []
  if (timestamp < 1462290285746) { err.push('Timestamp too old') }

  return err
}

const optional = (fn) => (value) => (isUndefined(value) ? [] : fn(value))

module.exports = {
  optional: optional,

  errorsInBitcoinAddress: errorsInBitcoinAddress,
  isBitcoinAddress: (address) => isEmpty(errorsInBitcoinAddress(address)),

  errorsInPrivateKey: errorsInPrivateKey,
  isBitcoinPrivateKey: (privateKey) => isEmpty(errorsInPrivateKey(privateKey)),

  errorsInCurrency: errorsInCurrency,
  isCurrency: (currency) => isEmpty(errorsInCurrency(currency)),

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

  isLabel: (label) => isEmpty(errorsInLabel(label)),

  errorsInJavascriptTimestamp: errorsInJavascriptTimestamp
}
