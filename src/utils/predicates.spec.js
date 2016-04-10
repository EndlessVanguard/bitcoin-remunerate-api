const test = require('tape')

const predicates = require('./predicates')

test('predicates.isBitcoinAddress', (t) => {
  t.test('reportError flag false', (st) => {
    const reportError = false

    st.test('returns true when BitcoinAddress', (sst) => {
      const input = require('test/helper').mockAddress()
      const actual = predicates.isBitcoinAddress(input, reportError)
      const expected = true
      sst.equals(actual, expected, 'input is BitcoinAddress')
      sst.end()
    })

    st.test('returns false when not a String', (sst) => {
      const badInput = 42
      const actual = predicates.isBitcoinAddress(badInput, reportError)
      const expected = false
      sst.equal(actual, expected, 'input must be a String')
      sst.end()
    })

    st.test('returns false when not beginning with "1"', (sst) => {
      const badInput = 'x'
      const actual = predicates.isBitcoinAddress(badInput, reportError)
      const expected = false
      sst.equal(actual, expected, 'input must begin with a "1"')
      sst.end()
    })

    st.test('returns false when not 34 characters long', (sst) => {
      const badInput = require('test/helper').mockAddress() + 'x'
      const actual = predicates.isBitcoinAddress(badInput, reportError)
      const expected = false
      sst.equal(actual, expected, 'input less than 50 chars long')
      sst.end()
    })
  })

  t.test('reportError flag true', (st) => {
    const reportError = true

    st.test('returns null when BitcoinAddress', (sst) => {
      const input = require('test/helper').mockAddress()
      const actual = predicates.isBitcoinAddress(input, reportError)
      const expected = null
      sst.equals(actual, expected, 'input is BitcoinAddress')
      sst.end()
    })

    st.test('returns validation message when not a String', (sst) => {
      const badInput = 42
      const actual = predicates.isBitcoinAddress(badInput, reportError)
      const regex = /must be a String/
      sst.assert(regex.test(actual), 'input must be a String')
      sst.end()
    })

    st.test('returns validation message when not beginning with "1"', (sst) => {
      const badInput = 'x'
      const actual = predicates.isBitcoinAddress(badInput, reportError)
      const regex = /begin with a "1"/
      sst.assert(regex.test(actual), 'input must begin with a "1"')
      sst.end()
    })

    st.test('returns validation message when not 34 characters long', (sst) => {
      const badInput = require('test/helper').mockAddress() + 'x'
      const actual = predicates.isBitcoinAddress(badInput, reportError)
      const regex = /must be 34 chars/
      sst.assert(regex.test(actual), 'input less than 50 chars long')
      sst.end()
    })
  })
})

