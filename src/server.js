const isNil = require('lodash/isNil')

const apiVersion = 0

const Content = require('records/Content')
const Invoice = require('records/Invoice')
const blockchainApi = require('utils/blockchainApi')
const validates = require('utils/validates')

const app = require('express')()
app.use(require('cors')())
app.use(require('body-parser').urlencoded())
app.use(require('body-parser').json())
// index
const helpMessageRoute = (req, res) => (
  res.status(200).send(`Welcome to Momona!
Here follows our available routes

* GET /0/content/:contentId - get an invoice for :contentId. Try /0/content/momona-demo-video
* GET /0/content/:contentId?address=<invoice bitcoin address> - Supply the address given in above invoice. If it's paid, you will receive the content, else you will get another copy of your invoice.
* POST /0/content - Upload new content to Momona, and get the contentId back.
Uploading new content has some required fields. They are:

* contentId - a string
* content - a string of content to be returned. Can be a URL that you handle in some way.
* price - currently we only support setting prices in satoshi. Remember: 1btc = 1e8*satoshis
* currency - currently we only support 'satoshi', but soon we will support pegging your price to a fiat currency
* label - A label. This will show up in your customers bitcoin wallets after they have paid
* payoutAddress - Your address. This is where your revenue from the content will be sent

We hope you will enjoy using Momona, and find it profitable.
Please do not hesitate to contact us for any questions.

Help desk help@getmomona.com
Martin martin@getmomona.com
Matt matt@getmomona.com
`))
app.get('/', helpMessageRoute)
app.get('/0/', helpMessageRoute)

// api for content
app.get(`/${apiVersion}/content`, (req, res) => (
  res.status(400).json(sendMessage('missing contentId. Remember to put something after the /!'))
))

app.get(`/${apiVersion}/content/:contentId`, (req, res) => {
  const address = req.query.address
  const contentId = req.params.contentId

  if (isNil(address)) {
    const newAddress = Invoice.newKeypair(contentId)
    return Content.find(contentId).then((content) => (
      res.status(402).json(paymentPrompt(newAddress, content))
    ))
  }
  if (!validates.isBitcoinAddress(address)) {
    return res.status(400).json({errors: validates.errorsInBitcoinAddress(address)})
  }

  Invoice.isAddressAndContentPaired(address, contentId)
    .then((addressFound) => {
      if (!addressFound) {
        const newAddress = Invoice.newKeypair(contentId)
        Content.find(contentId).then((content) => (
          res.status(402).json(paymentPrompt(newAddress, content))
        ))
      }

      return blockchainApi.lookup(address)
        .then((rawAddressInformation) => {
          const body = JSON.parse(rawAddressInformation.body)
          if (blockchainApi.isPaid(body)) {
            Invoice.markAsPaid(address)

            Content.find(contentId).then((content) => {
              res.status(200).send(content.content)
            }).catch((error) => {
              console.log(error)
              return res.status(500).send()
            })
          } else {
            Content.find(contentId).then((content) => (
              res.status(402).json(paymentPrompt(address, content))
            ))
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

// When POST-ing new content, you can specify ?return=[id|js|url].
// Depending on what you chose, your response will be either
// * The newly created contentId
// * A Javascript snippet for embedding
// * A url for you to GET to get the content
const contentPostedResponseHelpers = {
  contentResponseTypes: Object.freeze(['id', 'js', 'url']),
  parseResponseType: (returnType, knownReturnTypes) => {
    if (isNil(returnType)) return 'url'
    returnType = returnType.toLowerCase()
    if (knownReturnTypes.indexOf(returnType) === -1) return null
    return returnType
  },
  formatResponseByType: (contentRecord, returnType) => {
    if (returnType === 'id') {
      return contentRecord.contentId
    } else if (returnType === 'js') {
      // TODO: need a template of the current build for web client and inject contentId
      return 'js-snippet'
    } else if (returnType === 'url') {
      return `https://api.momona.com/${apiVersion}/content/${contentRecord.contentId}`
    } else {
      throw Error(`invalid returnType ${returnType}`)
    }
  }
}

app.post(`/${apiVersion}/content`, (req, res) => {
  const responseType = contentPostedResponseHelpers.parseResponseType(req.query.return, contentPostedResponseHelpers.contentResponseTypes)

  if (isNil(responseType)) {
    return res.status(400).json(
      sendMessage(
        `Response type ${req.query.return} not supported. Available options ${contentPostedResponseHelpers.contentResponseTypes}`
      )
    )
  }

  req.body.price = parseInt(req.body.price)

  return Content.save(req.body)
    .then((contentRecord) => {
      res.status(200).send(contentPostedResponseHelpers.formatResponseByType(contentRecord, responseType))
    })
    .catch((error) => {
      res.status(400).json(sendMessage(error))
    })
})

const port = 3000
const server = app.listen(port, function () {
  console.log('server on', port, '😎')
})

// helper for response formats
const sendMessage = (message) => ({
  message: message
})

const paymentPrompt = (address, contentRecord) => {
  const label = contentRecord.label

  if (contentRecord.currency === 'satoshi') {
    const satoshis = contentRecord.price

    return { address, label, satoshis }
  } else {
    throw Error('Bad currency, and I have yet to learn how to convert')
  }
}

module.exports = {
  app: app,
  server: server
}
