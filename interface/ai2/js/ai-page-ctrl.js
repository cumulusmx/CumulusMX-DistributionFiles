/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: ai-ctrlr.js                 Ver: 5.0.0
    Author: Neil Thomas                   Nov 2025
    Edited: 2026-08-25 11:56:10
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Common scripts for all pages
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

let setPageGeometry = function( geometry ) {
    //  Configure the banner, footer and content gap
    let bannerHeight = $('#pageHead').outerHeight( true );
    let footerHeight = $('#pageFoot').outerHeight( true );
    //  Header
    if( geometry.StaticHead ) {
        $('#pageHead').css({'position':'fixed', 'top':0});
        $('#pageContent').css('margin-top', bannerHeight + 'px');
    }  else {
        $('#pageHead').css({'position':'relative','top':''});
        $('#pageContent').css('margin-top','');
    }
    //  Footer
    if( geometry.StaticFoot && $(window).height() > 800 ) { 
        $('#pageFoot').css({'position':'fixed', 'bottom':0});
        $('#pageContent').css({'margin-bottom': footerHeight + 'px', 'height': $(window).outerHeight() - (bannerHeight + footerHeight) + 'px'} );
    } else {
        $('#pageFoot').css({'position':'relative', 'bottom':''});
        $('#pageContent').css('margin-bottom','');
    }
    //  Top & Bottom margins
    $('.subContent').css({'padding-top':geometry.PaddingHead + geometry.Units,'padding-bottom':geometry.PaddingFoot + geometry.Units});
    //  Side navigation changes
    if( $('.subContent').outerHeight( true ) > $('#pageContent').outerHeight( true) ) {
        $('.sideNav').css('height', $('.subContent').outerHeight( true ));    
    } else {
        $('.sideNav').css('height', $('#pageContent').outerHeight( true ) );
         $('.sideNav').css('height', '100%' );
    }
};

let setPanelsStyles = function( panels ) {
    $('.ow-grid, .ow-flex, .customGrid').css( 'align-items', (panels.VariableHeight ? 'start' : '' ));
    if( panels.VariableHeight ) {
        $('.gullPanel').css('display','none');
    }
    let shadows = 'ow-theme-shadow1, ow-theme-shadow2, ow-theme-shadow3';
    $('.davisGrid').addClass('ow-shadow-none');
    $('.ledGrid').addClass('ow-shadow-none');
    switch( panels.Shadow ){
        case 'ow-theme-shadow1': $('.ow-flex, .ow-grid, .customGrid').children().addClass( 'ow-theme-shadow1');  break;
        case 'ow-theme-shadow2': $('.ow-flex, .ow-grid, .customGrid').children().addClass( 'ow-theme-shadow2');  break;
        case 'ow-theme-shadow3': $('.ow-grid, .ow.flex, .customGrid').chlidren().addClass( 'ow-theme-shadow3' ); break;
        default:    $('.ow-grid, .ow-flex, .customGrid').children().removeClass( shadows ) 
    }
    console.log('Panel styles set');
}

let setGull = function( gull ) {
    let animation, prompt;
    switch( gull.Animation) {
        case 'Drop':        animation = 'gullDrop '     ; break;
        case 'Slide LtR':   animation = 'gullSlideLtR ' ; break;
        case 'Slide RtL':   animation = 'gullSlideRtL ' ; break;
        case 'Grow':        animation = 'gullGrow '     ; break;
        default:            animation = 'gullFadeIn '   ; break;
    }
    prompt = (gull.Animation == '' ? 'default' : gull.Animation.toLowerCase()) + " animation";
    //prompt += " and " + (gull.OnTop ? 'over' : 'below') + " other elements";
    console.log('Gull set to ' + prompt );
    $('#footImg').css({'animation': animation + gull.Speed + 's', 'z-index': (gull.OnTop ? 0 : -100)});
}

