const request = require('request')

function blockchainKeyLookupUrl (key) {
  return 'https://blockchain.info/rawaddr/' + key
}

function lookup (key) {
  return new Promise((resolve, reject) => {
    request(blockchainKeyLookupUrl(key), function (error, response, body) {
      if (error) { reject(error) }
      resolve(JSON.parse(body))
    })
  })
}

module.exports = {
  blockchainKeyLookupUrl: blockchainKeyLookupUrl,
  lookup: lookup
}
