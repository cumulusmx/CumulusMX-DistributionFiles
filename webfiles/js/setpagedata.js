/*	----------------------------------------------------------
 * 	setpagedata.js		v:0.1.0		d:Mar 2021		a:Neil  Thomas
 *  Last modified: 2022/07/02 17:55:10
 * 	Basic scripts for all new at-xxxx.html template pages.
 *  Incorporating changes suggested by beteljuice
 * 	Requires jQuery
 * 	----------------------------------------------------------*/

//	Global variables
//	Changing these affects every page in the ai-interface
//	All numbers are pixels.

let fixedHeader = false;	//	Use only true or false
let fixedFooter = true;	//	Use only true or false
let headerMargin = 20;	//	Gap between the header and the main body
let footerMargin = 10;	//	Gap between the body and the footer
let load_menu =	"js/menu.js"; // menu file to load - path is relative to the page


//	Thats the only changes you should make unless you know better!

let cmx_data;
let menu = mobileMenu = "";
let initialLoad = true;

window.onresize = function() {
	borderpatrol();
};


let borderpatrol = function() {
	var contentMargin = $("#Header").outerHeight( true );
	if ($('#Header').hasClass('w3-top')) {
		$('#Content').css('margin-top', headerMargin + contentMargin + 'px');
	} else {
		$('#Content').css('margin-top', headerMargin + 'px');
	}
	contentMargin = $('#Footer').outerHeight( true );
	if ($('#Footer').hasClass('w3-bottom')){
		$('#Content').css('margin-bottom', footerMargin + contentMargin + 'px');
	} else {
		$('#Content').css('margin-bottom', footerMargin + 'px');
	}
}; // end function

let createMainMenu = function(src, submenu) {
	let classMain = 'w3-bar-item w3-btn w3-theme-hvr at-slim w3-hide-small w3-hide-medium';
	let classMainSub = 'w3-bar-item w3-btn w3-theme-d5-hvr at-slim';

	src.forEach(function(itm) {
		if (itm.menu !== 'n') {	// wanted in main menu
			if (itm.submenu) { // drop down
				menu += '<div class="w3-dropdown-hover">\n';
				menu += '\t<button id="' +  itm.title.replace(/ /g,"_") + '" type="button" class="w3-btn w3-theme-hvr at-slim w3-hide-medium w3-hide-small" onclick="dropDown(this)" aria-expanded="false">' + itm.title + '&#8230;</button>\n';
				menu += '\t<div id="sub_' +  itm.title.replace(/ /g,"_") + '" class="w3-dropdown-content w3-bar-block w3-theme">\n';
				// add the sub-menu items
				createMainMenu(itm.items, true);
				menu += '\t\n</div></div>\n';
			} else {
				infill = (itm.new_window ? ' target="_blank"' : '');

				if (itm.forum) {
					 if (cmx_data.forumurl != '') {
						menu += '<a href="' + cmx_data.forumurl + '"' + infill + ' class="' + (submenu ? classMainSub : classMain) + '">' + itm.title + '</a>\n';
					 }
				} else if (itm.webcam) {
					if (cmx_data.webcamurl != '') {
						menu += '<a href="' + cmx_data.webcamurl + '"' + infill + ' class="' + (submenu ? classMainSub : classMain) + '">' + itm.title + '</a>\n';
					}
				} else {
					menu += '<a href="' + itm.url + '"' + infill + ' class="' + (submenu ? classMainSub : classMain) + '">' + itm.title + '</a>\n';
				}
			}
		}
	});

	// if we are processing a sub menu, return to the main loop
	if (submenu)
		return;

	menu += '<button class="w3-bar-item w3-btn w3-theme-hvr at-slim w3-hide-large w3-right" onClick="toggleMenu(\'Main_Menu_Mobile\')">Menu  &#9776;</button>';

	// stick the menus into the page
	$('#Main_Menu').html(menu);
};

