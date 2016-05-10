const request = require('request')
const includes = require('lodash/includes')
const trim = require('lodash/trim')

const blockchainUrl = 'https://blockchain.info/'

// Sometimes blockchain.info sends errors with status 200
// This is how we deal with that
const lookupErrors = [
  'Checksum does not validate',
  'Input too short',
  'Maximum concurrent requests from this IP reached. Please try again shortly.'
]

const broadcastTransaction = (transactionHex) => (
  new Promise((resolve, reject) => (
    request.post({
      url: blockchainUrl + 'pushtx',
      form: { tx: transactionHex }
    }, (error, res, body) => {
      if (error || includes(lookupErrors, trim(body))) {
        reject(error || body)
      } else {
        resolve(JSON.parse(body))
      }
    })
  ))
)

function getAddress (address) {
  return new Promise((resolve, reject) => {
    request.get({
      url: blockchainUrl + `rawaddr/${address}`
    }, (error, response, body) => {
      if (error || includes(lookupErrors, trim(body))) {
        reject(error || body)
      } else {
        resolve(JSON.parse(body))
      }
    })
  })
}

// TODO: do we need this method here, or should it be chained in getAddress?
function isPaid (blockchainHttpResponse) {
  if (includes(lookupErrors, blockchainHttpResponse)) {
    return false
  }
  const price = 1
  const isPaid = blockchainHttpResponse.total_received > price
  return isPaid
}

module.exports = {
  broadcastTransaction,
  getAddress,
  isPaid
}
