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
  socket.on('listPadEnCours', listPadEnCours);


  initEvents();

	function initEvents(){
		$(".bouton-create button").on('click', function(){
			createPing();
		});
	}

  function onSocketConnect() {
    console.log(app.session + " is connect!");
    socket.emit('listPing', app.session);
  };

  function onSocketError(reason) {
      console.log('Unable to connect to server', reason);
  };

	function createPing(){
		var pingName = $(".left-create input[name='ping-name']").val();
		var personName = $(".left-create input[name='person-name']").val();
		var eventDate = $(".left-create input[name='event-date']").val();
		var eventPlace = $(".left-create input[name='event-place']").val();
		socket.emit("newPing", {session: app.session, ping:pingName, person:personName, date: eventDate, place:eventPlace})
	}

	function onNewPing(data){
		var formatName = data.ping.replace(" ", "");
		var addPing = "<li class='ping-list'><h2><a href='"+domainUrl+"/"+formatName+"'>"+data.ping+"</a></h2><h3>"+data.person+"</h3><h4>"+data.date+"</h4><h4>"+data.place+"</h4></li>";
		$(".left-myping ul").append(addPing);
	}

	function listPing(json){
		console.log(json.ping);
		var formatName = json.ping.replace(" ", "");
		var contentToadd = "<li class='ping-list'><h2><a href='"+domainUrl+"/"+formatName+"'>"+json.ping+"</a></h2><h3>"+json.person+"</h3><h4>"+json.date+"</h4><h4>"+json.place+"</h4></li>";
		$(".left-myping ul").append(contentToadd);
	}

	function listPadEnCours(count, ping){
		console.log(ping);
		var padEnCours = "<li class='ping-now'><h2>"+ping+"</h2><h4>Contributeurs:"+count+"</h4></li>";
		$(".list-ping-now ul").append(padEnCours);
	}


});