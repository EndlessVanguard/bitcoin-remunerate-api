const request = require('request')

function blockchainAddressLookupUrl (address) {
  return 'https://blockchain.info/rawaddr/' + address
}

const lookup = (address) => (
  new Promise((resolve, reject) => (request.get(
    { url: blockchainAddressLookupUrl(address) },
    (error, response, body) => error ? reject(error) : resolve(JSON.parse(body))
  )))
)

function broadcastTransaction (transactionHex) {
  console.log('broadcasting\n')
  console.log(transactionHex)
  console.log('\n\n')
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

function isPaid (blockchainHttpResponse) {
  if (blockchainHttpResponse === 'Input too short' || blockchainHttpResponse === 'Checksum does not validate') {
    return false
  }
  const price = 1
  const isPaid = blockchainHttpResponse.total_received > price
  return isPaid
}

module.exports = {
  broadcastTransaction: broadcastTransaction,
  lookup: lookup,
  isPaid: isPaid
}
