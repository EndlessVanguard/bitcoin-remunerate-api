const test = require('tape')
const Invoice = require('./Invoice')
const isEqual = require('lodash/isEqual')
const dissoc = require('lodash/fp/dissoc')

const validInvoice = {
  createdAt: 1462287817,
  address: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw',
  contentId: 'my-cool-content',
  privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9'
}

test('errorsInInvoice', (t) => {
  t.assert(isEqual(Invoice.errorsInInvoice(validInvoice), []),
           'Valid content contains no errors')

  t.assert(!Invoice.isValidInvoice(dissoc(validInvoice, 'privateKey')),
           'Invoice without privateKey is invalid')
  t.assert(!Invoice.isValidInvoice(dissoc(validInvoice, 'createdAt')),
           'Invoice without createdAt timestamp is invalid')

  t.end()
})
