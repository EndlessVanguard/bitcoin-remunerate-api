const fetch = {
  contentAddresses: (contentId) => {
    const redisDb = require('../config/redis')
    return new Promise((resolve, reject) => {
      redisDb.keys('*', (err, data) => { // TODO this is blocking, and you need to REPENT! ✞
        if (err) reject(err)
        resolve(data)
      })
    })
  },
  getLastTransactionId: (bitcoinPrivateKeyWIF) => {
    const blockchainApi = require('./blockchainApi')
    const bitcoin = require('bitcoinjs-lib')
    const address = bitcoin.ECPair.fromWIF(bitcoinPrivateKeyWIF).getAddress()
    bitcoinPrivateKeyWIF = undefined

    return blockchainApi.lookup(address)
    .then((addressInfo) => {
      console.log(addressInfo.txs)
      return addressInfo
    })
  },
  getInput: (bitcoinAddress) => {
    const redisDb = require('../config/redis')
    return new Promise((resolve, reject) => {
      redisDb.get(bitcoinAddress, (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })
  },
  inputsList: (contentId) => {
    // To get inputsList, we need to first fetch all the keys.
    // For each key, we need to fetch redisDb.get for that key
    return fetch.contentAddresses(contentId).then((addresses) => {
      return Promise.all(
        addresses.map((address) => {
          return fetch.getInput(address).then(JSON.parse)
        })
      )
    })
  },
  contentPayoutAddress: (contentId) => {
    const contentDb = require('../../config/content-database')
    const address = contentDb[contentId]

    return address
  },
  serviceAddress: () => {
    // TODO: we should calculate a new keypair, track it, and respond ꙲
    return '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw'
  }
}

const isObject = require('lodash/isObject')
function addressesPaidWithinTimeRange (contentId, timestamps, paymentList) {
  // Return inputsList, to be passed to buildTransaction
  // inputsList is an array of objects
  // {
  //    lastTransaction: bitcoin transactionId hash,
  //    finalBalance: amount of satoshis,
  //    privateKey: The private key for this address,
  // }
  // TODO refactor this to only be the callback.
  // Someone else can do the paymentList.filter
  // Instead this function now has 2 purposes
  const returnValue = paymentList.filter((record) => {
    console.assert(
      isObject(record),
      'TypeError: expected Object, got ' + (typeof record)
    )

    if (record.contentId === contentId) { return true }

    if (record.payment) {
      return record.payment.timestamp > timestamps.startTimestamp &&
             record.payment.timestamp < timestamps.stopTimestamp
    }
    return false
  })
  return returnValue
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

  const isArray = require('lodash/isArray')
  console.assert(isArray(inputsList), 'TypeError: inputsList not an Array')
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
function isValidInput (inputObj) {
  const isObject = require('lodash/isObject')
  if (!isObject(inputObj)) { return false }
  // type test of transaction input
  if (!('finalBalance' in inputObj)) { return false }
  if (!('privateKey' in inputObj)) { return false }
  if (!('lastTransaction' in inputObj)) { return false }
  return true
}
function payoutContent (contentId) {
  // side effecty. Pays out all outstanding balances we owe to contentId
  const blockchainApi = require('./blockchainApi')
  // inputsList: [
  //   {
  //     privateKey: 'L1dHE6RmNw345p2wy5m6dzyULAzqM96HdeHrfAKgU5sLYrNYpup9',
  //     finalBalance: 100000,
  //     lastTransaction: '8a94cc11ea5f432aa53919c049ec4beaac0f663ffe239c2f5f33406484d10407'
  //   }
  // ],
  // payoutAddress: '12Lk2zCSFpUGsuXxHigNgwvqvaYJQzpyWd',
  // serviceAddress: '1G5Sf35VL4aEc8TBb16467eNaq61E4GVfB'
  return fetch.inputsList(contentId)
  .then((inputsList) => {
    return Promise.all(
      inputsList.map((input, index) => {
        return fetch.getLastTransactionId(input.privateKey)
      })
    ).then((data) => {
      console.log('pmap done', data)
      return data.filter((val) => {
        console.log('val', val)
      })
    })
  })
  .then((inputsList) => {
    console.log('allData', inputsList)
    inputsList.forEach((input, index) => {
      console.assert(
        isValidInput(input),
        'TypeError: inputsList contains invalid inputs'
      )
    })

    return {
      inputsList: inputsList,
      payoutAddress: fetch.contentPayoutAddress(),
      serviceAddress: fetch.serviceAddress()
    }
  })
  // Done generating inputsList
  .then(buildTransaction)
  .then(blockchainApi.broadcastTransaction)
}

// function payoutContent (contentId) {
//   const moment = require('moment')
//   const blockchainApi = require('./blockchainApi')
//   const timestamps = {
//     // TODO: how to get moment to spit out a ISO
//     startTimestamp: parseInt(moment().subtract(1, 'week').startOf('week') + '', 10),
//     stopTimestamp: Date.now()
//   }
//   return fetch.contentAddresses(contentId, timestamps)
//     .then((unfilteredInputsList) => {
//       // console.log('unfilteredInputsList', unfilteredInputsList)
//       const addressesList = addressesPaidWithinTimeRange(contentId, timestamps, unfilteredInputsList)
//       // console.log('addressesList', addressesList)
//
//       return Promise.all([
//         // TODO define paymentList
//         instaPromise(addressesList),
//         instaPromise(fetch.contentPayoutAddress(contentId)),
//         instaPromise(fetch.serviceAddress())
//       ])
//     })
//     .then((data) => {
//       // console.log('then data[0]', data[0])
//       return {
//         inputsList: data[0],
//         contentAddress: data[1],
//         serviceAddress: data[2]
//       }
//     })
//     .then(buildTransaction)
//     .then(blockchainApi.broadcastTransaction)
// }

module.exports = {
  addressesPaidWithinTimeRange: addressesPaidWithinTimeRange,
  buildTransaction: buildTransaction,
  calculateFee: calculateFee,
  payoutContent: payoutContent,
  isValidInput: isValidInput
}
