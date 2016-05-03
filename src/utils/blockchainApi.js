const isEqual = require('lodash/fp/isEqual')
const request = require('request')

const blockchainUrl = (path) => `https://blockchain.info/${path}`

// api calls

const broadcastTransaction = (transactionHex) => (
  new Promise((resolve, reject) => (
    request.post({
      url: blockchainUrl('pushtx'),
      form: { tx: transactionHex }
    }, (error, res, body) => {
      if (error) {
        reject(error)
      } else {
        isRateLimited(body) ? reject(body) : resolve(body)
      }
    })
  ))
)

const getAddress = (address) => (
  new Promise((resolve, reject) => (
    request.get({
      url: blockchainUrl(`rawaddr/${address}`)
    }, (error, response, body) => {
      if (error) {
        reject(error)
      } else {
        isRateLimited(body) ? reject(body) : resolve(JSON.parse(body))
      }
    })
  ))
)

// helpers

// TODO: do we need this method here, or should it be chained in getAddress?
function isPaid (blockchainHttpResponse) {
  if (blockchainHttpResponse === 'Input too short' || blockchainHttpResponse === 'Checksum does not validate') {
    return false
  }
  const price = 1
  const isPaid = blockchainHttpResponse.total_received > price
  return isPaid
}

const isRateLimited = (body) => (
  isEqual(body, 'Maximum concurrent requests from this IP reached. Please try again shortly.')
)

module.exports = {
  broadcastTransaction,
  getAddress,
  isPaid
}
