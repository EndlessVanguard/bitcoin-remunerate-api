const test = require('tape')
const request = require('supertest')

const apiUrl = (path) => {
  if (!path) path = ''
  return `/0/content/${path}`
}

const api = require('./server')

test('route /0/content/:contentId', (t) => {
  t.test('without contentId param', (st) => {
    request(api.app).get(apiUrl())
      .expect('Content-Type', /json/)
      .expect(400, { message: 'missing contentId. Remember to put something after the /!' })
      .end(st.end)
  })
})

api.server.close()
