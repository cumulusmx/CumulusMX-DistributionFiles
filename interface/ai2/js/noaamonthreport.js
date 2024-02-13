/*	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Script:	noaamonthreport.js	v3.0.1
 * 	Author:	Neil Thomas		 Sept 2023
 * 	Last Edit:	06/10/2023 09:53
 * 	Based on:
 * 		Marks script embedded in the html
 * 		file of the same name.
 * 	Last Mod:	10/10/2023 12:38
 * 	Role:
 * 		Handle NOAA Monthly reports
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var thisYear;
var thisMonth;
var startYear;
var startMonth;

$(document).ready(function () {

	$.ajax({
		url: '/api/tags/process.txt',
		dataType: 'json',
		type: 'POST',
		data: '{"month": <#recordsbegandate format="%M">, "year": <#recordsbegandate format="yyyy">}'
	})
	.done(function (result) {
		var now = new Date();
		// subtract 1 day
		now.setTime(now.getTime()-(1*24*3600000));
		thisYear = now.getFullYear();
		thisMonth = now.getMonth() + 1;
		startMonth =  result.month;
		startYear = result.year;
		console.log("Start year: " + startYear);
		startYear = parseInt(result.year);
		for (var i = thisYear; i >= startYear; i--) {
			$('#selYear').append($('<option>', {
				value: i,
				text: i
			}));
		}

		changeYear();

		load();
	});

	$('#selYear').on('change', function () {
		changeYear();
	});
	
	$('#selMonth').on('change', function() {
		load();
	});
});

function changeYear() {
	var year = $('#selYear').val();
	var firstMonth = 1;
	var lastMonth = 12;
	if (year == thisYear) {
		lastMonth = thisMonth;
	}
	if (year == startYear) {
		firstMonth = startMonth;
	}

	var now = new Date();
	// subtract 1 day
	now.setTime(now.getTime()-(1*24*3600000));
	// and set to first of month
	now.setDate(1);
	$('#selMonth').empty();
	
	for (var i = firstMonth; i <= lastMonth; i++) {
		now.setMonth(i - 1);
		$('#selMonth').append($('<option>', {
			value: i,
			text: now.toLocaleString('default', {month: "long"}),
			selected: year == thisYear && i === thisMonth
		}));
	}
	load();
};


function load() {
	var year = $('#selYear').val();
	var month = $('#selMonth').val();
	$.ajax({
		url: '/api/reports/noaamonth?year='+year+'&month='+month,
	})
	.done(function(data) {
		$('#report').text(data);
	})
	.fail(function(jqXHR, textStatus) {
		$('#report').text('Something went wrong! (' + textStatus + ')');
	});
}

function generate() {
	var year = $('#selYear').val();
	var month = $('#selMonth').val();
	$.ajax({
		url: '/api/genreports/noaamonth?year='+year+'&month='+month
	})
	.done(function(data) {
		$('#report').text(data);
		alert("Report (Re)generated");
	})
	.fail(function(jqXHR, textStatus) {
		$('#report').text('Something went wrong! (' + textStatus + ')');
	});
}

function generateAll() {
	$.ajax({
		url: '/api/genreports/all'
	})
	.done(function(data) {
		$('#report').text(data);
	})
	.fail(function(jqXHR, textStatus) {
		$('#report').html('Something went wrong! (' + textStatus + ')');
	});
}
