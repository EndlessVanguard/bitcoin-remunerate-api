const mockAddress = () => {
  const times = require('lodash/times')
  return ('1' + times(33, () => 'x').join(''))
}

const spyOn = (Record, fn, cb) => {
  'use strict'
  const originalFn = Record[fn]
  let callCount = 0
  Record[fn] = function () {
    callCount++
    return cb(...arguments)
  }
  return {
    restore: () => { Record[fn] = originalFn },
    called: () => callCount > 0
  }
}

module.exports = {
  mockAddress: mockAddress,
  spyOn: spyOn
}
