const test = require('tape')
const validates = require('./validates')

const constant = require('lodash/fp/constant')
const includes = require('lodash/fp/includes')
const isEqual = require('lodash/fp/isEqual')
const times = require('lodash/fp/times')

const helper = require('test/helper')

test('validates.errorsInBitcoinAddress', (t) => {
  t.assert(isEqual(validates.errorsInBitcoinAddress(helper.validAddress),
                  []),
          'no errors in address beginning with 1')

  t.assert(isEqual(validates.errorsInBitcoinAddress('39qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'),
                  []),
          'no errors in address beginning with 3')

  const addressWithBadBeginning = '7'
  t.assert(includes('Bitcoin Address must begin with one of: "1", "3"',
                    validates.errorsInBitcoinAddress(addressWithBadBeginning)),
          'Bitcoin Address must begin with one of: "1", "3"')

  t.assert(includes('Bitcoin Address must be a String',
                    validates.errorsInBitcoinAddress(2381)),
          'Bitcoin Address must be String')

  const tooShortAddress = times(constant('1'), 25).join('')
  t.assert(includes('Bitcoin Address can not be shorter than 26 chars',
                    validates.errorsInBitcoinAddress(tooShortAddress)),
          'Bitcoin Address can not be shorter than 26 chars')

  const tooLongAddress = times(constant('1'), 36).join('')
  t.assert(includes('Bitcoin Address can not be longer than 35 chars',
                    validates.errorsInBitcoinAddress(tooLongAddress)),
          'Bitcoin Address can not be longer than 35 chars')

  t.end()
})

test('validates.isBitcoinAddress', (t) => {
  t.assert(validates.isBitcoinAddress(helper.validAddress),
          'valid address is valid')
  t.assert(!validates.isBitcoinAddress('x'),
          'Bitcoin Address not starting with 1 or 3 are invalid')
  t.assert(!validates.isBitcoinAddress(1235), 'non-string addresses are invalid')

  t.end()
})

test('validates.errorsInBitcoinPrivateKey', (t) => {
  t.assert(isEqual(validates.errorsInBitcoinPrivateKey(helper.validWIF),
                  []),
          'valid WIF is valid')

  t.assert(includes('Bitcoin Private Key WIF must be a String',
                    validates.errorsInBitcoinPrivateKey(123)),
          'must be a String')

  t.assert(includes('must begin with one of: "5", "K", "L"',
                    validates.errorsInBitcoinPrivateKey('x')),
          'must begin with one of: "5", "K", "L"]')

  const tooShortPrivateKey = times(constant('5'), 50).join('')
  t.assert(includes('Bitcoin Private Key WIF must be at least 51 characters long',
                    validates.errorsInBitcoinPrivateKey(tooShortPrivateKey)),
          'Bitcoin Private Key WIF must be at least 51 characters long')

  const tooLongPrivateKey = times(constant('5'), 53).join('')
  t.assert(includes('Bitcoin Private Key WIF can not be longer than 52 characters',
                    validates.errorsInBitcoinPrivateKey(tooLongPrivateKey)),
          'Bitcoin Private Key WIF can not be longer than 52 characters')

  t.end()
})

test('validates.isBitcoinPrivateKey', (t) => {
  t.assert(validates.isBitcoinPrivateKey(helper.validWIF),
          'valid WIF is valid')

  const badInputs = [42, 'x', `${helper.validWIF}xyzabc`, helper.validWIF.substring(0, 49)]
  badInputs.forEach((badPrivateKey) => t.assert(!validates.isBitcoinPrivateKey(badPrivateKey)))

  t.end()
})

test('validates.errorsInContentId', (t) => {
  t.assert(isEqual(validates.errorsInContentId('valid-content-id'),
                  []),
          'valid contentId is valid')

  t.assert(includes('contentId must be String',
                    validates.errorsInContentId()),
          'contentId must be a string')

  t.assert(includes('contentId can not contain spaces',
                    validates.errorsInContentId('invalid content id')),
          'contentId can not contain spaces')

  t.assert(includes('contentId must be String, is Number',
                    validates.errorsInContentId(4436)),
          'contentId must be String')

  t.end()
})

test('validates.errorsInCurrency && validates.isCurrency', (t) => {
  t.assert(validates.errorsInCurrency('satoshi').length === 0)
  t.assert(!validates.isCurrency('usd'))
  t.end()
})

test('validates.errorsInInteger && validates.isInteger', (t) => {
  t.assert(isEqual(
          validates.errorsInInteger('I am a lumberjack and I am ok! I sleep all night and I work all day!')[0],
          'must be a Integer'),
  'must be a Integer')

  t.assert(validates.isInteger(1))
  t.assert(validates.isInteger(0))
  t.assert(!validates.isInteger({ichBin: 'Objekt'}))
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

test('validates.errorsInString && validates.isString', (t) => {
  t.assert(validates.errorsInString(12345)[0] === 'must be a String')
  t.assert(validates.isString('lodash is amaze'))
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
