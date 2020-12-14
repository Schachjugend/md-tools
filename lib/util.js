module.exports = {
  dateString: dateString,
  parseGermanDate: parseGermanDate
}

function dateString (date) {
  date = date ? new Date(date) : new Date()
  return (date.getDate() < 10 ? '0' : '') + date.getDate() + '.' +
    (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1) + '.' +
    date.getFullYear()
}

function parseGermanDate (date) {
  const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

  const parsed = date.match(/^([0-9]{1,2})\. ([^\s]+) (20[0-9]{2})$/)
  const d = new Date('' + (months.indexOf(parsed[2]) + 1) + '/' + parsed[1] + '/' + parsed[3])

  return d
}
