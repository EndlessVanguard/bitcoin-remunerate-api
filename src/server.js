const isNil = require('lodash/isNil')

const blockchainApi = require('utils/blockchainApi')
const predicates = require('utils/predicates')
const Content = require('records/Content')
const Invoice = require('records/Invoice')

const app = require('express')()
app.use(require('cors')())

// index
app.get('/', (req, res) => (
  res.status(200).send('Welcome to Momona! Do GET /0/content/:contentId')
))

// api for content
app.get('/0/content', (req, res) => (
  res.status(400).json(sendMessage('missing contentId. Remember to put something after the /!'))
))
app.get('/0/content/:contentId', (req, res) => {
  const address = req.query.address
  const contentId = req.params.contentId

  if (isNil(address)) {
    const newAddress = Invoice.newKeypair(contentId)
    return res.status(402).json(sendPrompt(newAddress))
  }
  if (!predicates.isBitcoinAddress(address)) {
    return res.status(400).json(sendMessage(predicates.isBitcoinAddress(address, true)))
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
const server = app.listen(port, function () {
  console.log('server on', port, '😎')
})

// helper for response formats

const sendPrompt = (address) => ({
  display: 'payment.prompt',
  address: address
})

const sendMessage = (message) => ({
  message: message
})

// helper for data fetch

function isPaid (data) {
  if (data === 'Input too short' || data === 'Checksum does not validate') {
    return false
  }
  const price = 1
  const isPaid = data.total_received > price
  return isPaid
}

module.exports = {
  app: app,
  server: server
}
