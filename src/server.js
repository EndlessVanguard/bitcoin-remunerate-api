const apiVersion = require('config/api').apiVersion

const Content = require('records/Content')
const Invoice = require('records/Invoice')
const blockchainApi = require('utils/blockchainApi')
const currency = require('utils/currency.js')

const validates = require('utils/validates')
const includes = require('lodash/includes')
const isNil = require('lodash/isNil')

// init express with middleware
const app = require('express')()

if (includes(process.argv, 'init')) {
  // Don't run on normal require(), since it is a side-effecty and IO-y function
  // Damn, I love our code base
  console.log('Init currency table state synchronization')
  currency.initCurrencyConversionUpdating()
}

app.use(require('cors')())
app.use(require('body-parser').urlencoded())
app.use(require('body-parser').json())

// index
app.get('/', (req, res) => (
  res.status(200).send(`Welcome to Momona! Do GET /${apiVersion}/content/:contentId`)
))

// api for content
app.get(`/${apiVersion}/content`, (req, res) => (
  res.status(400).json(sendMessage('missing contentId. Remember to put something after the /!'))
))

app.get(`/${apiVersion}/content/:contentId`, (req, res) => {
  const address = req.query.address
  const contentId = req.params.contentId

  if (isNil(address)) {
    // TODO: Content.find should be first, all paths need this.
    return Content.find(contentId).then((content) => {
      const invoice = Invoice.create(contentId)
      Invoice.save(invoice) // TODO have Invoice.save return a Promise

      return res.status(402).json(paymentPrompt(invoice.address, content))
    })
    .catch((err) => {
      console.log(err)
      res.status(404).send('404 Not Found')
    })
  }
  if (!validates.isBitcoinAddress(address)) {
    return res.status(400).json({errors: validates.errorsInBitcoinAddress(address)})
  }

  Invoice.isAddressAndContentPaired(address, contentId)
    .then((addressFound) => {
      if (!addressFound) {
        Content.find(contentId).then((content) => {
          const invoice = Invoice.create(contentId)
          Invoice.save(invoice) // FIXME should return promise
          return res.status(402).json(paymentPrompt(invoice.address, content))
        })
      }

      return blockchainApi.getAddress(address)
        .then((rawAddressInformation) => {
          if (blockchainApi.isPaid(rawAddressInformation)) {
            Invoice.find(address).then((invoice) => {
              Invoice.save(Invoice.markInvoiceAsPaid(invoice))
            })

            Content.find(contentId).then((content) => (
              res.status(200).send(content.content)
            )).catch((error) => {
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

  req.body.price = parseInt(req.body.price, 10)

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
  console.log(`server on ${port} 😎 Time is ${new Date()}`)
})

// helper for response formats
const sendMessage = (message) => ({
  message: message
})

const paymentPrompt = (address, contentRecord) => ({
  address: address,
  label: contentRecord.label,
  satoshis: currency.convertToSatoshi(contentRecord.price, contentRecord.currency),
  currency: contentRecord.currency
})

module.exports = {
  app: app,
  server: server
}
