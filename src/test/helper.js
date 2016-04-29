const spyOn = (Record, fn, cb) => {
  const originalFn = Record[fn]
  var callCount = 0
  Record[fn] = function () {
    callCount++
    return cb(...arguments)
  }
  return {
    restore: () => { Record[fn] = originalFn },
    called: () => callCount > 0
  }
}

const helper = {
  validAddress: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw',
  validWIF: '5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ',
  spyOn: spyOn
}

module.exports = helper
