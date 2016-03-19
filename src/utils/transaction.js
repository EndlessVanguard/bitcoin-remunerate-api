const redisDb = require('../config/redis')

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

function fetch (startTimestamp, stopTimestamp, contentId) {
  return new Promise((resolve, reject) => {
    redisDb.get('*', (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
}

function makePayment (startTimestamp, stopTimestamp, contentId) {
  const date = { lastweek: Date.now() - 1 } // TODO(ms): make one week later
  return fetch(date.lastweek, Date.now(), 'my-cool-shit')
    .then((payments) => addressesPaidWithinTimeRange(contentId, payments, startTimestamp, stopTimestamp))
}

module.exports = {
  addressesPaidWithinTimeRange: addressesPaidWithinTimeRange,
  makePayment: makePayment
}