let createMobileMenu = function(src, submenu) {
	let classMobile = 'w3-bar-item w3-btn w3-theme-hvr at-slim';
	let styleMobile = submenu ? 'padding-left: 30px !important;' : '';

	src.forEach(function(itm) {
		if (itm.menu !== 'w') { // wanted in narrow menu
		// mobile menu
			if (itm.submenu) {
				mobileMenu += '\t<button class="w3-btn at-slim" style="cursor: default;">' + itm.title + '&#8230;</button>\n';
				createMobileMenu(itm.items, true);
			} else {
				infill = (itm.new_window ? " target='_blank'" : "");
				if (itm.forum && cmx_data.forumurl != '') {
					mobileMenu += '<a href="' +  cmx_data.forumurl + '"' + infill + ' class="' + classMobile + '" style= "' + styleMobile + '">' + itm.title + '</a>\n';
				} else if (itm.webcam && cmx_data.webcamurl != '') {
					mobileMenu += '<a href="' +  cmx_data.webcamurl + '"' + infill + ' class="' + classMobile + '" style= "' + styleMobile + '">' + itm.title + '</a>\n';
				} else {
					mobileMenu += '<a href="' +  itm.url + '"' + infill + ' class="' + classMobile + '" style= "' + styleMobile + '">' + itm.title + '</a>\n';
				}
			}
		}
	});

	// if we are processing a sub menu, return to the main loop
	if (submenu)
		return;

	// stick the menus into the page
	$('#Main_Menu_Mobile').html(mobileMenu);
};

let setupPage = function() {

	//	static header & footer
	if (fixedHeader) {
		$('#Header').addClass('w3-top');
	} else {
		$('#Header').removeClass('w3-top');
	}
	if (fixedFooter) {
		$('#Footer').addClass('w3-bottom');
	} else {
		$('#Footer').removeClass('w3-bottom');
	}
	//	Page content top and bottom margins
	borderpatrol();
};

let toggleMenu = function(menuid) {
	$('#'+menuid).toggleClass('w3-show');
};

let dropDown = function(panel) {
	var btn = $('#' + panel.id);
	var sub = $('#sub_' + panel.id);
	if (sub.hasClass('w3-show')) {
		sub.removeClass('w3-show');
		btn.attr('aria-expanded', false);
	} else {
		// Close other dropdowns first
		$('.w3-dropdown-content').removeClass('w3-show');
		sub.addClass('w3-show');
		btn.attr('aria-expanded', true);
	}
};


let getPageData = function (resolve, reject) {
	$.getJSON('websitedata.json?_=' + Date.now(), function (json) {
		console.log('Data success');
		// auto update every 60 seconds, only the index and today pages
		// Some sites may have index.htm as the default page, and thus not have a page name
		let pageName = window.location.href.split('/').pop().split('.')[0];
		if (pageName == 'index' || pageName == 'today' || pageName == 'todayYest' || pageName == '') {
			setTimeout(function () {
				getPageData(null, null);
			}, 60 * 1000);
		}

		cmx_data = json;

		// Set some header stuff
		$(document).prop('title', cmx_data.location + ' weather');
		$('meta[name=description]').attr('content', cmx_data.location + ' weather data');
		$('meta[name=keywords]').attr('content', $('meta[name=keywords]').attr('content') + ', ' + cmx_data.location);

		// do the menus
		if (initialLoad) {
			$.getScript(load_menu, function() { // path is relative to the page - allows for multiple vars to be available and ignores comments ;-)
				createMainMenu(menuSrc, false);
				createMobileMenu(menuSrc, false);
				borderpatrol(); // duplicated here to ensure things OK if initial menu wrapped
			});
			initialLoad = false;
		}

		// Show/hide Apparent/Feels Like
		if (cmx_data.options.useApparent === "1") {
			$('[data-cmx-apparent]').removeClass('w3-hide');
			$('[data-cmx-feels]').addClass('w3-hide');
		}

		if (cmx_data.options.showSolar === "1") {
			$('[data-cmx-solar]').removeClass('w3-hide');
		} else {
			$('[data-cmx-solar-gauge]').addClass('w3-hide'); // Gauges do not draw correctly if hidden from the start
		}

		if (cmx_data.options.showUV === "1") {
			$('[data-cmx-uv]').removeClass('w3-hide');
		} else {
			$('[data-cmx-uv-gauge]').addClass('w3-hide'); // Gauges do not draw correctly if hidden from the start
		}

		// Update all spans having data-cmxdata with data values
		$('[data-cmxdata]').each(function () {
			this.innerHTML = cmx_data[this.dataset.cmxdata];
		});

		if (cmx_data.currcond != '') {
			$('#currCond').removeClass('w3-hide');
		}

		// Use this to trigger other scripts on the page
		if (null !== resolve) {
			resolve();
		}
	})
	.fail(function (jqxhr, textStatus, error) {
		let err = textStatus + ', ' + error;
		console.log('Data Request Failed: ' + err );

		if (null !== reject) {
			reject();
		}

		// lets try that again
		setTimeout(function () {
			getPageData(resolve, reject);
		}, 5000);
	});
};


// Get the main page data
let dataLoadedPromise = new Promise((myResolve, myReject) => {
	$(document).ready(function() {
		setupPage();
		getPageData(myResolve, myReject);
	});
});
