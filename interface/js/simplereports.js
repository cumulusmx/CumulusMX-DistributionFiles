/*	----------------------------------------------------------
 *  simplereports.js
 *  Last modified: 2026/10/01 21:32:02
 *  Populates the dropdown menus using the records began date
 *
 * 	Mark Crossley
 * 	----------------------------------------------------------
 */


$(document).ready(function () {
    $.ajax({
        url: '/api/info/version.json',
        dataType: 'json'
    })
    .done(function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    });
});


let ChangeReport = (event) => {
    console.log(event.target.value);
    switch(event.target.value) {
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
        url: '/api/reports/' + apiName
    })
    .done(function(data) {
        $('#reportcontent').text(data);
    })
    .fail(function(jqXHR, textStatus) {
        $('#reportcontent').text('Something went wrong! (' + jqXHR.responseText + ')');
    });
};