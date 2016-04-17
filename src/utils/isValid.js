const flatMap = require('lodash/flatMap')

const errorsInRecord = (recordData, properties) => {
  // Returns a list of all errors in a record
  return flatMap(
    Object.keys(properties),
    (field) => {
      const errorGeneratingFn = properties[field]
      return errorGeneratingFn(recordData[field])
    }
  )
}

const isValidRecord = (recordData, properties) => {
  return (errorsInRecord(recordData, properties).length === 0)
}

module.exports = {
  errorsInRecord,
  isValidRecord
}
