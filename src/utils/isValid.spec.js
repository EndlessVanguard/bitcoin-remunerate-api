const test = require('tape')

const isValid = require('./isValid')

test('isValid', (t) => {
  t.test('options.throwErrors flag false', (st) => {
    const options = { throwErrors: false }

    st.test('returns true when all properties predicates are valid in data', (sst) => {
      const mockProperties = { id: () => null }
      const mockData = { id: 42 }
      const actual = isValid(mockProperties, mockData, options)
      const expected = true
      sst.equal(actual, expected, 'properties validate data')
      sst.end()
    })

    st.test('returns false when a property predicate fails', (sst) => {
      const mockProperties = { id: () => 'a reason' }
      const mockData = { id: 42 }
      const actual = isValid(mockProperties, mockData, options)
      const expected = false
      sst.equal(actual, expected, 'all property predicates must pass')
      sst.end()
    })

    st.test('returns false when a property is undefined in data', (sst) => {
      const mockProperties = { id: () => null }
      const mockData = { id: undefined }
      const actual = isValid(mockProperties, mockData, options)
      const expected = false
      sst.equal(actual, expected, 'no properties can be undefined in data')
      sst.end()
    })
  })

  t.test('options.throwErrors flag true', (st) => {
    const options = { throwErrors: true }

    st.test('returns null when all properties predicates are valid in data', (sst) => {
      const mockProperties = { id: () => null }
      const mockData = { id: 42 }
      const actual = isValid(mockProperties, mockData, options)
      const expected = null
      sst.equal(actual, expected, 'properties validate data')
      sst.end()
    })

    st.test('errors when a properties property returns a value for data', (sst) => {
      const mockProperties = { id: () => 'a reason' }
      const mockData = { id: 42 }
      sst.throws(
        () => isValid(mockProperties, mockData, options),
        /Validation: property "id" 42, a reason/,
        'all property predicates must pass'
      )
      sst.end()
    })

    st.test('errors when a Record property is undefined in data', (sst) => {
      const mockProperties = { id: () => null }
      const mockDataUndefined = { id: undefined }
      sst.throws(
        () => isValid(mockProperties, mockDataUndefined, options),
        /Validation: missing property "id"/,
        'no properties can be undefined in data'
      )
      sst.end()
    })
  })
})
