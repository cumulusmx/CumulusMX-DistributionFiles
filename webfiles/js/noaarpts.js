/*	----------------------------------------------------------
 *  noaarpts.js
 *  Last modified: 2021/07/10 13:19:42
 *  Populates the dropdown menus using the records began date
 *
 * 	Requires jQuery
 * 	----------------------------------------------------------*/

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

            // we need to process every month though, so we can disbale those out of range as well as MIA
            for (let m = 1; m <= 12; m++) {
                // assume this month isn't available
                rptAvail[y][m] = false;

                if (m >= monSt && m <= monEnd) {
                    // assume it's there, then we only have to check for failure
                    rptAvail[y][m] = true;
                    // checking...
                    $.ajax({
                        url: rptPath + 'NOAAMO' + pad2(m) + pad2(y - 2000) + '.txt',
                        type: 'HEAD',
                        error: function() {
                            rptAvail[y][m] = false;
                            // if we are in the year currently being displayed...
                            if (y == $('#year').val()) {
                                // ...disable of any months that should be available but aren't
                                $('#opt-' + m).prop('hidden', true);
                            }
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
        dataType: 'text',
        success: function(data) {
            $('#noaareport').text(data);
        },
        error: function() {
            alert('Did not find the required report\n\nPlease try another date');
        }
    });
};

// Script assumes that reports use the default name format
let getYearRpt = function(yr) {
    let reqRpt = rptPath + 'NOAAYR' + yr + '.txt';

    // set the month buttons for the new year
    for (let m = 1; m < 13; m++) {
        $('#opt-' + m).prop('hidden', !rptAvail[yr][m]);
    }

    // Do we have a month selected? If so show the month report for the new year
    let mon = $('#month').val();
    if (mon != '0') {
        getMonRpt(mon);
        return;
    }

    // get the report text
    $.ajax({
        url: reqRpt,
        dataType: 'text',
        success: function(data) {
            $('#noaareport').text(data);
        },
        error: function() {
            alert('Did not find the required report\n\nPlease try another date');
        }
    });
};
