const test = require('tape')
const currency = require('./currency')
const mockCurrencyTable = require('../test/mockCurrencyTable.js')

test('converting from euro to satoshi', (t) => {
  t.assert(
    currency.convertToSatoshi(1, 'SEK', mockCurrencyTable) < 40000,
    `bad times converting small whole amounts.
Expected ${currency.convertToSatoshi(1, 'SEK', mockCurrencyTable)} to be less than 40000`
  )
  t.assert(
    currency.convertToSatoshi(0.5, 'EUR', mockCurrencyTable) < 300000,
    'bad times converting half a euro'
  )
  t.assert(
    currency.convertToSatoshi(0.5, 'EUR', mockCurrencyTable) > 100000,
    `0.5 euro is overvalued, expected ${currency.convertToSatoshi(0.5, 'EUR', mockCurrencyTable)} to be > 200000`
  )
  t.equals(
    currency.convertToSatoshi(0.5, 'EUR', mockCurrencyTable) % 1,
    0,
    'currency convertion gives satoshis as int'
  )

  t.end()
})
