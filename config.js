var bodyParser = require('body-parser');

module.exports = function(app,express){


  // app.set("ipaddr", "127.0.0.1"); //Server's IP address
  app.set("port", 1337); //Server's port number
  app.set("views", __dirname + "/views"); //Specify the views folder
  app.set("view engine", "jade"); //View engine is Jade
  app.use(express.static(__dirname + "/public")); //Specify where the static content is
  app.use(express.static(__dirname + "/sessions"));
  app.use('/static', express.static("sessions"));
  app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());//Tells server to support JSON, urlencoded, and multipart requests

}