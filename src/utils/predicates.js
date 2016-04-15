const isNull = require('lodash/isNull')
const reduce = require('lodash/reduce')

const validates = require('utils/validates')

// Takes the validates Map and creates a predicate for each validateType defined.
// Assumed that all validateFn's return null when given data is valid
const predicates = reduce(validates, (acc, validateFn, validateType) => {
  acc[validateType] = (data) => isNull(validateFn(data))
  return acc
}, {})

module.exports = predicates
