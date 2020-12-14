module.exports = html

const fs = require('fs')
const path = require('path')
const through = require('through')
const marked = require('marked')
const cheerio = require('cheerio')

function html (options) {
  options = options || {}
  options.scaffold = options.scaffold || path.join(__dirname, '/scaffold.html')

  let md = ''
  const stream = through(function write (data) {
    md += data
  }, function end () {
    const markedHtml = marked(md)
    const modifiedHtml = preProcessHtml(markedHtml)

    const res = options.plain
      ? modifiedHtml
      : scaffold(modifiedHtml, options)

    this.queue(res)
    this.queue(null)
  })

  return stream
}

function preProcessHtml (html) {
  const $ = cheerio.load('<body>' + html + '</body>', { decodeEntities: false })
  const _ = cheerio.load('<table class="main-table"><thead><tr><th></th><th>Jugendspielordnung</th><th>Ausführungsbestimmungen</th></tr></thead><tbody></tbody></table>', { decodeEntities: false })

  const preambles = [
    $('p').eq(0).text(),
    $('blockquote').eq(0).text()
  ]
  _('tbody').append('<tr><td></td><td><p>' + preambles[0] + '</p></td><td><p>' + preambles[1] + '</p></td></tr>')

  $(':root > h2').each(function (sectionIx, section) {
    const number = $(this).text().replace(/^([0-9]*)\.\s.*/, '$1')
    const text = $(this).text().replace(/^[0-9]*\.\s(.*)/, '$1')

    _('tbody').append('<tr id="' + number + '"><th><a href="#' + number + '">' + number + '</a></th><th colspan="2"><a href="#' + number + '">' + text + '</a></th></tr>')

    let ol
    if (!$(this).next().is('ol')) {
      $(this).nextUntil('ol').filter('blockquote').find('p').each(function () {
        _('tbody').append('<tr><td></td><td></td><td><p>' + $(this).text() + '</p></td></tr>')
      })
      ol = $(this).nextUntil('ol').next()
    } else {
      ol = $(this).next()
    }

    ol.children('li').each(function (subsectionIx, subsection) {
      const id = number + '.' + (subsectionIx + 1)
      const row = cheerio.load('<tr id="' + id + '"><td><a href="#' + id + '">' + id + '</a></td><td class="sp"></td><td class="ab"></td></tr>', { decodeEntities: false })

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
      const html = $(this).html()
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
  const scaffold = fs.readFileSync(options.scaffold)
  const $ = cheerio.load(scaffold, { decodeEntities: false })
  $('body').append(html)

  const info = []
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
