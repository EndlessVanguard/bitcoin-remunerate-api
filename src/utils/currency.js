const request = require('request')

// This value is unavailable from outside of this module
// Therefore convertToSatoshi can't be called with currencyTable as argument
// This is required for tests to work - when running `npm start` it will refresh
var currencyTable = require('../test/mockCurrencyTable.js')
const refreshCurrencyTable = () => {
  request('https://api.bitcoinaverage.com/ticker/global/all',
          (err, res, body) => {
            if (!err && res.statusCode === 200) {
              const currTable = JSON.parse(body)
              console.log('Refreshed currency table. 1 BTC =',
                          currTable['EUR']['24h_avg'], 'EUR')
              currencyTable = currTable
            } else {
              console.log('Error refreshing currency conversions', err)
            }
          })
}

function initCurrencyConversionUpdating () {
  refreshCurrencyTable()
  return setInterval(refreshCurrencyTable, 1000 * 120)
}

function convertToSatoshi (amount, currency) {
  const bitcoinPrice = currencyTable[currency]['24h_avg']
  const oneCurrInBitcoin = 1 / bitcoinPrice

  return parseInt((amount * oneCurrInBitcoin) * 1e8, 10)
}

module.exports = {
  convertToSatoshi,
  initCurrencyConversionUpdating
}
