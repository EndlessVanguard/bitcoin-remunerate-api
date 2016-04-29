const test = require('tape')
const Invoice = require('./Invoice')

const isEqual = require('lodash/isEqual')

test('errorsInInvoice', (t) => {
  t.assert(
    isEqual(
      Invoice.errorsInInvoice({
        address: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw',
        contentId: 'my-cool-content',
        privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9'
      }),
      []
    ), 'Valid content contains no errors'
  )

  t.assert(
    !Invoice.isValidInvoice({
      address: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw',
      privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9'
    }),
    'Invalid invoice is not valid'
  )
  t.end()
})
