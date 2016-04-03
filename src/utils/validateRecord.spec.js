const test = require('tape')
const noop = require('lodash/noop')

const validateRecord = require('./validateRecord')

test('validateRecord', (t) => {
  t.test('will validate when all properties of Record are present in data', (st) => {
    const mockRecord = {
      properties: {
        id: noop
      }
    }
    const mockData = {
      id: 42
    }

    const actual = validateRecord(mockRecord, mockData)
    const expected = undefined
    st.equal(actual, expected, 'validateRecord returns "undefined" when data matches Record.properties')
    st.end()
  })

  t.test('will not validate when a Record property returns a value for data', (st) => {
    const mockRecord = {
      properties: {
        id: () => 'a reason'
      }
    }
    const mockData = {
      id: 42
    }

    st.throws(
      () => validateRecord(mockRecord, mockData),
      /^AssertionError: Validation: property "id" 42, a reason$/,
      'validateRecord throws an error if a property fn returns a value'
    )
    st.end()
  })

  t.test('will not validate when a Record property is nil in data', (st) => {
    const mockRecord = {
      properties: {
        id: noop
      }
    }
    const mockDataNull = {
      id: null
    }
    const mockDataUndefined = {
      id: undefined
    }

    st.throws(
      () => validateRecord(mockRecord, mockDataNull),
      /^AssertionError: Validation: missing property "id"$/,
      'validateRecord throws an error if a property is null in data'
    )
    st.throws(
      () => validateRecord(mockRecord, mockDataUndefined),
      /^AssertionError: Validation: missing property "id"$/,
      'validateRecord throws an error if a property is undefined in data'
    )
    st.end()
  })
})
