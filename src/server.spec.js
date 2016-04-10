const test = require('tape')
const request = require('supertest')

const apiUrl = (path) => {
  if (!path) path = ''
  return `/0/content/${path}`
}

const api = require('./server')

test('route GET /0/content/:contentId', (t) => {
  t.test('without contentId param', (st) => {
    request(api.app).get(apiUrl())
      .expect('Content-Type', /json/)
      .expect(400, { message: 'missing contentId. Remember to put something after the /!' })
      .end(st.end)
  })

  t.test('without address query', (st) => {
    const contentId = 'mein-artikle'
    request(api.app).get(apiUrl(contentId))
      .expect('Content-Type', /json/)
      .expect(402)
      .end((error, res) => {
        const predicates = require('utils/predicates')
        if (error) st.fail(error)
        st.equals(res.body.display, 'payment.prompt', 'i18n key for client to use')
        st.assert(predicates.isBitcoinAddress(res.body.address), 'generated bitcoin address to pay')
        st.end()
      })
  })

  t.test('invalid address query', (st) => {
    const contentId = 'mein-artikle'
    const badAddress = '123'
    request(api.app).get(apiUrl(`${contentId}?address=${badAddress}`))
      .expect('Content-Type', /json/)
      .expect(400)
      .end((error, res) => {
        const predicates = require('utils/predicates')
        if (error) st.fail(error)
        st.assert(res.body.message, predicates.isBitcoinAddress('generated bitcoin address to pay'))
        st.end()
      })
  })
})

api.server.close()
