var system = require('system');
var page = require('webpage').create();

// Read in arguments
var args = ['in', 'out', 'runningsPath', 'paperFormat', 'paperOrientation', 'paperBorder', 'renderDelay', 'jsonPath'].reduce(function (args, name, i) {
  args[name] = system.args[i + 1];
  return args;
}, {});


page.open(args.in, function (status) {
  
  if (status == 'fail') {
    page.close();
    phantom.exit(1);
    return;
  }
  
  // Set the PDF paper size
  page.paperSize = paperSize(args.runningsPath, {
    format: args.paperFormat, 
    orientation: args.paperOrientation, 
    border: args.paperBorder
  });

  // Render the page
  setTimeout(function () {
    page.render(args.out);
    page.close();
    phantom.exit(0);
  }, parseInt(args.renderDelay, 10));
});

function paperSize(runningsPath, obj) {
  var runnings = require(runningsPath);

  // encapsulate .contents into phantom.callback()
  //   Why does phantomjs not support Array.prototype.forEach?!
  var keys = ['header', 'footer'];
  for (var i = 0; i < keys.length; i++) {
    var which = keys[i];
    if (runnings[which]
      && runnings[which].contents
      && typeof runnings[which].contents === 'function') {
      obj[which] = {
        contents: phantom.callback(runnings[which].contents)
      }
      if (runnings[which].height) {
        obj[which].height = runnings[which].height;
      }
    }
  }
  
  return obj;
}