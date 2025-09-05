// Created: 2021/01/21 17:10:29
// Last modified: 2025/08/11 16:20:44

var fromDate, toDate;

$(document).ready(function () {

    $.ajax({
        url: '/api/info/version.json',
        dataType: 'json'
    })
    .done(function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    });

    // get the display options so we know which checkboxes to show
    const visibility = $.ajax({
        url: '/api/settings/displayoptions.json',
        dataType: 'json'
    })
    .done(function (result) {
        const dataVisibility = result.DataVisibility;

        // construct the checkboxes
        // checkbox id's are the field offsets in the day file
        let group = 1; // we are allowed four groups per row
        let row = 0;
        let rows = [];

        // start a row
        rows[row] = $('<div>', { class: 'row top-buffer' });

        // temperature Data
        let tempBoxes = $('<div>');

        if (dataVisibility.temperature.Temp > 0) {
            tempBoxes.append($('<input>', { type: 'checkbox', id: '6' }))
                .append($('<label>', { for: '6', class: 'mylabel', html: '{{TEMP_MAX}}' }))
                .append($('<br>'))
                .append($('<input>', { type: 'checkbox', id: '7' }))
                .append($('<label>', { for: '7', class: 'mylabel', html: '{{TEMP_MAX_TIME}}' }))
                .append($('<br>'))
                .append($('<input>', { type: 'checkbox', id: '4' }))
                .append($('<label>', { for: '4', class: 'mylabel', html: '{{TEMP_MIN}}' }))
                .append($('<br>'))
                .append($('<input>', { type: 'checkbox', id: '5' }))
                .append($('<label>', { for: '5', class: 'mylabel', html: '{{TEMP_MIN_TIME}}' }))
                .append($('<br>'))
                .append($('<input>', { type: 'checkbox', id: '15' }))
                .append($('<label>', { for: '15', class: 'mylabel', html: '{{TEMP_AVG}}' }))
                .append($('<br>'))
                .append($('<input>', { type: 'checkbox', id: '52' }))
                .append($('<label>', { for: '52', class: 'mylabel', html: '{{CHILL_HOURS}}' }));
        }

        if (tempBoxes.children().length > 0) {
            let tempBlock = $('<div>', { class: 'my-unit' })
                .append($('<div>', { class: 'my-title', text: '{{TEMPERATURE}}' }))
                .append(tempBoxes);
            group++;
            rows[row].append($('<div>', { class: 'col-md-3' }).append(tempBlock));
        }

        // humidity Data
        let humBoxes = $('<div>');
        if (dataVisibility.humidity.Hum > 0) {
            humBoxes.append($('<input>', { type: 'checkbox', id: '21' }))
                .append($('<label>', { for: '21', class: 'mylabel', html: '{{HIGH_HUMIDITY}}' }))
                .append($('<br>'))
                .append($('<input>', { type: 'checkbox', id: '22' }))
                .append($('<label>', { for: '22', class: 'mylabel', html: '{{HIGH_HUMIDITY_TIME}}' }))
                .append($('<br>'))
                .append($('<input>', { type: 'checkbox', id: '19' }))
                .append($('<label>', { for: '19', class: 'mylabel', html: '{{LOW_HUMIDITY}}' }))
                .append($('<br>'))
                .append($('<input>', { type: 'checkbox', id: '20' }))
                .append($('<label>', { for: '20', class: 'mylabel', html: '{{LOW_HUMIDITY_TIME}}' }));
        }

        if (humBoxes.children().length > 0) {
            let humBlock = $('<div>', { class: 'my-unit' })
                .append($('<div>', { class: 'my-title', text: '{{LOW_HUMIDITY_TIME}}' }))
                .append(humBoxes);
            group++;
            rows[row].append($('<div>', { class: 'col-md-3' }).append(humBlock));
        }

        // pressure
        let pressBlock = $('<div>', { class: 'my-unit' })
            .append($('<div>', { class: 'my-title', text: '{{PRESSURE}}' }))
            .append($('<div>'))
            .append($('<input>', { type: 'checkbox', id: '10' }))
            .append($('<label>', { for: '10', class: 'mylabel', html: '{{HIGH_PRESSURE}}' }))
            .append($('<br>'))
            .append($('<input>', { type: 'checkbox', id: '11' }))
            .append($('<label>', { for: '11', class: 'mylabel', html: '{{HIGH_PRESSURE_TIME}}' }))
            .append($('<br>'))
            .append($('<input>', { type: 'checkbox', id: '8' }))
            .append($('<label>', { for: '8', class: 'mylabel', html: '{{LOW_PRESSURE}}' }))
            .append($('<br>'))
            .append($('<input>', { type: 'checkbox', id: '9' }))
            .append($('<label>', { for: '9', class: 'mylabel', html: '{{LOW_PRESSURE_TIME}}' }));

        group++;
        rows[row].append($('<div>', { class: 'col-md-3' }).append(pressBlock));

        // wind data
        let windBlock = $('<div>', { class: 'my-unit' })
            .append($('<div>', { class: 'my-title', text: '{{WIND}}' }))
            .append($('<div>'))
            .append($('<input>', { type: 'checkbox', id: '1' }))
            .append($('<label>', { for: '1', class: 'mylabel', html: '{{HIGH_GUST_SPEED}}' }))
            .append($('<br>'))
            .append($('<input>', { type: 'checkbox', id: '3' }))
            .append($('<label>', { for: '3', class: 'mylabel', html: '{{HIGH_GUST_TIME}}' }))
            .append($('<br>'))
            .append($('<input>', { type: 'checkbox', id: '2' }))
            .append($('<label>', { for: '2', class: 'mylabel', html: '{{HIGH_GUST_BEARING}}' }))
            .append($('<br>'))
            .append($('<input>', { type: 'checkbox', id: '17' }))
            .append($('<label>', { for: '17', class: 'mylabel', html: '{{HIGH_WIND_SPEED}}' }))
            .append($('<br>'))
            .append($('<input>', { type: 'checkbox', id: '18' }))
            .append($('<label>', { for: '18', class: 'mylabel', html: '{{HIGH_WIND_SPEED_TIME}}' }))
            .append($('<br>'))
            .append($('<input>', { type: 'checkbox', id: '39' }))
            .append($('<label>', { for: '39', class: 'mylabel', html: '{{DOMINANT_DIRECTION}}' }))
            .append($('<br>'))
            .append($('<input>', { type: 'checkbox', id: '16' }))
            .append($('<label>', { for: '16', class: 'mylabel', html: '{{WIND_RUN}}' }));

        group++;
        rows[row].append($('<div>', { class: 'col-md-3' }).append(windBlock));

        // rainfall
        let rainBlock = $('<div>', { class: 'my-unit' })
            .append($('<div>', { class: 'my-title', text: '{{RAINFALL}}' }))
            .append($('<div>'))
            .append($('<input>', { type: 'checkbox', id: '12' }))
            .append($('<label>', { for: '12', class: 'mylabel', html: '{{HIGH_RAIN_RATE}}' }))
            .append($('<br>'))
            .append($('<input>', { type: 'checkbox', id: '13' }))
            .append($('<label>', { for: '13', class: 'mylabel', html: '{{HIGH_RAIN_RATE_TIME}}' }))
            .append($('<br>'))
            .append($('<input>', { type: 'checkbox', id: '14' }))
            .append($('<label>', { for: '14', class: 'mylabel', html: '{{DAILY_RAINFALL}}' }))
            .append($('<br>'))
            .append($('<input>', { type: 'checkbox', id: '31' }))
            .append($('<label>', { for: '31', class: 'mylabel', html: '{{HIGH_RAINFALL_1HR}}' }))
            .append($('<br>'))
            .append($('<input>', { type: 'checkbox', id: '32' }))
            .append($('<label>', { for: '32', class: 'mylabel', html: '{{HIGH_RAINFALL_1HR_TIME}}' }))
            .append($('<br>'))
            .append($('<input>', { type: 'checkbox', id: '53' }))
            .append($('<label>', { for: '53', class: 'mylabel', html: '{{HIGH_RAINFALL_24HR}}' }))
            .append($('<br>'))
            .append($('<input>', { type: 'checkbox', id: '54' }))
            .append($('<label>', { for: '54', class: 'mylabel', html: '{{HIGH_RAINFALL_24HR_TIME}}' }));

        group++;
        if (group > 4) {
            row++;
            rows[row] = $('<div>', { class: 'row top-buffer' });
            group = 1;
        }
        rows[row].append($('<div>', { class: 'col-md-3' }).append(rainBlock));

        // solar
        let solarBoxes = $('<div>');
        if (dataVisibility.solar.Solar > 0) {
            solarBoxes.append($('<input>', { type: 'checkbox', id: '42' }))
                .append($('<label>', { for: '42', class: 'mylabel', html: '{{HIGH_SOLAR_RADIATION}}' }))
                .append($('<br>'))
                .append($('<input>', { type: 'checkbox', id: '43' }))
                .append($('<label>', { for: '43', class: 'mylabel', html: '{{HIGH_SOLAR_RADIATION_TIME}}' }))
                .append($('<br>'))
                .append($('<input>', { type: 'checkbox', id: '23' }))
                .append($('<label>', { for: '23', class: 'mylabel', html: '{{EVAPOTRANSPIRATION}}' }))
                .append($('<br>'));
        }
        if (dataVisibility.solar.UV > 0) {
            solarBoxes.append($('<input>', { type: 'checkbox', id: '44' }))
                .append($('<label>', { for: '44', class: 'mylabel', html: '{{HIGH_UV_INDEX}}' }))
                .append($('<br>'))
                .append($('<input>', { type: 'checkbox', id: '45' }))
                .append($('<label>', { for: '45', class: 'mylabel', html: '{{HIGH_UV_INDEX_TIME}}' }))
                .append($('<br>'));
        }
        if (dataVisibility.solar.Sunshine > 0) {
            solarBoxes.append($('<input>', { type: 'checkbox', id: '24' }))
                .append($('<label>', { for: '24', class: 'mylabel', html: '{{SUNSHINE_HOURS}}' }));
        }

        if (solarBoxes.children().length > 0) {
            let solarBlock = $('<div>', { class: 'my-unit' })
                .append($('<div>', { class: 'my-title', text: '{{SOLAR}}' }))
                .append(solarBoxes);
            if (group > 4) {
                row++;
                rows[row] = $('<div>', { class: 'row top-buffer' });
                group = 1;
            }
            rows[row].append($('<div>', { class: 'col-md-3' }).append(solarBlock));
        }

        // derived temperatures
        if (dataVisibility.temperature.DewPoint > 0 || dataVisibility.temperature.FeelsLike > 0 || dataVisibility.temperature.HeatIndex > 0 || dataVisibility.temperature.Humidex > 0 || dataVisibility.temperature.WindChill > 0) {
            let derivedTempBlock = $('<div>', { class: 'my-unit' })
                .append($('<div>', { class: 'my-title', text: '{{DERIVED_TEMPERATURES}}' }))
                .append($('<div>'));
            if (dataVisibility.temperature.DewPoint > 0) {
                derivedTempBlock.append($('<input>', { type: 'checkbox', id: '35' }))
                    .append($('<label>', { for: '35', class: 'mylabel', html: '{{HIGH_DEW_POINT}}' }))
                    .append($('<br>'))
                    .append($('<input>', { type: 'checkbox', id: '36' }))
                    .append($('<label>', { for: '36', class: 'mylabel', html: '{{HIGH_DEW_POINT_TIME}}' }))
                    .append($('<br>'))
                    .append($('<input>', { type: 'checkbox', id: '37' }))
                    .append($('<label>', { for: '37', class: 'mylabel', html: '{{LOW_DEW_POINT}}' }))
                    .append($('<br>'))
                    .append($('<input>', { type: 'checkbox', id: '38' }))
                    .append($('<label>', { for: '38', class: 'mylabel', html: '{{LOW_DEW_POINT_TIME}}' }))
                    .append($('<br>'));
            }
            if (dataVisibility.temperature.FeelsLike > 0) {
                derivedTempBlock.append($('<input>', { type: 'checkbox', id: '46' }))
                    .append($('<label>', { for: '46', class: 'mylabel', html: '{{HIGH_FEELS_LIKE}}' }))
                    .append($('<br>'))
                    .append($('<input>', { type: 'checkbox', id: '47' }))
                    .append($('<label>', { for: '47', class: 'mylabel', html: '{{HIGH_FEELS_LIKE_TIME}}' }))
                    .append($('<br>'))
                    .append($('<input>', { type: 'checkbox', id: '48' }))
                    .append($('<label>', { for: '48', class: 'mylabel', html: '{{LOW_FEELS_LIKE}}' }))
                    .append($('<br>'))
                    .append($('<input>', { type: 'checkbox', id: '49' }))
                    .append($('<label>', { for: '49', class: 'mylabel', html: '{{LOW_FEELS_LIKE_TIME}}' }))
                    .append($('<br>'));
            }
            if (dataVisibility.temperature.HeatIndex > 0) {
                derivedTempBlock.append($('<input>', { type: 'checkbox', id: '25' }))
                    .append($('<label>', { for: '25', class: 'mylabel', html: '{{HIGH_HEAT_INDEX}}' }))
                    .append($('<br>'))
                    .append($('<input>', { type: 'checkbox', id: '26' }))
                    .append($('<label>', { for: '26', class: 'mylabel', html: '{{HIGH_HEAT_INDEX_TIME}}' }))
                    .append($('<br>'));
            }
            if (dataVisibility.temperature.Humidex > 0) {
                derivedTempBlock.append($('<input>', { type: 'checkbox', id: '50' }))
                    .append($('<label>', { for: '50', class: 'mylabel', html: '{{HIGH_HUMIDEX}}' }))
                    .append($('<br>'))
                    .append($('<input>', { type: 'checkbox', id: '51' }))
                    .append($('<label>', { for: '51', class: 'mylabel', html: '{{HIGH_HUMIDEX_TIME}}' }))
                    .append($('<br>'));
            }
            if (dataVisibility.temperature.WindChill > 0) {
                derivedTempBlock.append($('<input>', { type: 'checkbox', id: '33' }))
                    .append($('<label>', { for: '3', class: 'mylabel', html: '{{LOW_WIND_CHILL}}' }))
                    .append($('<br>'))
                    .append($('<input>', { type: 'checkbox', id: '34' }))
                    .append($('<label>', { for: '34', class: 'mylabel', html: '{{LOW_WIND_CHILL_TIME}}' }))
                    .append($('<br>'));
            }
            if (dataVisibility.temperature.AppTemp > 0) {
                derivedTempBlock.append($('<input>', { type: 'checkbox', id: '27' }))
                    .append($('<label>', { for: '27', class: 'mylabel', html: '{{HIGH_APPARENT_TEMPERATURE}}' }))
                    .append($('<br>'))
                    .append($('<input>', { type: 'checkbox', id: '28' }))
                    .append($('<label>', { for: '28', class: 'mylabel', html: '{{HIGH_APPARENT_TEMPERATURE_TIME}}' }))
                    .append($('<br>'))
                    .append($('<input>', { type: 'checkbox', id: '29' }))
                    .append($('<label>', { for: '29', class: 'mylabel', html: '{{LOW_APPARENT_TEMPERATURE}}' }))
                    .append($('<br>'))
                    .append($('<input>', { type: 'checkbox', id: '30' }))
                    .append($('<label>', { for: '30', class: 'mylabel', html: '{{LOW_APPARENT_TEMPERATURE_TIME}}' }))
            }

            group++;
            if (group > 4) {
                row++;
                rows[row] = $('<div>', { class: 'row top-buffer' });
                group = 1;
            }
            rows[row].append($('<div>', { class: 'col-md-3' }).append(derivedTempBlock));
        }

        // degree days
        let degreeDayBlock = $('<div>', { class: 'my-unit' })
            .append($('<div>', { class: 'my-title', text: '{{DEGREE_DAYS}}' }))
            .append($('<div>'))
            .append($('<input>', { type: 'checkbox', id: '40' }))
            .append($('<label>', { for: '40', class: 'mylabel', html: '{{HEATING_DEGREE_DAYS}}' }))
            .append($('<br>'))
            .append($('<input>', { type: 'checkbox', id: '41' }))
            .append($('<label>', { for: '41', class: 'mylabel', html: '{{COOLING_DEGREE_DAYS}}' }));

        if (group > 4) {
            row++;
            rows[row] = $('<div>', { class: 'row top-buffer' });
            group = 1;
        }
        rows[row].append($('<div>', { class: 'col-md-3' }).append(degreeDayBlock));


        $('#container').append(rows);
        // Phew!
    });


    var fromDate, toDate;
    var now = new Date();
    now.setHours(0, 0, 0, 0);

    $.ajax({
        url: '/api/tags/process.txt',
        dataType: 'json',
        method: 'POST',
        data: '{"rollovertime":"<#rollovertime>","began":"<#recordsbegandate format="yyyy/MM/dd">"}',
    })
    .done(function (result) {
        switch (result.rollovertime) {
            case 'midnight':
                // do nothing
                break;
            case '9 am':
                if (now.getHours() < 9) {
                    now.setDate(now.getDate() - 1);
                }
                break;
            case '10 am':
                if (now.getHours() < 10) {
                    now.setDate(now.getDate() - 1);
                }
                break;
            default:
            // do nothing
        }

        now.setDate(now.getDate() - 1);

        var start = new Date(result.began)

        fromDate = $('#dateFrom').datepicker({
            dateFormat: 'yy-mm-dd',
            minDate: start,
            maxDate: '0d',
            firstDay: 1,
            yearRange: start.getFullYear() + ':' + now.getFullYear(),
            changeMonth: true,
            changeYear: true,
        }).val(formatUserDateStr(now))
            .on('change', function () {
                var date = fromDate.datepicker('getDate');
                if (toDate.datepicker('getDate') < date) {
                    toDate.datepicker('setDate', date);
                }
                toDate.datepicker('option', { minDate: date });
            });

        toDate = $('#dateTo').datepicker({
            dateFormat: 'yy-mm-dd',
            minDate: start,
            maxDate: '0d',
            firstDay: 1,
            yearRange: start.getFullYear() + ':' + now.getFullYear(),
            changeMonth: true,
            changeYear: true,
        }).val(formatUserDateStr(now))
            .on('change', function () {
                var date = fromDate.datepicker('getDate');
                if (toDate.datepicker('getDate') < date) {
                    toDate.datepicker('setDate', date);
                }
                toDate.datepicker('option', { minDate: date });
            });

        fromDate.datepicker('setDate', now);
        toDate.datepicker('setDate', now);
    });
});



