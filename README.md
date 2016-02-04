# bitcoin-remunerate
A scheme for trustless, decentralized, anonymous, remuneration for content creators.

## Tech statement
An http header from the server hosting something,

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

---

## HOW DO WE MAKE SOME BITS OFF DIS!?
- 10c button in a browser (tipping button in your browser)
- offer it as a plugin to CMS's
- make our own CMS
  * license
  * as a hsoted service (medium with paywall)
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
-

## as a medium thing
- article page loads, and user is prompted to pay
  * with a modal yep / nope
  * with top fold visible and rest obscured by css blur
