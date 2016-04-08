const isUndefined = require('lodash/isUndefined')
const isNull = require('lodash/isNull')
const isObject = require('lodash/isObject')
const map = require('lodash/map')
const compact = require('lodash/compact')

const isValid = (properties, data, validate) => {
  if (!isObject(properties)) {
    return validate ? console.assert(false, `TypeError: properties must be an object, got ${typeof properties}`) : false
  }
  if (!isObject(data)) {
    return validate ? console.assert(false, `TypeError: data must be an object, got ${typeof data}`) : false
  }

  const propFail = compact(map(properties, (predicate, property) => {
    if (isUndefined(data[property])) {
      return `Validation: missing property "${property}"`
    }
    const errorMessage = predicate(data[property], validate)
    if (!isNull(errorMessage)) {
      return `Validation: property "${property}" ${data[property]}, ${errorMessage}`
    }
  }))

  if (propFail.length > 0) {
    return validate ? console.assert(false, propFail) : false
  }

  return validate ? null : true
}

module.exports = isValid
