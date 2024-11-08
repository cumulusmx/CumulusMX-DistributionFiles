// Last modified: 2024/11/06 12:11:29

var activeDates;
var defaultSnowHour;
var automated = 0;

$(document).ready(function () {
    $.ajax({
        url: '/api/info/version.json',
        dataType: 'json'
    })
    .done(function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    });

    $.ajax({
        url: '/api/info/units.json',
        dataType: 'json'
    })
   .done(function (result) {
        $('#snow24hLabel').append(' (' + result.snow + ')');
        $('#snowDepthLabel').append(' (' + result.snow + ')');
    });

    $.ajax({
        url: '/api/info/snowinfo.json',
        dataType: 'json'
    })
   .done(function (result) {
        defaultSnowHour = ('0' + result.snowHour).slice(-2) + ":00:00"
        $('#inputTime').val(defaultSnowHour);
        $('#automated').val(result.automated);
    })
    .always(function (result) {
        $('#automated').on('change', function () {
            $.ajax({
                url: '/api/edit/diaryautomate',
                type: 'POST',
                data: this.value,
                dataType: 'html'
            })
            .done(function (result) {
                console.log(result);
                // notify user
                $('#status').text(result);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $('#status').text('Error: ' + textStatus);
            });
        });
    });

    $('#datepicker').datepicker({
        dateFormat: 'yy-mm-dd',
        maxDate: '0d',
        minDate: '-20y',
        firstDay: 1,
        changeMonth: true,
        changeYear: true,
        yearRange: '-30:+0',
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
                dataType: 'json'
            })
            .done(function (result) {
                $('#inputComment').val(result.Entry);
                $('#inputSnow24h').val(result.Snow24h);
                $('#inputTime').val(result.Time);
                $('#inputSnowDepth').val(result.SnowDepth);
                $('#status').text('');
                $('#selectedDate').text(selDate.toDateString());
                $('#status').text('');
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $('#status').text('Error: ' + textStatus);
            });
        }
    });

    // override the default _gotoToday function to actually do something!
    var old_goToToday = $.datepicker._gotoToday
    $.datepicker._gotoToday = function (id) {
        old_goToToday.call(this, id)
        this._selectDate(id)
    }

    // Go get our diary data
    getSummaryData();
    $.datepicker._gotoToday($('#datepicker'));
});

function getSummaryData() {
    $.ajax({
        url: '/api/data/diarysummary',
        dataType: 'json'
    })
    .done(function (result) {
        activeDates = result.dates;
        $("#datepicker").datepicker("refresh");
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        $('#status').text('Error: ' + textStatus);
    });
}

function deleteEntry() {
    var date = $('#datepicker').datepicker('getDate');

    $('#status').text('');

    if ('' == date) {
        $('#status').text('Error: You must select a date first.');
    } else {
        var body = '{"Date":"' + getDateString(date) + '"}';

        if (!window.confirm("Are you sure you want to delete this record?")) {
            return;
        }

        $.ajax({
            url: '/api/edit/diarydelete',
            type: 'POST',
            data: body,
            dataType: 'json'
        })
        .done(function (result) {
            console.log("Delete " + date + ": " + result.result);
            // notify user
            if (result.result === 'Success') {
                $('#inputTime').val(snowHour);
                $('#inputComment').val(null);
                $('#inputSnow24h').val(null);
                $('#inputSnowDepth').val(null);
                $('#status').text('Entry deleted.');
            } else {
                $('#status').text('Error: ' + result.result);
            }
            // update datepicker
            getSummaryData();
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $('#status').text('Error: ' + textStatus);
        });
    }
}

function applyEntry() {
    var date = $('#datepicker').datepicker('getDate');

    $('#status').text('');

    if ('' == date) {
        $('#status').text('Error: You must select a date first.');
    } else {
        var body = '{"Date":"' + getDateString(date) + '",' +
            '"Time":' + $('#inputTime').val() + '",' +
            '"Entry":"' + $('#inputComment').val() + '",' +
            '"Snow24h":"' + ($('#inputSnow24h').val() ? $('#inputSnow24h').val() : "NULL") + '",' +
            '"SnowDepth":"' + ($('#inputSnowDepth').val() ? $('#inputSnowDepth').val() : "NULL") + '"}';

        $.ajax({
            url: '/api/edit/diarydata',
            type: 'POST',
            data: body,
            dataType: 'json'
        })
        .done(function (result) {
            console.log(result.result);
            // notify user
            if (result.result === 'Success') {
                $('#status').text('Entry added/updated OK.');
            } else {
                $('#status').text('Error: ' + result.result);
            }
            // update datepicker
            getSummaryData();
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $('#status').text('Error: ' + textStatus);
        });

    }
}

function uploadFile() {
    var fileInput = $('#upFile')[0];

    $('#status').text('');

    if (fileInput.files.length < 1) {
        alert('You must select a file to upload first!');
        return;
    }

    if (!window.confirm("Are you sure you want to upload this file? All existing data will be deleted.")) {
        return;
    }

    $.ajax({
        url: '/api/edit/diaryupload',
        type: 'POST',
        contentType: 'text/csv',
        processData: false,
        data: fileInput.files[0]
    })
    .done(function (result) {
        console.log(result);
        // notify user
        $('#status').text(result);
        // update datepicker
        getSummaryData();
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        $('#status').text('Error: ' + textStatus);
    });
}


function automated(sel) {
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
