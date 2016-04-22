const test = require('tape')
const Content = require('./Content')
const isEqual = require('lodash/isEqual')
const R = require('ramda')

const validContent = {
  contentId: 'my-cool-content',
  content: 'This is a cool article about something interesting',
  price: 10000,
  currency: 'satoshi',
  label: 'This string shows up in peoples bitcoin wallets',
  payoutAddress: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
}

test('isValidContent', (t) => {
  t.assert(
    Content.isValidContent(validContent),
    'Valid Content record is valid')
  t.assert(
    !Content.isValidContent(R.dissoc('contentId', validContent)),
    'Content is missing contentId is invalid')
  t.assert(
    !Content.isValidContent(R.dissoc('content', validContent)),
    'Content is missing content is invalid')
  t.assert(
    !Content.isValidContent(R.assoc('price', '10000', validContent)),
    'Content price can not be string')
  t.end()
})

test('errorsInContent', (t) => {
  t.assert(isEqual(
    Content.errorsInContent(validContent),
    []
  ), 'Valid content contains no errors')

  t.equal(
    Content.errorsInContent(R.dissoc('currency', validContent)).length,
    1,
    'Content missing currency gives an error')

  t.equal(
    // Currying can make this prettier somehow
    Content.errorsInContent(R.dissoc('price',
                                     R.dissoc('currency', validContent))).length,
    2,
    'Content missing price and currency has 2 errors')

  t.end()
})