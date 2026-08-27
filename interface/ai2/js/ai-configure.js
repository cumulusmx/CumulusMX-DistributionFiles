/*	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Script:	ai-configure.js			| Ver: 5.0.0
 * 	Author:	DNC Thomas		  		| 2026-06-26
 * 	Last Edit:	2026/03/24 11:05:20
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Role:	Utility for the ai-config page:
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

//	Configure 'themes' for drop down
const themeNames = ["Dark Grey",
				  "Aurora Green",	"Dark Aurora Green", 	"Cherry Tomato",	"Dark Cherry Tomato",
				  "Chili Oil",		"Dark Chili Oil",		"Cranberry",	 	"Dark Cranberry",
				  "Crocus Petal",	"Dark Crocus Petal", 	"Field Green", 		"Dark Field Green",
				  "Lilac",			"Dark Lilac",			"Martini Olive",	"Dark Martini Olive",
				  "Meadow Green",	"Dark Meadow Green",	"Nebulas Blue",		"Dark Nebulas Blue",
				  "Red Pear",		"Dark Red Pear",		"Russet Orange",	"Dark Russet Orange",
				  "Spring Crocus",	"Dark Spring Crocus",	"Valiant Poppy",	"Dark Valiant Poppy",
				  "Warren Tavern",	"Dark Warren Tavern"];

const units =       {px: 'Pixels', em: 'Font height', vh: 'Screen height'};

const ledShapes =   {Brick: 'ow-brick',     Diamond: 'ow-diamond', Small_Diamond: 'ow-diamond ows-small',
					 Lozenge: 'ow-lozenge', Oval: 'ow-oval',	     Round:         'ow-round',
                     Small_Round: 'ow-round ow-small'}

const Shadows =     {"None":"","{{BASIC_SHADOW}}":"ow-theme-shadow1","{{ENHANCED_SHADOW}}":"ow-theme-shadow2"};

const gullAnimations = {gullFadeIn: 'Default', gullGrow:'Fly closer', gullSlideLtR:'Slide left to right', gullSlideRtL:'Slide right to left',gullDrop:'Drop from top'};

function initialise() {
    getConfig();
}

function setThemeSelector( currentTheme ) { //  The Theme
    let selectEl = $('#ThemeList');
    var fName, opt;
    for (theme in themeNames) {
        fName = themeNames[theme].replaceAll(' ', '-').toLowerCase()
        opt = '<option value="' + fName + '"' + ( currentTheme == fName ? " selected" : "") + '>' + themeNames[theme] + '</option>\n';
        //console.log('Theme: ' + opt);
        selectEl.append( opt );
    }
    selectEl.on('change', function() {
        $('#altTheme').remove(); // Remove any previous selection
        if( $('#ThemeList').prop('value') == '') {
            cmxConfig.Theme = '';
        } else {
            cmxConfig.Theme = $('#ThemeList').prop('value');    // Assign choice to memory config object
            $('#Theme').after( '<link rel="stylesheet" href="./css/themes/' + cmxConfig.Theme + '.css" id="altTheme">');
        }
    })
    //  Menu Position
    $('#MenuPosition').prop('checked', cmxConfig.SideMenu );
    $('#MenuPosition').on('change', function() {
        cmxConfig.SideMenu = $('#MenuPosition').prop('checked');
    })
}

function setDataFormats() {                 //  Miscelaneous
    $('#DataHeight').val( parseInt( cmxConfig.Geometry.DataFontSize + '%'));
    $('html').css('--dataFontSize', cmxConfig.Geometry.DataFontSize + '%')
    $('#DataHeight').on('change', function() {
        cmxConfig.Geometry.DataFontSize = parseInt($('#DataHeight').val()) ;
        $('html').css('--dataFontSize', cmxConfig.Geometry.DataFontSize + '%' );
    })
    $('#DataWeight').val( parseInt(cmxConfig.Geometry.DataFontWeight) );
    $('html').css('--dataFontWeight', cmxConfig.Geometry.DataFontWeight );
    $('#DataWeight').on('change', function() {
        cmxConfig.Geometry.DataFontWeight = parseInt($('#DataWeight').val() );
        console.log("Font weight: " + $('#DataWeight').val() ) ;
        $('html').css('--dataFontWeight', parseInt($('#DataWeight').val() ) );
    })
}

function setGeometry( Geom ) {              //  Page Geometry
    //  Set checkbox Element
    $('#BannerState').prop('checked', (Geom.StaticHead ? 'checked' : '') );
    $('#FooterState').prop('checked', (Geom.StaticFoot ? 'checked' : '') );
    // Set onChange functions
    $('#BannerState').on('change', function() {
        Geom.StaticHead = $('#BannerState').prop('checked');    // Set memory cmxConfig
        if( Geom.StaticHead ) {
            $('#pageHead').css({'position':'fixed','top':0});
            $('#pageContent').css('margin-top', $('#pageHead').outerHeight( true ) + 'px');
        } else {
            $('#pageHead').css({'position':'relative','top': ''});
            $('#pageContent').css('margin-top', 0);
        }
    })
    $('#FooterState').on('change', function() {
        Geom.StaticFoot = $('#FooterState').prop('checked');    // Set memory cmxConfig
        if( Geom.StaticFoot ) {
            $('#pageFoot').css({'position':'fixed','bottom':0});
            $('#pageContent').css('margin-bottom', $('#pageFoot').outerHeight( true ) + 'px');
            $('#pageContent').css('height', $(window).outerHeight() - ($('#pageHead').outerHeight(true) + $('#pageFoot').outerHeight( true)));
        } else {
            $('#pageFoot').css({'position':'relative','bottom': ''});
            $('#pageContent').css({'margin-bottom': 0, 'height':''});
        }
    })
    //  Page content top & bottom gaps and units
    $('#TopGap').prop('value', Geom.PaddingHead );  //  Set stored value
    $('#BottomGap').prop('value', Geom.PaddingFoot );   //  Set stored value
	var opts = '';
	for ( var key in units) {
		opts += '<option value="' + key + '"' + ( Geom.Units == key ? " selected" : "") + '>' + units[key] + '</option>\n';
	}
    $('#unitSelect').html( opts );	//	Populate the selector
    $('#TopGap').on('change', function() {
        Geom.PaddingHead = parseFloat($('#TopGap').val());
		$('.subContent').css('padding-top', Geom.PaddingHead + Geom.Units);
    })
    $('#BottomGap').on('change', function() {
        Geom.PaddingFoot = parseFloat( $('#BottomGap').val());
        $('.subContent').css('padding-bottom', Geom.PaddingFoot + Geom.Units);
    })
    $('#unitSelect').on('change', function() {
		Geom.Units = $('#unitSelect').val();	//	Use new selected units
		$('#TopGap').trigger('change');		//	Force new padding units to be applied
		$('#BottomGap').trigger('change');
	})
}

function setAlarms( alarms ) {              //  Alarm LEDs
    //  LED shapes
    var opts = '';
    var leds = 'ow-brick ow-lozenge ow-oval ow-round ow-small ow-diamond';
	for( alarmType in alarms) {
		opts = '';	//	Clear for each pass
		for( shape in ledShapes) {
			opts += '<option value="' + ledShapes[shape] + '" ' + ( alarms[alarmType] === ledShapes[shape] ? ' selected' : '' ) + '>' + shape.replace("_"," ") + '</option>\n';
		}
		$('#Alarm' + alarmType).html( opts );
		$('#' + alarmType + 'LED').removeClass(leds).addClass(alarms[alarmType]);
	}
    //  LED background colour
    $('html').css('--ledOff', alarms.OffColour);
    $('#AlarmOffColour').prop('value', alarms.OffColour);

    //  LED onChange events
	$('#AlarmDefault').on('change', function() {
		alarms.Default = $('#AlarmDefault').prop('value')
		$('#DefaultLED').removeClass(leds).addClass(alarms.Default);
	})
	$('#AlarmUser').on('change', function() {
		alarms.User = $('#AlarmUser').prop('value');
		$('#UserLED').removeClass(leds).addClass(alarms.User);
	})
    //  LED Colour Change
    $('#AlarmOffColour').on('change', function() {
        //console.log('LED BG Colour: ' + $('#AlarmOffColour').val());
        
        alarms.OffColour =  $('#AlarmOffColour').val() ;
        $('html').css('--ledOff', $('#AlarmOffColour').val() );
    })
}

function setPanels( panel ) {               //  Panel Shadows & Heights
    var opts = '';
    for( opt in Shadows ) {
        opts += '<option value="' + Shadows[opt] + '" ' + (panel.Shadow == Shadows[opt]? 'selected': '') + '>' + opt + '</option>';
    }
    $('#shadowList').html( opts );
    $('#shadowList').on('change', function() {
        var shadows = 'ow-theme-shadow1 ow-theme-shadow2';
		var shadow = $('#shadowList').prop('value');

		panel.Shadow = shadow;
		$('.ow-flex, .ow-grid, #customGrid').children().removeClass( shadows ).addClass( shadow );
    })
    //  Panel heights
    $('#PanelHt').prop('checked', ( panel.VariableHeight ? 'checked' : ''));
    $('#PanelHt').on('change', function() {
		panel.VariableHeight = $('#PanelHt').prop('checked');
		if( panel.VariableHeight) {
			$('.ow-flex, .ow-grid, #customGrid').css('align-items', 'start');
		} else {
			$('.ow-flex, .ow-grid, #customGrid').css('align-items','');
		}
    })
}

function setRainRateBoundaries( rate ) {    // Rain Rate Boundaries
    //  Load elemens with stored values
    $('#rainrateLight').prop('value', rate.Low);	// Sets initial value
	$('#rainrateLight').on('change', function() {
		rate.Low = parseFloat($('#rainrateLight').val());
	});
	$('#rainrateMedium').prop('value', rate.Medium);	// Set initial value
	$('#rainrateMedium').on('change', function() {
		rate.Medium = parseFloat($('#rainrateMedium').val());
	});
}

function setAnimation( gull ) {             //  Gull animation 
    if( gull.Animation === '' || gull.Animation == "Default" ) {
        gull.Animation = 'gullFadeIn';
    }
    var opts = '';
    for( var key in gullAnimations ) {
        opts += '<option value="' + key + '"' + ( gullAnimations == key ? " selected": "" ) + '>' + gullAnimations[key] + '</option>\n';
    }
    //console.log("Animation selector: " + opts );
    $('#animationSelect').html( opts );
	$('#animationSelect').on('change', function() {
		gull.Animation = $('#animationSelect').val();
		$('#footImg').css('animation', gull.Animation + ' ' + gull.Speed + 's');
	})
    //	Set Speed
	$('#animationSpeed').prop('value', gull.Speed);		//	Set initial value
	$('#animationSpeed').on('blur', function() {
		gull.Speed = $('#animationSpeed').val();
		$('#footImg').css('animation', gull.Animation + ' ' + gull.Speed + 's');
	})
}

function showCmxConfigs() {                //  Display cmxConfigs
    var stored = JSON.parse( localStorage.getItem( owStore ))
	$('#cmxInfoValues').html(JSON.stringify(cmxConfig, null, 2));
    $('#storedCMX').html( JSON.stringify(stored, null, 2 ));
    toggleModal('cmxConfigTxt');
}


function applyScheme() {
    localStorage.setItem( owStore, JSON.stringify( cmxConfig ));
    alert('This configuration has now been stored for all pages');
    window.location.reload( true )
}

function resetScheme() {
    localStorage.removeItem( owStore );
    window.location.reload( true );
}

$().ready( function() {
    setThemeSelector( cmxConfig.Theme );
    setDataFormats();
    setGeometry( cmxConfig.Geometry );
    setAlarms( cmxConfig.LEDs );
    setPanels( cmxConfig.Panels );
    setRainRateBoundaries( cmxConfig.RainRate );
    setAnimation( cmxConfig.Gull );
    $('cmxConfigTxt').on('')
})