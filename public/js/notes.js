$(document).ready(function(){

    var serverBaseUrl = document.domain;
    var socket = io.connect(serverBaseUrl);
    var host = window.location.host;
    var userList = [];
    var userCount = [];
    var id = [];
    var userName = prompt("Quel est votre prénom ? ");
    id.push(userName);


    /* sockets */
    socket.on('connect', onSocketConnect);
    socket.on('error', onSocketError);
    socket.on('disconnect', onSocketDisconnect);
    // New socket connected, display new count on page
    socket.on('users connected', function (data){
        $('#connected').html('Contributeurs: ' + data);
    })
    socket.on("update", updateUsers);
    socket.on("receivenotes", onReceiveNotes);
    socket.on("displayNotes", displayNotes);
    socket.on("listImages", listImages);
    //function initie les évènements
    initEvents();

    function initEvents(){
      $("#pad_perso").focus();
      $(".session-name").append(userName);

      //Send notes 
      $("#pad_perso").keyup(function (e) {
        if(e.keyCode == 32 || e.keyCode == 13){
          sendNotes();
        }
      });

      $(".finnish-ping button").on('click', function(){
        publishPing();
      });

      rechremp();
      markdownToHtml();
      upAndDown();

      $("#fake").crevasse({
          previewer: $("#previewer")
      });
    }

    function onSocketConnect() {
      socket.emit("padConnect", app.ping, userName);
      socket.emit('nouveau_client', userName);
    };

    function onSocketDisconnect() {
      console.log(app.session + " is disconnect!");
    };

    function onSocketError(reason) {
      console.log('Unable to connect to server', reason);
    };

    // Fait apparaître son visualisateur à chaque connection de user
    function updateUsers(users){
      console.log(users);
      userList = users;
      $('#visualisateur').empty();
      for(var i=0; i<userList.length; i++) {
        if(userList[i] !== userName){
          $('#visualisateur').append("<div class='pseudo'>" + userList[i] + "</div><textarea id='visu"+i+"' class='visus'></textarea>");
        }
      }
    }

    //affiche les notes de l'utilisateur dès sa connexion
    function displayNotes(data, session){
      console.log(session);
      if(session == userName){
        $("#pad_perso").val(data['text']);
      }
    }
    function listImages (media, session){
      if(session == userName){
        
        for (var i = 0; i < media.length; i++) {      
          var extension = media[i].split('.').pop();
          var identifiant =  media[i].replace("." + extension, "");
          console.log(identifiant);
          if(extension == "jpg"){
            $('#river').append($('<b>').text(session), '</br><img src="http://'+host+'/en-cours/' + app.ping + '/' +media[i]+'" data-name="'+identifiant+'"><div class="comment" data-name="'+identifiant+'"></div>');
          }
        }
      }
    }

    // Envoie en temps réel au serveur la valeur du textarea
    function sendNotes(){
      //timecode pour chaque mot tapé
      var timestamp = new Date();
      var time = timestamp.getHours() +"-" + timestamp.getMinutes() + "-" + timestamp.getSeconds();
      socket.emit('sendnotes', {ping: app.ping, text: $('#pad_perso').val(), session: userName, time:time});
    }

    // Récupération de la valeur des textarea et se mettent dans le visualisateur prévu.
    function onReceiveNotes(data){
      for(i=0; i<userList.length; i++){
        if(data.session == userList[i]){
          $('#visu' +i).html(data.text);
          var textArea = $('#visu' +i);
          textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
        }
      }
    }

    //Publie le Ping et le termine!
    function publishPing(){
      socket.emit("publishPing", app.ping, userName);
      window.location.replace('http://'+host+'/ping/' +app.ping+ '/publi');
    }

    // Récupération des images
    socket.on('user image', image); //reçoit les données et affiche l'image avec la function image
    function image (data, filename) {  // décode le DataURl de l'image en base64Image
      if(data.session != userName){
        $('#river').append($('<p>').append($('<b>').text(data.session), '</br><img src="http://'+host+'/en-cours/' + data.ping + '/' +filename+'.jpg" data-name="'+filename+'"><div class="comment" data-name="'+filename+'"></div>'));       
      }
      var scrollImage = $('#river');
      scrollImage.scrollTop(scrollImage[0].scrollHeight - scrollImage.height());
    }

    function addComment(){
      $('#river p:last-child').append('<button class="commenter">COMMENTER</button>');
      $(".commenter").click(function(){
        var commentImage = $(this).prev('img').attr('data-name');
        $(this).parent().append('<input type="text" class="commentInput commentI"></input></br><input type="submit" class="commentSubmit commentI"></input> ');
        $(this).remove();
        $('#river .commentInput').focus();
        $(".commentSubmit").click(function(){
            $(this).parent().append('<div class="comment" data-name="'+commentImage+'"></div>');
            var comment = $("input.commentInput").val();       
            var regexUrl = /^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/;
            if(regexUrl){
                str = comment.replace(regexUrl, "<a href='" + comment + "'target='_blank'>" + comment + "</a>");
                $(".comment").append(str); 
            }
            else{   
                $(".comment").append(comment);
            }
            $(".comment").addClass("commentfull");
            $(".comment").removeClass("comment");

            socket.emit('comment image', {text:$("input.commentInput").val(), name:commentImage, ping:app.ping, session:userName});
            $("input.commentI").remove();
        });
      });
    }  

    socket.on('comment image', onNewComment); //ajout des commentaires
    function onNewComment(data){
      if(data.session != userName){
        //transforme les urls dans les commentaires en hyperliens
        var str = data.text;       
        var regexUrl = /^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/;
        if(regexUrl){
          str = str.replace(regexUrl, "<a href='" + data.text + "'target='_blank'>" + data.text + "</a>");
          $(".comment").append(str); 
        }
        else{   
            $(".comment").append(data.text);
        }
        $(".comment").addClass("commentfull");
        $(".comment").removeClass("comment");
      }  
    }

    function imageLocal (from, base64Image, imagename) {  // décode le DataURl de l'image en base64Image
      $('#river').append($('<p>').append($('<b>').text(from), '</br><img src="' + base64Image + '" data-name ="'+imagename+'"/>'));       
      var scrollImage = $('#river');
      scrollImage.scrollTop(scrollImage[0].scrollHeight - scrollImage.height());
    }

    // Image from "Partager les images" input
    $('#imagefile').bind('change', function(e){
        upload(e.originalEvent.target.files);
    });

    // Add images with Drag and Drop from local Files and from Web Page
    $("#river").on('dragover', function (e){
            e.preventDefault();
            e.stopPropagation();
            return false;
    });
 
    $("#river").on('dragleave', function (e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
    });

    $("#river").on('drop', function (e) {
        // Stop the propagation of the event
        e.preventDefault();
        e.stopPropagation();
        if(e.originalEvent.dataTransfer){
            if(e.originalEvent.dataTransfer.files.length) { //Drag and Drop from Local Files
                // Main function to upload
                upload(e.originalEvent.dataTransfer.files);
            }
            else {
                e.originalEvent.dataTransfer.items[0].getAsString(function(url){ // Drag and Drop from webpage
                    img = '<img src="'+ url +'">';
                    $($('<p>').append($('<b>').text("moi"), '</br><img src="'+ url +'">')).appendTo('#river');
                    addCommentFromWeb();
                    socket.emit('image url', url); 
                    var scrollImage = $('#river');
                    scrollImage.scrollTop(scrollImage[0].scrollHeight - scrollImage.height());  
                });
            }  
        }
        else {

        }
        return false;
    });

    function upload(files) {
      var f = files[0];
      // Only process image files.
      var reader = new FileReader();
      var currentDate =  new Date();
      var time = currentDate.getHours() +"-" + currentDate.getMinutes() + "-" + currentDate.getSeconds();
      var imageName = time + "_" + userName;
      // When the image is loaded,
      reader.onload = function(evt){
          imageLocal('moi', evt.target.result, imageName);
          addComment();
      socket.emit('user image', {ping: app.ping, session: userName, file:evt.target.result, image: imageName});
      };
      // Read in the image file as a data URL.
      reader.readAsDataURL(f);            
    }

    function addCommentFromWeb(){
        $('#river p:last-child').append('<button class="commenter">COMMENTER</button>');
        $(".commenter").click(function(){
            $(this).parent().append('<input type="text" class="commentInput commentI"></input></br><input type="submit" class="commentSubmit commentI"></input> ');
            $(this).remove();
            $('#river .commentInput').focus();
            $(".commentSubmit").click(function(){
                $(this).parent().append('<div class="comment"></div>');
                var comment = $("input.commentInput").val();       
                var regexUrl = /^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/;
                if(regexUrl){
                    str = comment.replace(regexUrl, "<a href='" + comment + "'target='_blank'>" + comment + "</a>");
                    $(".comment").append(str); 
                }
                else{   
                    $(".comment").append(comment);
                }
                $(".comment").addClass("commentfull");
                $(".comment").removeClass("comment");
                
                socket.emit('comment imageWeb', comment);
                $("input.commentI").remove();
            });
        });
    }

    socket.on('image url', function (from, data){
        $('<img src="'+ data +'">').load(function() {
            $($('<p>').append($('<b>').text(from), '</br><img src="'+ data +'"><div class="comment'+from+'"></div>')).appendTo('#river');
            var scrollImage = $('#river');
            scrollImage.scrollTop(scrollImage[0].scrollHeight - scrollImage.height());  
        }); 

        socket.on('comment imageWeb', function (message){ //ajout des commentaires
            console.log(message);  
            var str = message;       
            var regexUrl = /^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/;
            if(regexUrl){
                str = str.replace(regexUrl, "<a href='" + message + "'target='_blank'>" + message + "</a>");
                $('.comment'+from).append(str); 
            }
            else{   
                $(".comment"+from).append(message);
            }
            $(".comment"+from).addClass("commentfull");
            $(".comment"+from).removeClass("comment"+from);  
        });   

    });
});

