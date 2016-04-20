// A simple script that sends all bitcoin associated with the arguments to the contentId's payoutAddress
const transaction = require('../src/utils/transaction')

function payoutContent (contentId) {
  console.log('payout', contentId)
  return transaction.payoutContent(contentId)
}

process.argv.forEach((val, index, array) => {
  if (index < 2) {
    return false
  }
  payoutContent(val)
  .then((result) => {
    console.log('result', result)
    process.exit(0)
  })
  .catch((err) => {
    console.log('script err: ', err)
    process.exit(1)
  })
})
