/*
 Menu configuration file for NEW CuMX template
 Last modified: 2022/07/05 11:39:38
 menu.js - typical name, you define the one used in setpagedata.js

 It is STRONGLY RECOMMENDED that if you customise this file, you create a new file with a different name, e.g. mymenu.js
 and change setpagedata.js to use that file. This will avoid your customisations being accidentally overwritten during upgrades

 Properties:
   .menu             - can be 'b' (both menus), 'w' (wide menu ONLY), 'n' (narrow menu ONLY)
   .new_window:true  - forces the link to open in new browser window
   .forum:true       - flags a forum link menu item, it will use the url provided in CuMX config, if that is blank the menu item will be hidden
   .webcam:true      - flags a webcam link menu item, it will use the url provided in CuMX config, if that is blank the menu item will be hidden
*/

menuSrc = [
	{title: "Now",          menu: "b",    url: "index.htm"},
	{title: "Today",        menu: "b",    url: "today.htm"},
	{title: "Yesterday",    menu: "b",    url: "yesterday.htm"},
	{title: "Today-Yest",   menu: "b",    url: "todayyest.htm"},
	{title: "Gauges",       menu: "b",    url: "gauges.htm"},
	{title: "Records",      menu: "b",    submenu: true,       items: [
		{title: "This Month",        menu: "b",    url: "thismonth.htm"},
		{title: "This Year",         menu: "b",    url: "thisyear.htm"},
		{title: "All Time",          menu: "b",    url: "record.htm"},
		{title: "Monthly",           menu: "b",    url: "monthlyrecord.htm"}
	]},
	{title: "Charts",    menu: "b",    submenu: true,    items: [
		{title: "Trends",            menu: "b",    url: "trends.htm"},
		{title: "Select-a-graph",    menu: "b",    url: "selectachart.htm"},
		{title: "Historic",          menu: "b",    url: "historic.htm"}
	]},
	{title: "Reports",   menu: "b",    url: "noaareport.htm"},
	{title: "Forum",     menu: "b",    url: "#",    forum: true,    new_window: true},
	{title: "Webcam",    menu: "b",    url: "#",    webcam: true}
];
