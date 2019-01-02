
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
        beforeShowDay: function (date) {
            var d = date;
            var currDate = ('0' + d.getDate()).slice(-2);
            var currMonth = ('0' + (d.getMonth() + 1)).slice(-2);
            var currYear = d.getFullYear();
            var formattedDate = currYear + '-' + currMonth + '-' + currDate;
            var activeDate = $('#datepicker').datepicker('getFormattedDate');

            if ($.inArray(formattedDate, activeDates) != -1) {
                if (formattedDate != activeDate) {
                    return {classes: 'activeClass'};
                }
            }
            return;
        }
    });

    $("#datepicker").datepicker('setDate', '0');
    getSummaryData(currYear, currMonth);

    $('#datepicker').on('changeDate', function () {
        $.ajax({
            url: 'api/data/diarydata?date=' + $('#datepicker').datepicker('getFormattedDate'),
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
});


function getSummaryData() {
    var date = $('#datepicker').datepicker('getUTCDate');
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
    var date = $('#datepicker').datepicker('getFormattedDate');
    var body = '{"Timestamp":"' + date + 'Z00:00:00",' +
        '"entry":"' + $('#inputComment').val() + '",' +
        '"snowFalling":"' + ($('#inputSnowFalling').prop('checked') ? 1 : 0) + '",' +
        '"snowLying":"' + ($('#inputSnowLying').prop('checked') ? 1 : 0) + '",' +
        '"snowDepth":"' + ($('#inputSnowDepth').val() ? $('#inputSnowDepth').val() : 0) + '"}';
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
    var date = $('#datepicker').datepicker('getFormattedDate');
    var body = '{"Timestamp":"' + date + 'Z00:00:00",' +
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
