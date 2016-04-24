// This file is the dummy database of all Momona content.
// When we get new customers lets add them here. At some point, it might be good to replace this with a real database.
// For now we can update this file by hand.

// Key is contentId, value is object of payoutAddress & content <String>
module.exports = {
  'momona-demo-video': {
    payoutAddress: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw',
    price: 5000,
    currency: 'satoshi',
    label: 'Momonas demo video',
    content: '<h3>Nice done!</h3><p>to get this on your website, get in touch with us. <br>Here is the content you paid for: </p><iframe width="345" height="194" src="https://www.youtube-nocookie.com/embed/3ggIHfwkIWM?rel=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe>'
  }
}
