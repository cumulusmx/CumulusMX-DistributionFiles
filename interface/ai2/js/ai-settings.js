/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: ai-settings.js      | version 1.0.0
    Author: DNC Thomas          | 2026-05-19 09
    Edited: 2026-08-11 09:59:23
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Configuration settings for AI2
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

cmxConfig= {
    "Geometry": {
        "StaticHead": true,
        "StaticFoot": true,
        "PaddingHead": 1.5,
        "PaddingFoot": 1,
        "Units":    "em",
        "DataFontSize": 150,
        "DataFontWeight": 400
    },
    "Gull": {
        "Animation": "gullFadeIn",
        "Speed": 5
    },
    "LEDs": {
        "Default": "ow-brick",
        "User": "ow-oval",
        "OffColour": "#1c88ba"
    },
    "Panels": {
        "Shadow": "None",
        "VariableHeight": false
    },
    "RainRate": {
        "Low": 5,
        "Medium": 10
    },
    "ShowAlarms": true,
    "ShowDavis": true,
    "Theme":"Default",
    "SideMenu": true,
}

cmxSession = {
    "Charts": {
        "Trends":"",
        "Histsoric":"",
    },
    "Records": {
        "Monthly": "",
        "AllTime": "",
    }
}

//  Construct storage variable
var url = document.baseURI.split('/');
var port = url[2].split(':')[1] || 'Test';
var owStore = port + '-' + (url.length < 5 ? 'Root' : url[url.length - 2]);
console.log("Storage: owStore = " + owStore);

//  Check local storage
var currentLocal = JSON.parse(localStorage.getItem( owStore ));
if( currentLocal ) {
    console.log('Configuration already set - update');
    cmxConfig = currentLocal;
    if( cmxConfig.SideMenu === undefined ) { cmxConfig.SideMenu = false;}
    if( cmxConfig.Geometry.DataFontSize === undefined ) { cmxConfig.Geometry.DataFontSize = 150;}
    if( cmxConfig.Geometry.DataFontWeight === undefined ) { cmxConfig.Geometry.DataFontWeight = 500;}
    if( cmxConfig.LEDs.OffColour === undefined ) { cmxConfig.LEDs.OffColour = 'darkslategrey';}
    
    localStorage.setItem( owStore, JSON.stringify( cmxConfig ));
} else {
    console.log('Configuration NOT set - store default');
    localStorage.setItem( owStore, JSON.stringify( cmxConfig ));
}

//  Check session storage
var currentSession = JSON.parse( sessionStorage.getItem( owStore ));
if( currentSession ) {
    var mergedSession = {...cmxSession, ...currentSession};
    sessionStorage.setItem( owStore, JSON.stringify( mergedSession ));
} else {
    sessionStorage.setItem( owStore, JSON.stringify( cmxSession ));
}