function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

function upAndDown(){
    var scrolled=0;
    $("#downClick").on("click" ,function(){
                scrolled=scrolled+300;
        
                $("#visualisateur").animate({
                        scrollTop:  scrolled
                   });

            });

    
    $("#upClick").on("click" ,function(){
                scrolled=scrolled-300;
                
                $("#visualisateur").animate({
                        scrollTop:  scrolled
                   });

            });
}

// Synchronise les scrolls des textarea
function syncScroll() {

    var $divs = $('.scrollDiv');
    var sync = function(e){
        var $other = $divs.not(this).off('scroll'), other = $other.get(0);
        var percentage = this.scrollTop / (this.scrollHeight - this.offsetHeight);
        other.scrollTop = percentage * (other.scrollHeight - other.offsetHeight);
        setTimeout( function(){ $other.on('scroll', sync ); },10);
    }
    $divs.on( 'scroll', sync);
}

function markdownToHtml(){

    $(".html").on('click', onClickHtml);
    $(".markdown").on('click', onClickMarkdown);

    function onClickHtml(event){
        changeTabs();
        fakeTextarea();
        addComment();
        // cleanHtml();
        updateMarkdown();
    }

    function changeTabs(){
        $(".html").addClass("active");
        $(".markdown").removeClass("active");
        $("#previewer").css('display', 'block');
    }

    function fakeTextarea(){
        var htmlString = $("#pad_perso").val();
        $("#fake").val(htmlString);
    }

    function addComment(){
        var str = $("#fake").val();
        var regexSlash = /\/\//gi;
        var regexBreak = /\n/gi;
        var regexHttp = /http:>/ig;
        str = str.replace(regexSlash, ">");
        str = str.replace(regexBreak, "  \n");
        str = str.replace(regexHttp, "http://"); 
        $("#fake").val(str);
    }

    function cleanHtml(){
        var htmlString = $("#pad_perso").html();
        $("#fake").val(htmlString);        
        var str = $("#fake").val();
        var regexBr = /<br\s*\/?>/gi;
        var regexDiv = /<div>/gi;
        var regexDivClass = /<div class=(.*?)>/gi;
        var regexDivClose = /<\/div>/gi;  
        var regexNbsp = /\&nbsp;/gi;
        var regexSlash = /\/\//gi;
        str = str.replace(regexBr, "\n");
        str = str.replace(regexDiv, "\n\n");
        str = str.replace(regexDivClass, "\n\n");
        str = str.replace(regexDivClose, "");
        str = str.replace(regexNbsp, " ");
        str = str.replace(regexSlash, ">");        
        $("#fake").val(str);

    }

    function updateMarkdown(){
        $("#fake").trigger("change");
    }

    function onClickMarkdown(){
        $(this).addClass("active");
        $(".html").removeClass("active");
        $("#previewer").css('display', 'none');
    }
}

