const request = require('request')

var currencyTable
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

function convertToSatoshi (amount, currency, currencyTable) {
  const bitcoinPrice = currencyTable[currency]['24h_avg']
  const oneCurrInBitcoin = 1 / bitcoinPrice

  return parseInt((amount * oneCurrInBitcoin) * 1e8, 10)
}

module.exports = {
  convertToSatoshi,
  initCurrencyConversionUpdating,
  currencyTable
}
