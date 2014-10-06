var express = require('express');
var gm = require('gm');
var hashblot = require('hashblot');

var pdFunctions = {sha1q: hashblot.sha1qpd};

// Raster types we support for retrieval.
var rasterTypes = ['png','jpg','jpeg','gif','bmp','tga'];

module.exports = function appctor(opts) {

var gmopts = opts.gm || {};
  function magickPd(size, pd, type, cb) {
    return gm(size, size, '#fff').options(gmopts)
    .draw([
      'scale', size/255, size/255,
      'fill-rule nonzero',
      'path "' + pd + '"', ].join(' '))
    .toBuffer(type, cb);
  }

  function svgPd(size, pd) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 255 255" '
      + 'width="' + size + '" height="'+ size + '">'
      + '<path d="'+ pd + '" /></svg>';
  }

  function hashpathImage(req, res, next) {
    var hashpath = req.params.hashpath;
    var str = req.params.input;
    var pd;
    if (pdFunctions[hashpath]) {
      pd = pdFunctions[hashpath](str);
    } else return next();

    var extension = req.params.extension.toLowerCase();
    if (extension != 'svg' && ~rasterTypes.indexOf(extension))
      return next();

    var size;

    try {
      size = parseInt(req.params.size, 10);
    } catch(err) {
      return res.status(400).send('Invalid image size');
    }
    if (size < 15) {
      res.redirect('/'+ encodeURIComponent(hashpath)
        + '/15/' + encodeURIComponent(str)
        + '.' + encodeURIComponent(extension));
    } if (size > 2048) {
      res.redirect('/'+ encodeURIComponent(hashpath)
        + '/2048/' + encodeURIComponent(str)
        + '.' + encodeURIComponent(extension));
    }

    if (extension == 'svg') {
      res.type('svg');
      res.send(svgPd(size,pd));
    } else { // image is a raster type we support
      magickPd(size, pd, extension, function(err, buffer) {
        if (err) return next(err);
        res.type(extension);
        res.send(buffer);
      });
    }
  }

  var app = express();

  app.get('/:hashpath/:size/:input(|[^/]+?).:extension', hashpathImage);

  return app;
};
