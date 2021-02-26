/*	----------------------------------------------------------
 * 	at-basic.js		v:0.0.2		d:Feb 2021		a:Neil  Thomas
 *  Last modified: 2021/02/26 00:09:35
 * 	Basic scripts for all new at-xxxx.html template pages.
 *  Combined with existing MX setpagedata.js
 * 	Requires jQuery
 * 	----------------------------------------------------------*/

//	Global variables
//	Changing these affects every page in the ai-interface
//	All numbers are pixels.

let fixedHeader = true;	//	Use only true or false
let fixedFooter = true;	//	Use only true or false
let headerMargin = 20;	//	Gap between the header and the main body
let footerMargin = 10;	//	Gap between the body and the footer

//	Thats the only changes you should make unless you know better!

let menu = '<a href="index.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim w3-hide-small w3-hide-medium">Now</a>' +
	'<a href="gauges.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim w3-hide-small w3-hide-medium">Gauges</a>' +
	'<a href="today.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim w3-hide-small w3-hide-medium">Today</a>' +
	'<a href="yesterday.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim w3-hide-small w3-hide-medium">Yesterday</a>' +
	'<a href="thismonth.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim w3-hide-small w3-hide-medium">This Month</a>' +
	'<a href="thisyear.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim w3-hide-small w3-hide-medium">This Year</a>' +
	'<a href="record.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim w3-hide-small w3-hide-medium">Records</a>' +
	'<a href="monthlyrecord.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim w3-hide-small w3-hide-medium">Monthly Records</a>' +
	'<div class="w3-dropdown-hover">' +
		'<button class="w3-btn w3-theme-hvr  at-slim w3-hide-medium w3-hide-small">Charts</button>' +
		'<div class="w3-dropdown-content w3-bar-block w3-theme">' +
			'<a href="trends.htm" class="w3-bar-item w3-btn w3-theme-d5-hvr at-slim">Trends</a>' +
			'<a href="selectachart.htm" class="w3-bar-item w3-btn w3-theme-d5-hvr at-slim">Select-a-graph</a>' +
			'<a href="historic.htm" class="w3-bar-item w3-btn w3-theme-d5-hvr at-slim">Historic</a>' +
		'</div>' +
	'</div>' +
	'<a href="https://cumulus.hosiene.co.uk/index.php" data-cmx-forumlink class="w3-bar-item w3-btn w3-theme-hvr at-slim w3-hide-small w3-hide-medium w3-hide" target="_blank">Forum</a>' +
	'<a href="#" data-cmx-webcamlink class="w3-bar-item w3-btn w3-theme-hvr at-slim w3-hide-small w3-hide-medium w3-hide webcamlink">Webcam</a>' +
	'<button class="w3-bar-item w3-btn w3-theme-hvr at-slim w3-hide-large w3-right" onClick="toggleMenu(\'Main_Menu_Mobile\')">&#9776;</button>';

let mobileMenu = '<a href="index.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim">Now</a>' +
	'<a href="gauges.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim">Gauges</a>' +
	'<a href="today.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim">Today</a>' +
	'<a href="yesterday.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim">Yesterday</a>' +
	'<a href="thismonth.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim">This Month</a>' +
	'<a href="thisyear.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim">This Year</a>' +
	'<a href="record.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim">Records</a>' +
	'<a href="monthlyrecord.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim">Monthly Records</a>' +
	'<a href="trends.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim">Trends</a>' +
	'<a href="selectachart.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim">Select-a-graph</a>' +
	'<a href="historic.htm" class="w3-bar-item w3-btn w3-theme-hvr at-slim">Historic</a>' +
	'<a href="https://cumulus.hosiene.co.uk/index.php" data-cmx-forumlink class="w3-bar-item w3-btn w3-theme-hvr w3-hide at-slim forumlink" target="_blank">Forum</a>' +
	'<a href="#" data-cmx-webcamlink class="w3-bar-item w3-btn w3-theme-hvr w3-hide at slim webcamlink">Webcam</a>';

let cmx_data;

$(document).ready( function() {
	setupPage();
	getPageData();
});

let setupPage = function() {
	// menus
	$('#Main_Menu').html(menu);
	$('#Main_Menu_Mobile').html(mobileMenu);

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
};

let toggleMenu = function(menuid) {
	$('#'+menuid).toggleClass('w3-show');
};


// Get the main page data
let getPageData = function () {
	$.getJSON('websitedata.json', function (json) {
		console.log('Data success');
		cmx_data = json;

		// Set some header stuff
		$(document).prop('title', cmx_data.location + ' weather');
		$('meta[name=description]').attr('content', cmx_data.location + ' weather data');
		$('meta[name=keywords]').attr('content', $('meta[name=keywords]').attr('content') + ', ' + cmx_data.location + ' weather data');

		// Show/hide Apparent/Feels Like
		if (cmx_data.options.useApparent === "1") {
			$('[data-cmx-apparent]').removeClass('w3-hide');
			$('[data-cmx-feels]').addClass('w3-hide');
		}

		if (cmx_data.options.showSolar === "1") {
			$('[data-cmx-solar]').removeClass('w3-hide');
		} else {
			$('[data-cmx-solar-gauge]').addClass('w3-hide'); // Gauges do not draw correctly if the hidden from the start
		}

		if (cmx_data.options.showUV === "1") {
			$('[data-cmx-uv]').removeClass('w3-hide');
		} else {
			$('[data-cmx-uv-gauge]').addClass('w3-hide'); // Gauges do not draw correctly if the hidden from the start
		}

		// Update all spans having data-cmxdata with data values
		$('span[data-cmxdata]').each(function () {
			this.innerHTML = cmx_data[this.dataset.cmxdata];
		});


		if (cmx_data.forumurl != '') {
			$('[data-cmx-forumlink]').removeClass('w3-hide').each(function () {
				this.href = cmx_data.forumurl;
			});
		}

		if (cmx_data.webcamurl != '') {
			$('[data-cmx-webcamlink]').removeClass('w3-hide').each(function () {
				this.href = cmx_data.webcamurl;
			});
		}

		// Use this to trigger other scripts on the page
		$('#cmx-location').trigger('change');
	})
	.fail(function (jqxhr, textStatus, error) {
		let err = textStatus + ', ' + error;
		console.log('Data Request Failed: ' + err );
	});
};
