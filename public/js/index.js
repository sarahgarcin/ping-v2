$(document).ready(function(){

  var serverBaseUrl = document.domain;
  var socket = io.connect(serverBaseUrl);


    keyEvent();
    rechremp();
    markdownToHtml();
    // syncScroll();

    $("#pad_perso").crevasse({
        previewer: $("#previewer")
    });

    var id = [];

    // Demande le pseudo quand un user se connecte + l'envoie au serveur
    var user = prompt('Quel est votre nom ?');
    socket.emit('nouveau_client', user);
    document.title = user + ' - ' + document.title;
    id.push(user);

    var userList = [];
    var userCount = [];

    // New socket connected, display new count on page
    socket.on('users connected', function(data){
        $('#connected').html('Contributeurs: ' + data);
    })

    socket.on('update', function (users){
        userList = users;
        $('#user').empty();
        for(var i=0; i<userList.length; i++) {
            $('#user').append("<h1>" + userList[i] + "</h1>");
        }

    });


    // Envoie en temps réel au serveur la valeur du textarea
    $("#pad_perso").keyup(function (e) {
        if(e.keyCode == 32 || e.keyCode == 13){
            //socket.send(JSON.stringify($('#pad_perso').val()));

            socket.emit('sendnotes', {text: $('#pad_perso').val(), user:user});

            // Envoie au serveur l'id de celui qui écrit
            // for(var i=0; i<id.length; i++) {
            //     socket.emit('id', id[i]);
            // }
        }


        // // Timecode sur chaque lettre tapée
        // var time = new Date();
        // console.log(time);

    });

    // Récupération de la valeur des textarea et se mettent dans le visualisateur prévu.
    socket.on('receivenotes', function (data) {

        socket.on('id', function (id) {
            if(id == userList[0]){
                $('#visu').val(JSON.parse(data));
                var textArea = $('#visu');
                textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
                if( $('.pseudo').is(':empty') ) {
                    $('.pseudo').append('<p>' + id + '</p>');
                }
                $("#visu").css('display', 'block');
            }

            if(id == userList[1]){
                $('#visu2').val(JSON.parse(data));
                var textArea = $('#visu2');
                textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
                if( $('.pseudo2').is(':empty') ) {
                    $('.pseudo2').append('<p>' + id + '</p>');
                }
                $("#visu2").css('display', 'block');
            }

            if(id == userList[2]){
                $('#visu3').val(JSON.parse(data));
                var textArea = $('#visu3');
                textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
                if( $('.pseudo3').is(':empty') ) {
                    $('.pseudo3').append('<p>' + id + '</p>');
                }
                $("#visu3").css('display', 'block');
            }

            if(id == userList[3]){
                $('#visu4').val(JSON.parse(data));
                var textArea = $('#visu4');
                textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
                if( $('.pseudo4').is(':empty') ) {
                    $('.pseudo4').append('<p>' + id + '</p>');
                }
                $("#visu4").css('display', 'block');
            }

            if(id == userList[4]){
                $('#visu5').val(JSON.parse(data));
                var textArea = $('#visu5');
                textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
                if( $('.pseudo5').is(':empty') ) {
                    $('.pseudo5').append('<p>' + id + '</p>');
                }
                $("#visu5").css('display', 'block');
            }

            if(id == userList[5]){
                $('#visu6').val(JSON.parse(data));
                var textArea = $('#visu6');
                textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
                if( $('.pseudo6').is(':empty') ) {
                    $('.pseudo6').append('<p>' + id + '</p>');
                }
                $("#visu6").css('display', 'block');
            }
        })
    });

    // Récupération des images
    socket.on('user image', image);
    function image (from, base64Image) {
        $('#river').append($('<p>').append($('<b>').text(from), '</br><img src="' + base64Image + '"/>'));
    }

    $('#imagefile').bind('change', function(e){
      var data = e.originalEvent.target.files[0];
      var reader = new FileReader();
      reader.onload = function(evt){
        image('me', evt.target.result);
        socket.emit('user image', evt.target.result);
      };
      reader.readAsDataURL(data);

    });
});

// Synchronise les scrolls des textarea
// function syncScroll() {

//     var $divs = $('#pad_perso, #visu');
//     var sync = function(e){
//         var $other = $divs.not(this).off('scroll'), other = $other.get(0);
//         var percentage = this.scrollTop / (this.scrollHeight - this.offsetHeight);
//         other.scrollTop = percentage * (other.scrollHeight - other.offsetHeight);
//     }
//     $divs.on( 'scroll', sync);

// }

function markdownToHtml(){

    $(".html").click(function(){
        $(this).addClass("active");
        $(".markdown").removeClass("active");
        $("#previewer").css('display', 'block');

    });

    $(".markdown").click(function(){
        $(this).addClass("active");
        $(".html").removeClass("active");
        $("#previewer").css('display', 'none');
    });

}

// Timeline
function keyEvent() {

    var chrono = 0;
    var typingTimer;                //timer identifier
    var doneTypingInterval = 10000;  //time in ms, 5 second for example

    chrono = setInterval(function () {
        var currentVal = $('#pad_perso').val();
        $('#pad_perso').val(currentVal + '|  \n');
    }, 10000);

    $('#pad_perso').keydown(function(event){
            // console.log('You pressed a key');
            clearInterval(chrono);
            clearTimeout(typingTimer);
    });

    $('#pad_perso').keyup(function(){
        clearTimeout(typingTimer);
        typingTimer = setTimeout(doneTyping, doneTypingInterval);
    });

    function doneTyping () {
    chrono = setInterval(function () {
        var currentVal = $('#pad_perso').val();
        $('#pad_perso').val(currentVal + '|  \n');
    }, 10000);
    }

}

// Regex / abbréviations
function rechremp() {

    $('#pad_perso').keyup(function(event){
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
