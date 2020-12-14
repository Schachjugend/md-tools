const fs = require('fs')
const path = require('path')
const interpreted = require('interpreted')
const through = require('through')
const html = require('../lib/spielordnung/html/index')

interpreted({
  source: path.resolve(__dirname, 'md'),
  expected: path.resolve(__dirname, 'html'),

  // This method will be used to test the files.
  test: function (name, content, callback) {
    let str = ''

    const catchStream = through(function write (data) {
      str += data
    }, function end () {
      callback(null, str)
    })

    fs.createReadStream(path.resolve(__dirname, 'md', name + '.md'))
      .pipe(html())
      .pipe(catchStream)
  },

  // This method will execute before the file tests.
  start: function (callback) {
    callback(null)
  },

  // This method will execute after the file tests.
  close: function (callback) {
    callback(null)
  }
})
