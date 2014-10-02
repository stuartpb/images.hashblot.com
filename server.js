var app = require('./app.js')({gm: {imageMagick: true}});
var server = require('http').createServer(app);

server.listen(process.env.PORT, process.env.IP);
