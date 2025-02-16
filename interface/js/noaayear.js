/*	----------------------------------------------------------
 *  noaamonth.js
 *  Last modified: 2025/02/15 19:05:58
 *  Populates the dropdown menus using the records began date
 *
 * 	Mark Crossley
 * 	----------------------------------------------------------
 */

var outputText;

$(document).ready(function () {
    $.ajax({
        url: "/api/info/version.json",
        dataType:"json"
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
});

function load() {
    var year = $('#datepicker').val();
    $.ajax({
        url: '/api/reports/noaayear?year='+year
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
    var year = $('#datepicker').val();
    $.ajax({
        url: '/api/genreports/noaayear?year='+year
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
        url: '/api/genreports/all'
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
