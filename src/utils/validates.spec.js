const test = require('tape')
const validates = require('./validates')

const includes = require('lodash/includes')
const isEqual = require('lodash/isEqual')

const helper = require('test/helper')

test('validates.errorsInContentId', (t) => {
  t.assert(isEqual(validates.errorsInContentId('valid-content-id'), []))

  t.assert(isEqual(validates.errorsInContentId(),
                   ['contentId must be string']))

  t.assert(isEqual(validates.errorsInContentId('invalid content id'),
                   ['contentId can not contain spaces']))

  t.assert(includes(validates.errorsInContentId(4436),
                    'contentId must be String, is Number'))

  t.end()
})

test('validates.errorsInBitcoinAddress', (t) => {
  t.assert(
    isEqual(validates.errorsInBitcoinAddress(helper.validAddress), []),
    'no errors in address beginning with 1')

  t.assert(
    isEqual(validates.errorsInBitcoinAddress('39qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'), []),
    'no errors in address beginning with 3')

  const addressWithBadBeginning = '79qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
  t.assert(isEqual(
    validates.errorsInBitcoinAddress(addressWithBadBeginning),
    ['Bitcoin Address must begin with a "1" or "3"']
  ), 'Bitcoin Address must begin with 1 or 3')

  t.assert(includes(
    validates.errorsInBitcoinAddress(2381),
    'Bitcoin Address must be a String'
  ), 'Bitcoin Address must be String')

  const tooLongAddress = '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBwtrhortyihjtyhoytrg'
  t.assert(isEqual(
    validates.errorsInBitcoinAddress(tooLongAddress),
    ['Bitcoin Address can not be longer than 35 chars']
  ), 'Bitcoin Address can not be longer than 35 chars')

  t.assert(isEqual(
    validates.errorsInBitcoinAddress(helper.validAddress.substring(0, 25)),
    ['Bitcoin Address can not be shorter than 26 chars']
  ), 'Bitcoin Address can not be shorter than 26 chars')

  t.end()
})

test('validates.isBitcoinAddress', (t) => {
  t.assert(validates.isBitcoinAddress(helper.validAddress), 'valid address is valid')
  t.assert(!validates.isBitcoinAddress('x'), 'Bitcoin Address not starting with 1 or 3 are invalid')
  t.assert(!validates.isBitcoinAddress(1235), 'non-string addresses are invalid')

  t.end()
})

test('validates.errorsInPrivateKey', (t) => {
  t.assert(isEqual(validates.errorsInPrivateKey(helper.validWIF), []),
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
    validates.errorsInPrivateKey(helper.validWIF.substring(0, 40)),
    'Private Key WIF must be at least 51 characters long'
  ), 'Private Key WIF must be at least 51 characters long')

  t.assert(includes(
    validates.errorsInPrivateKey(helper.validWIF + 'abcdefgh'),
    'Private Key WIF can not be longer than 52 characters'
  ), 'Private Key WIF can not be longer than 52 characters')

  t.end()
})

test('validates.isBitcoinPrivateKey', (t) => {
  t.assert(
    validates.isBitcoinPrivateKey(helper.validWIF),
    'valid WIF is valid'
  )

  const badInputs = [42, 'x', helper.validWIF + 'xyzabc', helper.validWIF.substring(0, 49)]
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

test('validates.errorsInLabel', (t) => {
  const validLabel = 'This is a label'
  t.assert(
    isEqual(validates.errorsInLabel(''), ['No label given']),
    'Empty string is not valid label'
  )
  t.assert(
    isEqual(validates.errorsInLabel(), ['No label given']),
    'no label is not a valid label'
  )
  t.assert(
    validates.errorsInLabel(validLabel).length === 0,
    'valid label is valid'
  )
  t.end()
})

test('validates.errorsInJavascriptTimestamp', (t) => {
  const validTimestamp = 1462290285746 // momona epoch ;-)

  t.assert(includes(
    validates.errorsInJavascriptTimestamp(validTimestamp - 1),
    'Timestamp too old'
  ))

  t.end()
})

test('validates.optional', (t) => {
  const wrappedValidation = validates.optional(() => (['options ∀']))

  t.assert(isEqual(wrappedValidation(), []),
          'when value is "undefined" there will be no error')
  t.assert(isEqual(wrappedValidation(null), ['options ∀']),
          'when value is not "undefined" wrapped validation is called')

  t.end()
})
