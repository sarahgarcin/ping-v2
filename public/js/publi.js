jQuery(document).ready(function($) {

	var serverBaseUrl = document.domain;
	var socket = io.connect(serverBaseUrl);
	var host = window.location.host;
	var userName;

   /* sockets */
  socket.on('connect', onSocketConnect);
  socket.on('error', onSocketError);
  socket.on('goPublish', publish);
  socket.on('goPublishImages', publishImages);

  initEvents();

  function initEvents(){
  	setTimeout(function(){
	  	$(".fake-publication").crevasse({
			  previewer: $(".text-content")
			});
		}, 2000);
  }

	function onSocketConnect() {
		console.log("Socket is connected");
	};

	function onSocketError(reason) {
		console.log('Unable to connect to server', reason);
	};

	function publish(ping, session, json){
		userName = session;	
		$(".session-name").append(userName);
    $(".left-publi").append("<textarea class='fake-publication'>"+json['text']+"</textarea>");
    $('.fake-publication').hide();
  }

  function publishImages(media, session){
  	for (var i = 0; i < media.length; i++) {      
      var extension = media[i].split('.').pop();
      var identifiant =  media[i].replace("." + extension, "");
      if(extension == "jpg"){
        $('.right-publi .image-content ul').append('<li><img src="http://'+host+'/termines/' + app.ping + '/' +media[i]+'" data-name="'+identifiant+'"></li>');
      }
    }
  }

});