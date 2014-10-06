var express = require('express');
var gm = require('gm');
var hashblot = require('hashblot');
var crypto = require('crypto');

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

    // 404 for extensions we don't support
    var extension = req.params.extension.toLowerCase();
    if (extension != 'svg' && ~rasterTypes.indexOf(extension))
      return next();

    var hashType = req.params.hash;
    var hash;
    var pathType = req.params.path;
    var str = req.params.input;
    var pd;

    // If there's a hashblot function for the path type,
    // define a path from the byte-array-ified buffer for the given hash,
    // and 404 otherwise
    if (hashblot.pd[pathType]) {
      try {
        hash = crypto.createHash(hashType);
      } catch (err) {
        // 404 when the hash type is not supported
        return next();
      }
      pd = hashblot.pd[pathType](Array.apply([],
        hash.update(str, 'utf8').digest()));
    } else return next();

    var size;

    try {
      size = parseInt(req.params.size, 10);
    } catch(err) {
      return res.status(400).send('Invalid image size');
    }

    if (size < 15) {
      res.redirect('/' + encodeURIComponent(hashType)
        + '/' + encodeURIComponent(pathType)
        + '/15/' + encodeURIComponent(str)
        + '.' + encodeURIComponent(extension));
    } if (size > 2048) {
      res.redirect('/' + encodeURIComponent(hashType)
        + '/' + encodeURIComponent(pathType)
        + '/2048/' + encodeURIComponent(str)
        + '.' + encodeURIComponent(extension));
    }

    if (extension == 'svg') {
      res.type('svg');
      res.send(svgPd(size, pd));
    } else { // image is a raster type we support
      magickPd(size, pd, extension, function(err, buffer) {
        if (err) return next(err);
        res.type(extension);
        res.send(buffer);
      });
    }
  }

  var app = express();

  app.get('/:hash/:path/:size/:input(|[^/]+?).:extension', hashpathImage);

  return app;
};
