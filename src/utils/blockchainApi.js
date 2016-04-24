const request = require('request')
const includes = require('lodash/includes')
const trim = require('lodash/trim')

const blockchainAddressLookupUrl = (address) => (
  'https://blockchain.info/rawaddr/' + address)

// Sometimes blockchain.info sends errors with status 200
// This is how we deal with that
const lookupErrors = [
  'Checksum does not validate',
  'Input too short',
  'Maximum concurrent requests from this IP reached. Please try again shortly.',
  'All Outputs Are Very Small you must include a min (10000) satoshi fee'
]

function lookup (address) {
  return new Promise((resolve, reject) => {
    request.get({
      url: blockchainAddressLookupUrl(address)
    }, (error, response, body) => {
      if (error || includes(lookupErrors, trim(body))) {
        return reject(error || body)
      } else {
        return resolve(JSON.parse(body)) // REBASE CHANGE FIX
      }
    })
  })
}

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
