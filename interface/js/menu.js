/*
 Menu configuration file for NEW CuMX template
 Last modified: 2024/11/30 10:59:16
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
	{title: "Dashboard", menu: "b", label: "Dashboard",         url: "index.html"},
	{title: "Now",       menu: "b", label: "Live tabular data", url: "now.html"},
	{title: "Gauges",    menu: "b", label: "Gauges",            url: "gauges.html"},
	{title: "Charts",    menu: "b", submenu: true, label: "Charts sub-menu", items: [
		{title: "Recent Charts",         menu: "b", label: "Recent charts",         url: "charts.html"},
		{title: "Recent Select-a-Chart", menu: "b", label: "Recent selected data charts", url: "chartscompare.html"},
		{title: "Select-a-Period",       menu: "b", label: "Selected period charts",       url: "chartsperiod.html"},
		{title: "Daily Charts",          menu: "b", label: "Daily charts",          url: "chartshistoric.html"}
	]},
	{title: "Today/Yesterday", menu: "b", label: "Todays and yesterdays data", url: "todayyest.html"},
	{title: "Records", submenu: true, label: "Records sub-menu", items: [
		{title: "Records",          menu: "b", label: "All time records",    url: "records.html"},
		{title: "This Period",      menu: "b", label: "Selected period records", url: "thisperiod.html"},
		{title: "Daily Data Query", menu: "b", label: "Daily data query",    url: "querydayfile.html"}
	]},
	{title: "Extra sensors", submenu: true, label:"Extra sensors sub-menu", items: [
		{title: "Extra sensors",   menu: "b", label: "Extra sensors",   url: "extra.html"},
		{title: "AirLink sensors", menu: "b", label: "Airlink sensors", url: "airlink.html"}
	]},
	{title: "Data logs", submenu: true, label: "Data logs sub-menu", items: [
		{title: "Monthly logs",        menu: "b", label: "Monthly logs viewer editor",      url: "datalogs.html"},
		{title: "Extra data logs",     menu: "b", label: "Extra data logs viewer editor",   url: "extradatalogs.html"},
		{title: "Dayfile",             menu: "b", label: "Dayfile viewer editor",           url: "dayfileviewer.html"},
		{title: "Interval data viewer",menu: "b", label: "Interval data log viewer editor", url: "intervaldata.html"},
		{title: "Daily data viewer",   menu: "b", label: "Daily data viewer",               url: "dailydata.html"}
	]},
	{title: "Reports", submenu: true, label: "Reports sub-menu", items: [
		{title: "NOAA Month Report", menu: "b", label: "NOAA monthly reports", url: "noaamonthreport.html"},
		{title: "NOAA Year Report",  menu: "b", label: "NOAA annual reports",  url: "noaayearreport.html"}
	]},
	{title: "Settings", submenu: true, label: "Settings sub-menu", items: [
		{title: "Config Wizard",        menu: "b",  label: "Configuration wizard",  url: "wizard.html"},
		{title: "Program settings",     menu: "b",  label: "Program settings",      url: "programsettings.html"},
		{title: "Station settings",     menu: "b",  label: "Station settings",      url: "stationsettings.html"},
		{title: "Internet settings",    menu: "b",  label: "Internet settings",     url: "internetsettings.html"},
		{title: "Third party uploads",  menu: "b",  label: "Third party uploads",   url: "thirdpartysettings.html"},
		{title: "Extra sensors",        menu: "b",  label: "Extra sensors",         url: "extrasensorsettings.html"},
		{title: "Extra web files",      menu: "b",  label: "Extra web files",       url: "extrawebfiles.html"},
		{title: "HTTP files",           menu: "b",  label: "HTTP files",            url: "httpfiles.html"},
		{title: "Calibration settings", menu: "b",  label: "Calibration settings",  url: "calibrationsettings.html"},
		{title: "NOAA settings",        menu: "b",  label: "NOAA settings",         url: "noaasettings.html"},
		{title: "MySQL settings",       menu: "b",  label: "MySQL settings",        url: "mysqlsettings.html"},
		{title: "MQTT settings",        menu: "b",  label: "MQTT settings",         url: "mqttsettings.html"},
		{title: "Alarms",               menu: "b",  label: "Alarm settings",        url: "alarmsettings.html"},
		{title: "User defined Alarms",  menu: "b",  label: "User defined alarm settings", url: "useralarms.html"},
		{title: "Custom logs",          menu: "b",  label: "Custom log settings",   url: "customlogs.html"},
		{title: "Display options",      menu: "b",  label: "Data display settings", url: "display.html"},
		{title: "Locale strings",       menu: "b",  label: "String localisations",  url: "locale.html"}
	]},
	{title: "Edit",      submenu: true,  label: "Editors sub-menu",    items: [
		{title: "Today's rain",         menu: "b",  label: "Today's rain",         url: "raintodayeditor.html"},
		{title: "Weather Diary",        menu: "b",  label: "Weather diary",        url: "diaryeditor.html"},
		{title: "Current Conditions",   menu: "b",  label: "Current conditions",   url: "currentcondeditor.html"},
		{title: "All Time Records",     menu: "b",  label: "All-time records",     url: "alltimerecseditor.html"},
		{title: "Monthly Records",      menu: "b",  label: "Monthly records",      url: "monthlyrecseditor.html"},
		{title: "This Month's Records", menu: "b",  label: "This month's records", url: "thismonthrecseditor.html"},
		{title: "This Year's Records",  menu: "b",  label: "This year's records",  url: "thisyearrecseditor.html"}
	]},
	{title: "Utils",     submenu: true,  label: "Utilities sub-menu",   items:[
		{title: "Reload Dayfile",   menu: "b",  label: "Reload the dayfile",       url: "util_reloaddayfile.html"},
		{title: "Upload/Copy Now!", menu: "b",  label: "Upload or copy files now", url: "util_ftpnow.html"},
		{title: "Purge MySQL",      menu: "b",  label: "Purge MySQL upload queue", url: "util_purgemysql.html"},
		{title: "Latest Errors",    menu: "b",  label: "Show the latest errors",   url: "util_errorlog.html"},
		{title: "Alternative Interface", menu: "b", label: "Alternative interface",   url: "ai2/index.html"}
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

