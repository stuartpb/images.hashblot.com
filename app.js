var express = require('express');
var gm = require('gm');
var hashblot = require('hashblot');

module.exports = function appctor(opts) {

  function sha1qpPng(req, res, next) {
    var str = req.params.input;
    var size;
    try {
      size = parseInt(req.params.size, 10);
    } catch(err) {
      return res.status(400).send('Invalid image size');
    }
    if (size < 15) {
      res.redirect('/sha1q/15/' + req.params.input + '.png');
    } if (size > 2048) {
      res.redirect('/sha1q/2048/' + req.params.input + '.png');
    }

    gm(size, size, '#fff').options(gmopts)
      .draw([
        'scale', size/255, size/255,
        'fill-rule nonzero',
        'path', JSON.stringify(hashblot.sha1qpd(str))].join(' '))
      .toBuffer('PNG',function (err, buffer) {
        if (err) return next(err);
        res.type('png');
        res.send(buffer);
      });
  }

  var gmopts = opts.gm || {};

  var app = express();

  app.get('/sha1q/:size/:input(|[^/]+?).png', sha1qpPng);

  return app;
};
