// Last modified: 2021/05/16 20:54:13

var activeDates;

$(document).ready(function () {
    var date = new Date();
    var currYear = date.getFullYear();
    var currMonth = date.getMonth() + 1;

    $.ajax({
        url     : 'api/settings/version.json',
        dataType: 'json',
        success : function (result) {
            $('#Version').text(result.Version);
            $('#Build').text(result.Build);
        }
    });

    $('#datepicker').datepicker({
        format       : 'yyyy-mm-dd',
        endDate      : '0d',
        startDate    : '-20y',
        todayBtn      : "linked",
        weekStart: 1,
        beforeShowDay: function (date) {
            var localDate = getLocalFormattedString(date);
            if ($.inArray(localDate, activeDates) != -1) {
                return {classes: 'hasData'};
            }
            return;
        }
    });

    $('#datepicker').on('changeDate', function () {
        var date = $('#datepicker').datepicker('getUTCDate');
        var dateString = getUTCFormattedString(date, false);
        $.ajax({
            url: 'api/data/diarydata?date=' + dateString ,
            dataType: 'json',
            success: function (result) {
                $('#inputComment').val(result.entry);
                $('#inputSnowFalling').prop('checked', (result.snowFalling === 1));
                $('#inputSnowLying').prop('checked', (result.snowLying === 1));
                $('#inputSnowDepth').val(result.snowDepth);
                $('#status').text('');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('#status').text('Error: ' + textStatus);
            }
        });
    });

    $("#datepicker").datepicker('setDate', '0');
    getSummaryData(currYear, currMonth);
});


function getSummaryData() {
    var date = $('#datepicker').datepicker('getFormattedDate');
    $.ajax({
        url     : 'api/data/diarysummary',
        dataType: 'json',
        success : function (result) {
            activeDates = result.dates;
            $('#datepicker').datepicker('update', date);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $('#status').text('Error: ' + textStatus);
        }
    });
}

function deleteEntry() {
    var date = $('#datepicker').datepicker('getUTCDate');
    var body = '{"Timestamp":"' + getUTCFormattedString(date, true) + '"}';
    if ('' == date) {
        $('#status').text('Error: You must select a date first.');
    } else {
        $.ajax({
            url     : 'api/edit/diarydelete',
            type    : 'POST',
            data    : body,
            dataType: 'json',
            success : function (result) {
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
            }
        });
    }
}

function applyEntry() {
    var date = $('#datepicker').datepicker('getUTCDate');
    var body = '{"Timestamp":"' + getUTCFormattedString(date, true) + '",' +
        '"entry":"' + $('#inputComment').val() + '",' +
        '"snowFalling":"' + ($('#inputSnowFalling').prop('checked') ? 1 : 0) + '",' +
        '"snowLying":"' + ($('#inputSnowLying').prop('checked') ? 1 : 0) + '",' +
        '"snowDepth":"' + ($('#inputSnowDepth').val() ? $('#inputSnowDepth').val() : 0) + '"}';
    if ('' == date) {
        $('#status').text('Error: You must select a date first.');
    } else {
        $.ajax({
            url     : 'api/edit/diarydata',
            type    : 'POST',
            data    : body,
            dataType: 'json',
            success : function (result) {
                console.log(result.result);
                // notify user
                if (result.result === 'Success') {
                    $('#status').text('Entry added/updated OK.');
                }
                // update datepicker
                getSummaryData();
            }
        });
    }
}

function getUTCFormattedString(date, long) {
    return date.getUTCFullYear() + '-' + ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + date.getUTCDate()).slice(-2) + (long ? 'T00:00:00Z' : '');
}

function getLocalFormattedString(date) {
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
}
