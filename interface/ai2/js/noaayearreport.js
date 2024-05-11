/*	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Script:	noaayearreport.js	v3.0.1
 * 	Author:	Neil Thomas		 Sept 2023
 * 	Last Edit:	10/10/2023 12:56
 * 	Based on:	
 * 		Marks script embedded in the 
 * 		html file of the same name
 * 	Last Mod:	
 * 	Role:
 * 		Draw charts based on readings
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

//$.fn.dataTable.ext.errMode = 'none';
$(document).ready(function () {

	$.ajax({
		url: '/api/tags/process.txt',
		dataType: 'json',
		type: 'POST',
		data: '<#recordsbegandate format="yyyy">'
	})
	.done(function (result) {
		var now = new Date();
		// subtract 1 day
		now.setTime(now.getTime()-(1*24*3600000));
		var yr = now.getFullYear();
		var start = parseInt(result);

		for (var i = yr; i >= start; i--) {
			$('#datepicker').append($('<option>', {
				value: i,
				text: i
			}));
		}

		load();
	});
	
	$('#datepicker').on('change', function() {
		load();
	});
});

function load() {
	var year = $('#datepicker').val();
	$.ajax({
		url: '/api/reports/noaayear?year='+year
	})
	.done(function(data) {
		$('#report').text(data);
	})
	.fail(function(jqXHR, textStatus) {
		$('#report').text('Something went wrong! (' + textStatus + ')');
	});
}

function generate() {
	var year = $('#datepicker').val();
	$.ajax({
		url: '/api/genreports/noaayear?year='+year
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
		$('#report').text('Something went wrong! (' + textStatus + ')');
	});
}

function uploadRpt() {
	var year = $('#datepicker').val();
	$.ajax({
		url: '/api/uploadreport/noaayear?year='+year
	})
	.done(function(data) {
		alert("Report upload: " + data);
	})
	.fail(function(jqXHR, textStatus) {
		$('#report').text('Something went wrong! (' + jqXHR.responseText + ')');
	});
}
