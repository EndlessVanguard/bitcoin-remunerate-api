const trace = (msg) => (v) => (console.log((msg || 'trace: '), v), v)

module.exports = trace
