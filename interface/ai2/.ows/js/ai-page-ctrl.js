/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: ai-ctrlr.js                 Ver: 5.0.0
    Author: Neil Thomas                   Nov 2025
    Edited: 
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Common scripts for all pages
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

let cmxConfig = {};
let cmxSession = {};
let build = 0.01;

//  Construct variable to access Local, and Session storage 
var url=document.baseURI.split('/');
var port=url[2].split(':')[1] || 'test' ;
let owsStore;
//console.log("Full URL: " + document.URL);
owsStore = port + '~' + (url.length < 5 ? 'root' : url[url.length - 2])
console.log("Storage var: " + owsStore );

//  ~~~~    Get or Set CumulusMX config    ~~~~~~
let getConfig = function() {
    // Get any stored config
    var storedCFG = JSON.parse(localStorage.getItem(owsStore));
    if( storedCFG === null || storedCFG.Build === null ){   //  Nothing stored so create
        cmxConfig = {
            "Build": 0.0,
            "Geometry": {
                "StaticHead": true,
                "StaticFoot": true,
                "PaddingHead": 1.5,
                "PaddingFoot": 2,
                "Units": "em",
            },
            "Gull": {
                "Animation": "",
                "Speed": 5,
                "OnTop": true,
            },
            "LEDs": {
                "Default":"ows-brick",
                "User": "ows-brick",
            },
            "Panels": {
                "Shadows": "None",
                "VariableHeights": "",
                "FixedWidths": "",
            },
            "RainRate": {
                "Low": 5,
                "Medium": 10,
            },
            "ShowAlarms": true,
            "ShowDavis": true,
            "Theme": "",
        }
        //  Store virgin configuration
        localStorage.setItem( owsStore, JSON.stringify( cmxConfig ));
    } else {
        //  Use stored configuration
        cmxConfig = storedCFG;
        //  Check for latest version
        if( cmxConfig.Build !== build || cmxConfig.Panels == null) {
            cmxConfig.Build = build;
            cmxConfig.Panels.Shadows = "None";
            cmxConfig.Panels.VariableHeights = "";
            cmxConfig.Panels.FixedWidths = "";
            localStorage.setItem( owsStore, JSON.stringify(cmxConfig));
        }
    }
}

//  Get or set Session status. This is only needed on the charts pages
let getSession = function(){
    var storedSession = JSON.parse(sessionStorage.getItem(owsStore));
    if( storedSession === null){    //  No charts selected this session
        cmxSession = {
            "Charts": {
                "Trends": "",
                "Historic": ""
            },
            "Records": {
                "Monthly": "",
                "All": ""
            }
        }
        //  Store session status
        sessionStorage.setItem( owsStore, JSON.stringify( cmxSession ));
    } else {
        //  Use session status
        cmxSession = storedSession;
    }
}
//  These must happen asap not when page has completed loading.
getConfig();
getSession();

let setPageGeometry = function( geometry ) {
    $('#MobileMenu').css('top', $('#Banner').outerHeight( true ) + 'px');
    if( geometry.StaticHead ) {
        $('#Banner').addClass('w3-top');
        $('#Content').css( 'margin-top', $('#Banner').outerHeight(true) + 'px'); 
    }
    var windowHt = $(window).height() - $('#Banner').outerHeight( true ) - $('#Footer').outerHeight( true );
    if( geometry.StaticFoot ) {
        //  Static footer
        $('#Footer').addClass('w3-bottom');
        $('#Content').css('margin-bottom', $('#Footer').outerHeight( true) + 'px');
        if( $('#Content').outerHeight( true ) < windowHt) {
            $('#Content').css('height',  windowHt + 'px');
            $('#Gull1').css('bottom', 0);
        } else {
            $('#Content').css('height', windowHt + 'px');
            $('#Gull1').css('position', 'fixed')
            $('#Gull1').css('bottom', $('#Footer').outerHeight( true ) + 'px');
        }
    } else {
        //  Floating footer
        $('#Content').css('height', 'auto');
    }
    //  Set Padding
    $('#Content').css('padding-top', geometry.PaddingHead + geometry.Units);
    $('#Content').css('padding-bottom' , geometry.PaddingFoot + geometry.Units);
};

let setPanelsStyles = function( panels ) {
    if( panels.Shadows ) {
        $('.ows-flex, .ows-grid, #customGrid').children().addClass( panels.Shadows );
    } else {
        $('.ows-flex, .ows-grid, #customGrid').children().removeClass('ows-theme-shadow1 ows-theme-shadow2');
    }
    if( panels.VariableHeights) {
        $('.ows-flex, .ows-grid, #customGrid').css('align-items', 'start');
    } else {
        $('.ows-flex, .ows-grid, #customGrid').css('align-items', '');
    }
}

