const isUndefined = require('lodash/isUndefined')
const isNull = require('lodash/isNull')
const isObject = require('lodash/isObject')
const map = require('lodash/map')
const compact = require('lodash/compact')

const isValid = (properties, data, options) => {
  const reportError = (options && options.throwErrors)
  if (!isObject(properties)) {
    return reportError ? console.assert(false, `TypeError: properties must be an object, got ${typeof properties}`) : false
  }
  if (!isObject(data)) {
    return reportError ? console.assert(false, `TypeError: data must be an object, got ${typeof data}`) : false
  }

  const propFail = compact(map(properties, (predicate, property) => {
    if (isUndefined(data[property])) {
      return `Validation: missing property "${property}"`
    }
    const errorMessage = predicate(data[property], reportError)
    if (!isNull(errorMessage)) {
      return `Validation: property "${property}" ${data[property]}, ${errorMessage}`
    }
  }))

  if (propFail.length > 0) {
    return reportError ? console.assert(false, propFail) : false
  }

  return reportError ? null : true
}

module.exports = isValid
