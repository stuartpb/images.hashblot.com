var express = require('express');
var gm = require('gm');
var hashblot = require('hashblot');

function encode(str) {
  return encodeURIComponent(str).replace(/%20/g,'+')}
function decode(str) {
  return decodeURIComponent(str.replace(/\+/g,' '))}

module.exports = function appctor(opts) {
  var gmopts = opts.gm || {};

  var app = express();

  app.get('/sha1q/:size/:input.png', function sha1qpPng(req, res, next) {
    var str = req.params.input;
    var size = req.params.size;

    gm(size, size, '#fff').options(gmopts)
      .draw([
        'viewbox 0 0 255 255',
        'fill #000',
        'fill-rule nonzero',
        'path', hashblot.sha1qpd(str)].join(' '))
      .toBuffer('PNG',function (err, buffer) {
        if (err) return next(err);
        res.type('png');
        res.send(buffer);
      });
  });

  return app;
};
