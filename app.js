var express = require('express'); //inclusion du framework express
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http); // création d'un objet app avec express + serveur + socket.io

var config  = require('./config');

/*
* Server config
*/
config(app, express);


// server.listen(1337);
// io.set('log level', 1)

// app.use(express.static(__dirname + '/public'));

// var req = app.get('/', function (req, res) { // c'est ici qu'on indique les différentes routes (URLs)
//   //res.sendfile(__dirname + '/public/index.html');
// });

/**
* routing
*/
//Handle route "GET /", as in "http://localhost:8080/"
app.get("/", getIndex);


/**
* routing functions
*/
/* GET */
function getIndex(req, res) {
    res.render("index", {title : "Ping"});
};

var users = [];
var clients =[];
var socketCount = 0;

io.sockets.on('connection', function (socket) {

    // Socket has connected, increase socket count
    socketCount++

    // Let all sockets know how many are connected
    io.sockets.emit('users connected', socketCount);
    clients.push(socket);

    socket.on('nouveau_client', function (user) {
        socket.user = user;
        users.push(user);
        // updateClients();

    });

    // on recoit du contenu supp
    socket.on('sendnotes', function (data) {
      console.log("message", data);
      socket.broadcast.emit('receivenotes', data);

      // socket.broadcast.emit('notes', data);
      // socket.on('id', function(id){
      //   socket.broadcast.emit('id', id);
      // });

    });

    socket.on('user image', function (msg) {
      socket.broadcast.emit('user image', socket.user, msg);
    });

    socket.on('disconnect', function (user) {
        for(var i=0; i<users.length; i++) {
            if(users[i] == socket.user) {
                users.splice(i, 1);
            }
        }
        updateClients();

        // Decrease the socket count on a disconnect, emit
        socketCount--
        io.sockets.emit('users connected', socketCount);

        for(var i=0; i<clients.length; i++) {
            if(clients[i] == socket) {
                clients.splice(i, 1);
                // console.log("client disconnect");
            }
        }

    });

});


// function updateClients() {
//     io.sockets.emit('update', users);
// }


/**
* Start the http server at port and IP defined before
*/
http.listen(app.get("port"), /*app.get("ipaddr"),*/ function() {
  console.log("Server up and running. Go to http://" + app.get("ipaddr") + ":" + app.get("port"));
});


