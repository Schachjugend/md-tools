module.exports = html

var fs = require('fs')
var path = require('path')
var through = require('through')
var marked = require('marked')
var cheerio = require('cheerio')

function html (options) {
  options = options || {}
  options.scaffold = options.scaffold || path.join(__dirname, '/scaffold.html')

  var md = ''
  var stream = through(function write (data) {
    md += data
  }, function end () {
    var markedHtml = marked(md)
    var modifiedHtml = preProcessHtml(markedHtml)

    var res = options.plain
        ? modifiedHtml
        : scaffold(modifiedHtml, options)

    this.queue(res)
    this.queue(null)
  })

  return stream
}

function preProcessHtml (html) {
  var $ = cheerio.load('<body>' + html + '</body>')
  var _ = cheerio.load('<table class="main-table"><thead><tr><th></th><th>Jugendspielordnung</th><th>Ausführungsbestimmungen</th></tr></thead><tbody></tbody></table>')

  var preambles = [
    $('p').eq(0).text(),
    $('blockquote').eq(0).text()
  ]
  _('tbody').append('<tr><td></td><td><p>' + preambles[0] + '</p></td><td><p>' + preambles[1] + '</p></td></tr>')

  $(':root > h2').each(function (sectionIx, section) {
    var number = $(this).text().replace(/^([0-9]*)\.\s.*/, '$1')
    var text = $(this).text().replace(/^[0-9]*\.\s(.*)/, '$1')

    _('tbody').append('<tr id="' + number + '"><th><a href="#' + number + '">' + number + '</a></th><th colspan="2"><a href="#' + number + '">' + text + '</a></th></tr>')

    var ol
    if (!$(this).next().is('ol')) {
      $(this).nextUntil('ol').filter('blockquote').find('p').each(function () {
        _('tbody').append('<tr><td></td><td></td><td><p>' + $(this).text() + '</p></td></tr>')
      })
      ol = $(this).nextUntil('ol').next()
    } else {
      ol = $(this).next()
    }

    ol.children('li').each(function (subsectionIx, subsection) {
      var id = number + '.' + (subsectionIx + 1)
      var row = cheerio.load('<tr id="' + id + '"><td><a href="#' + id + '">' + id + '</a></td><td class="sp"></td><td class="ab"></td></tr>')

      $(this).children().each(addHtml($, row('.sp')))

      $(this).find('blockquote').each(function (i, e) {
        $(this).children().each(addHtml($, row('.ab')))
      })

      _('tbody').append(row.html())
    })
  })

  return _.html()
}

function addHtml ($, row) {
  return function (i, e) {
    if ($(this).is('p')) {
      var html = $(this).html()
      // var html = $(this).html().split('. ').map(function(sentence, number) {
      //   return '<sup id="">'+(number+1)+'</sup>'+sentence
      // }).join('. ')

      row.append('<p>' + html + '</p>')
    } else if ($(this).is('ul')) {
      row.append('<ul>' + $(this).html() + '</ul>')
    } else if ($(this).is('ol')) {
      row.append('<ol>' + $(this).html() + '</ol>')
    }
  }
}

function scaffold (html, options) {
  var scaffold = fs.readFileSync(options.scaffold)
  var $ = cheerio.load(scaffold)
  $('body').append(html)

  let info = []
  if (options.commitMd) {
    info.push(`<a href="https://github.com/Schachjugend/Spielordnung">Spielordnung</a>@<a href="https://github.com/Schachjugend/Spielordnung/commit/${options.commitMd}">${options.commitMd.substr(0, 6)}</a>`)
  }
  if (options.commitCreator) {
    info.push(`<a href="https://github.com/Schachjugend/md-tools">md-tools</a>@<a href="https://github.com/Schachjugend/md-tools/commit/${options.commitCreator}">${options.commitCreator.substr(0, 6)}</a>`)
  }
  if (info.length !== 0) {
    $('body').append(`<p class="info">${info.join(', ')}</p>`)
  }

  return $.html()
}
