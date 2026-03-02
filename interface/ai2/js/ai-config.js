/*	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Script:	ai-config.js			| Ver: 5.0.0
 * 	Author:	DNC Thomas		  			Nov 2025
 * 	Last Edit:	2025-11-08
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Role:	Utility for the ai-config page:
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

//	Configure 'themes' for drop down
let ThemeNames = ["Dark Grey", 
				  "Aurora Green",	"Dark Aurora Green", 	"Cherry Tomato",	"Dark Cherry Tomato",
				  "Chili Oil",		"Dark Chili Oil",		"Cranberry",	 	"Dark Cranberry", 
				  "Crocus Petal",	"Dark Crocus Petal", 	"Field Green", 		"Dark Field Green",
				  "Lilac",			"Dark Lilac",			"Martini Olive",	"Dark Martini Olive",
				  "Meadow Green",	"Dark Meadow Green",	"Nebulas Blue",		"Dark Nebulas Blue",
				  "Red Pear",		"Dark Red Pear",		"Russet Orange",	"Dark Russet Orange",
				  "Spring Crocus",	"Dark Spring Crocus",	"Valiant Poppy",	"Dark Valiant Poppy",
				  "Warren Tavern",	"Dark Warren Tavern"];

$( function () {
	if( typeof( Storage ) == 'undefined' ) {
		console.log( 'Local storage unavailable.' );
		$('#ThemeSelector').html("Your browser won't allow on-line theme selection!");
	} else {
		$('#ThemeSelector').remove();
		initialise();
	}
});

function initialise(){
	checkConfig();
	setupTheme( cmxConfig.Theme );		// Populate theme panel
	setupGeometry( cmxConfig.Geometry);	//	Populate the Geometry panel
	setupGull( cmxConfig.Gull );		//	Populate the Gul panel
	setupAlarms( cmxConfig.LEDs );		//	Create LED option list and options
	setupRainBoundaries( cmxConfig.RainRate);
	showConfig();
}

let checkConfig = function() {
	//	Needed to ensure all elements are present
	if( cmxConfig.Panels == null)  {
		cmxConfig.Panels.Shadows = "";
		cmxConfig.Panels.VariableHeights = "";
		cmxConfig.Panels.FixedWidths = "";
	}
}

//	Setup Colour Theme Panel
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
		$('#altTheme').remove();	//	Removeas any previous selections
		if($('#ThemeList').prop('value')=='' ){
			cmxConfig.Theme = "";
		} else {
			cmxConfig.Theme = $('#ThemeList').prop('value');
			$('#Theme').after('<link rel="stylesheet" href="css/themes/' + cmxConfig.Theme +'.css" id="altTheme">')
		}
	});

	//	Set checkbox status
	$('#PanelHt').prop('checked', ( cmxConfig.Panels.VariableHeights ? 'checked' : ''));
	//	Set function
	$('#PanelHt').on('change', function() {
		cmxConfig.Panels.VariableHeights = $('#Symmetry').prop('checked');
		showConfig();
		if( cmxConfig.Panels.VariableHeights) {
			$('.ows-flex, .ows-grid, #customGrid').css('align-items', 'start');
		} else {
			$('.ows-flex, .ows-grid, #customGrid').css('align-items','');
		}
	})

};

//	Setup Page Geometry panel
let setupGeometry = function( geometry ) {
	//	Set Banner
	$('#BannerState').prop('checked', (geometry.StaticHead ? 'checked' : ''));
	$('#BannerState').on('change', function() {
		geometry.StaticHead = $('#BannerState').prop('checked');
		showConfig();
		if( geometry.StaticHead ) {
			$('#Banner').addClass('w3-top').css('position','fixed');
			$('#Content').css('margin-top', $('#Banner').outerHeight( true ) + 'px');
		} else {
			$('#Banner').removeClass('w3-top').css('position', 'relative');
			$('#Content').css('margin-top', 0);
		}
	})
	//	Set Footer
	$('#FooterState').prop('checked', (geometry.StaticFoot ? 'checked' : ''));//	Sets initial value
	$('#FooterState').on('change', function() {
		geometry.StaticFoot = $('#FooterState').prop('checked');	//	Store ??
		showConfig();	//	Temp
		if(geometry.StaticFoot ){
			$('#Content').css('margin-bottom', $('#Footer').outerHeight( true ) + 'px');
			$('#Footer').addClass('w3-bottom')
		} else {
			$('#Content').css('margin-bottom', 0);
			$('#Footer').removeClass('w3-bottom');
		}
	})
	//	Set Gap values & onChange functions
	$('#TopGap').prop('value',  geometry.PaddingHead );	//	Sets current value
	$('#TopGap').on('change', function() {
		geometry.PaddingHead = parseFloat($('#TopGap').val());
		showConfig();
		$('#Content').css('padding-top', geometry.PaddingHead + geometry.Units);
	})
	$('#BottomGap').prop('value', geometry.PaddingFoot);
	$('#BottomGap').on('change', function() {
		geometry.PaddingFoot = parseFloat($('#BottomGap').val());
		showConfig();
		$('#Content').css('padding-bottom', geometry.PaddingFoot + geometry.Units);
	})
	//	Setup Units Dropdown.
	var units = {px:'Pixels',em:'Font height',vh:'Screen height'};
	var opts = '';
	for ( var key in units) {
		opts += '<option value="' + key + '" ' + ( geometry.Units == key ? "selected" : "") + '>' + units[key] + '</option>\n';
	}
	$('#unitSelect').html( opts );	//	Populates selector
	$('#unitSelect').on('change', function() {
		geometry.Units = $('#unitSelect').val();	//	Use new selected units
		showConfig();
		$('#TopGap').trigger('change');		//	Force new padding units to be applied
		$('#BottomGap').trigger('change');
	})

		//	Build shadow list
	var opts= '';
	var AvailableShadows = {"None":"","{{BASIC_SHADOW}}":"ows-theme-shadow1","{{ENHANCED_SHADOW}}":"ows-theme-shadow2"} 
	for( var opt in AvailableShadows) {
		opts += '<option value="' + AvailableShadows[opt] + '" ' + (cmxConfig.Panels.Shadows == AvailableShadows[opt]? 'selected': '') + '>' + opt + '</option>';
	}
	$('#shadowList').html( opts )
	$('#shadowList').on('change', function(){
		var shadows = 'ows-theme-shadow1 ows-theme-shadow2';
		var shadow = $('#shadowList').prop('value');
		cmxConfig.Panels.Shadows = shadow;
		$('.ows-flex, .ows-grid, #customGrid').children().removeClass( shadows ).addClass( shadow );
		showConfig();
	})

	//	Set checkbox status
	$('#PanelHt').prop('checked', ( cmxConfig.Panels.VariableHeights ? 'checked' : ''));
	//	Set function
	$('#PanelHt').on('change', function() {
		cmxConfig.Panels.VariableHeights = $('#PanelHt').prop('checked');
		showConfig();
		if( cmxConfig.Panels.VariableHeights) {
			$('.ows-flex, .ows-grid, #customGrid').css('align-items', 'start');
		} else {
			$('.ows-flex, .ows-grid, #customGrid').css('align-items','');
		}
	})
};

//	Setup the Seagull Panel
let setupGull = function(gull) {
	if(gull.Animation === '') {gull.Animation = 'gull-FadeIn';}	//	Force to be default value if blank
	//	Populate animation dropdown
	var animations = {gull_FadeIn: 'Default', gull_GrowUp:'Grow upwards', gull_SlideIn_from_Left:'Slide from left', gull_SlideIn_from_Right:'Slide from right',gull_Drop:'Drop from top'};
	var keyAct, opts = '';
	for (var key in animations) {
		keyAct = key.replaceAll('_','-');
		opts += '<option value="' + keyAct + '" ' + ( animations == keyAct ? "selected": "" ) + '>' + animations[key] + '</option>\n'; 
	}
	$('#animationSelect').html( opts );
	$('#animationSelect').on('change', function() {
		gull.Animation = $('#animationSelect').val();
		$('#Gull1').css('animation', gull.Animation + ' ' + gull.Speed + 's');
		showConfig();
	})
	//	Set Speed
	$('#animationSpeed').prop('value', gull.Speed);		//	Set initial value
	$('#animationSpeed').on('blur', function() {
		gull.Speed = $('#animationSpeed').val();
		$('#Gull1').css('animation', gull.Animation + ' ' + gull.Speed + 's');
		showConfig();
	})
	//	Set OnTop?
	$('#stayOnTop').prop('checked', (gull.OnTop ? 'checked' : ''));	//	Set initial value
	$('#stayOnTop').on('change', function() {
		gull.OnTop = $('#stayOnTop').prop('checked');		//	Store new value
		$('#Gull1').css('z-index', (gull.OnTop ? 200 : -200));
		showConfig();	// Update popup panel.
	})
}

let setupAlarms = function( alarms ) {
	var ledShapes = {Brick:'ows-brick',  Diamond: 'ows-diamond', Small_Diamond: 'ows-diamond ows-small', 
					 Lozenge: 'ows-lozenge', Oval: 'ows-oval',	 Round: 'ows-round', 	 Small_Round: 'ows-round ows-small'}
	var opts = '';
	for( alarmType in alarms) {
		opts = '';	//	Clear for each pass
		//console.log("Creating options for: " + alarmType);
		for( shape in ledShapes) {
			//console.log('<option value="' + ledShapes[shape] + '"" ' + ( alarms[alarmType] === ledShapes[shape] ? ' selected' : '' ) + '>' + shape.replace("_"," ") + '</option>');
			opts += '<option value="' + ledShapes[shape] + '" ' + ( alarms[alarmType] === ledShapes[shape] ? ' selected' : '' ) + '>' + shape.replace("_"," ") + '</option>\n';
		}
		//console.log("Adding "+ opts +  " to #Alarm" + alarmType);
		$('#Alarm' + alarmType).html( opts );
		$('#' + alarmType + 'LED').removeClass('ows-brick ows-lozenge ows-oval ows-round ows-small ows-diamond').addClass(alarms[alarmType]);
	}
	
	$('#AlarmDefault').on('change', function() {
		alarms.Default = $('#AlarmDefault').prop('value')
		$('#DefaultLED').removeClass('ows-brick ows-lozenge ows-oval ows-round ows-small ows-diamond').addClass(alarms.Default);
		showConfig();
	})
	$('#AlarmUser').on('change', function() {
		alarms.User = $('#AlarmUser').prop('value');
		$('#UserLED').removeClass('ows-brick ows-lozenge ows-oval ows-round ows-small ows-diamond').addClass(alarms.User);
		showConfig();
	})
}

let setupRainBoundaries = function( rate ) {
	$('#rainrateLight').prop('value', rate.Low);	// Sets initial value
	$('#rainrateLight').on('change', function() {
		rate.Low = parseFloat($('#rainrateLight').val());
	});
	$('#rainrateMedium').prop('value', rate.Medium);	// Set initial value
	$('#rainrateMedium').on('change', function() {
		rate.Medium = parseFloat($('#rainrateMedium').val());
	});
}

var clearScheme = function( ) {
    localStorage.removeItem( owsStore );
    getConfig();	//	Collects and stores default settings
    alert("All saved configuration values removed. Reload the page to confirm.");
	//displayCurrent();
	initialise();
	$('#altTheme').remove();	//	Removeas any previous selections
/*	
	setPageGeometry();
	checkTheme();*/
};

var setScheme = function() {
	//	Store the scheme
	if( typeof( Storage ) !== "undefined" ) {
		localStorage.setItem( owsStore, JSON.stringify( cmxConfig ));
		alert( "The current configuration is now stored for all pages" );
	}
	showConfig();
}

function showConfig() {
	$('#cmxInfo').html(JSON.stringify(cmxConfig, null, 2));
}

/* Testing	*/
function testColourChange() {
	$('html').get(0).style.setProperty('--ledOn', 'hotPink');
}