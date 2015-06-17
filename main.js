var fs = require('fs-extra');
var request = require('request');
var recursive = require('recursive-readdir');
var ncp = require('ncp').ncp;

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
        socket.on("listFinnishPing", listFinnishPing);

        //Socket from Notes page
        socket.on("padConnect", onPadConnect);
        socket.on("sendnotes", onSendNotes);
        socket.on('user image', onNewImage);
        socket.on('comment image', onCommentImage);
        socket.on("publishPing", onPublishPing);

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
    var sessionPath = 'sessions/comptes/'+session.name;
    fs.ensureDirSync(sessionPath);

    io.sockets.emit("displayNewSession", {name: session.name});
  }

  //Liste les dossiers dans sessions/
  function listSessions() {
    var dir = "sessions/comptes/";
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
    var pingPath = 'sessions/en-cours/' + data.ping;
    fs.ensureDirSync(pingPath); 

    //create json File for each ping
    var jsonFile = 'sessions/en-cours/'+ data.ping +'/' +data.ping +'.json';
    var objectJson = {"ping" : data.ping, "person" : data.person, "place" : data.place, "date": data.date, "images":[]};
    var jsonString = JSON.stringify(objectJson);
    fs.appendFile(jsonFile, jsonString, function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log("PING was created!");
      }
    });

    io.sockets.emit("displayPing", {ping: data.ping, person:data.person, date: data.date, place:data.place});
  }

  function listPing(session){
    var dir = "sessions/en-cours/";
    fs.readdir(dir, function (err, files) { if (err) throw err;
      files.forEach( function (file) {
        files.push(file);
        var jsonFile = __dirname +'/'+ dir + file+"/"+file + ".json";
        var data = fs.readFileSync(jsonFile);
        var jsonObj = JSON.parse(data);
        io.sockets.emit("listPingJson", jsonObj);
      });
    });
    // recursive(dir,['*.jpg'], function (err, files) {
    //   // Files is an array of filename 
        
    //   console.log(files);
    //   if (err) return;
    //   files.forEach(function(f) {
    //     console.log(f);
    //     var data = fs.readFileSync(f);
    //     var jsonObj = JSON.parse(data);

    //     io.sockets.emit("listPingJson", jsonObj);
    //   });
    // });
  }

  function listFinnishPing(){
    var dir = "sessions/termines/";
    fs.readdir(dir, function (err, files) { if (err) throw err;
      files.forEach( function (file) {
        files.push(file);
        var jsonFile = __dirname +'/'+ dir + file+"/"+file + ".json";
        var data = fs.readFileSync(jsonFile);
        var jsonObj = JSON.parse(data);
        io.sockets.emit("listFinnishPingJson", jsonObj);
      });
    });
  }

  function onPadConnect(ping, session){
    var dir = "sessions/en-cours/" + ping;
    var fileExist = dir + "/" + session + ".json";
    var Objson = {"name": session, "text": ""};
    var jsonString = JSON.stringify(Objson);
    var usersConnected;
    //If file exist do nothing else create file
    fs.stat(fileExist, function(err, stat) {
      if(err == null) {
          console.log('File exists');
          var data = fs.readFileSync(fileExist,"UTF-8");
          var jsonObj = JSON.parse(data);
          io.sockets.emit("displayNotes", jsonObj, session);
      } else if(err.code == 'ENOENT') {
          fs.writeFile(fileExist, jsonString);
      } else {
          console.log('Some other error: ', err.code);
      }
    });
    fs.readdir(dir, function(err, files) {
      var media = [];
      if (err) return;
      files.forEach(function(f) {
        media.push(f);
      });
      io.sockets.emit('listImages', media, session);
    });
  }

  // Reçoit le contenu "notes"
  function onSendNotes(req) {
    var jsonFile = __dirname + "/sessions/en-cours/"+req.ping +"/"+ req.session + ".json";
    var data = fs.readFileSync(jsonFile,"UTF-8");
    var jsonObj = JSON.parse(data);
    var jsonAdd = req.text;
    jsonObj.text = jsonAdd;
    fs.writeFile(jsonFile, JSON.stringify(jsonObj), function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log("The file was saved!");
      }
    });
    io.sockets.emit('receivenotes', req); // Envoyer les "notes" à tous les users connectés
  }

  function onNewImage(data){
    var time = new Date();
    var ts = time.getHours() +"-" + time.getMinutes() + "-" + time.getSeconds();
    var fileName = data.image;
    var filePath = __dirname + '/sessions/en-cours/'+ data.ping +'/'+ fileName + ".jpg";

    var imageBuffer = decodeBase64Image(data.file);

    fs.writeFile(filePath, imageBuffer.data, function (err) {
        console.info("write new file to " + filePath);
    });
    //add image in json file
    var jsonFile = 'sessions/en-cours/' + data.ping +"/"+data.ping+'.json';
    var jsonData = fs.readFileSync(jsonFile,"UTF-8");
    var jsonObj = JSON.parse(jsonData);
    var jsonAdd = { "name" : fileName};
    jsonObj["images"].push(jsonAdd);
    fs.writeFile(jsonFile, JSON.stringify(jsonObj), function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log("The file was saved!");
      }
    });  

    io.sockets.emit('user image', data, fileName);
  }

  function onPublishPing(ping, session){
    ncp.limit = 16;
    var oldDir = __dirname +'/sessions/en-cours/'+ ping ;
    var newDir = __dirname +'/sessions/termines/'+ ping;

    ncp(oldDir, newDir, function (err) {
     if (err) {
       return console.error(err);
     }
     console.log('done!');
      var dir = "sessions/termines/" + ping;
      var fileExist = dir + "/" + session + ".json";
      var data = fs.readFileSync(fileExist,"UTF-8");
      var jsonObj = JSON.parse(data);

      setTimeout(function(){
        io.sockets.emit("goPublish", ping, session, jsonObj);
      }, 1000);
    });
    setTimeout(function(){
      fs.readdir(newDir, function(err, files) {
        var media = [];
        if (err) return;
        files.forEach(function(f) {
          media.push(f);
        });
        io.sockets.emit('goPublishImages', media, session);
      });
    }, 1000);
  }

  function updateClients() {
    io.sockets.emit('update', users);
  }

  function onCommentImage(req){
    // var jsonFile = 'sessions/en-cours/' + req.ping +"/"+req.ping+'.json';
    // var jsonData = fs.readFileSync(jsonFile,"UTF-8");
    // var jsonObj = JSON.parse(jsonData);
    io.sockets.emit('comment image', req);
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

