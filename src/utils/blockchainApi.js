const request = require('request')

function blockchainAddressLookupUrl (address) {
  return 'https://blockchain.info/rawaddr/' + address
}

function lookup (address) {
  return new Promise((resolve, reject) => {
    request.get({
      url: blockchainAddressLookupUrl(address)
    }, (error, response, body) => {
      if (!error) {
        resolve(response)
      } else {
        console.log('error!', error, response)
        reject(error)
      }
    })
  })
}

function broadcastTransaction (transactionHex) {
  console.log('broadcasting', transactionHex)
  return new Promise((resolve, reject) => {
    request.post({
      url: 'https://blockchain.info/pushtx',
      form: { tx: transactionHex }
    }, (err, res, body) => {
      if (err) { reject(err) }
      resolve(body)
    })
  })
}

module.exports = {
  broadcastTransaction: broadcastTransaction,
  lookup: lookup
}
