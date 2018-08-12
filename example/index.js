const fs = require('fs')
const path = require('path')
const pack = require('../index')
// const pack = require('../minipack')

const example = path.join(__dirname, './mod-a.js')

const result = pack(example)

fs.writeFileSync('./example/bundle.js', result)