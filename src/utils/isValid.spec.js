const test = require('tape')
const isValid = require('./isValid')

const isEqual = require('lodash/isEqual')
const validates = require('../utils/validates.js')
const mockProperties = {
  contentId: validates.errorsInString,
  content: validates.errorsInString,
  price: validates.errorsInInteger,
  currency: validates.errorsInCurrency,
  payoutAddress: validates.errorsInBitcoinAddress
}

test('isValidRecord', (t) => {
  t.assert(isValid.isValidRecord({
    contentId: 'my-cool-content',
    content: 'This is a cool article about something interesting',
    price: 10000,
    currency: 'satoshi',
    payoutAddress: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
  }, mockProperties))
  t.end()
})

test('errorsInRecord', (t) => {
  t.assert(
    isEqual(
      isValid.errorsInRecord({
        contentId: 'my-cool-content',
        content: 'This is a cool article about something interesting',
        price: 10000,
        currency: 'satoshi',
        payoutAddress: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
      }, mockProperties),
      []
    ), 'Valid content contains no errors'
  )

  t.equal(
    isValid.errorsInRecord({
      contentId: 'my-cool-content',
      content: 'This is a cool article about something interesting',
      price: 10000,
      payoutAddress: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
    }, mockProperties).length,
    1,
    'Valid content contains no errors'
  )

  t.equal(
    isValid.errorsInRecord({
      contentId: 'my-cool-content',
      content: 'This is a cool article about something interesting',
      payoutAddress: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
    }, mockProperties).length,
    2,
    'Valid content contains no errors'
  )

  t.end()
})
