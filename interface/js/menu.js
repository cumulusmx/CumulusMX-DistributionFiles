/*
 Menu configuration file for NEW CuMX template
 Last modified: 2025/08/16 23:10:47
 menu.js - typical name, you define the one used in setpagedata.js

 It is STRONGLY RECOMMENDED that if you customise this file, you create a new file with a different name, e.g. mymenu.js
 and change setpagedata.js to use that file. This will avoid your customisations being accidentally overwritten during upgrades

 Properties:
   .menu             - can be 'b' (both menus), 'w' (wide menu ONLY), 'n' (narrow menu ONLY)
   .new_window:true  - forces the link to open in new browser window
   .forum:true       - flags a forum link menu item, it will use the url provided in CuMX config, if that is blank the menu item will be hidden
   .webcam:true      - flags a webcam link menu item, it will use the url provided in CuMX config, if that is blank the menu item will be hidden
*/

let menu = '';
let menuSrc = [
	{title: "{{MENU_DASHBOARD}}", menu: "b", label: "{{MENU_DASHBOARD}}", url: "index.html"},
	{title: "{{NOW}}",       menu: "b", label: "{{MENU_NOW_LABEL}}", url: "now.html"},
	{title: "{{MENU_GAUGES}}",    menu: "b", label: "{{MENU_GAUGES}}",    url: "gauges.html"},
	{title: "{{MENU_CHARTS}}",    menu: "b", submenu: true, label: "Charts sub-menu", items: [
		{title: "{{MENU_CHARTS_RECENT}}",       menu: "b", label: "{{MENU_CHARTS_RECENT}}",             url: "charts.html"},
		{title: "{{MENU_CHARTS_SELECTACHART}}", menu: "b", label: "{{MENU_CHARTS_SELECTACHART_LABEL}}", url: "chartscompare.html"},
		{title: "{{MENU_CHARTS_SELECTAPERIOD}}",menu: "b", label: "{{MENU_CHARTS_SELECTAPERIOD_LABEL}}",url: "chartsperiod.html"},
		{title: "{{MENU_CHARTS_DAILY}}",        menu: "b", label: "{{MENU_CHARTS_DAILY_LABEL}}",        url: "chartshistoric.html"}
	]},
	{title: "{{MENU_TODAYYEST}}", menu: "b", label: "{{MENU_TODAYYEST_LABEL}}", url: "todayyest.html"},
	{title: "{{RECORDS}}", submenu: true, label: "{{MENU_RECORDS_LABEL}}", items: [
		{title: "{{RECORDS}}",                 menu: "b", label: "{{MENU_RECORDS_ALLTIME_LABEL}}",url: "records.html"},
		{title: "{{MENU_RECORDS_PERIOD}}",     menu: "b", label: "{{MENU_RECORDS_PERIOD_LABEL}}", url: "thisperiod.html"},
		{title: "{{MENU_RECORDS_DAILY_DATA}}", menu: "b", label: "{{MENU_RECORDS_DAILY_DATA}}",   url: "querydayfile.html"}
	]},
	{title: "{{EXTRA_SENSORS}}", submenu: true, label:"{{MENU_EXTRA_LABEL}}", items: [
		{title: "{{EXTRA_SENSORS}}",   menu: "b", label: "{{EXTRA_SENSORS}}",   url: "extra.html"},
		{title: "{{AIRLINK_SENSORS}}", menu: "b", label: "{{AIRLINK_SENSORS}}", url: "airlink.html"}
	]},
	{title: "{{MENU_LOGS}}", submenu: true, label: "{{MENU_LOGS_LABEL}}", items: [
		{title: "{{MONTHLY_DATA_LOGS}}", menu: "b", label: "{{MENU_LOGS_MONTHLY_LABEL}}",      url: "datalogs.html"},
		{title: "{{MENU_LOGS_EXTRA}}",   menu: "b", label: "{{EXTRA_DATALOGS_VIEWER_EDITOR}}", url: "extradatalogs.html"},
		{title: "{{DAYFILE}}",           menu: "b", label: "{{DAYFIILE_VIEWER/EDITOR}}",       url: "dayfileviewer.html"},
		{title: "{{MENU_LOGS_INTERVAL}}",menu: "b", label: "{{MENU_LOGS_INTERVAL}}",           url: "intervaldata.html"},
		{title: "{{MENU_LOGS_DAILY}}",   menu: "b", label: "{{MENU_LOGS_DAILY}}",              url: "dailydata.html"}
	]},
	{title: "{{REPORTS}}", submenu: true, label: "{{MENU_REPORTS_LABEL}}", items: [
		{title: "{{NOAA_MONTHLY_REPORT}}", menu: "b", label: "{{NOAA_MONTHLY_REPORT}}", url: "noaamonthreport.html"},
		{title: "{{NOAA_YEARLY_REPORT}}",  menu: "b", label: "{{NOAA_YEARLY_REPORT}}",  url: "noaayearreport.html"}
	]},
	{title: "{{SETTINGS}}", submenu: true, label: "{{MENU_SETTINGS_LABEL}}", items: [
		{title: "{{MENU_CONFIG_WIZARD}}",    menu: "b",  label: "{{MENU_CONFIG_WIZARD}}",    url: "wizard.html"},
		{title: "{{PROGRAM_SETTINGS}}",      menu: "b",  label: "{{PROGRAM_SETTINGS}}",      url: "programsettings.html"},
		{title: "{{STATION_SETTINGS}}",      menu: "b",  label: "{{STATION_SETTINGS}}",      url: "stationsettings.html"},
		{title: "{{INTERNET_SETTINGS}}",     menu: "b",  label: "{{INTERNET_SETTINGS}}",     url: "internetsettings.html"},
		{title: "{{MENU_THIRD_PARTY}}",      menu: "b",  label: "{{MENU_THIRD_PARTY}}",      url: "thirdpartysettings.html"},
		{title: "{{EXTRA_SENSORS}}",         menu: "b",  label: "{{EXTRA_SENSORS}}",         url: "extrasensorsettings.html"},
		{title: "{{EXTRA_WEB_FILES}}",       menu: "b",  label: "{{EXTRA_WEB_FILES}}",       url: "extrawebfiles.html"},
		{title: "{{MENU_HTTP}}",             menu: "b",  label: "{{MENU_HTTP}}",             url: "httpfiles.html"},
		{title: "{{CALIB_SETTINGS}}",        menu: "b",  label: "{{CALIB_SETTINGS}}",        url: "calibrationsettings.html"},
		{title: "{{NOAA_SETTINGS}}",         menu: "b",  label: "{{NOAA_SETTINGS}}",         url: "noaasettings.html"},
		{title: "{{MYSQL_SETTINGS}}",        menu: "b",  label: "{{MYSQL_SETTINGS}}",  	     url: "mysqlsettings.html"},
		{title: "{{MQTT_SETTINGS}}",         menu: "b",  label: "{{MQTT_SETTINGS}}",         url: "mqttsettings.html"},
		{title: "{{MENU_ALARMS}}",           menu: "b",  label: "{{ALARM_SETTINGS}}",        url: "alarmsettings.html"},
		{title: "{{MENU_USER_ALARMS}}",      menu: "b",  label: "{{MENU_USER_ALARMS}}",      url: "useralarms.html"},
		{title: "{{MENU_CUSTOM_LOGS}}",      menu: "b",  label: "{{MENU_CUSTOM_LOGS}}",      url: "customlogs.html"},
		{title: "{{DISPLAY_OPTIONS}}",       menu: "b",  label: "{{DISPLAY_OPTIONS}}",       url: "display.html"},
		{title: "{{LOCALE_STRINGS}}",        menu: "b",  label: "{{LOCALE_STRINGS}}",        url: "locale.html"}
	]},
	{title: "{{MENU_EDITORS}}",      submenu: true,  label: "{{MENU_EDITORS_LABEL}}",    items: [
		{title: "{{MENU_TODAYS_RAIN}}",   menu: "b",  label: "{{MENU_TODAYS_RAIN}}",   url: "raintodayeditor.html"},
		{title: "{{MENU_WEATHER_DIARY}}", menu: "b",  label: "{{MENU_WEATHER_DIARY}}", url: "diaryeditor.html"},
		{title: "{{CURRENT_CONDITIONS}}", menu: "b",  label: "{{CURRENT_CONDITIONS}}", url: "currentcondeditor.html"},
		{title: "{{MENU_ALL_TIME}}",      menu: "b",  label: "{{MENU_ALL_TIME}}",      url: "alltimerecseditor.html"},
		{title: "{{MENU_MONTHLY}}",       menu: "b",  label: "{{MENU_MONTHLY}}",       url: "monthlyrecseditor.html"},
		{title: "{{MENU_THIS_MONTH}}",    menu: "b",  label: "{{MENU_THIS_MONTH}}",    url: "thismonthrecseditor.html"},
		{title: "{{MENU_THIS_YEAR}}",     menu: "b",  label: "{MENU_THIS_YEAR}",       url: "thisyearrecseditor.html"}
	]},
	{title: "{{MENU_UTILS}}",     submenu: true,  label: "{{MENU_UTILS_LABEL}}",   items:[
		{title: "{{RELOAD_DAYFILE}}",     menu: "b", label: "{{RELOAD_DAYFILE}}",     url: "util_reloaddayfile.html"},
		{title: "{{UPLOAD_NOW}}",         menu: "b", label: "{{MENU_UPLOAD_LABEL}}",  url: "util_ftpnow.html"},
		{title: "{{MENU_PURGE_MYSQL}}",   menu: "b", label: "{{PURGE_CACHED_MYSQL}}", url: "util_purgemysql.html"},
		{title: "{{LATEST_ERRORS}}",      menu: "b", label: "{{LATEST_ERRORS}}",      url: "util_errorlog.html"},
		{title: "{{MENU_ALT_INTERFACE}}", menu: "b", label: "{{MENU_ALT_INTERFACE}}", url: "ai2/index.html"}
	]}
];


