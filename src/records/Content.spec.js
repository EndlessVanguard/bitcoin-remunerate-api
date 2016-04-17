const test = require('tape')
const Content = require('./Content')
const isEqual = require('lodash/isEqual')

test('isValidContent', (t) => {
  t.assert(
    Content.isValidContent({
      contentId: 'my-cool-content',
      content: 'This is a cool article about something interesting',
      price: 10000,
      currency: 'satoshi',
      payoutAddress: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
    }),
    'valid content record is valid')
  t.assert(
    !Content.isValidContent({
      content: 'This is a cool article about something interesting',
      price: 10000,
      currency: 'satoshi',
      payoutAddress: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
    }),
    'content missing contentId is invalid')
  t.assert(
    !Content.isValidContent({
      contentId: 'my-cool-content',
      price: 10000,
      currency: 'satoshi',
      payoutAddress: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
    }),
    'content missing content is invalid')
  t.assert(
    !Content.isValidContent({
      contentId: 'my-cool-content',
      content: 'This is a cool article about something interesting',
      price: '10000',
      currency: 'satoshi',
      payoutAddress: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
    }),
    'price can not be string')
  t.end()
})

test('errorsInContent', (t) => {
  t.assert(
    isEqual(
      Content.errorsInContent({
        contentId: 'my-cool-content',
        content: 'This is a cool article about something interesting',
        price: 10000,
        currency: 'satoshi',
        payoutAddress: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
      }),
      []
    ), 'Valid content contains no errors'
  )

  t.equal(
    Content.errorsInContent({
      contentId: 'my-cool-content',
      content: 'This is a cool article about something interesting',
      price: 10000,
      payoutAddress: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
    }).length,
    1,
    'Valid content contains no errors'
  )

  t.equal(
    Content.errorsInContent({
      contentId: 'my-cool-content',
      content: 'This is a cool article about something interesting',
      payoutAddress: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
    }).length,
    2,
    'Valid content contains no errors')

  t.end()
})
