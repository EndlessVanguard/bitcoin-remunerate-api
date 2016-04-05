const test = require('tape')

const Invoice = require('./Invoice')

const validInvoices = [
  {
    contentId: '231-bitcoin-company-frees-us-from-the-terror-of-advertising',
    address: '12GxzzCayud4BUkpfoE2zwFJTQazop1PMw',
    privateKey: 'L18zSsEpb1ydjUyKJhscnKwn1fR3fESzLFd1iQrniXSXfWWdoULs',
    paymentTimestamp: 1459253598902
  },
  {
    contentId: '231-bitcoin-company-frees-us-from-the-terror-of-advertising',
    address: '12GxzzCayud4BUkpfoE2zwFJTQazop1PMw',
    privateKey: 'L18zSsEpb1ydjUyKJhscnKwn1fR3fESzLFd1iQrniXSXfWWdoULs',
  },
]

const invalidInvoices = [
  {
    address: '12GxzzCayud4BUkpfoE2zwFJTQazop1PMw',
    privateKey: 'L18zSsEpb1ydjUyKJhscnKwn1fR3fESzLFd1iQrniXSXfWWdoULs',
    paymentTimestamp: 1459253598902
  },
  {
    contentId: '231-bitcoin-company-frees-us-from-the-terror-of-advertising',
    privateKey: 'L18zSsEpb1ydjUyKJhscnKwn1fR3fESzLFd1iQrniXSXfWWdoULs',
    paymentTimestamp: 1459253598902
  },
  {
    contentId: '231-bitcoin-company-frees-us-from-the-terror-of-advertising',
    address: '12GxzzCayud4BUkpfoE2zwFJTQazop1PMw',
    paymentTimestamp: 1459253598902
  }
]
test('Valid invoice', (t) => {
  validInvoices.forEach((validInvoice) => {
    t.true(Invoice.validate(validInvoice), 'Valid invoice successfully validated')
  })
  t.end()
})

test('Invalid invoices', (t) => {
  invalidInvoices.forEach((invalidInvoice) => {
    t.false(Invoice.validate(invalidInvoice), 'Invalid invoice fails validation')
  })
  t.end()
})
