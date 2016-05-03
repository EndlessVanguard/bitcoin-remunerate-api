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
  spyOn,
  validAddress: '19qwUC4AgoqpPFHfyZ5tBD279WLsMAnUBw',
  // TODO: correct name?
  validWIF: '5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ'
}

module.exports = helper
