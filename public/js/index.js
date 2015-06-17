jQuery(document).ready(function($) {

  var serverBaseUrl = document.domain;
  var domainUrl = window.location.href;
  var socket = io.connect();
  var sessionId = '';

    /* sockets */
  socket.on('connect', onSocketConnect);
  socket.on('error', onSocketError);
  socket.on('displayPing', onNewPing);
  socket.on('listPingJson', listPing);
  socket.on('listFinnishPingJson', listFinnishPing);


  initEvents();

	function initEvents(){
		$(".bouton-create button").on('click', function(){
			createPing();
		});
	}

  function onSocketConnect() {
    socket.emit('listPing');
    socket.emit('listFinnishPing');
  };

  function onSocketError(reason) {
      console.log('Unable to connect to server', reason);
  };

	function createPing(){
		var ping = $(".left-create input[name='ping-name']").val();
		var personName = $(".left-create input[name='person-name']").val();
		var eventDate = $(".left-create input[name='event-date']").val();
		var eventPlace = $(".left-create input[name='event-place']").val();
		var pingName = ping.replace(" ", "").replace("é", "e");
		socket.emit("newPing", {ping:pingName, person:personName, date: eventDate, place:eventPlace})
	}

	function onNewPing(data){
		var addPing = "<li class='ping-list'><h2><a href='"+domainUrl+"ping/"+data.ping+"'>"+data.ping+"</a></h2><h3>"+data.person+"</h3><h4>"+data.date+"</h4><h4>"+data.place+"</h4></li>";
		$(".list-ping-now ul").append(addPing);
	}

	function listPing(json){
		console.log(json);
		var pingName = json['ping'];
		var personName = json['person'];
		var place = json['place'];
		var date = json['date'];
		var contentToadd = "<li class='ping-list'><h3><a href='"+domainUrl+"ping/"+pingName+"'>"+pingName+"</a></h3><h4>"+personName+"</h4><h4>"+date+"</h4><h4>"+place+"</h4></li>";
		$(".list-ping-now ul").append(contentToadd);
	}

	function listFinnishPing(json){
		var pingName = json['ping'];
		var personName = json['person'];
		var place = json['place'];
		var date = json['date'];
		var contentToadd = "<li class='ping-list'><h3><a href='"+domainUrl+"ping/"+pingName+"/publi'>"+pingName+"</a></h3><h4>"+personName+"</h4><h4>"+date+"</h4><h4>"+place+"</h4></li>";
		$(".last-ping ul").append(contentToadd);
	}

});