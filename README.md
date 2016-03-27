# bitcoin remunerate api
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![ci-build-status](https://circleci.com/gh/EndlessVanguard/bitcoin-remunerate-api.png?style=shield&circle-token=042ad75f490d7709e331cfda74b9d756202f9cf2)](https://circleci.com/gh/EndlessVanguard/bitcoin-remunerate-api)


A scheme for trustless, decentralized, anonymous, remuneration for content creators.

## Tech statement
An http header from the server hosting something,

## Dependencies
* Node.js (tested with `v5.6.0`)
* Redis (tested with `3.0.7`)

## routes
* /secret-article
=> you get an html response body, with a http header PAYABLE_ADDRESS that should receive funds before access is granted to the 'secret article'

* /secret-article?key=<PAYABLE_ADDRESS>
=> this PAYABLE_ADDRESS is both the destination wallet and id for the user to get access
- if adddress has history of payment, then grant access
- else patiently waiting

## Generating PAYABLE_ADDRESS for new visitors
1. generate a public and private bitcoin key
2. save the private key to somewhere (otherwise we can never spend the money)
3. Attach the public key (bitcoin address) to the HTTP response header.

## Authenticating a consumer
When users come to /secret-article?key=<PAYABLE_ADDRESS>, we check https://blockchain.info/rawaddr/<PAYABLE_ADDRESS>'s total_received field.

If that is greater than, say $0.10*BTC/USD then return the article in question. Else redirect user to a page saying we want CASH!!!

## HOW DO WE MAKE SOME BITS OFF DIS!?
- 10c button in a browser (tipping button in your browser)
- offer it as a plugin to CMS's
- make our own CMS
  * license
  * as a hosted service (medium with paywall)
- get hired to do it on-prem for New York Times :D
- Publish a whitepaper
  * as a hook to the hosted service
- write a book / set of tutorials and put it behind the service
  * Book idea: "100 functions and macros" Each page in this book (in A5 paper format) begins with one famous function or macro, maybe from Scheme or Lisp or Clojure, or various languages. Goes they them all and ends up in eval/apply. Or maybe ends in defining lambda.

## schemes of use
- as a content creator, once a certain threshold of total payments it reached, content is unlocked for everyone
- per person, per article
- putlocker / MEGA => instead of showing ads, you just pay for access to a file

## onboarding flow
- do you have a bitcoin wallet? if not, go to https://www.coinbase.com/
- now that you have a wallet, we can sink payments to you
  * on some interval we flush payments to their wallet
- what metrics do you currently have / wish to have?
  * track volume of access (events: generate key, key access denied, key access granted)

## use case: medium
- article page loads, and user is prompted to pay
  * with a modal yep / nope
  * with top fold visible and rest obscured by css blur

## use case: white papers
- instead of needing to pay a publisher a large subscription fee or 30€ per paper, have small fee to read paper
  * opens the door for enthusists, smaller budget institutions
