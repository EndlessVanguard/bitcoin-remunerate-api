const test = require('tape')

const transaction = require('./transaction')
test('transaction.addressesPaidWithinTimeRange', (t) => {
  t.plan(1)

  const mockContentId = '123abc'
  const mockData = [
    {
      contentId: mockContentId,
      payment: {
        amount: 500000,
        timestamp: Date.now()
      }
    },
    {
      contentId: mockContentId,
      payment: {
        amount: 50000,
        timestamp: Date.now()
      }
    },
    {
      contentId: mockContentId + 'nope'
    }
  ]
  const timestamps = {
    start: (Date.now() - 1),
    stop: (Date.now() + 1)
  }

  const actual = transaction.addressesPaidWithinTimeRange(mockContentId, mockData, timestamps.start, timestamps.stop).length
  const exepected = 2
  t.equal(actual, exepected)
})
