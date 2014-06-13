$(document).ready(function(){

    var serverBaseUrl = document.domain;
    var socket = io.connect(serverBaseUrl);
    // var siofu = new SocketIOFileUpload(socket);

    $("#pad_perso").focus();

    timerEvent();
    rechremp();
    markdownToHtml();
    upAndDown();
    shareUrl();
    // syncCursor();
    // syncScroll();

    $("#fake").crevasse({
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
    socket.on('users connected', function (data){
        $('#connected').html('Contributeurs: ' + data);
    })

    // socket.on('update', function (users){
    //     userList = users;
    //     $('#user').empty();
    //     for(var i=0; i<userList.length; i++) {
    //         $('#user').append("<h1>" + userList[i] + "</h1>");
    //     }

    // });

    // Fait apparaître son visualisateur à chaque connection de user
    socket.on('update', function (users){
        userList = users;
        $('#visualisateur').empty();
        for(var i=0; i<userList.length; i++) {
            if(userList[i] !== user){
                $('#visualisateur').append("<div class='pseudo'>" + userList[i] + "</div><textarea id='visu"+i+"'></textarea>");
            }
        }

    });

    // var twice = 0;
    // $("#pad_perso").keyup(function (e){
    //     if(e.keyCode == 13){
    //         twice +=1;

    //         if(twice == 1 && e.keyCode !== 13){
    //             twice=0;
    //         }

    //         if(twice == 2){
    //             var time = new Date();
    //             var currentVal = $("#pad_perso").val();
    //             $("#pad_perso").val( currentVal + time.getHours() +":" + time.getMinutes() + ":" + time.getSeconds() + "  " + "\n");
    //             twice = 0;
    //         }
    //     }
    // });

    // $("#pad_perso").keyup(function(){
    //     var string = $("#pad_perso").val();
    //     var urlRegex = '^(https?:\/\/[^\s]+[^.,:;"\')\]\s])';
    //     var regextest = "caca"; 
    //     // var newtxt = string.replace(regextest, 'URL');
    //     var newtxt = string.replace(urlRegex, 'URL');
    //     $('#pad_perso').val(newtxt);
        // var url = string.match(urlRegex);
        // if(url){
        //     console.log("une url est là");
        //     $("#river").append("<div class='url'>" + url + "</div>");
        // }
    // })

    // Envoie en temps réel au serveur la valeur du textarea
    $("#pad_perso").keyup(function (e) {
        if(e.keyCode == 32 || e.keyCode == 13){
            //timecode pour chaque mot tapé
            var timestamp = new Date();
            var time = timestamp.getHours() +"-" + timestamp.getMinutes() + "-" + timestamp.getSeconds();
            socket.emit('sendnotes', {text: $('#pad_perso').val(), user:user, time:time});
        }

    });

    // Récupération de la valeur des textarea et se mettent dans le visualisateur prévu.
    socket.on('receivenotes', function (data) {
            if(data.user == userList[0]){
                $('#visu0').html(data.text);
                var textArea = $('#visu0');
                textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
            }

            if(data.user == userList[1]){
                $('#visu1').html(data.text);
                var textArea = $('#visu1');
                textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
            }

            if(data.user == userList[2]){
                $('#visu2').html(data.text);
                var textArea = $('#visu2');
                textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
            }

            if(data.user == userList[3]){
                $('#visu3').html(data.text);
                var textArea = $('#visu3');
                textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
            }

            if(data.user == userList[4]){
                $('#visu4').html(data.text);
                var textArea = $('#visu4');
                textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
            }

            if(data.user == userList[5]){
                $('#visu5').html(data.text);
                var textArea = $('#visu5');
                textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
            }       
    });

    // Récupération des images
    socket.on('user image', image); //reçoit les données et affiche l'image avec la function image
    function image (from, base64Image) {  // décode le DataURl de l'image en base64Image
            $('#river').append($('<p>').append($('<b>').text(from), '</br><img src="' + base64Image + '"/><div class="comment"></div>'));       
            socket.on('comment image', function (message){ //ajout des commentaires
                
                var str = message;       
                var regexUrl = /^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/;
                if(regexUrl){
                    str = str.replace(regexUrl, "<a href='" + message + "'target='_blank'>" + message + "</a>");
                    $(".comment").append(str); 
                }
                else{   
                    $(".comment").append(message);
                }
                $(".comment").addClass("commentfull");
                $(".comment").removeClass("comment");  
            });

            var scrollImage = $('#river');
            scrollImage.scrollTop(scrollImage[0].scrollHeight - scrollImage.height());

    }

    $('#imagefile').bind('change', function(e){
        var data = e.originalEvent.target.files[0];
        var reader = new FileReader();      
        reader.onload = function(evt){
            image('moi', evt.target.result);
            addComment();
            socket.emit('user image', evt.target.result);
        };
    
        reader.readAsDataURL(data);
    });

    function addComment(){
        $('#river').append('<button class="commenter">COMMENTER</button>');
        $(".commenter").click(function(){
            $('.commenter').remove();
            $('#river').append('<input type="text" class="commentInput commentI"></input></br><input type="submit" class="commentSubmit commentI"></input> ');
            $(".commentSubmit").click(function(){
                socket.emit('comment image', $("input.commentInput").val());
                $("input.commentI").remove();
            });
        });
    }

    socket.on('image url', function (from, data){
        $('<img src="'+ data +'">').load(function() {
            $($('<p>').append($('<b>').text(from), '</br><img src="'+ data +'"><div class="comment"></div>')).appendTo('#river');
        }); 

        socket.on('comment image', function (message){ //ajout des commentaires  
            var str = message;       
            var regexUrl = /^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/;
            if(regexUrl){
                str = str.replace(regexUrl, "<a href='" + message + "'target='_blank'>" + message + "</a>");
                $(".comment").append(str); 
            }
            else{   
                $(".comment").append(message);
            }
            $(".comment").addClass("commentfull");
            $(".comment").removeClass("comment");  
        });

        var scrollImage = $('#river');
        scrollImage.scrollTop(scrollImage[0].scrollHeight - scrollImage.height());     

    })


    $('#submiturl').click(function(){
        $('<img src="'+ $("#imageurl").val() +'">').load(function() {
            $($('<p>').append($('<b>').text("moi"), '</br><img src="'+ $("#imageurl").val() +'"><div class="comment"></div>')).appendTo('#river');
            socket.emit('image url', $("#imageurl").val());
            addComment();
        });
    });

    // $('#river').on('dragover', function(e) {e.preventDefault();return false;});
    // $('#river').on('drop', function(e) {
    //     e.preventDefault();
    //     var data = e.originalEvent.dataTransfer.files[0];
    //     var reader = new FileReader();      
    //     reader.onload = function(evt){
    //         image('moi', evt.target.result);
    //         addComment();
    //         socket.emit('user image', evt.target.result);
    //     };
    
    //     reader.readAsDataURL(data);
    //     // e.originalEvent.dataTransfer.items[0].getAsString(function(url){
    //     //     img = '<img src="'+ url +'">';
    //     //     img.onload = function () {
    //     //         $($('<p>').append($('<b>').text("moi"), '</br><img src="'+ url +'"><div class="comment"></div>')).appendTo('#river');
    //     //     };
    //         // $('<img src="'+ url +'">').load(function () {
    //         //     $($('<p>').append($('<b>').text("moi"), '</br><img src="'+ url +'"><div class="comment"></div>')).appendTo('#river');
    //         // });
    //     // addComment();
    //     // socket.emit('image url', url); 

    //     // });

    // });
        
        
            
            // var imgPath = $("#imageurl").val(); 

            // $('<img src="'+ imgPath +'">').load(function() {
            //     $(this).appendTo('#river');
            // })
    // });

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

function syncCursor(){
    $('#pad_perso div').each(
    function(i) {
        var classes = this.className.split(/\s+/);
        for (var i=0,len=classes.length; i<len; i++){
            if ($('#visualisateur div div').hasClass(classes[i])){
                // $(this).addClass('bodySharesClass');
                console.log("ces phrases ont été écrites au même moment :)")
            }
        }
    });
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
        var regexSlash = /^\/\//gi;
        str = str.replace(regexSlash, ">"); 
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

    var text = $("#pad_perso").val(); 
    var regexUrl = (/^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/);   
    while(text.match(regexUrl) !== null) {
        console.log("pouet");
        $("#river").append('<div class="urlHtml"></div>');
        var newUrl = text.replace(regexUrl, "<a href='" + text + "'target='_blank'>" + text + "</a>");
        $(".urlHtml").append(newUrl); 
    }

// var matchesUrl = [];

//     $('#pad_perso').keyup(function(){
//         var text = $("#pad_perso").val();      
//         var regexUrl = /^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/;
//         var matches = text.match(regexUrl);
//         matchesUrl.push(matches);

//         for (i=0; i<matches.length; i++){
//             console.log(matches[i]);
//             $("#river").append('<div class="urlHtml"></div>');
//             var newUrl = text.replace(regexUrl, "<a href='" + text + "'target='_blank'>" + text + "</a>");
//             $(".urlHtml").append(newUrl); 
//         } 

        // if(oldUrl.match(regexUrl)){
        //     $("#river").append('<div class="urlHtml"></div>');
        //     var newUrl = oldUrl.replace(regexUrl, "<a href='" + oldUrl + "'target='_blank'>" + oldUrl + "</a>");
        //     // var newUrl = oldUrl.replace(regexUrl, "caca");
        //     $(".urlHtml").append(newUrl); 
        // }
        // else {

        // }
        // $(".urlHtml").addClass("urlHtmlfull");
        // $(".urlHtml").removeClass("urlHtml"); 

    //});

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
