/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: ai-page-manager.js       Ver: aiX-1.0
    Author: Neil Thomas                  Mar 2025
    Edited: 2025/03/30
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Provide ALL utility javascripts
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

let CMXConfig = {};
let CMXSession = {}
let axStore = '';

//  Configure Config Object name
let url = document.baseURI.split('/');
var port = url[2].split(':')[1] || 'Website';
if (url.length < 5) {
    axStore = port + 'Root';
} else {
    axStore = port + url[url.length - 2];
}

//  Development ONLY
//localStorage.removeItem(axStore);

/*  ~~~~~~~~~~~~~~~~~~~~~~~
    Configure CumulusMX
    ~~~~~~~~~~~~~~~~~~~~~~*/
let getConfig = function() {
    // Collect any stored config
    var storedCFG = JSON.parse(localStorage.getItem(axStore));
    if( storedCFG === null ){
        //  Nothing stored so create
        CMXConfig = {
            'Theme':    '',
            'StaticHead':true,
            'StaticFoot':true,
            'PaddingTop': 2,
            'PaddingBottom': 1,
            'PaddingUnits': 'vh',
            'Seagull': {
                'Animation':'',
                'Speed': 5,
                'OnTop': true
            },
            'RainRate': { 'low':5,'medium':10},
            'LEDAlarm': 'ax-brick',
            'LEDUserAlarm': 'ax-brick',
            'ShowAlarms': true,
            'ShowDavis': true,
            'Version': '5'
        }
        localStorage.setItem( axStore, JSON.stringify( CMXConfig ));
    } else {
        CMXConfig = storedCFG;
    }
}

let getSession = function(){
    var storedSession = JSON.parse(sessionStorage.getItem(axStore));
    if( storedSession === null){
        CMXSession = {
            'Charts': {
                'Trends':'',
                'Historic':''
            },
            'Records': {
                'Monthly':'',
                'All':''
            }
        }
        sessionStorage.setItem( axStore, JSON.stringify( CMXSession ));
    } else {
        CMXSession = storedSession;
    }
}

/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Check and change Theme if required
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
let checkTheme = function() {
    //  Check if a theme change is required?
    if( CMXConfig.Theme != '') {
        console.log('Setting theme to: ' + CMXConfig.Theme);
        var theme = 'css/themes/' + CMXConfig.Theme + '.css';
        $('#theme').prop( 'href', theme );
    } else {
        $('#theme').prop('href', '');
    }
}

let configPage = function() {
    //  Show/Hide panels
    if( !CMXConfig.ShowAlarms){
        $('#AlarmsPanel').addClass('w3-hide');
        $('#Alarms').text('Show Alarms');
    }
    if( !CMXConfig.ShowDavis){
        $('#DavisPanel').addClass('w3-hide');
        $('#Davis').text('Show Davis');
    }
    //  Get the height of the header & footer
    var headHeight = $('#PageHead').outerHeight( true ) ;
    var footHeight = $('#PageFoot').outerHeight( true );
    var contentHeight = $(window).height() - (headHeight + footHeight);
    $('#content').css('min-height', contentHeight  + 'px');
    if( CMXConfig.StaticHead ) {
        //  Header is fixed - need to add marging to content
        $('#PageHead').addClass('w3-top');
        $('#content').css('margin-top', headHeight + 'px');
    } else {
        //  Header scrolls
        $('#PageHead').removeClass('w3-top').css('position','relative');
        $('#content').css('margin-top','0px');
    }
    if( CMXConfig.StaticFoot ) {
        if( $(window).height() > 920 ) {
            //  Tall screen orientation
            $('#PageFoot').addClass('w3-bottom');
            $('#content').css('margin-bottom', footHeight + 'px');
            $('#ax-gull').css('bottom', footHeight + 'px'); // Gull sits ON footer
        } else {
            $('#ax-gull').css('position','absolute'); // Gull on bottom of page
            $('#PageFoot').removeClass('w3-bottom');
        }
    } else {
        $('#ax-gull').css('position', 'absolute');  // Gull on bottom of page
    }
    //  Top Padding
    $('#content').css('padding-top', CMXConfig.PaddingTop + CMXConfig.PaddingUnits);
    //  Bottom padding
    $('#content').css('padding-bottom', CMXConfig.PaddingBottom + CMXConfig.PaddingUnits);
    //  Seagull
    if( CMXConfig.Seagull.OnTop) {
        $('#ax-gull').css( 'z-index','200');
    } else {
        $('#ax-gull').css( 'z-index','-200');
    }
    //  Animation
    if( CMXConfig.Seagull.Animation =='') {
        $('#ax-gull').css('aniation', 'fadeIn ' + CMXConfig.Seagull.Speed + 's' );  // Default animation
    } else {
        switch( CMXConfig.Seagull.Animation){
            case 'fadeDown':;
            case 'fadeAcrossDown': $('#ax-gull').css('transform-origin', 'top left');break;
            default: $('#ax-gull').css('transform-origin', 'bottom center');
        }
        $('#ax-gull').css('animation', CMXConfig.Seagull.Animation + ' ' + CMXConfig.Seagull.Speed + 's');
    }
}