let setTheme = function() {
    //  If alternative theme chosen, change.
    if( cmxConfig.Theme !== 'Default') {
        console.log("Setting theme to: " + cmxConfig.Theme);
        var theme = '<link rel="stylesheet" href="css/themes/' + cmxConfig.Theme + '.css" id="altTheme">';
        $('#altTheme').remove();    // Remove any other 'alternative' themes
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
            //  Set any elements affected
            $("[data-cmxData='latitude']").html( result.Latitude );
            $("[data-cmxData='longitude']").html( result.Longitude );
            $("[data-cmxData='altitude']").html( result.Altitude );
            $("[data-cmxData='Date']").html( result.CurrentDate );
            $("[data-cmxData='update']").html( result.update );
            $("[data-cmxData='WindRunUnit']").html( result.WindRunUnit );
            $("[data-owsData='Yesterday']").html( result.Yesterday );
            $("[data-cmxData='location']").html( result.Location );
            $("[data-cmxData='Port']").html( port );
        })
        .fail( function() {
            console.log("Failed to get data");
        })
    }
    $('[data-owsData=Build]').html('(b:' + cmxConfig.Build + ')');
};
//  NEW ****
function createMenu(src, submenu, indent, navBar){
    src.forEach( function(itm){
        if( itm.subMenu || itm.megaMenu) {
            menuHTML += '<div class="ow-dropdown">\n';
            menuHTML += '\t<button type="button" class="ow-dropdownBtn" role="menuitem" name="' + itm.name + '" aria-expanded="false">' + itm.title + '&nbsp;<i class="fa-solid fa-caret-down"></i></button>\n';
			menuHTML += '\t<div class="dropdown-container' + (itm.megaMenu ? ' megaMenu' : '') + '" style="z-index:2000;">\n';
			// add the sub-menu items
			createMenu(itm.items, true, '\t\t', navBar);
			menuHTML += '\t</div>\n</div>\n' ;
		} else {
			infill = (itm.newWindow ? ' target="_blank"' : '');
            order = ((Object.hasOwn( itm, 'order')) ? ' style="order:' + itm.order + '"':'');
            icon = ((submenu && itm.icon) ? '<i class="' + itm.icon + (itm.position == 'left' ? ' iconLeft' : ' iconRight') +'"></i>' : '');
            if ( itm.title == '-') {
                menuHTML += '\t\t<div style="height:2px;background:var(--color5);"></div>\n';
            } else {
                menuHTML += indent + '<a href="' + itm.url + '"' + infill + ' role="menuitem"';
                menuHTML += order + '>' + itm.title + icon + '</a>\n';
            }
        }
    })
    // if we are processing a sub menu, return to the main loop
	if (submenu)
		return;
   
    if( cmxConfig.SideMenu == true ) {
        $('#mySideNav').children('.theMenu').replaceWith( menuHTML );// Was replaceWith
        $('#myTopNav').css('display', 'none');

    } else {
        console.log('Using top menu');
        $('#myTopNav').children('.theMenu').replaceWith( menuHTML );
        $('#NavBars').css('display','none');
        }
    console.log('Menu loaded');
}

function navClicks() {  //  Allocates a click function to all dropdown buttons
    console.log('Allocating click event to navigation buttons')
    //let count = 0;
    $('.ow-dropdownBtn').each( function() {
        $(this).on('click', function() {
            var mnuBtn = this;
            //  Check if this button is dispalying its panel
            if( $(mnuBtn).hasClass('active')) {
                //  Clear just this panel
                $(mnuBtn).removeClass('active')
                $(mnuBtn).attr('aria-expanded',false);
                $(mnuBtn).next('.dropdown-container').css({'display': 'none'})
            } else {
                //  Clear all other panels
                $('.ow-dropdownBtn').removeClass('active')
                $('.ow-dropdownBtn').attr('aria-expanded', false);
                $('.ow-dropdownBtn').next('.dropdown-container').css({'display': 'none','grid-template-columns':''})
                //  Now configure and display this panel
                $(mnuBtn).addClass('active').attr('aria-expanded',true);
                if( $(mnuBtn).next('.dropdown-container').hasClass('megaMenu')) {
                    $(mnuBtn).next('.dropdown-container').css({'display': 'grid', 'grid-template-columns': 'repeat(auto-fill, minmax(16em, 1fr))', 'column-gap':'1vw'});
                } else {
                    $(mnuBtn).next('.dropdown-container').css({'display': 'block'})
                }
            }
        })
    })
}