function makeTable(D) {
    var a = '';
    a += '<table><thead><tr>';

    for (j = 0; j < D[0].length; j++) {
        a += '<th>' + D[0][j] + '</th>';
    }
    a += '</tr></thead><tbody>';

    for (i = 1; i < D.length; i++) {
        a += '<tr>';
        for (j = 0; j < D[i].length; j++) {
            a += '<td>' + D[i][j] + '</td>';
        }
        a += '</tr>';
    }

    a += '</tbody></table>';
    return a;
}

function convertToCSV(arr, html) {
    var csv = '';
    arr.forEach(function(row) {
        csv += row.join(',') + (html ? '<br>' : "\n");
    });
    return csv;
}

function capitalizeFirstLetters(string) {
    return string.replace(/\b\w/g, c => c.toUpperCase());
}

function showData() {
    var url = createQuery();
    if (url == '') {
        alert('{{NO_DATATYPES_SELECTED}}');
    } else {
        $.ajax({
            url: url,
            dataType: 'json'
        })
        .done(function (result) {
            createDataPage(result);
        })
        .fail(function (result) {
            console.log(result);
        });
    }
}

function downloadData() {
    var url = createQuery();
    if (url == '') {
        alert('{{NO_DATATYPES_SELECTED}}');
    } else {
        $.ajax({
            url: url,
            dataType: 'json'
        })
        .done(function (result) {
            createDownloadData(result);
        })
        .fail(function (result) {
            console.log(result);
        });
    }
}