test('predicates.isBitcoinPrivateKey', (t) => {
  const mockPrivateKey = () => {
    const times = require('lodash/times')
    return ('5' + times(51, () => 'x').join(''))
  }

  t.test('reportError flag false', (st) => {
    const reportError = false

    st.test('returns true when BitcoinPrivateKey', (sst) => {
      const input = mockPrivateKey()
      const actual = predicates.isBitcoinPrivateKey(input, reportError)
      const expected = true
      sst.equals(actual, expected, 'input is BitcoinPrivateKey')
      sst.end()
    })

    st.test('returns false when not a String', (sst) => {
      const badInput = 42
      const actual = predicates.isBitcoinPrivateKey(badInput, reportError)
      const expected = false
      sst.equal(actual, expected, 'input must be a String')
      sst.end()
    })

    st.test('returns false when not beginning with "5"', (sst) => {
      const badInput = 'x'
      const actual = predicates.isBitcoinPrivateKey(badInput, reportError)
      const expected = false
      sst.equal(actual, expected, 'input must begin with a "5"')
      sst.end()
    })

    st.test('returns false when not 51 or 52 characters long', (sst) => {
      const input = mockPrivateKey()

      function longCheck () {
        const longInput = input + 'x'
        const actual = predicates.isBitcoinPrivateKey(longInput, reportError)
        const expected = false
        sst.equal(actual, expected, 'input longer than 52 characters')
      }

      function shortCheck () {
        const shortInput = '5x'
        const actual = predicates.isBitcoinPrivateKey(shortInput, reportError)
        const expected = false
        sst.equal(actual, expected, 'input shorter than 51 characters')
      }

      [longCheck, shortCheck].map((x) => x())
      sst.end()
    })
  })

  t.test('reportError flag true', (st) => {
    const reportError = true

    st.test('returns null when BitcoinPrivateKey', (sst) => {
      const input = mockPrivateKey()
      const actual = predicates.isBitcoinPrivateKey(input, reportError)
      const expected = null
      sst.equals(actual, expected, 'input is BitcoinPrivateKey')
      sst.end()
    })

    st.test('returns validation message when not a String', (sst) => {
      const badInput = 42
      const actual = predicates.isBitcoinPrivateKey(badInput, reportError)
      const regex = /must be a String/
      sst.assert(regex.test(actual), 'input must be a String')
      sst.end()
    })

    st.test('returns validation message when not beginning with "5"', (sst) => {
      const badInput = 'x'
      const actual = predicates.isBitcoinPrivateKey(badInput, reportError)
      const regex = /begin with one of: 5, K, L/
      sst.assert(regex.test(actual), 'input must begin with a "5"')
      sst.end()
    })

    st.test('returns validation message when not 51 or 52 characters long', (sst) => {
      const input = mockPrivateKey()

      function longCheck () {
        const longInput = input + 'x'
        const actual = predicates.isBitcoinPrivateKey(longInput, reportError)
        const regex = /be 51 or 52 characters/
        sst.assert(regex.test(actual), 'input longer than 52 characters')
      }

      function shortCheck () {
        const shortInput = '5x'
        const actual = predicates.isBitcoinPrivateKey(shortInput, reportError)
        const regex = /be 51 or 52 characters/
        sst.assert(regex.test(actual), 'input shorter than 51 characters')
      }

      [longCheck, shortCheck].map((x) => x())
      sst.end()
    })
  })
})

test('predicates.isInteger', (t) => {
  t.test('reportError flag false', (st) => {
    const reportError = false

    st.test('returns true when Integer', (sst) => {
      const input = 42
      const actual = predicates.isInteger(input, reportError)
      const expected = true
      sst.equals(actual, expected, 'input is Integer')
      sst.end()
    })

    st.test('returns validation message when not a Integer', (sst) => {
      const badInput = '42'
      const actual = predicates.isInteger(badInput, reportError)
      const expected = false
      sst.equal(actual, expected, 'input must be a Integer')
      sst.end()
    })
  })

  t.test('reportError flag true', (st) => {
    const reportError = true

    st.test('returns null when Integer', (sst) => {
      const input = 42
      const actual = predicates.isInteger(input, reportError)
      const expected = null
      sst.equals(actual, expected, 'input is Integer')
      sst.end()
    })

    st.test('returns validation message when not a Integer', (sst) => {
      const badInput = '42'
      const actual = predicates.isInteger(badInput, reportError)
      const regex = /be a Integer/
      sst.assert(regex.test(actual), 'input must be a Integer')
      sst.end()
    })
  })
})

test('predicates.isString', (t) => {
  t.test('reportError flag false', (st) => {
    const reportError = false

    st.test('returns true when String', (sst) => {
      const input = '42'
      const actual = predicates.isString(input, reportError)
      const expected = true
      sst.equals(actual, expected, 'input is String')
      sst.end()
    })
    st.test('returns false when not a String', (sst) => {
      const badInput = 42
      const actual = predicates.isString(badInput, reportError)
      const expected = false
      sst.equal(actual, expected, 'input must be a String')
      sst.end()
    })
  })

  t.test('reportError flag true', (st) => {
    const reportError = true

    st.test('returns null when String', (sst) => {
      const input = '42'
      const actual = predicates.isString(input, reportError)
      const expected = null
      sst.equals(actual, expected, 'input is String')
      sst.end()
    })
    st.test('returns validation message when not a String', (sst) => {
      const badInput = 42
      const actual = predicates.isString(badInput, reportError)
      const regex = /be a String/
      sst.assert(regex.test(actual), 'input must be a String')
      sst.end()
    })
  })
})