function toggleTopNav() {
    console.log('Clicked top nav hamburger.');
    $('.topNav').toggleClass('responsive');
    
}
function toggleSideNav() {
    event.preventDefault();
    var width, minWidth = '410px';
    if( $(window).outerWidth() < 600) { minWidth = '100%';}
    width = parseInt($('#mySideNav').css('width'));
    console.log("Width: " + width);
    $('#mySideNav').css('width', ( width > 0 ) ? '0' : '40%' );
    $('#mySideNav').css('min-width', ( width  > 0 ) ? '0' : minWidth );
    console.log('Resetting menu length');
    if( $('.subContent').outerHeight( true ) > $('#pageContent').outerHeight( false ) ) {
        $('.sideNav').css('min-height', $('.subContent').outerHeight( true )); 
        $('.backtotop').css('display','block');
    } else {
        $('.sideNav').css('height', '100%' );
        $('.backtotop').css('display','none');
    }
}
//  END OF NEW  ****

let togglePanel = function(el) {  // Show/hide Alarm or Davis panels
    var elmt = '#' + el.id ;
    $(elmt + 'Panel').toggleClass('ow-hide');
    if( $(elmt + 'Panel').hasClass('ow-hide')) {
        $(elmt).text('{{SHOW}} ' + elmt.slice(1,9));
        cmxConfig['Show' + elmt.slice(1,9)] = false;
    } else {
        $(elmt).text('{{HIDE}} ' + elmt.slice(1,9));
        cmxConfig['Show' + elmt.slice(1,9)] = true;
    }
    localStorage.setItem(owStore, JSON.stringify(cmxConfig));
};

//  ~~~~    Show Modal Popups
let toggleModal = function(PopUp){
    $('#' + PopUp).css( 'display', ($('#' + PopUp).css('display'))== 'none' ? 'block' : 'none');
}
function togglePopup( el ){
    //  This controls the popups
    $('#' + el).css( 'display', ($('#' + el).css('display') == 'none' ? 'block' : 'none'));
}

function setActive() {
    const currentUrl = window.location.href;
    let menuLinks = document.querySelectorAll('nav a');
    menuLinks.forEach( link => {
        if( link.href === currentUrl) {
            $(link).addClass('active');
        }
    })
}
/*  Document ready */
$().ready( function() {
    setTheme();
    menuHTML ='';
    $.getScript( 'js/menu.js', function(){
        createMenu( menuSrc, false, '',true);
        navClicks();
        setActive();
    })
    setPageGeometry( cmxConfig.Geometry );
    setPanelsStyles( cmxConfig.Panels );
    setGull( cmxConfig.Gull );
    $('[data-owData="Version"]').text('5.21');
    setStaticData();
    setTimeout(setPageGeometry, 250, cmxConfig.Geometry);
//    $('#pageContent').on('click', function() {
//        var navWidth = parseInt( $('#mySideNav').css('width'));
//       ( navWidth > 0 ? toggleSideNav() :'');
//    })
})

$(window).on('resize', function() {
    setPageGeometry( cmxConfig.Geometry);
    if($('#MobileMenu').css('display') != 'none') {
        //console.log('Menu is hidden');
        $('#MobileMenu').css('display', 'none');
    }
    $('.dropdown').children('.dropdown-container').css('display','none');
    
})

