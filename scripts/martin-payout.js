const bitcoin = require('bitcoinjs-lib')

const txId0 = '21348f726e5835b066a02d6ffa4a21447e190c2fc581bfbcfabd787a616a8e0d'
const txFinalBalance0 = 10000
const txPrivKey0 = 'KyhmfptaB3GG7mcj9x2W2YwXyjPjhp5nMPsA6DqYquUeBG3Kw5S6'
const keyPair0 = bitcoin.ECPair.fromWIF(txPrivKey0)

const txId1 = '2a4ba29638d65557047188a8d5a64497816b8fafdfab175c804f00f63c6fd76a'
const txFinalBalance1 = 100000
const txPrivKey1 = 'L23VBtHbR5pFi68dFJAZJb5mrxK5voiRc9te5UDKSYySjWAokzUS'
const keyPair1 = bitcoin.ECPair.fromWIF(txPrivKey1)

const tx = new bitcoin.TransactionBuilder()
tx.addInput(txId0, 0)
tx.addInput(txId1, 0)

tx.addOutput('15MkM3DQprMrikRey56uHkFzPW3aXNCCRw',
             (txFinalBalance0 + txFinalBalance1 - 5000))

tx.sign(0, keyPair0)
tx.sign(1, keyPair1)
console.log(tx.build().toHex())
