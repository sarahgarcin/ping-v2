$(document).ready(function(){

$(".plus1").click(function(){
 	$('.commentaire1').css("display", "block");
 	$(".plus1").addClass("plus1active");
})

$(".plus1active").click(function(){
 	$('.commentaire1').css("display", "none");
 	$(".plus1active").removeClass("plus1active");
});




});