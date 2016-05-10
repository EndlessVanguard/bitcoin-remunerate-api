const test = require('tape')
const Invoice = require('./Invoice')

const isEqual = require('lodash/fp/isEqual')
const dissoc = require('lodash/fp/dissoc')

const validInvoice = {
  createdAt: 1462290285746,
  address: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw',
  contentId: 'my-cool-content',
  privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9'
}

test('Invoice.create', (t) => {
  // ☯λ☯λ☯λ \\
  t.assert(Invoice.isValidInvoice(Invoice.create('momona-demo-video')),
          'Invoice.create creates valid invoices')
  t.end()
})

test('Invoice.errorsInInvoice', (t) => {
  t.assert(isEqual(Invoice.errorsInInvoice(validInvoice), []),
           'Valid Invoice contains no errors')

  t.assert(!Invoice.isValidInvoice(dissoc(validInvoice, 'privateKey')),
           'Invoice without privateKey is invalid')
  t.assert(!Invoice.isValidInvoice(dissoc(validInvoice, 'createdAt')),
           'Invoice without createdAt timestamp is invalid')

  t.end()
})

test('Invoice.isPaid', (t) => {
  t.assert(Invoice.isPaid({ paymentTimestamp: Date.now() }),
           'when there is a paymentTimestamp, Invoice has been paid')
  t.assert(!Invoice.isPaid({}),
           'when there is no paymentTimestamp, Invoice has not been paid')
  t.end()
})

test('Invoice.markInvoiceAsPaid', (t) => {
  t.assert(Invoice.markInvoiceAsPaid(validInvoice).paymentTimestamp !== undefined,
          'will set the paymentTimestamp')
  t.end()
})