let createMainMenu = function(src, submenu) {
	let path = window.location.pathname;
	let page = path.split("/").pop();
	let active = ' class="active"';

	src.forEach(function(itm) {
		if (itm.menu !== 'n') {	// wanted in main menu
			if (itm.submenu) { // drop down
				let menuActive = false;
				if (itm.items.some(rec => rec.url === page)) {
					menuActive = true;
				}
				menu += '<li class="dropdown role="none"' + (menuActive ? ' active' : '') + '">\n';
				menu += '\t<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="menuitem" aria-haspopup="true" aria-expanded="false" aria-label="' + itm.label + '">' + itm.title + '<span class="caret"></a>\n';
				menu += '\t<ul class="dropdown-menu" role="menu">\n';
				// add the sub-menu items
				createMainMenu(itm.items, true);
				menu += '\t</ul>\n';
				menu += '</li>\n';
			} else {
				infill = (itm.new_window ? ' target="_blank"' : '');
				menu += '<li' + (itm.url == page ? active : '') + '><a href="' + itm.url + '"' + infill  + 'role="menuitem" aria-label="' + itm.label + '"' + (itm.url == page ? ' aria-current="page"' : '') + '>' + itm.title + '</a></li>\n';
			}
		}
	});

	// if we are processing a sub menu, return to the main loop
	if (submenu)
		return;

	// stick the menus into the page
	$('#Main_Menu').html(menu);
};

let resizeMenu = function() {
	// get the menu height - if it isn't collapsed
	if ($('#Main_Menu').is(':visible')) {
		$('body').children('.container').css('margin-top', $('#Main_Menu').height() - 50);
	} else {
		$('body').children('.container').css('margin-top', '');
	}
};

window.addEventListener('load', function() {
	createMainMenu(menuSrc, false);
	resizeMenu();
});

window.addEventListener('resize', resizeMenu);

