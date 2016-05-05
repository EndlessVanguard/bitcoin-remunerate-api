const test = require('tape')
const currency = require('./currency')

test('currency.convertToSatoshi', (t) => {
  t.assert(
    currency.convertToSatoshi(1, 'SEK') < 40000,
    `bad times converting small whole amounts. Expected ${currency.convertToSatoshi(1, 'SEK')} to be less than 40000`)
  t.assert(
    currency.convertToSatoshi(0.5, 'EUR') < 300000,
    'bad times converting half a euro')
  t.assert(
    currency.convertToSatoshi(0.5, 'EUR') > 100000,
    `0.5 euro is overvalued, expected ${currency.convertToSatoshi(0.5, 'EUR')} to be > 200000`)
  t.equals(
    currency.convertToSatoshi(0.5, 'EUR') % 1,
    0,
    'currency convertion gives satoshis as int')
  t.assert(
    currency.convertToSatoshi(1, 'satoshi') === 1,
    'when currency is already satoshi, will return same amount given')

  t.end()
})
