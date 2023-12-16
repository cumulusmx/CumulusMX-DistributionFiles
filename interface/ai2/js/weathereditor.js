/*	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Script:	    weathereditor.js
 *  Author:     Neil Thomas
 *  Last edit:  27-04-2023 14:24
 *  Based on:   conditions edtor and diary editor
 *          By: Mark Crossley
 *      Edited: 2021/06/09 21:50:22 & 2022/06/23 17:02:06
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

//  ----    Weather Diary   ----
var activeDates;

$(document).ready(function () {

	$('#datepicker').datepicker({
		dateFormat: 'yy-mm-dd',
		maxDate: '0d',
		minDate: '-20y',
		firstDay: 1,
		changeMonth: true,
		changeYear: true,
		showButtonPanel: true,
		onUpdateDatepicker: function (inst) {
			labelDays();
		},
		beforeShowDay: function (date) {
			var localDate = getDateString(date, false);
			var css = '';
			if ($.inArray(localDate, activeDates) != -1) {
				css = 'hasData';
			} else {
				css = 'noData';
			}
			return [true, css, ''];
		},
		onSelect: function (dateStr, inst) {
			var selDate = parseLocalDate(dateStr);

			$.ajax({
				url: '/api/data/diarydata?date=' + dateStr,
				dataType: 'json',
				success: function (result) {
					$('#inputComment').val(result.entry);
					$('#XComment').text(result.entry);  //  Repeat of comment with word wrap.
					$('#inputSnowFalling').prop('checked', (result.snowFalling === 1));
					$('#inputSnowLying').prop('checked', (result.snowLying === 1));
					$('#inputSnowDepth').val(result.snowDepth);
					$('#status').text('');
					$('#selectedDate').text(selDate.toDateString());
				},
				error: function (jqXHR, textStatus, errorThrown) {
					$('#status').text('Error: ' + textStatus);
				}
			});
		}
	});

	//loadCC();
	
	// override the default _gotoToday function to actually do something!
	var old_goToToday = $.datepicker._gotoToday
	$.datepicker._gotoToday = function (id) {
		old_goToToday.call(this, id)
		this._selectDate(id)
	}

	// Go get our diary data
	getSummaryData();
	$.datepicker._gotoToday($('#datepicker'));
	
	loadCC();
});

function getSummaryData() {
	$.ajax({
		url: '/api/data/diarysummary',
		dataType: 'json',
		success: function (result) {
			activeDates = result.dates;
			$("#datepicker").datepicker("refresh");
		},
		error: function (jqXHR, textStatus, errorThrown) {
			$('#status').text('Error: ' + textStatus);
		}
	});
}

function deleteDiaryEntry() {
	var date = $('#datepicker').datepicker('getDate');

	if ('' == date) {
		$('#status').text('Error: You must select a date first.');
	} else {
		var body = '{"Timestamp":"' + getDateString(date) + '"}';

		$.ajax({
			url: '/api/edit/diarydelete',
			type: 'POST',
			data: body,
			dataType: 'json',
			success: function (result) {
				console.log(result.result);
				// notify user
				if (result.result === 'Success') {
					$('#inputComment').val(null);
					$('#inputSnowFalling').prop('checked', false);
					$('#inputSnowLying').prop('checked', false);
					$('#inputSnowDepth').val(null);
					$('#status').text('Entry deleted.');
				}
				// update datepicker
				getSummaryData();
				//$('#datepicker').datepicker("setDate", date);
			}
		});
	}
}

function applyDiaryEntry() {
	var date = $('#datepicker').datepicker('getDate');
	console.log("Collected date: " + date);
	if ('' == date) {
		$('#status').text('Error: You must select a date first.');
	} else {
		var body = '{"Timestamp":"' + getDateString(date) + '",' +
			'"entry":"' + $('#inputComment').val() + '",' +
			'"snowFalling":"' + ($('#inputSnowFalling').prop('checked') ? 1 : 0) + '",' +
			'"snowLying":"' + ($('#inputSnowLying').prop('checked') ? 1 : 0) + '",' +
			'"snowDepth":"' + ($('#inputSnowDepth').val() ? $('#inputSnowDepth').val() : 0) + '"}';

		$.ajax({
			url: '/api/edit/diarydata',
			type: 'POST',
			data: body,
			dataType: 'json',
			success: function (result) {
				console.log(result.result);
				// notify user
				if (result.result === 'Success') {
					$('#status').text('Entry added/updated OK.');
					timeOut('status');
				}
				// update datepicker
				getSummaryData();
				//$('#datepicker').datepicker("setDate", date);
			}
		});
	}
}

function getDateString(date) {
	return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
}

function parseLocalDate(str) {
	var b = str.split(/\D/);
	return new Date(b[0], b[1] - 1, b[2]);
}

function labelDays() {
	$('#datepicker').find('[data-handler] > [data-date]').each(function () {
		var parent = this.parentNode;
		var date = new Date(parent.attributes['data-year'].value, parent.attributes['data-month'].value, this.attributes['data-date'].value);
		var label = $.datepicker.formatDate('d MM yy', date);
		if (parent.classList.contains('hasData')) {
			label += ". Day has data.";
		}
		if (this.attributes['aria-current'].value == 'true') {
			label += " Selected";
		}
		$(this).attr('aria-label', label);
	});
}


//  ------------------------------
//      Current Conditions
//  ---------------------------

function loadCC() {
	$.ajax({
		url: '/api/edit/currentcond.json',
		dataType: 'json'
	})
	.done(function(resp) {
		//$('#inputCurrCond').val(resp.data);
		console.log('Load success');
		$('#inputCurrCond')[0].value = resp.data;
	})
	.fail(function(jqXHR, textStatus) {
		alert('Something went wrong loading the text! (' + JSON.stringify( jqXHR) + "\n" + textStatus + ')');
	});
}

function applyEntry() {
	var body = $('#inputCurrCond')[0].value;
			
	body = body.replace(/\n/g, ' ');
	$.ajax({
		url     : '/api/edit/currcond',
		type    : 'POST',
		data    : body,
		dataType: 'json'
	}).done(function (result) {
		console.log(result.result);
		// notify user
		if (result.result === 'Success') {
			$("#CCstatus").text('Entry added/updated OK.');
			timeOut("CCstatus");
			loadCC();
		} else {
			$("#CCstatus").text('Failed to add/update entry!');
			timeOut("CCstatus");
		}
	}
	).fail(function(jqXHR, textStatus) {
		$("#CCstatus").text('Something went wrong updating the text! (' + textStatus + ')');
		timeOut("CCstatus");
	});
}
		
//  --  Timout for status messages        
let timeOut = function(elId) {
	window,setTimeout( function(){$("#" + elId).html("");}, 4000);
};