function createQuery() {
    let valid = false;
    let url = '/api/data/dailydata.json?';
    let startDate = $('#dateFrom').datepicker('getDate').getTime() / 1000;
    let endDate = $('#dateTo').datepicker('getDate').getTime() / 1000;

    url += 'from=' + Math.floor(startDate) + '&to=' + Math.floor(endDate);

    url += '&data='
    $('input[type="checkbox"]').each(function () {
        if ($(this).is(':checked')) {
            url += $(this).attr('id') + ',';
            valid = true;
        }
    });
    return valid ? url.slice(0, -1) : '';
}

function formatUserDateStr(inDate) {
    return addLeadingZeros(inDate.getDate()) + '-' + addLeadingZeros(inDate.getMonth() + 1) + '-' + inDate.getFullYear();
}

function addLeadingZeros(n) {
    return n <= 9 ? '0' + n : n;
}

function createDataPage(result) {
    let format = $('#format').val();
    let width = Math.min(screen.width, 600);
    let height = Math.min(screen.height, 800);
    let w = window.open('', 'DailyData', 'status=no,location=no,toolbar=no,menubar=no,width=' + width + ',height=' + height);
    let html = '';
    if (format == 'CSV') {
        html = '<html><head><title>{{DAILY_DATA_VIEWER}}</title></head>';
        html += '<body>' + convertToCSV(result, true) + '</body></html>';
    } else {
        html = '<html><head><title>{{DAILY_DATA_VIEWER}}</title><style>table{border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:center;}th{background-color:#f2f2f2;color:black;}tr:nth-child(even){background-color:#f9f9f9;}tr:hover{background-color:#ddd;}td{white-space:nowrap;}</style></head>';
        html += '<body>' + makeTable(result) + '</body></html>';
    }
    w.document.open().write(html);
    w.focus();
}

function createDownloadData(result) {
    csv = 'data:text/csv;charset=utf-8,' + convertToCSV(result, false);
    excel = encodeURI(csv);
    link = document.createElement('a');
    link.setAttribute('href', excel);
    link.setAttribute('download', 'dailydata.csv');
    link.click();
}
