/*	----------------------------------------------------------
 *  noaarpts.js
 *  Last modified: 2025/03/09 17:23:35
 *  Populates the dropdown menus using the records began date
 *
 * 	Requires jQuery
 * 	----------------------------------------------------------
 */

let rptPath = 'Reports/';  // Your path should have a trailing "/", eg. 'Reports/'
let startYear, endYear;
let startMonth, endMonth;
let rptAvail = {};

if (rptPath.length  && rptPath.slice(-1) !== '/')
    rptPath += '/';

$(document).ready(function() {
    dataLoadedPromise.then(function() {
        startYear = cmx_data.recordsbegandateISO.split('-')[0] * 1;
        startMonth = cmx_data.recordsbegandateISO.split('-')[1] * 1;
        endYear = cmx_data.metdateyesterdayISO.split('-')[0] * 1;
        endMonth = cmx_data.metdateyesterdayISO.split('-')[1] * 1;

        // This does the initial disable of out of range months this year
        rptAvail[endYear] = [];
        for (let m = 1; m < 13; m++) {
            // greater than end month
            rptAvail[endYear][m] = m <= endMonth;
            // if start year is this year, then less start month
            if (startYear == endYear) {
                rptAvail[endYear][m] = rptAvail[endYear][m] && m >= startMonth
            }
            $('#opt-' + m).prop('hidden', !rptAvail[endYear][m]);
        }

        rptAvail[endYear][0] = true;

        // get the current year report and display it whilst we sort out the rest in background
        getYearRpt(endYear);

        // add the year select dropdown values, most recent first
        for (let y = endYear; y >= startYear; y--) {
            let option = $('<option />');
            option.html(y);
            option.val(y);

            $('#year').append(option);

            rptAvail[y] = [];

            // The start and end years may be short, so no point in checking months that are out of range
            let monSt, monEnd;
            if (y == startYear || y == endYear) {
                monSt = y == startYear ? startMonth : 1;
                monEnd = y == endYear ? endMonth : 12;
            } else {
                monSt = 1;
                monEnd = 12;
            }

            rptAvail[y][0] = true;
            $.ajax({
                url: rptPath + 'NOAAYR' + y + '.txt',
                type: 'HEAD'
            })
            .fail(function() {
                rptAvail[y][0] = false;
                // if we are in the year currently being displayed...
                if (y == $('#year').val()) {
                    // ...disable of any months that should be available but aren't
                    $('#opt-0').prop('hidden', true);
                }
            });


            // we need to process every month though, so we can disbale those out of range as well as MIA
            for (let m = 1; m <= 12; m++) {
                // assume it's there, then we only have to check for failure
                rptAvail[y][m] = true;

                if (m >= monSt && m <= monEnd) {
                    // checking...
                    $.ajax({
                        url: rptPath + 'NOAAMO' + pad2(m) + pad2(y - 2000) + '.txt',
                        type: 'HEAD'
                    })
                    .fail(function() {
                        rptAvail[y][m] = false;
                        // if we are in the year currently being displayed...
                        if (y == $('#year').val()) {
                            // ...disable of any months that should be available but aren't
                            $('#opt-' + m).prop('hidden', true);
                        }
                    });
                }
            }
        }
    });
});

// pad two digit numbers with a leading zero
let pad2 = function (num) {
    return (num < 10 ? '0' : '') + num;
}

// Script assumes that reports use the default name format
let getMonRpt = function(month) {
    let yr  = $('#year').val();

    // Is annual selected? If so, show the yearly report
    if (month === '0') {
        getYearRpt(yr);
        return;
    }

    reqRpt = rptPath + 'NOAAMO' + pad2(month) + pad2(yr - 2000) + '.txt';

    $.ajax({
        url: reqRpt,
        dataType: 'text'
    })
    .done(function(data) {
        if (cmx_data.options.noaaFormat == "html") {
            $('#report')
                .css('text-align', 'center')
                .css('width', '800px')
                .css('display', 'block !important');
            $('#noaareport').html(data);
        } else {
            $('#noaareport').empty();
            $('#report')
                .css('display', 'flex')
                .css('width', '100%');
            $('#noaareport').append('<pre>' + data + '</pre>');
        }
    })
    .fail(function() {
        alert('Did not find the required report\n\nPlease try another date');
    });
};

// Script assumes that reports use the default name format
let getYearRpt = function(yr) {
    let reqRpt = rptPath + 'NOAAYR' + yr + '.txt';

    // set the month buttons for the new year
    for (let m = 0; m < 13; m++) {
        $('#opt-' + m).prop('hidden', !rptAvail[yr][m]);
    }

    // Do we have a month selected? If so show the month report for the new year
    let mon = $('#month').val();
    if (mon != '0') {
        getMonRpt(mon);
        return;
    }

    if (rptAvail[yr][0]) {
        // get the report text
        $.ajax({
            url: reqRpt,
            dataType: 'text'
        })
        .done(function(data) {
            if (cmx_data.options.noaaFormat == "text") {
                $('#noaareport').empty();
                $('#noaareport').append('<pre>' + data + '</pre>');
            } else {
                $('#noaareport').html(data);
            }
        })
        .fail(function() {
            alert('Did not find the required report\n\nPlease try another date');
        });
    }
};
