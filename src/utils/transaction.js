function addressesPaidWithinTimeRange (contentId, paymentList, startTimestamp, stopTimestamp) {
  // function that returns a list of all pubkeys successfully paid inbetween startTimestamp & stopTimestamp
  return paymentList.filter((record) => {
    if (record.contentId === contentId) { return true }

    if (record.payment) {
      return record.payment.timestamp > startTimestamp &&
             record.payment.timestamp < stopTimestamp
    }
    return false
  })
}

function fetchContentAddresses (startTimestamp, stopTimestamp, contentId) {
  const redisDb = require('../config/redis')
  return new Promise((resolve, reject) => {
    redisDb.get('*', (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
}

function calculateFee(total) {
  // TODO: is 1% a fair way to calculate the miner's fee?
  return {
    payout: (total * 0.9),
    service: (total * 0.09),
    miner: (total * 0.01)
  }
}

function buildTransaction(inputsList, payoutAddress, serviceAddress) {
  const bitcoin = require('bitcoinjs-lib')
  var tx = new bitcoin.TransactionBuilder()

  inputsList.forEach((input, index) => {
    var keyPair = bitcoin.ECPair.fromWIF(input.privateKey)
    tx.addInput(input.lastTransaction, index)
  })

  const amount = calculateFee(
    inputsList.reduce((sum, x) => sum + x.finalBalance, 0)
  )

  tx.addOutput(payoutAddress, amount.payout)
  tx.addOutput(serviceAddress, amount.service)

  inputsList.forEach((input, index) => {
    var keyPair = bitcoin.ECPair.fromWIF(input.privateKey)
    tx.sign(index, keyPair)
  })
  return tx.build().toHex()
}

function broadcastTransaction(transactionHex) {
  const request = require('request')
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

function payoutContent (startTimestamp, stopTimestamp, contentId) {
  const date = { lastweek: Date.now() - 1 } // TODO(ms): make one week later
  return fetchContentAddresses(date.lastweek, Date.now(), 'my-cool-shit')
    .then((payments) => addressesPaidWithinTimeRange(contentId, payments, startTimestamp, stopTimestamp))
}

module.exports = {
  addressesPaidWithinTimeRange: addressesPaidWithinTimeRange,
  buildTransaction: buildTransaction,
  broadcastTransaction: broadcastTransaction,
  calculateFee: calculateFee,
  payoutContent: payoutContent
}
