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
    redisDb.keys('*', (err, data) => { // TODO this is blocking, and you need to REPENT! ✞
      if (err) reject(err)
      resolve(data)
    })
  })
}

function calculateFee (total) {
  // TODO: is 1% a fair way to calculate the miner's fee?
  return {
    payout: (total * 0.9),
    service: (total * 0.09),
    miner: (total * 0.01)
  }
}

function buildTransaction (inputsList, payoutAddress, serviceAddress) {
  const bitcoin = require('bitcoinjs-lib')
  var tx = new bitcoin.TransactionBuilder()

  inputsList.forEach((input, index) => {
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

function payoutContent (startTimestamp, stopTimestamp, contentId) {
  const date = { lastweek: Date.now() - 1 } // TODO(ms): make one week later
  return fetchContentAddresses(date.lastweek, Date.now(), 'my-cool-shit')
    .then((payments) => {
      // const blockchainApi = require('./blockchainApi')

      // const inputList = addressesPaidWithinTimeRange(contentId, payments, startTimestamp, stopTimestamp)
      // HERE remember to filter such that the total amount to pay out is greater than 0.1 bitcoin
      // const payoutAddress = getPayoutAddress(contentId)
      // const serviceAddress = getServiceAddress()
      // return bitcoinApi.broadcastTransaction(
      //    buildTransaction(inputsList, payoutAddress, serviceAddress)
      //  )
    })
}

module.exports = {
  addressesPaidWithinTimeRange: addressesPaidWithinTimeRange,
  buildTransaction: buildTransaction,
  calculateFee: calculateFee,
  payoutContent: payoutContent
}
