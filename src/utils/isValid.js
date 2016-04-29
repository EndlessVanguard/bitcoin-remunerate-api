const isEmpty = require('lodash/isEmpty')
const flatMap = require('lodash/flatMap')

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
