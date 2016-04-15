const test = require('tape')

const validates = require('./validates')

test('validates.isBitcoinAddress', (t) => {
  t.test('returns null when BitcoinAddress', (st) => {
    const input = require('test/helper').mockAddress()
    const actual = validates.isBitcoinAddress(input)
    const expected = null
    st.equals(actual, expected, 'input is BitcoinAddress')
    st.end()
  })

  t.test('returns validation message when not a String', (st) => {
    const badInput = 42
    const actual = validates.isBitcoinAddress(badInput)
    const regex = /must be a String/
    st.assert(regex.test(actual), 'input must be a String')
    st.end()
  })

  t.test('returns validation message when not beginning with "1"', (st) => {
    const badInput = 'x'
    const actual = validates.isBitcoinAddress(badInput)
    const regex = /begin with a "1"/
    st.assert(regex.test(actual), 'input must begin with a "1"')
    st.end()
  })

  t.test('returns validation message when not 34 characters long', (st) => {
    const badInput = require('test/helper').mockAddress() + 'x'
    const actual = validates.isBitcoinAddress(badInput)
    const regex = /must be 34 chars/
    st.assert(regex.test(actual), 'input less than 50 chars long')
    st.end()
  })
})

test('validates.isBitcoinPrivateKey', (t) => {
  const mockPrivateKey = () => {
    const times = require('lodash/times')
    return ('5' + times(51, () => 'x').join(''))
  }

  t.test('returns null when BitcoinPrivateKey', (st) => {
    const input = mockPrivateKey()
    const actual = validates.isBitcoinPrivateKey(input)
    const expected = null
    st.equals(actual, expected, 'input is BitcoinPrivateKey')
    st.end()
  })

  t.test('returns validation message when not a String', (st) => {
    const badInput = 42
    const actual = validates.isBitcoinPrivateKey(badInput)
    const regex = /must be a String/
    st.assert(regex.test(actual), 'input must be a String')
    st.end()
  })

  t.test('returns validation message when not beginning with "5"', (st) => {
    const badInput = 'x'
    const actual = validates.isBitcoinPrivateKey(badInput)
    const regex = /begin with one of: 5, K, L/
    st.assert(regex.test(actual), 'input must begin with a "5"')
    st.end()
  })

  t.test('returns validation message when not 51 or 52 characters long', (st) => {
    const input = mockPrivateKey()

    function longCheck () {
      const longInput = input + 'x'
      const actual = validates.isBitcoinPrivateKey(longInput)
      const regex = /be 51 or 52 characters/
      st.assert(regex.test(actual), 'input longer than 52 characters')
    }

    function shortCheck () {
      const shortInput = '5x'
      const actual = validates.isBitcoinPrivateKey(shortInput)
      const regex = /be 51 or 52 characters/
      st.assert(regex.test(actual), 'input shorter than 51 characters')
    }

    [longCheck, shortCheck].map((x) => x())
    st.end()
  })
})

test('validates.isInteger', (t) => {
  t.test('returns null when Integer', (st) => {
    const input = 42
    const actual = validates.isInteger(input)
    const expected = null
    st.equals(actual, expected, 'input is Integer')
    st.end()
  })

  t.test('returns validation message when not a Integer', (st) => {
    const badInput = '42'
    const actual = validates.isInteger(badInput)
    const regex = /be a Integer/
    st.assert(regex.test(actual), 'input must be a Integer')
    st.end()
  })
})

test('validates.isString', (t) => {
  t.test('returns null when String', (st) => {
    const input = '42'
    const actual = validates.isString(input)
    const expected = null
    st.equals(actual, expected, 'input is String')
    st.end()
  })
  t.test('returns validation message when not a String', (st) => {
    const badInput = 42
    const actual = validates.isString(badInput)
    const regex = /be a String/
    st.assert(regex.test(actual), 'input must be a String')
    st.end()
  })
})