/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Get CMX & AI Version
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
let getVersion = function() {
    $.ajax({
        url: '/api/info/version.json',
        success: function( result ) {
            $('[data-cmxData=Version]').html( result.Version );
            $('[data-cmxData=Build]').html( result.Build );
        },
        error: function( xhr ) {
            console.log( "Failed to load version data: " + xhr.status );
            $('[data-cmxData=Version]').html('<span style="color:#C00">-Not known-</span>');
        }
    })
    $('[data-OWdata=Version]').html( CMXConfig.Version + ' <span style="font-size:80%">(b:166)</span>');
};

/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Get Location & Extra Data
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
let getExtras = function() {
    //	Gets the data listed below
    var data = '{"Latitude": "<#latitude>", "Longitude": "<#longitude>", "Altitude": "<#altitude>", ' +
               '"CurrentDate": "<#shortdayname>, <#day> <#monthname> <#year>", ' +
               '"Yesterday":"<#yesterday format=\"ddd dd MMM yyyy\">", "update":"<#update>", ' +
               '"Station":"<#stationId>", "Location":"<#location>","WindRunUnit":"<#windrununit>"}';
    $.ajax({
        url: '/api/tags/process.txt',
        dataType: 'json',
        type: 'POST',
        data: data
    })
    .done( function (result) {
        //  Ser any elements affected
        $("[data-cmxdata='latitude']").html( result.Latitude);
        $("[data-cmxdata='longitude']").html( result.Longitude );
        $("[data-cmxdata='altitude']").html( result.Altitude );
        $("[data-cmxData='Date']").html( result.CurrentDate );
        $("[data-cmxData='update']").html(result.update );
        $("[data-cmxData='WindRunUnit']").html(result.WindRunUnit);
        $("[data-OWData='Yesterday']").html( result.Yesterday );
        $("[data-OWdata='Station'").html( result.Location );
    })
    .fail( function() {
        console.log("Failed to get data");
    })
};
    

/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Process the Menus
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
let loadMenu = function() {
    // Load AI menus
    $('#Menus').load("menus.html", function( response, status, xhr) {
        if( status == "error") {
            var msg = "Sorry but there was an error:  ";
            console.log( msg + xhr.status + ": " + xhr.statusTxt );
        }
    });
};

let toggleDropDown = function( dropdown ){
    //  Displayes / Hides dropdowns in menus
    var show = !$('#mnu'+dropdown.id).hasClass('w3-show');
    $('.w3-dropdown-content').removeClass('w3-show');
    $('#mnu' + dropdown.id).toggleClass( 'w3-show', show );
}

let toggleMenus = function() {
    //  Switches between standard and mobile menu
    if($('#menuMobile').hasClass('w3-hide')) {
        $('#menuMobile').removeClass('w3-hide');
    } else {
        $('#menuMobile').addClass('w3-hide');
    }
}

/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Utilities
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
let showModal = function(PopUp){
    if( $('#' + PopUp ).css('display') == 'none') {
        $('#' + PopUp ).css('display','block');
    } else {
        $('#' + PopUp ).css('display', 'none');
    }
    //  Move popup to verical position
    $('#' + PopUp + ' div').first().css('transform', 'translateY(30vh)')
}

function togglePanel(el){
    var elId = el.id;
    if( $('#'+elId+'Panel').hasClass('w3-hide')){
        $('#'+elId+'Panel').removeClass('w3-hide');
        $('#'+elId).text('Hide ' + elId);
        if(elId === 'Davis'){
            CMXConfig.ShowDavis = true;
        }else{
            CMXConfig.ShowAlarms = true;
        }
        localStorage.setItem(axStore, JSON.stringify(CMXConfig));
    } else {
        $('#'+elId+'Panel').addClass('w3-hide');
        $('#'+elId).text('Show ' + elId);
        if(elId=='Davis'){
            CMXConfig.ShowDavis = false;
        }else{
            CMXConfig.ShowAlarms = false;
        }
        localStorage.setItem(axStore, JSON.stringify(CMXConfig));
    }
}

/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Functions run on script load
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
getConfig()
getSession()
checkTheme()

/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Processes when whole page loaded
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
$().ready( function() {
    loadMenu();
    configPage();
    getVersion();
    getExtras();
})

$( window ).on("resize", function() {
    //  Not required in this version
    configPage();
});
