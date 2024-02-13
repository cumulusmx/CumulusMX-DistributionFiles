// Last modified: 2022/07/26 23:48:42

//const userLocale =
//  navigator.languages && navigator.languages.length
//    ? navigator.languages[0]
//    : navigator.language;

$(document).ready(function() {

	$('.loading-overlay').show();
	$('.loading-overlay-image-container').show();

	var now = new Date();
	now.setHours(0,0,0,0);
	var yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2  );
	yesterday.setHours(0,0,0,0);

	var fromDate = $('#dateFrom').datepicker({
			dateFormat: 'dd-mm-yy',
			maxDate: '-1d',
			firstDay: 1,
			changeMonth: true,
			changeYear: true,
		 }).val(formatUserDateStr(now))
		.on('change', function() {
			var date = fromDate.datepicker('getDate');
			if (toDate.datepicker('getDate') < date) {
				toDate.datepicker('setDate', date);
			}
			toDate.datepicker('option', { minDate: date });
		});

	var toDate = $('#dateTo').datepicker({
			dateFormat: 'dd-mm-yy',
			maxDate: '-1d',
			firstDay: 1,
			changeMonth: true,
			changeYear: true,
		}).val(formatUserDateStr(now))
		.on('change', function() {
			var date = fromDate.datepicker('getDate');
			if (toDate.datepicker('getDate') < date) {
				toDate.datepicker('setDate', date);
			}
			toDate.datepicker('option', { minDate: date });
		});

	fromDate.datepicker('setDate', yesterday);
	toDate.datepicker('setDate', now);

	$.ajax({
		url: '/api/graphdata/units.json',
		dataType: 'json',
		success: function (result) {
			$.each(result, function(key, value) {
				$('.unit-' + key).text(value);
			});
		}
	});

	$.ajax({
		url: '/api/info/dateformat.txt',
		dataType: 'text',
		success: function (result) {
			// we want all lower case and yy for the year not yyyy
			var format = result.toLowerCase().replace('yyyy','yy');
			fromDate.datepicker('option', 'dateFormat', format);
			toDate.datepicker('option', 'dateFormat', format);
		}
	});
	load();
});


function load() {
	var startDate = $('#dateFrom').datepicker('getDate');
	var endDate = $('#dateTo').datepicker('getDate');
	$.ajax({
		url: '/api/records/thisperiod?startdate=' + formatDateStr(startDate) + '&enddate=' + formatDateStr(endDate),
		dataType: 'json',
		success: function (result) {
			$.each(result, function(key, value) {
				// convert the date time to local format
				/*if (key.includes('Time') && value != '-') {
					var split = value.split(' ');
					var date = split[0].split('/');
					var time = split.length === 1 ? null : split[1].split(':');

					if (time == null ) {
						if (date.length === 2) {
							var d = new Date(date[1], date[0] - 1);
							value = d.toLocaleDateString(userLocale, {year: 'numeric', month: 'long'});
						} else {
							var d = new Date(date[2], date[1] - 1, date[0]);
							value = d.toLocaleDateString(userLocale, {year: 'numeric', month: 'short', day: '2-digit'});
						}
					} else {
						var d = new Date(date[2], date[1] - 1, date[0], time[0], time[1]);
						value = d.toLocaleDateString(userLocale, {year: 'numeric', month: 'short', day: '2-digit'}) + " " + d.toLocaleTimeString();
					}
				}*/
				$('#' + key).text(value);
			});
		}
	});
}

function formatDateStr(inDate) {
	return '' + inDate.getFullYear() + '-' + (inDate.getMonth() + 1) + '-' + (inDate.getDate());
}

function formatUserDateStr(inDate) {
	return  addLeadingZeros(inDate.getDate()) + '-' + addLeadingZeros(inDate.getMonth() + 1) + '-' + inDate.getFullYear();
}

function addLeadingZeros(n) {
	return n <= 9 ? '0' + n : n;
}