let setGull = function( gull ) {
    $('[data-owsData=Build]').html( "(b:" + cmxConfig.Build + ")");
    $('#Gull1').css('z-index', ( gull.OnTop ? 200 : -200 ))
    //  Seagull animation
    if( gull.Animation =='') {
        $('#Gull1').css('animation', 'gull-FadeIn ' + gull.Speed + 's' );  // Default animation
    } else {
        $('#Gull1').css('animation', gull.Animation + ' ' + gull.Speed + 's');
    }
}

let setTheme = function() {
    //  If alternative theme chosen, change.
    if( cmxConfig.Theme !== '') {
        console.log("Setting theme to: " + cmxConfig.Theme);
        var theme = '<link rel="stylesheet" href="css/themes/' + cmxConfig.Theme + '.css" id="altTheme">';
        $('#altTheme').remove();    // Remove any other 'alterntive' themes
        $('#Theme').after( theme ); // Set chose alternative theme
    }
}

//  Get version data from station
let setStaticData = function() {
    var data = '{"Latitude": "<#latitude>", "Longitude": "<#longitude>", "Altitude": "<#altitude>", ' +
               '"CurrentDate": "<#shortdayname>, <#day> <#monthname> <#year>", ' +
               '"Yesterday":"<#yesterday format=\"ddd dd MMM yyyy\">", "update":"<#update>", ' +
               '"Station":"<#stationId>", "Location":"<#location>","WindRunUnit":"<#windrununit>"}';
    if(port !='test') {
        //  Version & Build
        $.ajax({
            url: '/api/info/version.json',
            success: function( result ) {
                //  Uses Marks data tags
                $('[data-cmxData="Version"]').html( 'V:' + result.Version );
                $('[data-cmxData="Build"]').html( 'b:' + result.Build );
            },
            error: function( xhr ) {
                console.log( "Failed to load version data: " + xhr.status );
                $('[data-cmxData=Version]').html('<span style="color:#C00">-Not known-</span>');
            }
        })
        $.ajax({
            url: '/api/tags/process.txt',
            dataType: 'json',
            type: 'POST',
            data: data
        })
        .done( function (result) {
            //  Ser any elements affected
            $("[data-cmxData='latitude']").html( result.Latitude );
            $("[data-cmxData='longitude']").html( result.Longitude );
            $("[data-cmxData='altitude']").html( result.Altitude );
            $("[data-cmxData='Date']").html( result.CurrentDate );
            $("[data-cmxData='update']").html( result.update );
            $("[data-cmxData='WindRunUnit']").html( result.WindRunUnit );
            $("[data-owsData='Yesterday']").html( result.Yesterday );
            $("[data-owsData='Station']").html( result.Location );
        })
        .fail( function() {
            console.log("Failed to get data");
        })
    }
    $('[data-owsData=Build]').html('(b:' + cmxConfig.Build + ')');
};

let loadMenus = function() {
    // Load Menus
    var msg;
    $('#MainMenu').load("menu-main.html", function( response, status, xhr) {
        if( status == "error") {
            msg = "Sorry but there was an error:  ";
            console.log( msg + xhr.status + ": " + xhr.statusTxt );
        }
    });
    $('#MobileMenu').load("menu-mobile.html", function( response, status, xhr) {
        if( status == "error") {
            msg = "Oops, could not load mobile menu: ";
            console.log(msg + xhr.status + ': ' + xhr.statusTxt);
        }
    })
};

let toggleMenus = function() {
    //  Switches between standard and mobile menu
    if($('#MobileMenu').css('display') === 'none') {
        //console.log('Menu is hidden');
        $('#MobileMenu').css('display', 'block');
    } else {
        $('#MobileMenu').css('animation', 'animateleft 0.4s reverse');
        setTimeout( function() {
            $('#MobileMenu').css('display','none')}, 390);
    }
};

let toggleDropDown = function( dropdown ){
    //  Displayes / Hides dropdowns in menus
    var show = !$('#mnu'+dropdown.id).hasClass('w3-show');
    $('.w3-dropdown-content').removeClass('w3-show');
    $('#mnu' + dropdown.id).toggleClass( 'w3-show', show );
};

let togglePanel = function(el) {  // Show/hide Alarm or Davis panels
    var elId = el.id;
    $('#' + elId + 'Panel').toggleClass('w3-hide');
    if( $('#' + elId + 'Panel').hasClass('w3-hide')) {
        $('#' + elId).text('Show ' + elId);
        cmxConfig['Show' + elId] = false;
    } else {
        $('#' + elId).text('Hide ' + elId);
        cmxConfig['Show' + elId] = true;
    }
    localStorage.setItem(owsStore, JSON.stringify(cmxConfig));
};

//  ~~~~    Show Modal Popups
let toggleModal = function(PopUp){
    $('#' + PopUp).css( 'display', ($('#' + PopUp).css('display'))== 'none' ? 'block' : 'none');
}

/*  Document ready */
$().ready( function() {
    setTheme();
    loadMenus();
    setPageGeometry( cmxConfig.Geometry );
    setPanelsStyles( cmxConfig.Panels );
    setGull( cmxConfig.Gull );
    setStaticData();
})