const mockAddress = () => {
  const times = require('lodash/times')
  return ('1' + times(33, () => 'x').join(''))
}

module.exports = {
  mockAddress: mockAddress
}