// Timeline
function timerEvent() {

    var chrono = 0;
    var typingTimer;                //timer identifier
    var doneTypingInterval = 30000;  //time in ms

    doneTyping();

    // chrono = setInterval(function () {
    //     var currentVal = $('#pad_perso').val();
    //     $('#pad_perso').val(currentVal + "\n|\n");
    //     $('#pad_perso').focus();
    //     // placeCaretAtEnd( document.getElementById("pad_perso") );
    //     var scrolltext = $('#pad_perso');
    //     scrolltext.scrollTop(scrolltext[0].scrollHeight - scrolltext.height());
    // }, doneTypingInterval);

    $('#pad_perso').keyup(function(){
        clearTimeout(typingTimer);
        typingTimer = setTimeout(doneTyping, doneTypingInterval);
    });

    $('#pad_perso').keydown(function(event){
        clearInterval(chrono);
        clearTimeout(typingTimer);
    });

    function doneTyping () {
        chrono = setInterval(function () {
            var currentVal = $('#pad_perso').val();
            $('#pad_perso').val(currentVal + "\n   |\n");
            $('#pad_perso').focus();
            // placeCaretAtEnd( document.getElementById("pad_perso") );
            var scrolltext = $('#pad_perso');
            scrolltext.scrollTop(scrolltext[0].scrollHeight - scrolltext.height());
        }, doneTypingInterval);
    }
}

