const bitcoin = require('bitcoinjs-lib')
const cors = require('cors')
const express = require('express')
const request = require('request')

const app = express()
const redisDb = require('config/redis')

app.use(cors())

// TODO: there will be an apiToken per client..
app.get('/:contentId', function (req, res) {
  const key = req.query.key
  const contentId = req.params.contentId

  isKeyAndContentPaired(key, contentId).then((keyFound) => {
    if (!keyFound) {
      const newKey = newPublicKey(contentId)
      return res.status(402).json(sendPrompt(newKey))
    }

    request(blockchainKeyLookupUrl(key), function (error, response, body) {
      if (error) {
        return res.status(500).send('ERROR: bad times getting info from ' + blockchainKeyLookupUrl(key))
      }

      if (isPaid(body)) {
        markAsPaid(key);
        res.status(200).send(fetchContent(contentId))
      } else {
        res.status(402).json(sendPrompt(key))
      }
    })
  })
})

const port = 3000
app.listen(port, function () {
  console.log('server on', port)
})

// bitcoin helper

function blockchainKeyLookupUrl (key) {
  return 'https://blockchain.info/rawaddr/' + key
}

function newPublicKey (contentId) {
  // generate a keypair
  const keypair = bitcoin.ECPair.makeRandom()
  const publicKey = keypair.getAddress()
  const privateKey = keypair.toWIF()

  saveKeyPair({
    contentId,
    publicKey,
    privateKey
  })

  return publicKey
}

// helper for data fetch
function isPaid (data) {
  if (data === 'Input too short' || data === 'Checksum does not validate') {
    return false
  }
  const price = 1
  const isPaid = JSON.parse(data).total_received > price
  return isPaid
}

// Data persistence
const saveKeyPair = (data) => {
  redisDb.set(data.publicKey, JSON.stringify({
    contentId: data.contentId,
    publicKey: data.publicKey,
    privateKey: data.privateKey
  }))
}

function isKeyAndContentPaired (publicKey, contentId) {
  // todo: moar validations
  // if (publicKey.length < 34)
  // if (publicKey[0] !== 1)

  return new Promise((resolve, reject) => {
    redisDb.get(publicKey, (err, data) => {
      if (err) reject(err)
      const parsedData = JSON.parse(data)
      resolve(!!parsedData && (parsedData.contentId === contentId))
    })
  })
}

function markAsPaid(key) {
  return new Promise((resolve, reject) => {
    redisDb.get(key, (err, data) => {
      if(err) reject(err)
      const parsedData = JSON.parse(data)
      if(!parsedData.paymentTimestamp) {
        updateData = parsedData
        updateData.paymentTimestamp = Date.now()
        redisDb.set(key, JSON.parse(updateData))
      }
    })
  })
}

function fetchContent (contentId) {
  return require('../config/content-database.js')[contentId]
}

function sendPrompt (key) {
  return {
    display: 'payment.prompt',
    key: key
  }
}
