const test = require('tape')
const isValid = require('./isValid')

const dissoc = require('lodash/fp/dissoc')
const isEqual = require('lodash/isEqual')

const validates = require('utils/validates.js')

const mockProperties = {
  contentId: validates.errorsInString,
  content: validates.errorsInString,
  price: validates.errorsInInteger,
  currency: validates.errorsInCurrency,
  payoutAddress: validates.errorsInBitcoinAddress
}

const validRecord = {
  contentId: 'my-cool-content',
  content: 'This is a cool article about something interesting',
  price: 10000,
  currency: 'satoshi',
  payoutAddress: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
}

test('isValidRecord', (t) => {
  t.assert(isValid.isValidRecord(validRecord, mockProperties))
  t.assert(!isValid.isValidRecord(dissoc('payoutAddress', validRecord), mockProperties))
  t.end()
})

test('errorsInRecord', (t) => {
  t.assert(
    isEqual(
      isValid.errorsInRecord(validRecord, mockProperties),
      []
    ), 'Valid content contains no errors'
  )

  t.equal(
    isValid.errorsInRecord(dissoc('currency', validRecord), mockProperties).length,
    1,
    'Removing required field in Record gives errors'
  )

  console.log(isValid.errorsInRecord(
    dissoc('currency', dissoc('payoutAddress', validRecord)),
    mockProperties))

  t.assert(
    isEqual(
      isValid.errorsInRecord(
        dissoc('currency', dissoc('payoutAddress', validRecord)),
        mockProperties
      ),
      ['Currency must be "satoshi"',
       'Bitcoin Address must begin with a "1" or "3"',
       'Bitcoin Address must be a String']
    ),
    'Removing many required fields yields multiple errors'
  )

  t.end()
})
