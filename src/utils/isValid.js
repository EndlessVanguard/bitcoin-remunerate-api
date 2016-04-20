const flatMap = require('lodash/flatMap')

const errorsInRecord = (recordData, properties) => {
  return flatMap(properties,
                 (errorGeneratingFn, field) => errorGeneratingFn(recordData[field]))
}

const isValidRecord = (recordData, properties) => {
  return (errorsInRecord(recordData, properties).length === 0)
}

module.exports = {
  errorsInRecord,
  isValidRecord
}
