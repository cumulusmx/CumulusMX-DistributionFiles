/*	----------------------------------------------------------
 *  simplereports.js
 *  Last modified: 2026/10/02 17:33:30
 *  Populates the dropdown menus using the records began date
 *
 * 	Mark Crossley
 * 	----------------------------------------------------------
 */

let reportFormat = 'html';
let lastReport = '';

$(document).ready(function () {
    $.ajax({
        url: '/api/info/version.json',
        dataType: 'json'
    })
    .done(function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    });

    reportFormat = getCookie('SimpleReportFormat') ?? 'html';

    if (reportFormat === 'text') {
        $('#cbFormat').prop('checked' , true)
    }
});


let ChangeReport = (event) => {
    FetchReport(event.target.value)
};

let FetchReport = (rpt) => {
    lastReport = rpt;

    switch(rpt) {
        case 'temp':
            LoadReport('simpleTemperature');
            break;
        case 'rain':
            LoadReport('simpleRainfall');
            break;
        case 'windrun':
            LoadReport('simpleWindRun');
            break;
        case 'sunshine':
            LoadReport('simpleSunshine');
            break;
        case 'et':
            LoadReport('simpleET');
            break;
        case 'dry':
            LoadReport('simpleDryDays');
            break;
        case 'wet':
            LoadReport('simpleWetDays');
            break;
    }
};

let LoadReport = (apiName) => {
    $.ajax({
        url: '/api/reports/' + apiName + '?format=' + reportFormat
    })
    .done(function(data) {
        $('#report').empty();

        if (reportFormat === 'text') {
            $('#report').append('<pre class="reportContent">' + data + '</pre>');
        } else {
            $('#report').append(data);
        }
    })
    .fail(function(jqXHR, textStatus) {
        $("#reportcontainer").empty();
        $('#reportcontainer').append('<pre>Something went wrong! (' + jqXHR.responseText + ')</pre>');
    });
};

let FormatChange = (event) => {
    reportFormat = event.target.checked ? 'text' : 'html';
    setCookie('SimpleReportFormat', reportFormat);
    FetchReport(lastReport);
};

//
// setCookie() writes the 'obj' in cookie 'name' for persistent storage
//
let setCookie = (name, obj) => {
    var date = new Date(),
        expires;
    // cookies valid for 1 year
    date.setYear(date.getFullYear() + 1);
    expires = '; expires=' + date.toGMTString();
    document.cookie = name + '=' + encodeURIComponent(JSON.stringify(obj)) + expires;
};

//
// getCookie() reads the value of cookie 'name' from persistent storage
//
let getCookie = (name) => {
    var i, x, y,
        ret = null,
        arrCookies = document.cookie.split(';');

    for (i = arrCookies.length; i--;) {
        x = arrCookies[i].split('=');
        if (x[0].trim() === name) {
            try {
                y = decodeURIComponent(x[1]);
            } catch (e) {
                y = x[1];
            }
            ret = JSON.parse(decodeURIComponent(y));
            break;
        }
    }
    return ret;
};
