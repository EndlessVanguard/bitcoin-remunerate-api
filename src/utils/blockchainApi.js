const request = require('request')
const isEqual = require('lodash/fp/isEqual')

function blockchainAddressLookupUrl (address) {
  return 'https://blockchain.info/rawaddr/' + address
}

const lookup = (address) => (
  new Promise((resolve, reject) => (
    request.get(
      { url: blockchainAddressLookupUrl(address) },
      (error, response, body) => {
        if (error) {
          return reject(error)
        } else {
          if (isEqual(body, 'Maximum concurrent requests from this IP reached. Please try again shortly.')) {
            reject(body)
          }
          return resolve(JSON.parse(body))
        }
      }
    )
  ))
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
