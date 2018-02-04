module.exports = pdf

var fs = require('fs')
var path = require('path')
var childProcess = require('child_process')
var through = require('through')
var tmp = require('tmp')
var phantomjs = require('phantomjs')

function pdf (outputPath, options) {
  options = options || {}
  options.phantomPath = options.phantomPath || phantomjs.path
  options.runningsPath = options.runningsPath || path.resolve(__dirname, 'runnings.js')
  options.paperFormat = options.paperFormat || 'A4'
  options.paperOrientation = options.paperOrientation || 'landscape'
  options.paperBorder = options.paperBorder || '1cm'
  options.renderDelay = options.renderDelay || 500

  var html = ''
  var stream = through(function write (data) {
    html += data
  }, function end () {
    var self = this

    tmp.file({ mode: parseInt(644, 8), postfix: '.html' }, function htmlFileCreated (err, tmpHtmlPath, htmlFd) {
      if (err) { return self.emit('error', err) }

      fs.write(htmlFd, html)
      fs.close(htmlFd, function (err) {
        if (err) { return self.emit('error', err) }

        fs.readFile(options.runningsPath, 'utf8', function (err, js) {
          if (err) { return self.emit('error', err) }

          js = js.replace('<!-- date -->', options.date)
          js = js.replace('<!-- generatedBy -->', options.generatedBy)
          js = js.replace('<!-- generated -->', options.generated)

          tmp.file({ mode: parseInt(644, 8), postfix: '.js' }, function jsFileCreated (err, tmpRunningsPath, jsFd) {
            if (err) { return self.emit('error', err) }

            fs.write(jsFd, js)
            fs.close(jsFd, function (err) {
              if (err) { return self.emit('error', err) }

              var childArgs = [
                path.join(__dirname, 'phantom.js'),
                tmpHtmlPath,
                outputPath,
                tmpRunningsPath,
                options.paperFormat,
                options.paperOrientation,
                options.paperBorder,
                options.renderDelay
              ]

                // console.log(childArgs)

              childProcess.execFile(options.phantomPath, childArgs, function (err, stdout, stderr) {
                if (err) {
                  return self.emit('error', err)
                }
              })
            })
          })
        })
      })
    })
  })

  return stream
}
