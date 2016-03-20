const request = require('request')

function blockchainAddressLookupUrl (address) {
  return 'https://blockchain.info/rawaddr/' + address
}

function lookup (address) {
  return new Promise((resolve, reject) => {
    request.get({
      url: blockchainAddressLookupUrl(address)
    }, function (error, response, body) {
      if (error) { reject(error) }
      resolve(JSON.parse(body))
    })
  })
}

function broadcastTransaction(transactionHex) {
  return new Promise((resolve, reject) => {
    request.post({
      url: 'https://blockchain.info/pushtx',
      form: { tx: transactionHex }
    }, (err, res, body) => {
      if(err) { reject(err) }
      resolve(body)
    })
  })
}


module.exports = {
  broadcastTransaction: broadcastTransaction,
  lookup: lookup
}
