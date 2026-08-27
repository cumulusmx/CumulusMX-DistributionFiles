/*
 Menu configuration file for NEW CuMX template
 Last modified: 2022/07/05 11:39:38
 menu.js - typical name, you define the one used in setpagedata.js

 It is STRONGLY RECOMMENDED that if you customise this file, you create a new file with a different name, e.g. mymenu.js
 and change setpagedata.js to use that file. This will avoid your customisations being accidentally overwritten during upgrades

 Properties:
    title       - The text displayed for the menu item; if '-', a bar divider will be drawn.
    subMenu     - Use this to create a dropdown single column sub-menu
    megaMenu    - Use thsi to create a mega menu - you should remove any bar dividers as these will occupy a link position.
                  A megaMenu width will be 80% on wide screens but 100% of the side menu panel.
    icon        - Only available in sub- & mega- menu items, adds a 'Font-Awsome' icon to the entry.
    newWindow   - If true, link will open in a new browser window
    order       - If using a megaMenu, order is required but can be set to 0.
*/

menuSrc = [
	{ title: "{{MENU_DASHBOARD}}",        url: "index.html"},
	{ title: "{{WEATHER_DATA}}",    name:'menuGeneral', megaMenu: true,      items: [
        { title: "{{CURRENT_DATA}}",                url: "current.html",        icon: ""},
        { title: "{{MENU_GAUGES}}",                 url: "gauges.html",         icon: "fa-solid fa-gauge-high"},
        { title: "{{MENU_CHARTS_RECENT}}",          url: "charts.html",         icon: "fa-solid fa-chart-line"},
        { title: "{{MENU_CHARTS_SELECTACHART}}",    url: "chartscompare.html",  icon: "fa-solid fa-chart-line"},
        { title: "{{MENU_CHARTS_SELECTAPERIOD}}",   url: "chartsperiod.html",   icon: "fa-solid fa-chart-line"},
        { title: "{{MENU_CHARTS_DAILY}}",           url: "chartshistoric.html", icon: "fa-solid fa-chart-column"},
        { title: "{{MENU_TODAYYEST}}",              url: "todayVyesterday.html",icon: ""},
        { title: "{{WEATHER_RECORDS}}",             url: "records.html",        icon: ""},
        { title: "{{RECORDS}} {{MENU_RECORDS_PERIOD}}", url: "recsthisperiod.html",icon: ""},
        { title: "{{MENU_RECORDS_DAILY_DATA}}",     url: "querydayfile.html",   icon: "fa-solid fa-question"}
    ]},
    { title: "{{EXTRA_SENSORS}}",   name:'menuExtra',  subMenu: true,      items: [
        { title: "{{EXTRA_SENSORS}}",   url: "extrasensors.html",    icon: "fa-solid fa-wand-magic-sparkles"},
        { title: "{{AIRLINK_SENSORS}}", url: "airlinksensors.html",  icon: "fa-regular fa-tower-cell"},
    ]},

	{ title: "{{REPORTS}}",          name:'menuReports', subMenu: true,      items: [
		{title: "{{NOAA_MONTHLY_REPORT}}",     url: "noaamonthreport.html",    icon: "fa-regular fa-clipboard"},
		{title: "{{NOAA_YEARLY_REPORT}}",      url: "noaayearreport.html",     icon: "fa-regular fa-clipboard"},
	]},
	{ title: "{{MENU_LOGS}}",        name:'menuLogs', subMenu: true,      items: [
		{title: "{{EDIT}} {{MONTHLY_DATA_LOGS}}",  url: "datalogeditor.html",      icon: "fa-regular fa-pen-to-square"},
		{title: "{{EDIT}} {{MENU_LOGS_EXTRA}}",    url: "extradatalogeditor.html", icon: "fa-regular fa-pen-to-square"},
		{title: "{{EDIT}} {{DAYFILE}}",            url: "dayfileeditor.html",      icon: "fa-regular fa-pen-to-square",},
		{title: "{{EDIT}} {{RECENT_DATA}}",        url: "recentdataviewer.html",   icon: "fa-regular fa-pen-to-square",},
        { title:'-'},
		{title: "{{INTERVAL_DATA_VIEWER}}",     url: "intervaldata.html",       icon: "fa-solid fa-clipboard-question",},
		{title: "{{DAILY_DATA_VIEWER}}",        url: "dailydata.html",          icon: "fa-solid fa-clipboard-question",},
	]},
	{ title: "{{SETTINGS}}",         name:'menuSettings',  megaMenu: true,     items: [
        //  Either place these in the correct order or use the 'order element'.
        { title: "<strong>{{MENU_CONFIG_WIZARD}}</strong>",     url: "wizard.html", icon: "fa-solid fa-list-check",         order: "0"},
        { title: "{{PROGRAM_SETTINGS}}",        url: "programsettings.html",     icon: "fa-solid fa-list-check",            order: "3"},
        { title: "{{STATION_SETTINGS}}",        url: "stationsettings.html",     icon: "fa-solid fa-list-check",            order: "6"},
        { title: "{{INTERNET_SETTINGS}}",       url: "internetsettings.html",    icon: "fa-solid fa-list-check",            order: "1"},
        { title: "{{LOCALE_STRINGS}}",          url: "configlocale.html",        icon: "fa-solid fa-globe",                 order: "9"},
        { title: "{{DISPLAY_OPTIONS}}",         url: "configdisplay.html",       icon: "fa-solid fa-display",               order: "12"},
        { title: "{{CALIB_SETTINGS}}",          url: "calibrationsettings.html", icon: "fa-solid fa-sliders",               order: "15"},
        { title: "{{THIRDPARTY_SETTINGS}}",     url: "thirdpartysettings.html",  icon: "fa-solid fa-list-check",            order: "4"},
        { title: "{{EXTRA_WEB_FILES}}",         url: "extrawebfiles.html",       icon: "fa-solid fa-arrow-up-from-bracket", order: "7"},
        { title: "{{HTTP_FILE_SETTINGS}}",      url: "confighttpfiles.html",     icon: "fa-solid fa-download",              order: "10"},
        { title: "{{MYSQL_SETTINGS}}",          url: "mysqlsettings.html",       icon: "fa-solid fa-database",              order: "13"},
        { title: "{{MQTT_SETTINGS}}",           url: "mqttsettings.html",        icon: "fa-solid fa-brain",                 order: "16"},
        { title: "{{NOAA_SETTINGS}}",           url: "noaareportsettings.html",  icon: "fa-solid fa-list-check",            order: "2"},
        { title: "{{EXTRA_SENSOR_SETTINGS}}",   url: "extrasensorsettings.html", icon: "fa-solid fa-wand-magic-sparkles",   order: "5"},
        { title: "{{ALARM_SETTINGS}}",          url: "alarmsettings.html",       icon: "fa-regular fa-bell",                order: "8"},
        { title: "{{MENU_USER_ALARMS}}",        url: "useralarms.html",          icon: "fa-regular fa-bell",                order: "11"},
        { title: "{{MENU_CUSTOM_LOGS}}",        url: "customlogs.html",          icon: "fa-solid fa-xmarks-lines",          order: "14"},
    ]},
    { title:"{{MENU_EDITORS}}",          name:'menuEditors',subMenu: true,      items:[
        { title: "{{EDIT}} {{MENU_TODAYS_RAIN}}",            url: "raintodayeditor.html",      icon: "fa-solid fa-droplet-slash",},
        { title: "{{WEATHER_CONDITIONS_EDITOR}}",    url: "weatherdiary.html",        icon: "fa-solid fa-cloud-sun-rain",}, 
        { title:'-'},
        { title: "{{MENU_ALL_TIME}}",             url: "editalltimerecs.html",     icon: "fa-solid fa-pen-to-square",},
        { title: "{{MENU_MONTHLY}}",              url: "editmonthlyrecs.html",     icon: "fa-solid fa-pen-to-square",},
        { title: "{{MENU_THIS_MONTH}}",         url: "editthismonthrecs.html",   icon: "fa-solid fa-pen-to-square",},
        { title: "{{MENU_THIS_YEAR}}",          url: "editthisyearrecs.html",    icon: "fa-solid fa-pen-to-square",},
    ]},
    { title:"{{MENU_UTILS}}",        name:'menuUtils', subMenu: true,      items: [
        { title: "{{UPLOAD_NOW}}",              url: "utilities.html",               icon: "fa-solid fa-copy"},
        { title: "{{MENU_PURGE_MYSQL}}",        url: "utilities.html#purge_anchor",  icon: "fa-solid fa-server"},
        { title: "{{LATEST_ERRORS}}",           url: "utilerrorslog.html",           icon: "fa-solid fa-triangle-exclamation"},
        { title: "{{AI_SETTINGS}}",             url: "ai-configure.html",            icon: "fa-solid fa-gears"},
        { title: "{{MENU_DEFAULT_INTERFACE}}",  url: "/index.html",                  icon: "fa-solid fa-gears",     newWindow: true},
    ]},
    { title: "{{SUPPORT}}",         name:'menuSupport', subMenu:true,       items: [
	    {title: "{{MENU_FORUM}}",       url: "https://cumulus.hosiene.co.uk",                   icon:"fa-solid fa-users",   newWindow: true},
	    {title: "{{MENU_WIKI}}",        url: "https://cumuluswiki.org/a/Original_Cumulus_Wiki", icon:"fa-solid fa-book",    newWindow: true},
        {title: "AI Wiki",              url: "https://wiki.ai2weather.uk",                      icon:"fa-solid fa-book",    newWindow: true}
    ]}
];
