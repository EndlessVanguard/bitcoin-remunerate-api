var path = require('path');
var express = require('express');
var request = require('request');
var bitcoin = require('bitcoinjs-lib');

var app = express();

app.get('/:article', function(req, res) {
  if(!keyValid(req.query.key, req.params.article)) {
    var newKey = newPublicKey(req.params.article)
    return res.status(402).json(sendPrompt(newKey))
  }

  request(addressURL(req.query.key), function(error, response, body) {
    if(error) {
      return res.status(500).send('ERROR: bad times getting info from ' + addressURL());
    }

    if (isPaid(body)) {
      res.status(200).send(fetchContent(req.params.article));
    } else {
      res.status(402).json(sendPrompt(req.query.key))
    }
  })
});

var port = 3000;
app.listen(port, function() {
  console.log('server on', port);
});

// bitcoin helper

function addressURL(key) {
  return "https://blockchain.info/rawaddr/" + key;
}

function newPublicKey(articleId) {
  // generate a keypair
  var keypair = bitcoin.ECPair.makeRandom();
  var publicKey = keypair.getAddress();
  var privateKey = keypair.toWIF();

  saveKeyPair({
    articleId: articleId,
    publicKey: publicKey,
    privateKey: privateKey,
  });

  return publicKey;
}

// helper for data fetch

function isPaid(data) {
  if (data === "Input too short" || data === "Checksum does not validate") {
    return false;
  }
  var price = 1;
  var isPaid = JSON.parse(data).total_received > price;
  return isPaid;
}

// Data persistence

function saveKeyPair(data) {
  // todo: persist somewhere we can query
  // data.publicKey
  // data.privateKey
  // data.articleId
}

function keyValid(key, articleId) {
  // todo: moar validations
  // if(key.length < 34)
  // if(key[0] !== 1)

  // todo: lookup in persisted set of keypair for articleId
  return typeof key === 'undefined' ? false : true;
}

function fetchContent(articleId) {
  return "Super interesting article about the new insteresting bitcoin paywall technology. Hmmmmm.";
}


function sendPrompt(key) {
  return {
    display: 'payment.prompt',
    key: key,
  };
}
