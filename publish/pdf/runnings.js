exports.header = {
  contents: function(pageNum, numPages) {
    return '<p style="font-size:10pt;">Jugendspielordnung der Deutschen Schachjugend <span style="float:right;font-size:8pt;">Seite ' + pageNum + ' von ' + numPages + '.</span><p>'
  },
  height: '1cm'
}

exports.footer = {
  contents: function(pageNum, numPages) {
    return '<p style="font-size:8pt;"><span style="float:left;">Stand: <!-- date -->.</span><span style="float:right;font-size:8pt;">Generiert am <!-- generated -->.</span><p>'
  },
  height: '0.5cm'
}