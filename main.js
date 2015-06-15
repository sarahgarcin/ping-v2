var fs = require('fs-extra');
var request = require('request');
var recursive = require('recursive-readdir');

module.exports = function(app, io){

console.log("main module initialized");


var users = [];
var clients =[];
var socketCount = 0;

    io.sockets.on('connection', function (socket) {

        socket.on("newUser", onNewUser);
        socket.on("newSession", addNewSession);
        socket.on("newPing", addNewPing);
        socket.on("listPing", listPing);
        socket.on("padEnCours", listPadEnCours);

        // Socket has connected, increase socket count
        socketCount++

        // Let all sockets know how many are connected
        io.sockets.emit('users connected', socketCount);
        clients.push(socket);

        socket.on('nouveau_client', function (user) {
            socket.user = user;
            users.push(user);
            updateClients();

        });

        // Reçoit le contenu "notes"
        socket.on('sendnotes', function (data) {
            var fileName = __dirname + '/public/sessions/diplome/' + socket.user + ".txt"; // créer un fichier texte dans lequel vont s'écrire les données
            var fileBrut = __dirname + '/public/sessions/diplome/' + socket.user + "-" + "brut.txt"; // créer un fichier texte dans lequel vont s'écrire les données
            fs.writeFileSync(fileBrut, data.text); // Écrire dans les notes dans un fichier texte
            fs.writeFile(fileName, JSON.stringify(data), function (err){ // Écrire dans les notes + timestamp + user dans un fichier json
                console.log(err);
            });
            socket.broadcast.emit('receivenotes', data); // Envoyer les "notes" à tous les users connectés
        });

        socket.on('user image', function (data) {
            var time = new Date();
            var ts = time.getHours() +"-" + time.getMinutes() + "-" + time.getSeconds();
            var fileName = __dirname + '/public/sessions/diplome/images/' + ts + "_" + socket.user + ".jpg";

            var imageBuffer = decodeBase64Image(data);

            fs.writeFile(fileName, imageBuffer.data, function (err) {
                console.info("write new file to " + fileName);
            });   

            socket.broadcast.emit('user image', socket.user, data);
        });

        socket.on('image url', function (data){
            var time = new Date();
            var ts = time.getHours() +"-" + time.getMinutes() + "-" + time.getSeconds();
            var fileName = __dirname + '/public/sessions/diplome/images/' + ts + "_" + socket.user + ".jpg";
            var download = function(uri, filename, callback){
                request.head(uri, function(err, res, body){
                    console.log('content-type:', res.headers['content-type']);
                    console.log('content-length:', res.headers['content-length']);

                    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
                });
            };
            download(data, fileName, function(){
                console.log('done');
            }); 

            socket.broadcast.emit('image url', socket.user, data);
            // io.sockets.emit('image url', socket.user, data);
        })

        socket.on('comment image', function (message){
            var time = new Date();
            var ts = time.getHours() +"-" + time.getMinutes() + "-" + time.getSeconds();
            var fileName = __dirname + '/public/sessions/diplome/images/' + ts + "_" + socket.user + ".txt";
            fs.writeFile(fileName, message);
            socket.broadcast.emit('comment image', message);
        });

        socket.on('comment imageWeb', function (comment){
            var time = new Date();
            var ts = time.getHours() +"-" + time.getMinutes() + "-" + time.getSeconds();
            var fileName = __dirname + '/public/sessions/diplome/images/' + ts + "_" + socket.user + ".txt";
            fs.writeFile(fileName, comment);
            socket.broadcast.emit('comment imageWeb', comment);
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

  function onNewUser(req){
    listSessions();   
  };

  //Ajoute le dossier de la session + l'ajouter à la liste des sessions
  function addNewSession(session) {
    console.log(session.name);
    var sessionPath = 'sessions/'+session.name;
    fs.ensureDirSync(sessionPath);

    io.sockets.emit("displayNewSession", {name: session.name});
  }

  //Liste les dossiers dans sessions/
  function listSessions() {
    var dir = "sessions/";
    fs.readdir(dir, function (err, files) { if (err) throw err;
      files.forEach( function (file) {
        files.push(file);
        if(file == ".DS_Store"){
          fs.unlink(dir+'.DS_Store');
        }
        io.sockets.emit('listSessions', file);
      });
    });
  }

  function addNewPing(data){
    var formatPingName = data.ping.replace(" ", "");
    var pingPath = 'sessions/'+data.session +"/" + formatPingName;
    fs.ensureDirSync(pingPath); 

    //create json File for each ping
    var jsonFile = 'sessions/' +data.session +"/" + formatPingName +'/' +formatPingName +'.json';
    var objectJson = {"ping" : data.ping, "person" : data.person, "place" : data.place, "date": data.date};
    var jsonString = JSON.stringify(objectJson);
    fs.appendFile(jsonFile, jsonString, function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log("PING was created!");
      }
    });
    // var textFile = 'sessions/' +data.session +"/" + data.ping +'/' +data.ping +'-text.json';
    // fs.appendFile(textFile);

    io.sockets.emit("displayPing", {session: data.session, ping: data.ping, person:data.person, date: data.date, place:data.place});
  }

  function listPing(session){
    var dir = "sessions/" + session;
    console.log(dir);
    recursive(dir,['*.jpg'], function (err, files) {
      // Files is an array of filename 
      if (err) return;
      files.forEach(function(f) {
        console.log(f);
        var data = fs.readFileSync(f);
        var jsonObj = JSON.parse(data);
        io.sockets.emit("listPingJson", jsonObj);
      });
    });

  }

  function listPadEnCours(count, ping){
    io.sockets.emit("listPadEnCours", count, ping);
  }


  function updateClients() {
      io.sockets.emit('update', users);
  }

  function decodeBase64Image(dataString) {
      var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
      response = {};

      if (matches.length !== 3) {
          return new Error('Invalid input string');
      }

      response.type = matches[1];
      response.data = new Buffer(matches[2], 'base64');

      return response;
  }
}

