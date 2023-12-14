/*	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Script:	page-manager.js		v3.0.1
 * 	Author:	Neil Thomas		 Sept 2023
 * 	Last Edit:	2023/12/14 16:41:19
 * 	Role:
 * 		Provide all utility js scripts
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

let CMXConfig = {
	'Theme': 'Grey',
	'StaticHead': true,
	'StaticFoot': true,
	'Units':	'em',
	'PaddingTop': 2,
	'PaddingBottom': 1,
	'Seagull': {
		'Animation': 'none',
		'Duration': 5,
		'OnTop': false
	},
	'Version': 2.1
}

$( window).on('resize', function() {
	configPage();
});

let toggleMobileMenu = function() {
	$('#menuMobile').toggleClass('w3-show', 'w3-hide');
	$('#Main_Menu_Mobile').toggleClass('w3-show', 'w3-hide');

}

let toggleMenu = function( menu ) {
	//Alt menu script
	var menuID = menu.id;
	if( $('#menu' + menu.id). hasClass('w3-show')) {
		$('#menu' + menu.id).removeClass('w3-show');
		$( menu.id ).attr('aria-expanded', false );
	} else {
		$('#menu' + menu.id).addClass('w3-show').removeClass('w3-hide');
		$( menu.id ).attr('aria-expanded', true );
	}
}

let checkTheme = function() {
	var current;
	current = $('#theme').attr('href').slice(7, -4);
	console.log('Current theme is: ' + current + '.css ')
	if( current == CMXConfig.Theme ) {
		console.log('Theme change not required.');
	} else {
		console.log('Theme change to: ' + CMXConfig.Theme );
		$('#theme').attr('href', 'themes/' + CMXConfig.Theme + '.css')
	}
	// yield to allow page redraw
	setTimeout(function () {
		$('body').removeClass('hidden');
	}, 5);
};

//checkTheme();

let configPage = function() {
	//	Uses CMXConfig from memory
	var elementHt, contentHt;
	//	Check for fixed header
	if( CMXConfig.StaticHead ) {
		elementHt = $('header').outerHeight( true );
		$('header').addClass('w3-top');
		$('#content').css('margin-top', elementHt + 'px');
	}
	//	Check for fixed footer
	if( ( CMXConfig.StaticFoot ) && ( $( window ).height()*1 > 750 ) ){
		elementHt = $('footer').outerHeight( true );
		$('footer').addClass('w3-bottom');
		$('#content').css( 'margin-bottom', elementHt + 'px');
	}
	//	Adjust content padding
	$('#content').css('padding-top', CMXConfig.PaddingTop + CMXConfig.Units );
	$('#content').css('padding-bottom', 'calc(' + CMXConfig.PaddingBottom + CMXConfig.Units +')' );
	//	Adjust content height
	elementHt = $('header').outerHeight( true ) + $('footer').outerHeight( true  );
	contentHt = $( window ).height() - elementHt;
	$('#content').css('min-height', contentHt + 'px');
	//	Configure seagull
	if( CMXConfig.Seagull.Animation == 'none' ) {
		$('#ow-gullRight').css('animation', 'appearRight 1.4s');
	} else {
		$('#ow-gullRight').css('animation', CMXConfig.Seagull.Animation + ' ' + CMXConfig.Seagull.Duration + 's');
	}
	if( CMXConfig.Seagull.OnTop == true ) {
		$('#ow-gullRight').css('z-index', '200' );
	} else {
		$('#ow-gullRight').css('z-index', '-200' );
	}

};

let showModal = function(modal){
	if( $('#M' + modal).css('display') == 'none') {
		$('#M' + modal).css('display', 'block');
		//console.log('Modal M' + modal +' should be visible');
	} else {
		$('#M' + modal).css('display', 'none');
		//console.log('Modal M' + modal + ' should be hidden');
	}
};
