const isNil = require('lodash/isNil')

const blockchainApi = require('utils/blockchainApi')
const predicates = require('utils/predicates')
const Content = require('records/Content')
const Invoice = require('records/Invoice')

const app = require('express')()
app.use(require('cors')())
app.use(require('body-parser').json({ limit: '500kb' }))

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

const contentReturnTypes = Object.freeze([
  'id', 'js', 'url'
])
const parseReturnType = (returnType, knownReturnTypes) => {
  if (isNil(returnType)) return 'url'
  returnType = returnType.toLowerCase()
  if (knownReturnTypes.indexOf(returnType) === -1) return null
  return returnType
}
const sendAsReturnType = (contentRecord, returnType) => {
  if (returnType === 'id') {
    return contentRecord.contentId
  } else if (returnType === 'js') {
    // TODO: need a template of the current build for web client and inject contentId
    return 'js-snippet'
  } else if (returnType === 'url') {
    return `https://api.momona.com/content/${contentRecord.contentId}`
  } else {
    throw Error(`invalid returnType ${returnType}`)
  }
}
app.post('/0/content', (req, res) => {
  const returnType = parseReturnType(req.query.return, contentReturnTypes)
  if (isNil(returnType)) {
    return res.status(400).json(sendMessage(`returnType ${req.query.return} not supported. Available options ${contentReturnTypes}`))
  }
  return Content.save(req.body)
    .then((contentRecord) => {
      res.status(200).send(sendAsReturnType(contentRecord, returnType))
    })
    .catch((error) => {
      res.status(400).json(sendMessage(error.message))
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
