// This file is the dummy database of all Momona content.
// When we get new customers lets add them here. At some point, it might be good to replace this with a real database.
// For now we can update this file by hand.

// Key is contentId, value is object of payoutAddress & content <String>
module.exports = {
  'momona-demo-video': {
    payoutAddress: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw',
    price: 1,
    currency: 'satoshi',
    content: '<h3>Nice done!</h3><p>to get this on your website, get in touch with us. Here is the content you paid for: </p><iframe width="560" height="315" src="https://www.youtube.com/embed/JWZMzcmqMwc&autoplay=1" frameborder="0" allowfullscreen></iframe>'
  }
}
