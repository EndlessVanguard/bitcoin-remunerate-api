const isEmpty = require('lodash/fp/isEmpty')
const isInteger = require('lodash/fp/isInteger')
const isNumber = require('lodash/fp/isNumber')
const isString = require('lodash/fp/isString')
const isUndefined = require('lodash/fp/isUndefined')
const size = require('lodash/fp/size')

const errorsInBitcoinAddress = (address) => {
  var err = []
  if (!/^[13]/.test(address)) { err.push('Bitcoin Address must begin with one of: "1", "3"') }
  if (!isString(address)) {
    err.push('Bitcoin Address must be a String')
  } else {
    if (size(address) < 26) { err.push('Bitcoin Address can not be shorter than 26 chars') }
    if (size(address) > 35) { err.push('Bitcoin Address can not be longer than 35 chars') }
  }
  return err
}

const errorsInBitcoinPrivateKey = (privateKey) => {
  var err = []
  if (!isString(privateKey)) { err.push('Bitcoin Private Key WIF must be a String') }
  if (!(/^[5KL]/).test(privateKey)) { err.push('must begin with one of: "5", "K", "L"') }
  if (size(privateKey) < 51) { err.push('Bitcoin Private Key WIF must be at least 51 characters long') }
  if (size(privateKey) > 52) { err.push('Bitcoin Private Key WIF can not be longer than 52 characters') }
  return err
}

const errorsInContentId = (contentId) => {
  var err = []
  if (isNumber(contentId)) { err.push('contentId must be String, is Number') }
  if (!isString(contentId)) { err.push('contentId must be String') }
  if (/ /.test(contentId)) { err.push('contentId can not contain spaces') }
  return err
}

const errorsInCurrency = (currency) => {
  const err = []
  if (currency !== 'satoshi') { err.push('Currency must be "satoshi"') }
  return err
}

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
  errorsInBitcoinAddress: errorsInBitcoinAddress,
  isBitcoinAddress: (address) => isEmpty(errorsInBitcoinAddress(address)),

  errorsInBitcoinPrivateKey: errorsInBitcoinPrivateKey,
  isBitcoinPrivateKey: (privateKey) => isEmpty(errorsInBitcoinPrivateKey(privateKey)),

  errorsInContentId: errorsInContentId,

  errorsInCurrency: errorsInCurrency,
  isCurrency: (currency) => isEmpty(errorsInCurrency(currency)),

  errorsInInteger: errorsInInteger,
  isInteger: isInteger,

  errorsInJavascriptTimestamp: errorsInJavascriptTimestamp,

  errorsInLabel: errorsInLabel,
  isLabel: (label) => isEmpty(errorsInLabel(label)),

  errorsInString: (str) => (isString(str) ? [] : ['must be a String']),
  isString: isString,

  optional: optional
}
