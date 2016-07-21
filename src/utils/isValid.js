// flatMap only receives the value in fp version..
// https://github.com/lodash/lodash/wiki/FP-Guide#capped-iteratee-arguments
const flatMap = require('lodash/flatMap')
const isEmpty = require('lodash/fp/isEmpty')

const errorsInRecord = (recordData, properties) => (
  flatMap(properties, (errorGeneratingFn, field) => errorGeneratingFn(recordData[field]))
)

const isValidRecord = (recordData, properties) => (
  isEmpty(errorsInRecord(recordData, properties))
)

module.exports = {
  errorsInRecord,
  isValidRecord
}
