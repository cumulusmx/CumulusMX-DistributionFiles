/*
 Menu configuration file for NEW CuMX template
 Last modified: 2021/06/07 23:52:48
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
	{title: "Dashboard",    menu: "b",    url: "index.html"},
	{title: "Now",          menu: "b",    url: "now.html"},
	{title: "Gauges",       menu: "b",    url: "gauges.html"},
	{title: "Charts",       menu: "b",    submenu: true,    items: [
		{title: "Recent Charts",     menu: "b",    url: "charts.html"},
		{title: "Select-a-chart",    menu: "b",    url: "chartscompare.html"},
		{title: "Historic Charts",   menu: "b",    url: "chartshistoric.html"}
	]},
	{title: "Today/Yesterday",    menu: "b",    url: "todayyest.html"},
	{title: "Records",            menu: "b",    url: "records.html"},
	{title: "Extra sensors",      submenu: true,       items: [
		{title: "Extra sensors",        menu: "b",    url: "extra.html"},
		{title: "AirLink sensors",      menu: "b",    url: "airlink.html"}
	]},
	{title: "Data logs",      submenu: true,       items: [
		{title: "Monthly logs",        menu: "b",    url: "datalogs.html"},
		{title: "Extra data logs",     menu: "b",    url: "extradatalogs.html"},
		{title: "Dayfile",             menu: "b",    url: "dayfileviewer.html"}
	]},
	{title: "Reports",      submenu: true,       items: [
		{title: "NOAA Month Report",      menu: "b",    url: "noaamonthreport.html"},
		{title: "NOAA Year Report",       menu: "b",    url: "noaayearreport.html"}
	]},
	{title: "Settings",      submenu: true,       items: [
		{title: "Config Wizard",        menu: "b",    url: "wizard.html"},
		{title: "Program settings",     menu: "b",    url: "programsettings.html"},
		{title: "Station settings",     menu: "b",    url: "stationsettings.html"},
		{title: "Internet settings",    menu: "b",    url: "internetsettings.html"},
		{title: "Third party uploads",  menu: "b",    url: "thirdpartysettings.html"},
		{title: "Extra sensors",        menu: "b",    url: "extrasensorsettings.html"},
		{title: "Extra web files",      menu: "b",    url: "extrawebfiles.html"},
		{title: "Calibration settings", menu: "b",    url: "calibrationsettings.html"},
		{title: "NOAA settings",        menu: "b",    url: "noaasettings.html"},
		{title: "MySQL settings",       menu: "b",    url: "mysqlsettings.html"},
		{title: "Alarms",               menu: "b",    url: "alarmsettings.html"},
		{title: "FTP/Copy Now!",        menu: "b",    url: "ftpnow.html"}
	]},
	{title: "Edit",      submenu: true,       items: [
		{title: "Today's rain",          menu: "b",    url: "raintodayeditor.html"},
		{title: "Weather Diary",         menu: "b",    url: "diaryeditor.html"},
		{title: "Current Conditions",    menu: "b",    url: "currentcondeditor.html"},
		{title: "All Time Records",      menu: "b",    url: "alltimerecseditor.html"},
		{title: "Monthly Records",       menu: "b",    url: "monthlyrecseditor.html"},
		{title: "This Month's Records",  menu: "b",    url: "thismonthrecseditor.html"},
		{title: "This Year's Records",   menu: "b",    url: "thisyearrecseditor.html"}
	]},
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
				menu += '<li class="dropdown' + (menuActive ? ' active' : '') + '">\n';
				menu += '\t<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">' + itm.title + '<span class="caret"></a>\n';
				menu += '\t<ul class="dropdown-menu">\n';
				// add the sub-menu items
				createMainMenu(itm.items, true);
				menu += '\t</ul>\n';
				menu += '</li>\n';
			} else {
				infill = (itm.new_window ? ' target="_blank"' : '');
				menu += '<li' + (itm.url == page ? active : '') + '><a href="' + itm.url + '"' + infill  + '>' + itm.title + '</a></li>\n';
			}
		}
	});

	// if we are processing a sub menu, return to the main loop
	if (submenu)
		return;

	// stick the menus into the page
	$('#Main_Menu').html(menu);
};

window.addEventListener("load", function() {
	createMainMenu(menuSrc, false);
});

