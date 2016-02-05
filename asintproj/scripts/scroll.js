$(function(){
	$('body').scrollspy({
		target: '.navbar',
		offset: 0
	});

	$('nav a, .down-button a').bind('click',function (){
		$('html, body').stop().animate({
			scrollTop: $($(this).attr('href')).offset().top+50
		}, 1500, 'easeInOutExpo');
		event.preventDefault();
		});
});