function shareUrl(){

    $('#pad_perso').keyup(function (e){
        var textUrl = $('#pad_perso').val(); 
        var regexUrl = /(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/gi;
        if(regexUrl.test(textUrl)){
            $("#river").append("<div class='url'></div>");
            $("#river .url").append(textUrl);
            // $("#river").html(textUrl);
        }
    });

    $('#river').bind('change', function(){
        console.log("Change");
        var textUrl = $('#river').text(); 
        var regexUrl = /(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/gi;

        var newUrl = textUrl.replace(regexUrl, '<a href="'+ textUrl +'" target="_blank">' + textUrl + '</a>');
        $("#river").html(newUrl);
    });

    // $('#pad_perso').change(function (e){
    //     var textUrl = $(this).val(); 
    //     var regexUrl = /(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/gi;

    //     if(regexUrl.test(textUrl)){
    //         var newUrl = textUrl.replace(regexUrl, '<a href="'+textUrl+'" target="_blank">' + textUrl + '</a>');
    //         var matches = [];
    //         matches.push(newUrl);
    //         for(i=0; i<matches.length; i++){
    //             // console.log(matches[0]);
    //             $('#river').append(matches[0]);
    //         }
    //     }
    // });
    //         var text = $("#pad_perso").val(); 
    //         var regexUrl = (/^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/gi);
    //         // var matches = regexUrl.match(text);
    //         var newUrl = text.replace(regexUrl, '<a href="' + text + '" target="_blank">' + text + '</a>');
    //         $(this).val(newUrl);
    //         //     $('#river').html(newUrl)

    //         // if(regexUrl.test(text)){
    //         //     console.log(text);
    //         //     var newUrl = text.replace(regexUrl, '<a href="' + text + '" target="_blank">' + text + '</a>');
    //         //     $('#river').html(newUrl);
    //         // }

    // });

    // var text = $("#pad_perso").val(); 
    // var regexUrl = (/^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/);   

    // while(text.match(regexUrl)) {
    //     console.log("pouet");
    //     $("#river").append('<div class="urlHtml"></div>');
    //     var newUrl = text.replace(regexUrl, "<a href='" + text + "'target='_blank'>" + text + "</a>");
    //     $(".urlHtml").append(newUrl); 
    // }
}

// Regex / abbréviations
function rechremp() {

  $('#pad_perso').keyup(function(event){

    var webLink = $(this).val();
    var linkregex = /<[^>]+>/ig;
    var checkEvent = false;
    if(linkregex.test(webLink)){
      var newlink = webLink.replace("<", '').replace(">", "");
      $(this).val(newlink);
      checkEvent = true;
      if(checkEvent = true){
        $("#river").append("<p><a href='"+newlink+"'>"+newlink+"</a></p>");
      }
    }

    var oldtxt = $(this).val();
    var regex = /\bbcp\b /ig;
    var newtxt = oldtxt.replace(regex, 'beaucoup ');
    $(this).val(newtxt);

    var oldtxt1 = $(this).val();
    var regex1 = /\bns\b /ig;
    var newtxt1 = oldtxt1.replace(regex1, 'nous ');
    $(this).val(newtxt1);

    var oldtxt2 = $(this).val();
    var regex2 = /\bvs\b /ig;
    var newtxt2 = oldtxt2.replace(regex2, 'vous ');
    $(this).val(newtxt2);

    var oldtxt3 = $(this).val();
    var regex3 = /\bpr\b /ig;
    var newtxt3 = oldtxt3.replace(regex3, 'pour ');
    $(this).val(newtxt3);

    var oldtxt4 = $(this).val();
    var regex4 = /\btt\b /ig;
    var newtxt4 = oldtxt4.replace(regex4, 'tout ');
    $(this).val(newtxt4);

    var oldtxt5 = $(this).val();
    var regex5 = /\btjs\b /ig;
    var newtxt5 = oldtxt5.replace(regex5, 'toujours ');
    $(this).val(newtxt5);

    var oldtxt6 = $(this).val();
    var regex6 = /\bpq\b /ig;
    var newtxt6 = oldtxt6.replace(regex6, 'pourquoi ');
    $(this).val(newtxt6);

    var oldtxt7 = $(this).val();
    var regex7 = /\bavt\b /ig;
    var newtxt7 = oldtxt7.replace(regex7, 'avant ');
    $(this).val(newtxt7);

    var oldtxt8 = $(this).val();
    var regex8 = /\bdt\b /ig;
    var newtxt8 = oldtxt8.replace(regex8, 'dont ');
    $(this).val(newtxt8);

    var oldtxt9 = $(this).val();
    var regex9 = /\bdc\b /ig;
    var newtxt9 = oldtxt9.replace(regex9, 'donc ');
    $(this).val(newtxt9);

    var oldtxt10 = $(this).val();
    var regex10 = /\btps\b /ig;
    var newtxt10 = oldtxt10.replace(regex10, 'temps ');
    $(this).val(newtxt10);

    var oldtxt11 = $(this).val();
    var regex11 = /\blgtps\b /ig;
    var newtxt11 = oldtxt11.replace(regex11, 'longtemps ');
    $(this).val(newtxt11);

    var oldtxt12 = $(this).val();
    var regex12 = /\bdvlpt\b /ig;
    var newtxt12 = oldtxt12.replace(regex12, 'développement ');
    $(this).val(newtxt12);

    var oldtxt13 = $(this).val();
    var regex13 = /\bpb\b /ig;
    var newtxt13 = oldtxt13.replace(regex13, 'problème ');
    $(this).val(newtxt13);

    var oldtxt14 = $(this).val();
    var regex14 = /\brdv\b /ig;
    var newtxt14 = oldtxt14.replace(regex14, 'rendez-vous ');
    $(this).val(newtxt14);

    var oldtxt15 = $(this).val();
    var regex15 = /\bgvt\b /ig;
    var newtxt15 = oldtxt15.replace(regex15, 'gouvernement ');
    $(this).val(newtxt15);

    var oldtxt16 = $(this).val();
    var regex16 = /\bmvt\b /ig;
    var newtxt16 = oldtxt16.replace(regex16, 'mouvement ');
    $(this).val(newtxt16);

    var oldtxt17 = $(this).val();
    var regex17 = /\bnbx\b /ig;
    var newtxt17 = oldtxt17.replace(regex17, 'nombreux ');
    $(this).val(newtxt17);
  });
}
