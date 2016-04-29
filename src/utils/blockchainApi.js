const isEqual = require('lodash/fp/isEqual')
const request = require('request')

const blockchainAddressLookupUrl = (address) => `https://blockchain.info/rawaddr/${address}`

const isRateLimited = (body) => (
  isEqual(body, 'Maximum concurrent requests from this IP reached. Please try again shortly.')
)

const lookup = (address) => (
  new Promise((resolve, reject) => (
    request.get({
      url: blockchainAddressLookupUrl(address)
    }, (error, response, body) => (
      error
      ? reject(error)
      : isRateLimited(body)
        ? reject(body)
        : resolve(JSON.parse(body))
    ))
  ))
)

const broadcastTransaction = (transactionHex) => (
  new Promise((resolve, reject) => (
    request.post({
      url: 'https://blockchain.info/pushtx',
      form: { tx: transactionHex }
    }, (error, res, body) => (
      error ? reject(error) : resolve(body)
    ))
  ))
)

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
