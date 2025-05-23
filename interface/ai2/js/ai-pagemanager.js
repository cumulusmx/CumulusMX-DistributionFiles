/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: ai-pagemanager.js   V4.0.0
    Author:	Neil Thomas		    Feb 2024
   	Last Edit:	2025/03/09 10:17:47
   	Role:
   	Manage and provide utility scripts for
    The AI
  	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

//  Page structure
let CMXConfig = {
	'Theme': 'Martini-Olive',
	'StaticHead': true,
	'StaticFoot': true,
	'Units':	'em',
	'PaddingTop': 2,
	'PaddingBottom': 1,
	'LEDs': {
		'userAlarm': 'ow-brick',
		'defAlarm': 'ow-brick',
	},
	'Seagull': {
		'Animation': 'none',
		'Duration': 5,
		'OnTop': false
	},
	'Version': '4.0.0'
}

//	Base storage name on port and parent folder of active interface
//	Enables multiple interfaces to be configured separately.
let url = document.baseURI.split('/');
var port = url[2].split(':')[1] || 'Website'; // differentiates between private and public website
if (url.length < 5) {
    AIStore = port + 'Root';	// Default interface
} else {
    AIStore = port + url[url.length - 2]; // AI2 (or other) interface
}


/*	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   	Check if the page structure can be stored:
    If it can, store & load it, otherwise use
    the above structure.
  	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
let getConfig = function() {
	if( typeof( Storage ) === "undefined" ) {
		console.log('Storage unavailable; hardwired config being used');
	} else {
		var storedConfig = JSON.parse( localStorage.getItem( AIStore ));
		if( storedConfig === null ) {
			console.log('First use;');
            console.log('Storing default configuration');
	        localStorage.setItem( AIStore, JSON.stringify( CMXConfig ));
		} else {
			console.log('Configuration stored already; reading..');
			console.log("Alarms: " + storedConfig.LEDs);
			if(storedConfig.LEDs === undefined){
				storedConfig.LEDs = {"userAlarm": 'ow-brick', "defAlarm": 'ow-brick'};
				console.log("Stored now: " + JSON.stringify(storedConfig));
				localStorage.setItem( AIStore, JSON.stringify( storedConfig ));
			}
			CMXConfig = storedConfig;
		}
	}
};

/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Get CMX & AI Version
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
let getVersion = function() {
	//	Mitigates having to include this in every page scriupt.
	$.ajax({
		url: '/api/info/version.json',
		success: function( result ) {
			$('[data-cmxData=Version]').html( result.Version );
			$('[data-cmxData=Build]').html( result.Build );
		},
		error: function( xhr ) {
			console.log( "Failed to load version data: " + xhr.status );
			$('[data-cmxdata=Version]').html('<span style="color:#C00">-Not known-</span>');
		}
	})
	$('[data-OWdata=Version]').html( CMXConfig.Version );
};

/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Get Menu
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
let getMenu = function() {
    // Load AI Menues
    $('#Menues').load("menues.html", function( response, status, xhr) {
        if( status == "error") {
            var msg = "Sorry but there was an error:  ";
            console.log( msg + xhr.status + ": " + xhr.statusTxt );
        }
    });
};

/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Get Extra data - inc dates in various formats
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
let getExtras = function() {
	//	Gets the weather station Lat, Long, Altitude and other data values
	var data = '{"Latitude": "<#latitude>", "Longitude": "<#longitude>", "Altitude": "<#altitude>", ' +
			   '"CurrentDate": "<#shortdayname>, <#day> <#monthname> <#year>", ' +
			   '"Yesterday":"<#yesterday format=\"ddd dd MMM yyyy\">"}';
	$.ajax({
		url: '/api/tags/process.txt',
        dataType: 'json',
        type: 'POST',
        data: data
    })
    .done( function (result) {
		$("[data-cmxdata='Latitude']").html( result.Latitude);
		$("[data-cmxdata='Longitude']").html( result.Longitude );
		$("[data-cmxdata='Altitude']").html( result.Altitude );
		$("[data-OWData='Date']").html( result.CurrentDate );
		$("[data-OWData='Yesterday']").html( result.Yesterday );
	})
	.fail( function() {
		console.log("Failed to get data");
	})
};

/*	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	Check the theme against the stored config
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
let checkTheme = function() {
	var current;
	current = $('#theme').attr('href').slice(7, -4);
	console.log('Current theme is: ' + current + '.css ');
	if( current != CMXConfig.Theme ) {
		console.log('Theme changed to: ' + CMXConfig.Theme );
		$('#theme').attr('href', 'themes/' + CMXConfig.Theme + '.css');
	}

	// yield to allow page redraw
	setTimeout(function () {
		console.log('Displaying page');
	}, 1);
};

let configPage = function() {
	//	Uses CMXConfig from memory
	var elementHt, contentHt;
	//	Check for fixed header
	if( CMXConfig.StaticHead ) {
		elementHt = $('#PageBanner').outerHeight( true );
		if( elementHt < 100) { elementHt = 124}
		$('#PageBanner').addClass('w3-top');
		$('#content').css('margin-top', elementHt + 'px');
	}
	//	Check for fixed footer
	if( ( CMXConfig.StaticFoot ) && ( $( window ).height()*1 > 750 ) ){
		elementHt = $('footer').outerHeight( true );
		$('footer').addClass('w3-bottom');
		$('#content').css( 'margin-bottom', elementHt + 'px');
	}
	//	Adjust content padding
	var TopPadding = CMXConfig.PaddingTop + CMXConfig.Units
	$('#content').css('padding-top', 'calc(' + TopPadding + ')' );
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


//	Temp development
getConfig();	//	Check to see if current CMXConfig has been set
checkTheme();

$( function() {
	getMenu();
	getExtras();
	getVersion();
	configPage()
	checkPanels();
})

$(window).on('resize', function(){
	configPage();
})

let toggleArea = function(element) {
	//	Function shows/hides alarm and davis panels.
	$('#' + element.id + 'Panel').toggleClass("w3-hide", "w3-show");
	var btnText = $('#' + element.id).text();
	if( btnText.slice(0,4) == 'Show') {
		$('#' + element.id).text( btnText.replace('Show','Hide'));
		localStorage.setItem( 'CMX' + element.id, 'Show');
	} else {
		$('#' + element.id).text( btnText.replace('Hide','Show'));
		localStorage.setItem( 'CMX' + element.id , 'Hide' );
	}
};

let checkPanels = function() {
	//console.log("Checking panels");
	if( localStorage.getItem('CMXAlarms') == 'Hide') {
		$('#Alarms').trigger('click');
	}
	if( localStorage.getItem('CMXDavis') == 'Hide') {
		$('#Davis').trigger('click');
	}
};

let toggleMobileMenu = function() {
	//	Opens the mobile menu
	$('#menuMobile').toggleClass('w3-show', 'w3-hide');
	$('#Main_Menu_Mobile').toggleClass('w3-show', 'w3-hide');
}
/*
let toggleMainMenu = function( menu ) {
	//Alt menu script
	var menuID = menu.id;
	if( $('#menu' + menuID).css('display') == 'block'){
		$('#menu' + menuID).css('display', 'none');
		$('#' + menuID).attr('aria-expanded', false);
	} else {
		$('.w3-dropdown-hover').children("div").css('display', 'none');
		$('.w3-dropdown-hover').children("div").removeClass('w3-show');
		$('.w3-dropdown-hover').children("div").attr('aria-expanded', false);

		//	Display chosen panel
		$('#menu' + menuID).css('display', 'block');
	//	$('#menu' + menuID).addClass('w3-show');
		$('#' + menuID).attr('aria-expanded', true);
	}
}
*/
let toggleMenu = function( menu ) {
	//Alt menu script - current
	var menuID = menu.id;
	if( $('#menu' + menu.id). hasClass('w3-show')) {
		$('#menu' + menu.id).removeClass('w3-show');
		$( '#' + menu.id ).attr('aria-expanded', false );
	} else {
		//	Close any open sub-menus
		$('.w3-dropdown-click').children().removeClass('w3-show');
		$('.w3-dropdown-click').children().attr('aria-expanded', false)
		//	Open the sellected sub-menu
		$('#menu' + menu.id).addClass('w3-show').removeClass('w3-hide');
		$( '#' + menu.id ).attr('aria-expanded', true );
	}
}

let showModal = function(modal){
	if( $('#M' + modal).css('display') == 'none') {
		$('#M' + modal).css('display', 'block');
		//console.log('Modal M' + modal +' should be visible');
	} else {
		$('#M' + modal).css('display', 'none');
		//console.log('Modal M' + modal + ' should be hidden');
	}
	var height = $('#C' + modal).outerHeight();
	var margin = ($(window).height() - height) / 2.5;
	$('#C' + modal).css('transform', 'translate(0px,' + margin +'px)' )
};
