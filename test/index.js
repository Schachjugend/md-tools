var fs = require('fs')
var path = require('path')
var interpreted = require('interpreted')
var through = require('through')
var publish = require('../publish/index')

interpreted({
  source: path.resolve(__dirname, 'md'),
  expected: path.resolve(__dirname, 'html'),

  // This method will be used to test the files.
  test: function (name, content, callback) {
    var html = ''

    var catchStream = through(function write (data) {
      html += data
    }, function end () {
        callback(null, html)
      })

    fs.createReadStream(path.resolve(__dirname, 'md', name + '.md'))
      .pipe(publish.html())
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
