const test = require('tape')
const isEqual = require('lodash/isEqual')
const includes = require('lodash/includes')
const validates = require('./validates')

const validAddress = require('../test/helper.js').validAddress

test('validates.errorsInBitcoinAddress', (t) => {
  t.assert(isEqual(validates.errorsInBitcoinAddress(validAddress), []),
           'no errors in valid address')

  const addressWithBadBeginning = '79qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
  t.assert(isEqual(
    validates.errorsInBitcoinAddress(addressWithBadBeginning),
    ['must begin with a "1" or "3"']
  ), 'must begin with 1 or 3')

  t.assert(includes(
    validates.errorsInBitcoinAddress(2381),
    'must be a String'
  ), 'must be String')

  const tooLongAddress = '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBwtrhortyihjtyhoytrg'
  t.assert(isEqual(
    validates.errorsInBitcoinAddress(tooLongAddress),
    ['can not be longer than 35 chars']
  ), 'can not be longer than 35 chars')

  t.assert(isEqual(
    validates.errorsInBitcoinAddress(validAddress.substring(0, 25)),
    ['can not be shorter than 26 chars']
  ), 'can not be shorter than 26 chars')

  t.end()
})

test('validates.isBitcoinAddress', (t) => {
  t.assert(validates.isBitcoinAddress(validAddress), 'valid address is valid')
  t.assert(!validates.isBitcoinAddress('x'), 'addresses not starting with 1 or 3 are invalid')
  t.assert(!validates.isBitcoinAddress(1235), 'non-string addresses are invalid')

  t.end()
})

const validWIF = require('../test/helper.js').validWIF
test('validates.errorsInPrivateKey', (t) => {
  t.assert(isEqual(validates.errorsInPrivateKey(validWIF), []),
           'valid WIF is valid')

  t.assert(includes(
    validates.errorsInPrivateKey(123), 'must be a String'
  ))

  t.assert(includes(
    validates.errorsInPrivateKey('x'),
    'must begin with one of: 5, K, L]'),
    'must begin with one of: 5, K, L]'
  )

  t.assert(includes(
    validates.errorsInPrivateKey(validWIF.substring(0, 40)),
    'Private Key WIF must be at least 51 characters long'
  ), 'Private Key WIF must be at least 51 characters long')

  t.assert(includes(
    validates.errorsInPrivateKey(validWIF + 'abcdefgh'),
    'Private Key WIF can not be longer than 52 characters'
  ), 'Private Key WIF can not be longer than 52 characters')

  t.end()
})

test('validates.isBitcoinPrivateKey', (t) => {
  t.assert(
    validates.isBitcoinPrivateKey(validWIF),
    'valid WIF is valid'
  )

  const badInputs = [42, 'x', validWIF + 'xyzabc', validWIF.substring(0, 49)]
  badInputs.forEach((bad) => t.assert(!validates.isBitcoinPrivateKey(bad)))

  t.end()
})

test('currency validation', (t) => {
  t.assert(validates.errorsInCurrency('satoshi').length === 0)
  t.assert(!validates.isCurrency('usd'))
  t.end()
})

test('integer validation', (t) => {
  t.assert(validates.errorsInInteger('I am a lumberjack and I am ok! I sleep all night and I work all day!')[0] === 'must be a Integer')

  t.assert(validates.isInteger(1))
  t.assert(validates.isInteger(0))
  t.assert(!validates.isInteger({ichBin: 'Objekt'}))
  t.end()
})

test('string validation', (t) => {
  t.assert(validates.errorsInString(12345)[0] === 'must be a String')
  t.assert(validates.isString('lodash is amaze'))
  t.end()
})
