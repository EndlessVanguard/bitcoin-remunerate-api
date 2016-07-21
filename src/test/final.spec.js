const test = require('tape')
const redisDb = require('config/redis')

// This is called after all tape tests have run.
// If we don't close the redis client, the test suite will hang
test.onFinish(() => redisDb.quit())
