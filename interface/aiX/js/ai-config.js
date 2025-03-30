/*	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Script:	ai-config.js			Ver: aiX-1.0
 * 	Author:	Neil Thomas		  			Mar 2025
 * 	Last Edit:	2025/03/23
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Role:	Utility for the ai-config page:
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

//	Configure 'themes' for drop down
let ThemeNames = ["Aurora Green",	"Dark Aurora Green", 	"Cherry Tomato",	"Dark Cherry Tomato",
				  "Chili Oil",		"Dark Chili Oil",		"Cranberry",	 	"Dark Cranberry", 
				  "Crocus Petal",	"Dark Crocus Petal", 	"Dark Grey",		"Field Green", "Dark Field Green",
				  "Lilac",			"Dark Lilac",			"Martini Olive",	"Dark Martini Olive",
				  "Nebulas Blue",	"Dark Nebulas Blue",	"Red Pear",			"Dark Red Pear",
				  "Russet Orange",	"Dark Russet Orange",	"Spring Crocus",	"Dark Spring Crocus",
				  "Valiant Poppy",	"Dark Valiant Poppy",	"Warren Tavern",	"Dark Warren Tavern"];

$( function () {
	if( typeof( Storage ) == 'undefined' ) {
		console.log( 'Local storage unavailable.' );
		$('#ThemeSelector').html("Your browser won't allow on-line theme selection!");
	} else {
		$('#ThemeSelector').remove();
		setupTheme( CMXConfig.Theme );			// Populate theme dropdown
		setUpUnits( CMXConfig.PaddingUnits );	//	Populate Padding Units
		setUpAnimation( CMXConfig.Seagull.Animation );	// Populate Seagull Options
		setupAlarms( CMXConfig.LEDAlarm, CMXConfig.LEDUserAlarm );	//	Create LED option list and options
	}
	displayCurrent();
});

let displayCurrent = function() {
	//	Using CMXConfig variable rather than stored data
	$('#BannerState').prop('checked' , (CMXConfig.StaticHead ? ' checked' : '' ));
	$('#BannerState').on('change', function() {
		CMXConfig.StaticHead = $('#BannerState').prop('checked');
		configPage();
		showConfig();
	});
	$('#FooterState').prop('checked', (CMXConfig.StaticFoot ? ' selected' : '' ));
	$('#FooterState').on('change', function() {
		CMXConfig.StaticFoot = $('#FooterState').prop('checked');
		configPage();
		showConfig();
	});

	$('#paddingTop').prop('value', parseInt(CMXConfig.PaddingTop ));
	$('#paddingTop').on('blur', function(){
		CMXConfig.PaddingTop = $('#paddingTop').val();
		console.log("Padding top: " + CMXConfig.PaddingTop + CMXConfig.PaddingUnits);
		configPage();
		showConfig();
	});
	$('#paddingBottom').prop('value', parseInt(CMXConfig.PaddingBottom ));
	$('#paddingBottom').on('blur', function(){
		CMXConfig.PaddingBottom = $('#paddingBottom').val();
		console.log("Padding bottom: " + CMXConfig.PaddingBottom + CMXConfig.Units);
		configPage();
		showConfig();
	});
	
	$('#animationSpeed').prop('value', parseInt(CMXConfig.Seagull.Speed));
	$('#animationSpeed').on('blur', function(){
		CMXConfig.Seagull.Speed = $('#animationSpeed').prop('value');
		console.log('Animation speed: ' + CMXConfig.Seagull.Speed);
		showConfig()
	});
	$('#stayOnTop').prop('checked', (CMXConfig.Seagull.OnTop ? 'checked' : '' ));
	$('#stayOnTop').on('change', function() {
		CMXConfig.Seagull.OnTop = $('#stayOnTop').prop('checked');
		configPage();
		showConfig();
	});
	$('#defaultLED').addClass(CMXConfig.LEDAlarm);
	$('#userLED').addClass(CMXConfig.LEDUserAlarm);
};

let setupTheme = function( activeTheme ) {
	//	Set up option lists of available themes
	var theme, fileName;
	var selector = $('#ThemeList');

	for (theme = 0; theme < ThemeNames.length; theme++ ) {
		fileName = ThemeNames[theme].replaceAll(" ","-").toLowerCase();
		var option = '<option value="' + fileName + '" ' + ( activeTheme == fileName  ? "selected" : "" ) + '>' + ThemeNames[theme] + '</option>';
		selector.append(option);
	}

	selector.on('change', function() {
		CMXConfig.Theme = $('#ThemeList').prop('value');
		checkTheme();
		showConfig();
	});
};

let setUpUnits = function( activeUnits ){
	var opt = {px:"Pixels",em:"Font height", vh:"Vertical height"};
	var options = '';
	for  (var key  in opt)   {
		options += '<option value="' + key + '" ' + ( activeUnits == key ? "selected" : "") + '>' + opt[key] + '</option>\n';
	}
	$('#unitSelect').html( options );
	$('#unitSelect').on('change', function() {
		CMXConfig.PaddingUnits = $('#unitSelect').val();
		configPage();
		showConfig();
	});
}

let setUpAnimation = function( animation ) {
	var opt = { fadeIn:"Default", growUp:"Grow upwards", fadeDown:"Fade Downwards",  fadeAcrossDown:"Expand diagonaly"}
	var options = '';
	for ( key in opt) {
		options += '<option value="' + key + '" ' + ( animation == key ? "selected" : "") + '>' + opt[key] + '</option>\n';
	}
	$('#animationSelect').html( options );
	$('#animationSelect').on('change', function() {
		console.log("Changing animation to " + $('#animationSelect').prop('value'));
		CMXConfig.Seagull.Animation = $('#animationSelect').prop('value');
		configPage();
		showConfig();
	});
};

let setupAlarms = function( led, userLed ) {
	var opt = { Brick:'ax-brick', Lozenge:'ax-lozenge', Oval:'ax-oval', Round: 'ax-round', Small_Round:'ax-round ax-small',Square:'', Small_Square:'ax-small'};
	var options = '';
	for( key in opt){
		options += '<option value="' + opt[key] + '" ' + (led == opt[key] ? "selected" : "") + '>' + key + '</option>\n';
	}
	$('#AlarmDef').html( options );
	options = '';
	for( key in opt){
		options += '<option value="' + opt[key] + '" ' + (userLed == opt[key] ? "selected" : "") + '>' + key + '</option>\n';
	}
	$('#AlarmUsr').html( options );
	$('#AlarmDef').on('change', function(){
		CMXConfig.LEDAlarm = $('#AlarmDef').prop('value');
		$('#defaultLED').removeClass('ax-brick ax-lozenge ax-oval ax-round ax-small').addClass($('#AlarmDef').prop('value'));
		showConfig()
	});
	$('#AlarmUsr').on('change', function() {
		CMXConfig.LEDUserAlarm = $('#AlarmUsr').prop('value');
		$('#userLED').removeClass('ax-brick ax-lozenge ax-oval ax-round ax-small').addClass($('#AlarmUsr').prop('value'));
		showConfig();
	})

};

var clearScheme = function() {
    localStorage.removeItem( axStore );
    alert("All saved configuration values removed. Reload the page to confirm.");
    configPage();
    showConfig();
	checkTheme();
};

var setScheme = function(destination) {
	//	Store the scheme
	if( destination == 'store' ) {
		//	This is never run
		localStorage.setItem( axStore, code );
	}
	if( typeof( Storage ) !== "undefined" ) {
		localStorage.setItem( axStore, JSON.stringify( CMXConfig ));
		alert( "The current configuration is now stored for all pages" );
	}
}

function showConfig() {
	$('#CMXInfo').html(JSON.stringify(CMXConfig, null, ' '));
}
