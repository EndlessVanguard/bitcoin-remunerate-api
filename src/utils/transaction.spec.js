const test = require('tape')

require

const transaction = require('./transaction')
test('transaction.payout', (t) => {
  t.plan(1)

  const mockContentId = '123abc'
  const mockData = [
    {
      contentId: mockContentId,
      paymentTimestamp: Date.now(),
    },
    {
      contentId: mockContentId,
      paymentTimestamp: Date.now(),
    },
    {
      contentId: mockContentId + 'nope',
      paymentTimestamp: Date.now(),
    },
  ]
  const timestamps = {
    start: (Date.now() - 1),
    stop: (Date.now() + 1),
  }

  const actual = transaction.payout(mockContentId, mockData, timestamps.start, timestamps.stop).length;
  const exepected = 2
  t.equal(actual, exepected)
})
