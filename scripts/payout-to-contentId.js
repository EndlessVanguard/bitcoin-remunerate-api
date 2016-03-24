// A simple script that sends all bitcoin associated with the arguments to the contentId's payoutAddress
const transaction = require("../src/utils/transaction")

function payoutContent (contentId){
  return transaction.payoutContent(contentId).then((result) => {
    console.log(result)
  })
}

process.argv.forEach((val, index, array) => {
  payoutContent(val).then(result => console.log(result))
  .catch((err) => {
    console.log(err)
  })
})
