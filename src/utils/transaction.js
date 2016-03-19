const redisDb = require('../config/redis')

function payout(contentId, paymentList, startTimestamp, stopTimestamp) {
  return paymentList.filter(record => {
    return record.contentId === contentId &&
      record.paymentTimestamp > startTimestamp &&
      record.paymentTimestamp < stopTimestamp
  })
}

function fetch (startTimestamp, stopTimestamp, contentId) {
  return new Promise((resolve, reject) => {
    redisDb.get('*', (err, data) => {
      if(err) reject(err)
      resolve(data)
    })
  })
}

function makePayment (startTimestamp, stopTimestamp, contentId) {
  return fetch(date.lastweek, Date.now(), "my-cool-shit")
    .then((payments) => payout(contentId, payments, startTimestamp, stopTimestamp))
}

module.exports = {
  payout: payout,
  makePayment: makePayment,
}
