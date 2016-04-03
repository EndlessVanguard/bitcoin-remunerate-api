const isNil = require('lodash/isNil')
const isObject = require('lodash/isObject')

const validateRecord = (Record, data) => {
  console.assert(
    isObject(Record),
    `TypeError: Record must be an object, got ${typeof Record}`
  )
  console.assert(
    isObject(Record.properties),
    `TypeError: Record.properties must be an object, got ${typeof Record.properties}`
  )
  console.assert(
    isObject(data),
    `TypeError: data must be an object, got ${typeof data}`
  )

  Object.keys(Record.properties).forEach((prop) => {
    console.assert(
      !isNil(data[prop]),
      `Validation: missing property "${prop}"`
    )

    const errorMessage = Record.properties[prop](data[prop])
    console.assert(
      isNil(errorMessage),
      `Validation: property "${prop}" ${data[prop]}, ${errorMessage}`
    )
  })
}

module.exports = validateRecord
