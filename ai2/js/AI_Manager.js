/*	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Script:	AI-Manager.js		v3.0.1
 * 	Author:	Neil Thomas		 Sept 2023
 * 	Last Edit:	2023/12/13 17:32:27
 * 	Role:	Utility for the ai-config page:
 * 	a)	Enable the theme to be changed dynamically
 * 	b)	To select Dark mode for the theme
 * 	c)	Set static or scrolling header / footer
 * 	d)	Adjust padding above & below page content
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

//	Configure 'thems' for drop down
let ThemeNames = ["Arcadia",		"Arcadia-Dark", 	"Cherry Tomato",	"Cherry Tomato Dark",
				  "Chili Oil",		"Chili Oil Dark",	"Crocus Petal",		"Crocus Petal Dark",
				  "Cylon Yellow",	"Cylon Yellow Dark","Emporador",	"Emporador Dark",
				  "Grey",   		"Dark Grey",		"Lime Punch",		"Lime Punch Dark",
				  "Marsala",		"Marsala Dark",     "Martini Olive",	"Martini Olive Dark",
				  "Meerkat",		"MeerKat Dark",     "Nebulas Blue",		"Nebulas Blue Dark",
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
		setUpAnimation( CMXConfig.Seagull.Animation )
	}
	displayCurrent();
//	$('input[type=radio]').bind('change', function() {
//		alert("Display mode: " + $('input[type=radio]:checked').val());
//	})
});

let displayCurrent = function() {
	//	Using CMXConfig variable rather than stored data
	console.log( "updating screen elements" );
	$('#BannerState').prop('checked' , (CMXConfig.StaticHead ? ' checked' : '' ));
	$('#BannerState').on('change', function() {
		CMXConfig.StaticHead = $('#BannerState').prop('checked');
		configPage();
	});
	$('#FooterState').prop('checked', (CMXConfig.StaticFoot ? ' selected' : '' ));
	$('#FooterState').on('change', function() {
		CMXConfig.StaticFoot = $('#FooterState').prop('checked');
		configPage();
	});
	//$('#darkMode').prop('checked', (CMXConfig.darkMode ? ' selected' : '' ));
	$('#paddingTop').prop('value', parseInt(CMXConfig.PaddingTop ));
	$('#paddingTop').on('blur', function(){
		CMXConfig.PaddingTop = $('#paddingTop').val();
		console.log("Padding top: " + CMXConfig.PaddingTop + CMXConfig.Units);
		configPage();
	});
	$('#paddingBottom').prop('value', parseInt(CMXConfig.PaddingBottom ));
	$('#paddingBottom').on('blur', function(){
		CMXConfig.PaddingBottom = $('#paddingBottom').val();
		console.log("Padding bottom: " + CMXConfig.PaddingBottom + CMXConfig.Units);
		configPage();
	});
	$('#animationSpeed').prop('value', parseInt(CMXConfig.Seagull.Duration));
	$('#animationSpeed').on('blur', function(){
		CMXConfig.Seagull.Duration = $('#animationSpeed').prop('value');
		console.log('Animation speed: ' + CMXConfig.Seagull.Duration);
	});
	$('#stayOnTop').prop('value', (CMXConfig.Seagull.OnTop ? ' checked' : '' ));
	$('#stayOnTop').on('change', function() {
		CMXConfig.Seagull.OnTop = $('#stayOnTop').prop('checked');
		console.log('Stay on top: ' + CMXConfig.Seagull.OnTop);
		configPage();
	});
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
	});
};

var clearScheme = function() {
   localStorage.removeItem("CMXai2.1");
   alert("Saved configuration removed");
   window.location.assign("configai.html");
};

var setScheme = function(destination) {
	//	Store the scheme
	var newConfig = {'Theme': $('#ThemeList').val(), 'darkMode': $("#darkMode").is(':checked')};
	newConfig = Object.assign(newConfig, {'StaticHead': $('#BannerState').is(':checked'), 'StaticFoot': $('#FooterState').is(':checked')});
	newConfig = Object.assign(newConfig, {'PaddingTop': $('#paddingTop').val()+'px', 'PaddingBottom': $('#paddingBottom').val()+'px' } );
	var code = JSON.stringify( newConfig);
	if( destination == 'store' ) {
		localStorage.setItem( 'CMXai2.1', code );

	}
	if( typeof( Storage ) !== "undefined" ) {
		console.log('Storing');
		localStorage.setItem( 'CMXai2.1', code );
		localStorage.setItem('CMXai2.1', JSON.stringify( CMXConfig ));

		alert( "The current configuration is now stored for all pages" );
		$('#CMXInfo').html(JSON.stringify(CMXConfig).replaceAll(',',', '));
	}
}

function showConfig() {

	$('#CMXInfo').html(JSON.stringify(CMXConfig).replaceAll(',',', '));
}
