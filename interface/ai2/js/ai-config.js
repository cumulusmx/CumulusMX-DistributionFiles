/*	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Script:	ai-config.js		v3.0.2
 * 	Author:	Neil Thomas		  Nov 2024
 * 	Last Edit:	2024/11213
 * 	Role:	Utility for the ai-config page:
 * 	a)	Enable the theme to be changed dynamically
 * 	b)	To select Dark mode for the theme
 * 	c)	Set static or scrolling header / footer
 * 	d)	Adjust padding above & below page content
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

//	Configure 'thems' for drop down
let ThemeNames = ["Arcadia",		"Arcadia Dark", 	"Cherry Tomato",	"Cherry Tomato Dark",
				  "Chili Oil",		"Chili Oil Dark",	"Crocus Petal",		"Crocus Petal Dark",
				  "Cylon Yellow",	"Cylon Yellow Dark","Emporador",	"Emporador Dark",
				  "Grey",   		"Dark Grey",		"High Contrast", "Lime Punch",		"Lime Punch Dark",
				  "Marsala",		"Marsala Dark",     "Martini Olive",	"Martini Olive Dark",
				  "MeerKat",		"MeerKat Dark",     "Nebulas Blue",		"Nebulas Blue Dark",
				  "Red Pear",		"Red Pear Dark",	"Russet Orange",	"Russet Orange Dark",
				  "Spring Crocus",	"Spring Crocus Dark",	"Valiant Poppy","Valiant Poppy Dark"];

$( function () {
	if( typeof( Storage ) == 'undefined' ) {
		console.log( 'Local storage unavailable.' );
		$('#ThemeSelector').html("Your browser won't allow on-line theme selection!");
	} else {
		$('#ThemeSelector').remove();
		setupTheme( CMXConfig.Theme );
		setUpUnits( CMXConfig.Units );
		setupAlarms( CMXConfig.LEDs );
		setUpAnimation( CMXConfig.Seagull.Animation )
	}
	displayCurrent();
});

let displayCurrent = function() {
	//	Using CMXConfig variable rather than stored data
	console.log( "updating screen elements" );
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
	//$('#darkMode').prop('checked', (CMXConfig.darkMode ? ' selected' : '' ));
	$('#paddingTop').prop('value', parseInt(CMXConfig.PaddingTop ));
	$('#paddingTop').on('blur', function(){
		CMXConfig.PaddingTop = $('#paddingTop').val();
		console.log("Padding top: " + CMXConfig.PaddingTop + CMXConfig.Units);
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
	$('#animationSpeed').prop('value', parseInt(CMXConfig.Seagull.Duration));
	$('#animationSpeed').on('blur', function(){
		CMXConfig.Seagull.Duration = $('#animationSpeed').prop('value');
		console.log('Animation speed: ' + CMXConfig.Seagull.Duration);
		showConfig()
	});
	$('#stayOnTop').prop('value', (CMXConfig.Seagull.OnTop ? ' checked' : '' ));
	$('#stayOnTop').on('change', function() {
		CMXConfig.Seagull.OnTop = $('#stayOnTop').prop('checked');
		console.log('Stay on top: ' + CMXConfig.Seagull.OnTop);
		configPage();
		showConfig();
	});
	//$('#CMXInfo').html( JSON.stringify( CMXConfig, null, ' ' ));
	$('#defaultLED').addClass(CMXConfig.LEDs.defAlarm);
	$('#userLED').addClass(CMXConfig.LEDs.userAlarm);
};

let setupTheme = function( activeTheme ) {
	//	Set up option lists of available themes
	var theme, fileName;
	var selector = $('#ThemeList');

	for (theme = 0; theme < ThemeNames.length; theme++ ) {
		fileName = ThemeNames[theme].replaceAll(" ","-");
		var option = '<option value="' + fileName + '" ' + ( activeTheme == fileName  ? "selected" : "" ) + '>' + ThemeNames[theme] + '</option>';
		selector.append(option);
	}

	selector.on('change', function() {
		CMXConfig.Theme = $('#ThemeList').prop('value');
		checkTheme();
		$('#CMXInfo').html( JSON.stringify( CMXConfig, null, ' ' ));
	});
};

let setUpUnits = function( activeUnits ){
	var opt = {Px:"Pixels",em:"Font height", vh:"Vertical height"};
	var options = '';
	for  (var key  in opt)   {
		//console.log("Value: " + opt[key]);
		options += '<option value="' + key + '" ' + ( activeUnits == key ? "selected" : "") + '>' + opt[key] + '</option>\n';
		//console.log("Options: " + options);
	}
	$('#unitSelect').html( options );
	$('#unitSelect').on('change', function() {
		CMXConfig.Units = $('#unitSelect').val();
		configPage();
		$('#CMXInfo').html( JSON.stringify( CMXConfig, null, ' ' ));
	});
	//console.log("Units done");
}

let setUpAnimation = function( animation ) {
	var opt = { none:"None", floatDownRight:"Float down screen", slideRight:"Slide across screen"}
	var options = '';
	for ( key in opt) {
		options += '<option value="' + key + '" ' + ( animation == key ? "selected" : "") + '>' + opt[key] + '</option>\n';
	}
	$('#animationSelect').html( options );
	//console.log("Options: " + options);
	$('#animationSelect').on('change', function() {
		CMXConfig.Seagull.Animation = $('#animationSelect').prop('value');
		configPage();
		$('#CMXInfo').html( JSON.stringify( CMXConfig, null, ' ' ));
	});
};

let setupAlarms = function( ) {
	var opt = { Brick:'ow-brick', Lozenge:'ow-lozenge', Oval:'ow-oval', Round: 'ow-round', Small_Round:'ow-round ow-small',Square:'', Small_Square:'ow-small'};
	var optionsUsr = '';
	var optionsDef = '';
	for( key in opt){
		optionsUsr += '<option value="' + opt[key] + '" ' + (CMXConfig.LEDs.userAlarm == opt[key] ? "selected" : "") + '>' + key.replace('_',' ') + '</option>\n';
		optionsDef += '<option value="' + opt[key] + '" ' + (CMXConfig.LEDs.defAlarm == opt[key] ? "selected" : "") + '>' + key.replace('_',' ') + '</option>\n';
	}

	$('#AlarmDef').html( optionsDef );
	$('#AlarmUsr').html( optionsUsr );
	$('#AlarmDef').on('change', function(){
		CMXConfig.LEDs.defAlarm = $('#AlarmDef').prop('value');
		$('#defaultLED').addClass($('#AlarmDef').prop('value'));
		showConfig()
	});
	$('#AlarmUsr').on('change', function() {
		CMXConfig.LEDs.userAlarm = $('#AlarmUsr').prop('value');
		$('#userLED').addClass($('#AlarmUsr').prop('value'));
		showConfig();
	})

};
var clearScheme = function() {
    //localStorage.removeItem( AIStore );
	//localStorage.clear();
    alert("All saved configuration values removed");
    configPage();
    showConfig();
};

var setScheme = function(destination) {
	//	Store the scheme
	$('#CMXInfo').html( JSON.stringify( CMXConfig, null, ' '));
	
	if( destination == 'store' ) {
		//	This is never run
		localStorage.setItem( AIStore, code );
		console.log("Stored as variable 'code'");
	}
	if( typeof( Storage ) !== "undefined" ) {
		console.log('Storing');
		//localStorage.setItem( AIStore, code );
		localStorage.setItem( AIStore, JSON.stringify( CMXConfig ));
		//$('#CMXInfo').html(JSON.stringify(CMXConfig, null, ' '));
		alert( "The current configuration is now stored for all pages" );
	}
	/**/
}

function showConfig() {
	$('#CMXInfo').html(JSON.stringify(CMXConfig).replaceAll(',',', '));
}
