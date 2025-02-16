/*	----------------------------------------------------------
 *  noaamonth.js
 *  Last modified: 2025/02/16 11:57:54
 *  Populates the dropdown menus using the records began date
 *
 * 	Mark Crossley
 * 	----------------------------------------------------------
 */

var thisYear;
var thisMonth;
var startYear;
var startMonth;
var outputText;

$(document).ready(function () {
    $.ajax({
        url: '/api/info/version.json',
        dataType: 'json'
    })
    .done(function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    });

    var conf = $.ajax({
        url: '/api/settings/noaadata.json',
        dataType: 'json'
    })
    .done(function (result) {
        outputText = result.options.outputtext;
        if (outputText) {
            $('#report')
            .css('display', 'flex')
            .css('width', '100%');
        } else {
            $('#report')
            .css('text-align', 'center')
            .css('width', '800px')
            .css('display', 'block !important');
        }
    })

    var dates = $.ajax({
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

        var startYear = parseInt(result.year);

        for (var i = thisYear; i >= startYear; i--) {
            $('#selYear').append($('<option>', {
                value: i,
                text: i
            }));
        }

        changeYear();
    });

    $.when(conf, dates).done(function() {
        load();
    });

    $('#selYear').on('change', function () {
        changeYear();
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
}

function load() {
    var year = $('#selYear').val();
    var month = $('#selMonth').val();
    $.ajax({
        url: '/api/reports/noaamonth?year='+year+'&month='+month,
    })
    .done(function(data) {
        if (outputText) {
            $('#report').empty();
            $('#report').append('<pre>' + data + '</pre>');
        } else {
            $('#report').html(data);
        }
    })
    .fail(function(jqXHR, textStatus) {
        $('#report').text('Something went wrong! (' + jqXHR.responseText + ')');
    });
}

function generate() {
    var year = $('#selYear').val();
    var month = $('#selMonth').val();
    $.ajax({
        url: '/api/genreports/noaamonth?year='+year+'&month='+month
    })
    .done(function(data) {
        if (outputText) {
            $('#report').empty();
            $('#report').append('<pre>' + data + '</pre>');
        } else {
            $('#report').html(data);
        }
        alert("Report (Re)generated");
    })
    .fail(function(jqXHR, textStatus) {
        $('#report').text('Something went wrong! (' + jqXHR.responseText + ')');
    });
}

function generateAll() {
    $.ajax({
        url: 'api/genreports/all'
    })
    .done(function(data) {
        if (outputText) {
            $('#report').empty();
            $('#report').append('<pre>' + data + '</pre>');
        } else {
            $('#report').html(data);
        }
    })
    .fail(function(jqXHR, textStatus) {
        $('#report').text('Something went wrong! (' + jqXHR.responseText + ')');
    });
}

function uploadRpt() {
    var year = $('#selYear').val();
    var month = $('#selMonth').val();
    $.ajax({
        url: '/api/uploadreport/noaamonth?year='+year+'&month='+month,
    })
    .done(function(data) {
        alert("Report upload: " + data);
    })
    .fail(function(jqXHR, textStatus) {
        $('#report').text('Something went wrong! (' + jqXHR.responseText + ')');
    });
}
