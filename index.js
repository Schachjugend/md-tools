module.exports = createPDF

var fs = require('fs')
var http = require('http')
var markdownpdf = require('markdown-pdf')
var through = require('through')
var cheerio = require('cheerio')


function createPDF(options) {
  var pdfOptions = {
    paperOrientation: 'landscape',
    paperFormat: 'A4',
    runningsPath: __dirname+'/runnings.js',
    cssPath: __dirname + '/style.css',
    paperBorder: '1.4cm',
    preProcessHtml: preProcessHtmlThrough
  }

  return markdownpdf(pdfOptions)
}


function preProcessHtmlThrough() {
  var html = ''

  return through(function write(data) {
    html += data
  }, function end() {
    this.queue(preProcessHtml(html))
    this.queue(null)
  })
}


function preProcessHtml(html) {
  var $ = cheerio.load('<body>'+html+'</body>')
  var _ = cheerio.load('<table class="main-table"><thead><tr><th></th><th>Jugendspielordnung</th><th>Ausführungsbestimmungen</th></tr></thead><tbody></tbody></table>')
  
  var preambles = [
    $('p').eq(0).text(),
    $('blockquote').eq(0).text()
  ]
  _('tbody').append('<tr><td></td><td><p>'+preambles[0]+'</p></td><td><p>'+preambles[1]+'</p></td></tr>')

  $(':root > h2').each(function (sectionIx, section) {
    var number = $(this).text().replace(/^([0-9]*)\.\s.*/, '$1')
    var text = $(this).text().replace(/^[0-9]*\.\s(.*)/, '$1')

    _('tbody').append('<tr><th>'+number+'</th><th>'+text+'</th><th></th></tr>')

    if (!$(this).next().is('ol')) {
      $(this).nextUntil('ol').filter('blockquote').find('p').each(function () {
        _('tbody').append('<tr><td></td><td></td><td><p>'+$(this).text()+'</p></td></tr>')
      })
      var ol = $(this).nextUntil('ol').next()
    }
    else {
      var ol = $(this).next()
    }

    ol.children('li').each(function (subsectionIx, subsection) {
      var row = cheerio.load('<tr><td>'+number+'.'+(subsectionIx+1)+'</td><td class="sp"></td><td class="ab"></td></tr>')

      $(this).children().each(addHtml($, row('.sp')))

      $(this).find('blockquote').each(function (i, e) {
        $(this).children().each(addHtml($, row('.ab')))
      })

      _('tbody').append(row.html())
    })
  })


  return _.html()
}


function addHtml($, row) {
  return function(i, e) {
    if ($(this).is('p')) {
      row.append('<p>'+$(this).text()+'</p>')
    }
    else if ($(this).is('ul')) {
      row.append('<ul>'+$(this).html()+'</ul>')
    }
    else if ($(this).is('ol')) {
      row.append('<ol>'+$(this).html()+'</ol>')
    }
  }
}