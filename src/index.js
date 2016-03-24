const bitcoin = require('bitcoinjs-lib')
const cors = require('cors')
const express = require('express')
const request = require('request')
const isNil = require('lodash/isNil')

const app = express()
const blockchainApi = require('./utils/blockchainApi')
const redisDb = require('./config/redis')

app.use(cors());

// TODO: there will be an apiToken per client..
app.get('/:contentId', function (req, res) {
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
  // generate a keypair
  const keypair = bitcoin.ECPair.makeRandom()
  const address = keypair.getAddress()
  const privateKey = keypair.toWIF()

  saveKeyPair({
    contentId,
    address,
    privateKey
  })

  return address
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
const saveKeyPair = (data) => {
  redisDb.set(data.address, JSON.stringify({
    contentId: data.contentId,
    address: data.address,
    privateKey: data.privateKey
  }))
}

function isAddressAndContentPaired (address, contentId) {
  // todo: moar validations
  // if (address.length < 34)
  // if (address[0] !== 1)

  return new Promise((resolve, reject) => {
    redisDb.get(address, (err, data) => {
      if (err) reject(err)
      const parsedData = JSON.parse(data)
      resolve(!!parsedData && (parsedData.contentId === contentId))
    })
  })
}

function markAsPaid(address) {
  return new Promise((resolve, reject) => {
    redisDb.get(address, (err, data) => {
      if(err) reject(err)
      const parsedData = JSON.parse(data)
      if(!parsedData.paymentTimestamp) {
        updatedData = parsedData
        updatedData.paymentTimestamp = Date.now()
        console.log(updatedData)
        redisDb.set(address, JSON.stringify(updatedData))
      }
    })
  })
}

function fetchContent (contentId) {
  return require('../config/content-database.js')[contentId]
}

function sendPrompt (address) {
  return {
    display: 'payment.prompt',
    address: address
  }
}
