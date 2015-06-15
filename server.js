var express = require("express");
var app     = express();
var http    = require("http").createServer(app);
var fs = require('fs');
var io      = require("socket.io").listen(http);
// var readDir = require('readdir');

var main    = require('./main');
var config  = require('./config');
var router  = require('./router');



var m = new main(app, io);

/*
* Server config
*/
config(app, express);

/**
* Server routing and io events
*/
router(app, io, m);

/**
* Start the http server at port and IP defined before
*/
http.listen(app.get("port"), /*app.get("ipaddr"),*/ function() {
  console.log("Server up and running. Go to http://localhost:" + app.get("port"));
});
