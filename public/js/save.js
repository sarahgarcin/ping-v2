jQuery(document).ready(function($) {

    var serverBaseUrl = document.domain;
    var domainUrl = window.location.href;
    var socket = io.connect();
    var sessionId = '';
    var session = {};
    var sessionList = [];

    /**Events*/
    initEvents();
    
    /* sockets */
    socket.on('connect', onSocketConnect);
    socket.on('error', onSocketError);
    socket.on('listSessions', onlistSessions);
    socket.on('displayNewSession', displayNewSession);

    function initEvents(){
      $("#add-session").off();
      $("#add-session").on('click', function(){
        addSession();
      });
    }

    /* sockets */
    function onSocketConnect() {
      socket.emit('newUser');
    };

    function onSocketError(reason) {
        console.log('Unable to connect to server', reason);
    };

    // Affiche la liste des sessions
    function onlistSessions(session) {
        $(".session .list-session ul").append('<li class="session-project"><a href="'+domainUrl+'select/'+session+'">'+session+'</a></li>')
    }

    //Ajouter une session
    function addSession(){
      var newContentToAdd = "<form onsubmit='return false;' class='add-project'><input class='new-session' placeholder='Nom du compte'></input><input type='submit' class='submit-session'></input></form>";
      $(".list-session .form-create").append(newContentToAdd);
      $('input.submit-session').on('click', function(){
          var newSession = $('input.new-session').val();
          if(!newSession == ''){
            session = {
                name: newSession 
            }
            sessionList.push(session);
            socket.emit('newSession', {name: newSession});
          }
          else{
            alert("Champ vide, veuillez rentrer un nom de compte avant de valider!");
          }

      })
    }

    function displayNewSession(req){
        $(".session .list-session ul").prepend('<li class="session-project"><a href="'+domainUrl+'select/'+req.name+'">'+req.name+'</a></li>');
    }

});











