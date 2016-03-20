const test = require('tape')

const transaction = require('./transaction')

test('transaction.addressesPaidWithinTimeRange', (t) => {
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
  t.equal(actual, exepected, 'Time range filter works')
  t.end()
})

test('transaction.calculateFee', (t) => {
  const mockTotal = 100

  const actual = transaction.calculateFee(mockTotal)
  const expected = {
    payout: 90,
    service: 9,
    miner: 1
  }

  Object.keys(actual).forEach((key) => {
    t.equal(actual[key], expected[key], `${key} price is correct`)
  })
  t.end()
})

test('transaction.buildTransaction', (t) => {
  const mockInputList = ([
    {
      privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9',
      finalBalance: 100000,
      lastTransaction: '8a94cc11ea5f432aa53919c049ec4beaac0f663ffe239c2f5f33406484d10407'
    }
  ])
  const mockPayoutAddress = '12Lk2zCSFpUGsuXxHigNgwvqvaYJQzpyWd'
  const mockServiceAddress = '1G5Sf35VL4aEc8TBb16467eNaq61E4GVfB'

  const actual = transaction.buildTransaction(
    mockInputList,
    mockPayoutAddress,
    mockServiceAddress
  )
  const expected = '01000000010704d1846440335f2f9c23fe3f660facea4bec49c01939a52a435fea11cc948a000000006a473044022073e4b18365536ab57d088b17cef62060de44c596634b1463c31b5a4a0bcb525002200e560aaa4f4c57e87a6704f28a202dde2f4f23744809a2e1c8f2549960e43fc401210346de948d9486886c4b91ded5cb282f541d6f86247dab923c231153ed39823299ffffffff02905f0100000000001976a9140eb3f3c5b78f32cd2d86b6b530c7cd9a6d05a78388ac28230000000000001976a914a560f78beb580526e198f18ab7c8025a3f6221d788ac00000000'
  t.equal(actual, expected, 'transaction hex matches')
  t.end()
})
