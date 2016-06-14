const test = require('tape')
const transaction = require('./transaction')

const isEqual = require('lodash/fp/isEqual')

const helper = require('test/helper')

test('transaction.buildTransaction', (t) => {
  const mockTransactionInfo = {
    UTXO: [
      {
        addr: helper.validAddress,
        hash: '6d265ee112592132af41439181ce53f5114d99d144fb390f666f5e59e8f59dbd',
        n: 0,
        privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9',
        spent: false,
        value: 100000
      },
      {
        addr: helper.validAddress,
        hash: 'a6d0dfe423e1f92db2f9c3c26c1d6d78c6ce81befe2f4f926c8c91583670da25',
        n: 10,
        privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9',
        spent: false,
        value: 100000
      },
      {
        addr: helper.validAddress,
        hash: 'b8ee8dc1ec4fefbbc76cd173c8fe8af39cfc54caeedb2e4db1696fcb051fccb1',
        n: 20,
        privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9',
        spent: false,
        value: 100000
      },
      {
        addr: helper.validAddress,
        hash: 'b8ee8dc1ec4fefbbc76cd173c8fe8af39cfc54caeedb2e4db1696fcb051fccb1',
        n: 21,
        privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9',
        spent: false,
        value: 100000
      }
    ],
    payoutAddress: '12Lk2zCSFpUGsuXxHigNgwvqvaYJQzpyWd',
    serviceAddress: '1G5Sf35VL4aEc8TBb16467eNaq61E4GVfB'
  }

  const actual = transaction.buildTransaction(mockTransactionInfo)
  const expected = '0100000004bd9df5e8595e6f660f39fb44d1994d11f553ce81914341af32215912e15e266d000000006a47304402201fc6af27fe7316e267949cc9d4dd238a85c8fe6dd639fd5260824068810aa7c90220564d8100cb60fd815b939a6da3aa87be6e78c8f3af9d8b0a6996077295fb883b01210346de948d9486886c4b91ded5cb282f541d6f86247dab923c231153ed39823299ffffffff25da703658918c6c924f2ffebe81cec6786d1d6cc2c3f9b22df9e123e4dfd0a60a0000006a473044022007d755ed2472fc667e4cdb9e70c2ef78b351b899d07b3f8d22d771927e08295b02200343091ab6777bea4850cb9cdca777ff262e5104cb8b55694117910c0b19307601210346de948d9486886c4b91ded5cb282f541d6f86247dab923c231153ed39823299ffffffffb1cc1f05cb6f69b14d2edbeeca54fc9cf38afec873d16cc7bbef4fecc18deeb8140000006b483045022100b27cd2a500fee6f26e19e9d41383c8d076a50f0ac85f5ba9e1bafb2b2d4b17ca02203cbe1b110566ef8c9838de7c14a20452eb922b01cdebe8076f8a9b8a9a6e5be701210346de948d9486886c4b91ded5cb282f541d6f86247dab923c231153ed39823299ffffffffb1cc1f05cb6f69b14d2edbeeca54fc9cf38afec873d16cc7bbef4fecc18deeb8150000006b4830450221009426671c6a07ea404cfdd94fefb080b7e98e19423550fc3ce5d21c156925ab4a02204cb624d498ea3913456e4e507bcae80b682a750d6418fabb2e9c591014f3e00d01210346de948d9486886c4b91ded5cb282f541d6f86247dab923c231153ed39823299ffffffff02198c0500000000001976a9140eb3f3c5b78f32cd2d86b6b530c7cd9a6d05a78388ac738c0000000000001976a914a560f78beb580526e198f18ab7c8025a3f6221d788ac00000000'
  t.equal(actual, expected, 'transaction hex matches')
  t.end()
})

test('transaction.calculateFee', (t) => {
  const mockTotal = 100000 // 100,000

  const actual = transaction.calculateFee(mockTotal)
  const expected = {
    payout: 90545,
    service: 8955
  }

  Object.keys(actual).forEach((key) => {
    t.equal(actual[key], expected[key], `${key} price is correct`)
  })
  t.end()
})

test('transaction.getUTXO', (t) => {
  // https://blockchain.info/rawaddr/19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw
  const mockInvoiceList = [
    {
      address: helper.validAddress,
      privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9',
      final_balance: 300000,
      txs: [
        {
          hash: '6d265ee112592132af41439181ce53f5114d99d144fb390f666f5e59e8f59dbd',
          out: [
            {
              addr: helper.validAddress,
              n: 0,
              spent: false,
              value: 100000
            }
          ]
        },
        {
          hash: 'a6d0dfe423e1f92db2f9c3c26c1d6d78c6ce81befe2f4f926c8c91583670da25',
          out: [
            {
              addr: helper.validAddress,
              n: 10,
              spent: false,
              value: 100000
            },
            { // filtered by addr
              addr: `${helper.validAddress}nope`,
              n: 11,
              spent: false,
              value: 100000
            }
          ]
        }
      ]
    },
    {
      address: helper.validAddress,
      privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9',
      final_balance: 200000,
      txs: [
        {
          hash: 'b8ee8dc1ec4fefbbc76cd173c8fe8af39cfc54caeedb2e4db1696fcb051fccb1',
          out: [
            {
              addr: helper.validAddress,
              n: 20,
              spent: false,
              value: 100000
            },
            {
              addr: helper.validAddress,
              n: 21,
              spent: false,
              value: 100000
            },
            { // filtered by spent
              addr: helper.validAddress,
              n: 23,
              spent: true,
              value: 100000
            }
          ]
        }
      ]
    }
  ]

  const actual = transaction.getUTXO(mockInvoiceList)
  const expected = [
    {
      addr: helper.validAddress,
      hash: '6d265ee112592132af41439181ce53f5114d99d144fb390f666f5e59e8f59dbd',
      n: 0,
      privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9',
      spent: false,
      value: 100000
    },
    {
      addr: helper.validAddress,
      hash: 'a6d0dfe423e1f92db2f9c3c26c1d6d78c6ce81befe2f4f926c8c91583670da25',
      n: 10,
      privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9',
      spent: false,
      value: 100000
    },
    {
      addr: helper.validAddress,
      hash: 'b8ee8dc1ec4fefbbc76cd173c8fe8af39cfc54caeedb2e4db1696fcb051fccb1',
      n: 20,
      privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9',
      spent: false,
      value: 100000
    },
    {
      addr: helper.validAddress,
      hash: 'b8ee8dc1ec4fefbbc76cd173c8fe8af39cfc54caeedb2e4db1696fcb051fccb1',
      n: 21,
      privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9',
      spent: false,
      value: 100000
    }
  ]
  t.assert(isEqual(actual, expected),
          'UTXO filtered by address & spent then annotated with transaction hash and privateKey')
  t.end()
})
