module.exports = spielordnung2pdf
module.exports.fromHtml = html2pdf

const fs = require('fs')
const path = require('path')
const util = require('util')
const stream = require('stream')
const puppeteer = require('puppeteer')
const fn = require('../../util')

async function spielordnung2pdf (input, output, options) {
  const extension = path.extname(input)

  if (['.htm', '.html'].indexOf(extension) !== -1) {
    return html2pdf(input, output, options)
  }

  if (['.md', '.markdown'].indexOf(extension) === -1) {
    throw new Error('Please specify HTML or Markdown file for input')
  }

  const basename = path.basename(input, extension)
  const htmlFilename = basename + '.html'
  let htmlFile
  let cleanup
  if (options.dir) {
    htmlFile = path.join(options.dir || '', htmlFilename)
  } else {
    const tmp = require('tmp-promise')
    const res = await tmp.file({
      mode: 0644,
      prefix: basename + '-',
      postfix: '.html',
      dir: path.join(__dirname, '../../../tmp')
    })
    htmlFile = res.path
    cleanup = res.cleanup
  }

  const spielordnung2html = require('../html/index')
  const pipeline = util.promisify(stream.pipeline)
  await pipeline(
    fs.createReadStream(input),
    spielordnung2html(options),
    fs.createWriteStream(htmlFile)
  )

  await html2pdf(htmlFile, output, options, cleanup)
}

async function html2pdf (input, output, options, cleanup) {
  options.date = options.date || getDate(input)

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  let absFilename = input
  if (!path.isAbsolute(absFilename)) {
    absFilename = path.join(process.cwd(), absFilename)
  }

  await page.goto(`file:${absFilename}`, {
    waitUntil: 'networkidle2'
  })

  await page.pdf({
    path: output,
    format: 'A4',
    landscape: true,
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: headerTemplate(options),
    footerTemplate: footerTemplate(options),
    margin: {
      top: '1.8cm',
      bottom: '1.8cm',
      right: leftRightPadding(),
      left: leftRightPadding(),
    },
  })
 
  await browser.close()

  if (cleanup) {
    cleanup()
  }
}

function headerTemplate(options) {
  var header = `
    <table id="header-template" style="width:100%; font-size:7pt; padding: 3mm ${leftRightPadding()};">
      <tr>
        <td style="text-align:left;">
          <span class="title"></span>
        </td>
        <td style="text-align:right;">
          Seite <span class="pageNumber"></span> von <span class="totalPages"></span>
        </td>
      </tr>
    </table>
  `

  return replaceComments(header, options)
}

function footerTemplate(options) {
  var footer = `
    <table id="header-template" style="width:100%; font-size:7pt; padding: 3mm ${leftRightPadding()};">
      <tr>
        <td style="text-align:left;">
          Stand: <!-- date -->
        </td>
        <td style="text-align:right;">
          Generiert am <!-- generated -->
        </td>
      </tr>
    </table>
  `

  return replaceComments(footer, options)
}

function leftRightPadding() {
  return '1cm';
}

function replaceComments(text, options) {
  const generated = options.generated || `<span class="date"></span>`

  text = text.replace('<!-- generated -->', generated)
  text = text.replace('<!-- date -->', options.date)

  return text
}

function getDate(input) {
  var md = fs.readFileSync(input, 'utf8');
  var jvChanged = md.match('Diese Jugendspielordnung wurde von der Jugendversammlung der Deutschen Schachjugend am 2. März 2008 in Bremen beschlossen und zuletzt am (.*) in .* geändert.')[1]
  var aksChanged = md.match('Die Ausführungsbestimmungen wurden zuletzt (vom Arbeitskreis Spielbetrieb|vom Vorstand|von der Jugendversammlung) am (.*) geändert.')[2]
  
  var jvChangedDate = fn.parseGermanDate(jvChanged);
  var aksChangedDate = fn.parseGermanDate(aksChanged);

  var date = jvChangedDate > aksChangedDate
                  ? jvChangedDate
                  : aksChangedDate;
  return fn.dateString(date);
}
