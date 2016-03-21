const fetch = {
  contentAddresses: (contentId, query) => {
    const redisDb = require('../config/redis')
    return new Promise((resolve, reject) => {
      redisDb.keys('*', (err, data) => { // TODO this is blocking, and you need to REPENT! ✞
        if (err) reject(err)
        resolve(data)
      })
    })
  },
  contentPayoutAddress: (contentId) => {
    const contentDb = require('config/content-database')
    return contentDb[contentId]
  },
  serviceAddress: () => {
    // TODO: we should calculate a new keypair, track it, and respond ꙲
    return 'MY-KEY'
  }
}

function addressesPaidWithinTimeRange (contentId, query, paymentList) {
  // function that returns a list of all pubkeys successfully paid inbetween startTimestamp & stopTimestamp
  return paymentList.filter((record) => {
    if (record.contentId === contentId) { return true }

    if (record.payment) {
      return record.payment.timestamp > query.startTimestamp &&
             record.payment.timestamp < query.stopTimestamp
    }
    return false
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

function buildTransaction (transactionInfo) {
  const bitcoin = require('bitcoinjs-lib')
  const inputsList = transactionInfo.inputsList
  const payoutAddress = transactionInfo.payoutAddress
  const serviceAddress = transactionInfo.serviceAddress
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

function payoutContent (contentId) {
  const moment = require('moment')
  const blockchainApi = require('./blockchainApi')
  const query = {
    // TODO: how to get moment to spit out a ISO
    startTimestamp: parseInt(moment().subtract(1, 'week').startOf('week') + '', 10),
    stopTimestamp: Date.now()
  }
  return fetch.contentAddresses(contentId, query)
    .then(() => {
      return Promise.all(
        addressesPaidWithinTimeRange.bind(null, contentId, query),
        fetch.contentPayoutAddress(contentId),
        fetch.serviceAddress()
      )
    })
    .then((data) => {
      return {
        inputsList: data[0],
        contentAddress: data[1],
        serviceAddress: data[2]
      }
    })
    .then(buildTransaction)
    .then(blockchainApi.broadcastTransaction)
}

module.exports = {
  addressesPaidWithinTimeRange: addressesPaidWithinTimeRange,
  buildTransaction: buildTransaction,
  calculateFee: calculateFee,
  payoutContent: payoutContent
}
