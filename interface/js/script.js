$( document ).ready(function() {

	$(".plus1").click(function(){
	 	$('.commentaire1').css("display", "block");
	 	$(".plus1").addClass("plus1active");
	 	$(".plus1").removeClass("plus1");
	 		
	 	$(".plus1active").click(function(){
		 	$('.commentaire1').css("display", "none");
		 	$(".plus1active").addClass("plus1");
		 	$(".plus1active").removeClass("plus1active");		 	
		});

	});

	$(".plus2").click(function(){
	 	$('.commentaire2').css("display", "block");
	 	$(".plus2").addClass("plus2active");
	 	$(".plus2").removeClass("plus2");
	 		
	 	$(".plus2active").click(function(){
		 	$('.commentaire2').css("display", "none");
		 	$(".plus2active").addClass("plus2");
		 	$(".plus2active").removeClass("plus2active");		 	
		});

	});

});