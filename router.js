var _ = require("underscore");
var url = require('url')
var fs = require('fs-extra');

module.exports = function(app,io,m){

  /**
  * routing event
  */

  app.get("/", getIndex);
  // app.get("/select/:session", getAdmin);
  app.get("/ping/:ping", getPing);
  app.get("/ping/:ping/publi", getPubli);
  // app.get("/select/:session/notes", getNotes);

  /**
  * routing functions
  */

  // GET
  function getIndex(req, res) {
    res.render("index", {title : "PING"});
  };
  // function getAdmin(req, res) {
  //   var session = req.param('session');
  //   var sessionPath = 'sessions/comptes/'+session;

  //   fs.ensureDirSync(sessionPath);

  //   res.render("admin", {
  //     title : "Admin",
  //     session : session,
  //   });
  // };

  function getPing(req, res) {
    var session = req.param('session');
    var ping = req.param('ping');
    var pingPath = 'sessions/en-cours/' + ping;

    res.render("notes", {
      title : "Notes",
      session : session,
      ping : ping
    });
  };
  function getPubli(req, res) {
  var ping = req.param('ping');
  var pingPath = 'sessions/termines/' + ping;

  res.render("publi", {
    title : "Publication",
    ping : ping
  });
  };
  // function getNotes(req, res) {
  //   var session = req.param('session');

  //   res.render("notes", {
  //     title : "Notes",
  //     session : session,
  //   });
  // };

};