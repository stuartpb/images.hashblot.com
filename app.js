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

    gm(req.params.size, req.params.size, 'white')
      .options(gmopts)
      .draw('path ' + hashblot.sha1qpd(str))
      .toBuffer('PNG',function (err, buffer) {
        if (err) return next(err);
        res.type('png');
        res.send(buffer);
      });
  });

  return app;
};
