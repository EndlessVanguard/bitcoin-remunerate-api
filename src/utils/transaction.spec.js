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
  const query = {
    startTimestamp: (Date.now() - 1),
    stopTimestamp: (Date.now() + 1)
  }
  const filteredInputsList = transaction.addressesPaidWithinTimeRange(mockContentId, query, mockData)

  const actual = filteredInputsList.length
  const exepected = 2
  t.equal(actual, exepected, 'Time range filter works')
  t.end()
})

test('transaction.buildTransaction', (t) => {
  const mockData = {
    inputsList: [
      {
        privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9',
        finalBalance: 100000,
        lastTransaction: '8a94cc11ea5f432aa53919c049ec4beaac0f663ffe239c2f5f33406484d10407'
      }
    ],
    payoutAddress: '12Lk2zCSFpUGsuXxHigNgwvqvaYJQzpyWd',
    serviceAddress: '1G5Sf35VL4aEc8TBb16467eNaq61E4GVfB'
  }

  const actual = transaction.buildTransaction(mockData)
  const expected = '01000000010704d1846440335f2f9c23fe3f660facea4bec49c01939a52a435fea11cc948a000000006a47304402205c28b871d1dc84efc7d77a2f086d4edfd13db36f5e27e9a8c16a0abffb580c3c02200ab5d3620b9759559e68a92058bbf42ac2619fa30ba092683cca1e45d0420dfc01210346de948d9486886c4b91ded5cb282f541d6f86247dab923c231153ed39823299ffffffff02b1610100000000001976a9140eb3f3c5b78f32cd2d86b6b530c7cd9a6d05a78388acfb220000000000001976a914a560f78beb580526e198f18ab7c8025a3f6221d788ac00000000'
  t.equal(actual, expected, 'transaction hex matches')
  t.end()
})

test('transaction.calculateFee', (t) => {
  const mockTotal = 1000
  const actual = transaction.calculateFee(mockTotal)
  const expected = {
    payout: 455,
    service: 45,
    miner: 500
  }

  Object.keys(actual).forEach((key) => {
    t.equal(actual[key], expected[key], `${key} price is correct`)
  })
  t.end()
})

test('transaction.isValidInput', (t) => {
  const validInput = {
    privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9',
    finalBalance: 100000,
    lastTransaction: '8a94cc11ea5f432aa53919c049ec4beaac0f663ffe239c2f5f33406484d10407'
  }
  const invalidInputs = [
    {
      finalBalance: 100000,
      lastTransaction: '8a94cc11ea5f432aa53919c049ec4beaac0f663ffe239c2f5f33406484d10407'
    },
    {
      privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9',
      finalBalance: 100000
    },
    {
      privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9',
      lastTransaction: '8a94cc11ea5f432aa53919c049ec4beaac0f663ffe239c2f5f33406484d10407'
    }
  ]
  t.equal(true, transaction.isValidInput(validInput), 'good input is valid')
  t.equal(false, transaction.isValidInput(invalidInputs[0]), 'input needs private key')
  t.equal(false, transaction.isValidInput(invalidInputs[1]), 'input needs lastTransaction')
  t.equal(false, transaction.isValidInput(invalidInputs[2]), 'input needs finalBalance')
  t.end()
})
