const bitcoin = require('bitcoinjs-lib')
const cors = require('cors')
const express = require('express')
const request = require('request')
const isNil = require('lodash/isNil')

const app = express()
const blockchainApi = require('./utils/blockchainApi')

app.use(cors());

app.get('/', (req, res) => res.status(200).send('Welcome to momona! Use <code>/0/:contentId</code>'))
app.get('/0/:contentId', function (req, res) {
  const address = req.query.address
  const contentId = req.params.contentId

  if (isNil(address)) {
    const newKey = newKeypair(contentId)
    return res.status(402).json(sendPrompt(newKey))
  }
  if (isNil(contentId)) {
    return res.status(400).send('missing contentId. Remember to put something after the /!')
  }

  isAddressAndContentPaired(address, contentId)
    .then((addressFound) => {
      if (!addressFound) {
        const newKey = newKeypair(contentId)
        return res.status(402).json(sendPrompt(newKey))
      }

      return blockchainApi.lookup(address)
        .then((rawAddressInformation) => {
          const body = JSON.parse(rawAddressInformation.body)
          if (isPaid(body)) {
            markAsPaid(address)
            res.status(200).send(fetchContent(contentId))
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

function newKeypair (contentId) {
  const Invoice = require('./records/Invoice')

  // generate a keypair
  const keypair = bitcoin.ECPair.makeRandom()
  const address = keypair.getAddress()
  const privateKey = keypair.toWIF()

  Invoice.save({
    address,
    contentId,
    privateKey
  })

  return address
}

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

// Data persistence

function isAddressAndContentPaired (address, contentId) {
  return require('./records/Invoice')
    .find(address)
    .then((invoice) => !isNil(invoice) && (invoice.contentId === contentId))
}

function markAsPaid(address) {
  const Invoice = require('./records/Invoice')
  return Invoice.find(address)
    .then((invoice) => {
      if(!invoice.paymentTimestamp) {
        invoice.paymentTimestamp = Date.now()
        console.log('mark as paid:', updatedData)
        Invoice.save(invoice)
      }
    })
}

function fetchContent (contentId) {
  return require('../config/content-database.js')[contentId].content
}
