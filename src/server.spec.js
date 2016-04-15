const test = require('tape')
const request = require('supertest')

const apiVersion = 0

const apiUrl = (path) => {
  if (!path) path = ''
  return `/${apiVersion}/content/${path}`
}

const api = require('./server')

test('route GET /0/content/:contentId', (t) => {
  t.test('without contentId param', (st) => {
    request(api.app).get(apiUrl())
      .expect('Content-Type', /json/)
      .expect(400, { message: 'missing contentId. Remember to put something after the /!' })
      .end(st.end)
  })

  // TODO: this test is hanging..
  // t.test('without address query', (st) => {
  //   const contentId = 'mein-artikle'
  //   request(api.app).get(apiUrl(contentId))
  //     .expect('Content-Type', /json/)
  //     .expect(402)
  //     .end((error, res) => {
  //       const predicates = require('utils/predicates')
  //       console.log(res.body)
  //       if (error) { return st.end(error) }
  //       st.equals(res.body.display, 'payment.prompt', 'i18n key for client to use')
  //       st.assert(predicates.isBitcoinAddress(res.body.address), 'generated bitcoin address to pay')
  //       st.end()
  //     })
  // })

  t.test('invalid address query', (st) => {
    const contentId = 'mein-artikle'
    const badAddress = '123'
    request(api.app).get(apiUrl(`${contentId}?address=${badAddress}`))
      .expect('Content-Type', /json/)
      .expect(400)
      .end((error, res) => {
        const validates = require('utils/validates')
        const isEqual = require('lodash/isEqual')
        if (error) { return st.end(error) }

        st.assert(isEqual(validates.errorsInBitcoinAddress(badAddress),
                          res.body.errors))
        st.end()
      })
  })
})

test('route POST /0/content', (t) => {
  const mockData = () => ({
    contentId: 'mein-artikle',
    content: 'eins zwei dri',
    payoutAddress: require('test/helper').validAddress
  })

  const spyOnContentSave = () => require('test/helper').spyOn(
    require('records/Content'),
    'save',
    (data) => Promise.resolve(data)
  )

  t.test('without return query, defaults to url return query', (st) => {
    const reqData = mockData()
    const contentRecordSpy = spyOnContentSave()
    request(api.app).post(apiUrl())
      .send(reqData)
      .expect('Content-Type', /text/)
      .expect(200)
      .end((error, res) => {
        if (error) { return st.end(error) }
        st.assert(contentRecordSpy.called(), 'Content.save was called')
        const expected = `https://api.momona.com/${apiVersion}/content/${reqData.contentId}`
        st.equals(res.text, expected, 'a URL to GET the content')
        contentRecordSpy.restore()
        st.end()
      })
  })

  t.test('id return query', (st) => {
    const reqData = mockData()
    const contentRecordSpy = spyOnContentSave()
    const returnType = 'id'
    request(api.app).post(apiUrl(`?return=${returnType}`))
      .send(reqData)
      .expect('Content-Type', /text/)
      .expect(200)
      .end((error, res) => {
        if (error) { return st.end(error) }
        st.assert(contentRecordSpy.called(), 'Content.save was called')
        st.equals(res.text, reqData.contentId, 'the contentId to use for future requests')
        contentRecordSpy.restore()
        st.end()
      })
  })
  t.test('js return query', (st) => {
    const reqData = mockData()
    const contentRecordSpy = spyOnContentSave()
    const returnType = 'js'
    request(api.app).post(apiUrl(`?return=${returnType}`))
      .send(reqData)
      .expect('Content-Type', /text/)
      .expect(200)
      .end((error, res) => {
        if (error) { return st.end(error) }
        st.assert(contentRecordSpy.called(), 'Content.save was called')
        const expected = 'js-snippet'
        st.equals(res.text, expected, 'a javscript blob to use in <script>')
        contentRecordSpy.restore()
        st.end()
      })
  })
  t.test('url return query', (st) => {
    const reqData = mockData()
    const contentRecordSpy = spyOnContentSave()
    const returnType = 'url'
    request(api.app).post(apiUrl(`?return=${returnType}`))
      .send(reqData)
      .expect('Content-Type', /text/)
      .expect(200)
      .end((error, res) => {
        if (error) { return st.end(error) }
        st.assert(contentRecordSpy.called(), 'Content.save was called')
        const expected = `https://api.momona.com/${apiVersion}/content/${reqData.contentId}`
        st.equals(res.text, expected, 'a URL to GET the content')
        contentRecordSpy.restore()
        st.end()
      })
  })

  t.test('invalid return query', (st) => {
    const badReturnType = 'nope'
    request(api.app).post(apiUrl(`?return=${badReturnType}`))
      .expect('Content-Type', /json/)
      .expect(400)
      .end((error, res) => {
        if (error) { return st.end(error) }
        const regex = RegExp(`returnType ${badReturnType} not supported`)
        st.assert(regex.test(res.body.message), 'return query must be supported returnType')
        st.end()
      })
  })
})

api.server.close()
