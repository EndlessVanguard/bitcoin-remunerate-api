const isNil = require('lodash/isNil')

const blockchainApi = require('utils/blockchainApi')
const Content = require('records/Content')
const Invoice = require('records/Invoice')

const app = require('express')()
app.use(require('cors')())

app.get('/', (req, res) => res.status(200).send(`Welcome to Momona! Do GET /0/content/:contentId`))
app.get('/0/content/:contentId', function (req, res) {
  const address = req.query.address
  const contentId = req.params.contentId

  if (isNil(address)) {
    const newAddress = Invoice.newKeypair(contentId)
    return res.status(402).json(sendPrompt(newAddress))
  }
  if (isNil(contentId)) {
    return res.status(400).send('missing contentId. Remember to put something after the /!')
  }

  Invoice.isAddressAndContentPaired(address, contentId)
    .then((addressFound) => {
      if (!addressFound) {
        const newAddress = Invoice.newKeypair(contentId)
        return res.status(402).json(sendPrompt(newAddress))
      }

      return blockchainApi.lookup(address)
        .then((rawAddressInformation) => {
          const body = JSON.parse(rawAddressInformation.body)
          if (isPaid(body)) {
            Invoice.markAsPaid(address)
            res.status(200).send(Content.fetchContent(contentId))
          } else {
            console.log('not paid')
            res.status(402).json(sendPrompt(address))
          }
        })
        .catch((error) => {
          console.log('ERROR: ', error)
          return res.status(500).send(
            'ERROR: bad times getting info from ' + address
          )
        })
    })
    .catch((error) => {
      console.log('ERROR: ', error)
      return res.status(500).send(
        'ERROR: bad times looking up ', address, contentId
      )
    })
})

const port = 3000
app.listen(port, function () {
  console.log('server on', port, '😎')
})

function sendPrompt (address) {
  return {
    display: 'payment.prompt',
    address: address
  }
}

// helper for data fetch

function isPaid (data) {
  if (data === 'Input too short' || data === 'Checksum does not validate') {
    return false
  }
  const price = 1
  const isPaid = data.total_received > price
  return isPaid
}
