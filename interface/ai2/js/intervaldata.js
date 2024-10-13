// Created: 2021/01/21 17:10:29
// Last modified: 2024/09/24 15:30:39


var fromDate, toDate;

$(document).ready(function () {

    // get the display options so we know which checkboxes to show
    const visibility = $.ajax({ url: '/api/settings/displayoptions.json', dataType: 'json' });

    // get the extra sensor names
    const names = $.ajax({ url: '/api/settings/langdata.json', dataType: 'json' });

    Promise.all([visibility, names])
        .then(function (results) {
            const dataVisibility = results[0].DataVisibility;
            const localeStrings = results[1];

            // construct the checkboxes
            // the checkbox id's are the field offset in the monthly log file - add 1000 to fields if they are in the extra log file
            // No need to compute rows - flexbox deals with it.
            cards = $('<div>', { class: 'ow-fourCol' });

            // temperature Data
            let tempBoxes = $('<div>');

            if (dataVisibility.temperature.Temp > 0) {
                tempBoxes.append($('<input>', { type: 'checkbox', id: '2' }))
                    .append($('<label>', { for: '2', class: 'mylabel', html: 'Temperature' }))
                    .append($('<br>'));
            }
            if (dataVisibility.temperature.DewPoint > 0) {
                tempBoxes.append($('<input>', { type: 'checkbox', id: '4' }))
                    .append($('<label>', { for: '4', class: 'mylabel', html: 'Dewpoint' }))
                    .append($('<br>'));
            }

            if (dataVisibility.temperature.FeelsLike > 0) {
                tempBoxes.append($('<input>', { type: 'checkbox', id: '27' }))
                    .append($('<label>', { for: '27', class: 'mylabel', html: 'Feels Like' }))
                    .append($('<br>'));
            }
            if (dataVisibility.temperature.HeatIndex > 0) {
                tempBoxes.append($('<input>', { type: 'checkbox', id: '16' }))
                    .append($('<label>', { for: '16', class: 'mylabel', html: 'Heat Index' }))
                    .append($('<br>'));
            }

            if (dataVisibility.temperature.Humidex > 0) {
                tempBoxes.append($('<input>', { type: 'checkbox', id: '28' }))
                    .append($('<label>', { for: '28', class: 'mylabel', html: 'Humidex' }))
                    .append($('<br>'));
            }

            if (dataVisibility.temperature.WindChill > 0) {
                tempBoxes.append($('<input>', { type: 'checkbox', id: '15' }))
                    .append($('<label>', { for: '15', class: 'mylabel', html: 'Wind Chill' }))
                    .append($('<br>'));
            }
            if (dataVisibility.temperature.AppTemp > 0) {
                tempBoxes.append($('<input>', { type: 'checkbox', id: '21' }))
                    .append($('<label>', { for: '21', class: 'mylabel', html: 'Apparent' }))
                    .append($('<br>'));
            }
            if (dataVisibility.temperature.InTemp > 0) {
                tempBoxes.append($('<input>', { type: 'checkbox', id: '12' }))
                    .append($('<label>', { for: '12', class: 'mylabel', html: 'Inside Temperature' }))
            }

            if (tempBoxes.children().length > 0) {
                let tempBlock = $('<div>', { class: 'my-unit' })
                    .append($('<div>', { class: 'ow-titleBar', html: '<h4>Temperature</h4>' }))
                    .append(tempBoxes);
                cards.append($('<div>', { class: 'ow-card' }).append(tempBlock));
            }

            // humidity Data
            let humBoxes = $('<div>');

            if (dataVisibility.humidity.Hum > 0) {
                humBoxes.append($('<input>', { type: 'checkbox', id: '3' }))
                    .append($('<label>', { for: '3', class: 'mylabel', html: 'Humidity' }))
                    .append($('<br>'));
            }
            if (dataVisibility.humidity.InHum > 0) {
                humBoxes.append($('<input>', { type: 'checkbox', id: '13' }))
                    .append($('<label>', { for: '13', class: 'mylabel', html: 'Inside Humidity' }))
                    .append($('<br>'));
            }

            if (humBoxes.children().length > 0) {
                let humBlock = $('<div>', { class: 'my-unit' })
                    .append($('<div>', { class: 'ow-titleBar', html: '<h4>Humidity</h4>' }))
                    .append(humBoxes);
                cards.append($('<div>', {class: 'ow-card'}).append(humBlock));
            }

            // pressure
            let pressBlock = $('<div>', { class: 'my-unit' })
                .append($('<div>', { class: 'ow-titleBar', html: '<h4>Atmospheric Pressure</h4>' }))
                .append($('<div>'))
                .append($('<input>', { type: 'checkbox', id: '10' }))
                .append($('<label>', { for: '10', class: 'mylabel', html: 'Sea Level Pressure' }))
            cards.append($('<div>', { class: 'ow-card' }).append(pressBlock));

            // wind data
            let windBlock = $('<div>', { class: 'my-unit' })
                .append($('<div>', { class: 'ow-titleBar', html: '<h4>Wind</h4>' }))
                .append($('<div>'))
                .append($('<input>', { type: 'checkbox', id: '5' }))
                .append($('<label>', { for: '5', class: 'mylabel', html: 'Wind Speed' }))
                .append($('<br>'))
                .append($('<input>', { type: 'checkbox', id: '6' }))
                .append($('<label>', { for: '6', class: 'mylabel', html: 'Wind Gust' }))
                .append($('<br>'))
                .append($('<input>', { type: 'checkbox', id: '7' }))
                .append($('<label>', { for: '7', class: 'mylabel', html: 'Wind Direction' }));
            cards.append($('<div>', { class: 'ow-card'}).append(windBlock));

            // rainfall
            let rainBlock = $('<div>', { class: 'my-unit' })
                .append($('<div>', { class: 'ow-titleBar', html: '<h4>Rainfall</h4>' }))
                .append($('<div>'))
                .append($('<input>', { type: 'checkbox', id: '9' }))
                .append($('<label>', { for: '9', class: 'mylabel', html: 'Rainfall' }))
                .append($('<br>'))
                .append($('<input>', { type: 'checkbox', id: '8' }))
                .append($('<label>', { for: '8', class: 'mylabel', html: 'Rainfall Rate' }));
            cards.append($('<div>', { class: 'ow-card'}).append(rainBlock));

            // solar
            let solarBoxes = $('<div>');
            if (dataVisibility.solar.Solar > 0) {
                solarBoxes.append($('<input>', { type: 'checkbox', id: '18' }))
                    .append($('<label>', { for: '18', class: 'mylabel', html: 'Solar Radiation' }))
                    .append($('<br>'));
            }
            if (dataVisibility.solar.UV > 0) {
                solarBoxes.append($('<input>', { type: 'checkbox', id: '17' }))
                    .append($('<label>', { for: '17', class: 'mylabel', html: 'UV Index' }))
                    .append($('<br>'));
            }
            if (dataVisibility.solar.Sunshine > 0) {
                solarBoxes.append($('<input>', { type: 'checkbox', id: '23' }))
                    .append($('<label>', { for: '23', class: 'mylabel', html: 'Sunshine Hours' }));
            }

            if (solarBoxes.children().length > 0) {
                let solarBlock = $('<div>', { class: 'my-unit' })
                    .append($('<div>', { class: 'ow-titleBar', html: '<h4>Solar</h4>' }))
                    .append(solarBoxes);
                cards.append($('<div>', { class: 'ow-card'}).append(solarBlock));
            }

            // values from the Extras file have 1000 added to the field offset

            // extra temperature
            let extraTempBoxes = $('<div>');

            for (var i = 0; i < 10; i++) {
                if (dataVisibility.extratemp.sensors[i] > 0) {
                    extraTempBoxes.append($('<input>', { type: 'checkbox', id: 1000 + i + 2 }))
                        .append($('<label>', { for: 1000 + i + 2, class: 'mylabel', html: localeStrings.extraTemp[i] || 'Sensor ' + (i + 1) }))
                        .append($('<br>'));
                }
            }

            if (extraTempBoxes.children().length > 0) {
                let extraTempBlock = $('<div>', { class: 'my-unit' })
                    .append($('<div>', { class: 'ow-titleBar', html: '<h4>Extra Temperature</h4>' }))
                    .append(extraTempBoxes);
                cards.append($('<div>', { class: 'ow-card'}).append(extraTempBlock));
            }

            // extra humidity
            let extraHumBoxes = $('<div>');

            for (var i = 0; i < 10; i++) {
                if (dataVisibility.extrahum.sensors[i] > 0) {
                    extraHumBoxes.append($('<input>', { type: 'checkbox', id: 1000 + i + 12 }))
                        .append($('<label>', { for: 1000 + i + 12, class: 'mylabel', html: localeStrings.extraHum[i] || 'Sensor ' + (i + 1) }))
                        .append($('<br>'));
                }
            }

            if (extraHumBoxes.children().length > 0) {
                let extraHumBlock = $('<div>', { class: 'my-unit' })
                    .append($('<div>', { class: 'ow-titleBar', html: '<h4>Extra Humidity</h4>' }))
                    .append(extraHumBoxes);
                cards.append($('<div>', {class: 'ow-card'}).append(extraHumBlock));
            }

            // extra dewpoint
            let extraDewBoxes = $('<div>');

            for (var i = 0; i < 10; i++) {
                if (dataVisibility.extradew.sensors[i] > 0) {
                    extraDewBoxes.append($('<input>', { type: 'checkbox', id: 1000 + i + 22 }))
                        .append($('<label>', { for: 1000 + i + 22, class: 'mylabel', html: localeStrings.extraDP[i] || 'Sensor ' + (i + 1) }))
                        .append($('<br>'));
                }
            }

            if (extraDewBoxes.children().length > 0) {
                let extraDewBlock = $('<div>', { class: 'my-unit' })
                    .append($('<div>', { class: 'ow-titleBar', html: '<h4>Extra Dewpoint</h4>' }))
                    .append(extraDewBoxes);
                cards.append($('<div>', {class: 'ow-card'}).append(extraDewBlock));
            }

            // soil temp
            let soilTempBoxes = $('<div>');

            for (var i = 0; i < 4; i++) {
                if (dataVisibility.soiltemp.sensors[i] > 0) {
                    soilTempBoxes.append($('<input>', { type: 'checkbox', id: 1000 + i + 32 }))
                        .append($('<label>', { for: 1000 + i + 32, class: 'mylabel', html: localeStrings.soilTemp[i] || 'Sensor ' + (i + 1) }))
                        .append($('<br>'));
                }
            }
            for (var i = 4; i < 16; i++) {
                if (dataVisibility.soiltemp.sensors[i] > 0) {
                    soilTempBoxes.append($('<input>', { type: 'checkbox', id: 1000 + i - 4 + 44 }))
                        .append($('<label>', { for: 1000 + i - 4 + 44, class: 'mylabel', html: localeStrings.soilTemp[i] || 'Sensor ' + (i + 1) }))
                        .append($('<br>'));
                }
            }

            if (soilTempBoxes.children().length > 0) {
                let soilTempBlock = $('<div>', { class: 'my-unit' })
                    .append($('<div>', { class: 'ow-titleBar', html: '<h4>Soil Temperature</h4>' }))
                    .append(soilTempBoxes);
                cards.append($('<div>', { class: 'ow-card'}).append(soilTempBlock));
            }

            // soil moisture
            let soilMoistBoxes = $('<div>');

            for (var i = 0; i < 4; i++) {
                if (dataVisibility.soilmoist.sensors[i] > 0) {
                    soilMoistBoxes.append($('<input>', { type: 'checkbox', id: 1000 + i + 36 }))
                        .append($('<label>', { for: 1000 + i + 36, class: 'mylabel', html: localeStrings.soilMoist[i] || 'Sensor ' + (i + 1) }))
                        .append($('<br>'));
                }
            }
            for (var i = 4; i < 16; i++) {
                if (dataVisibility.soilmoist.sensors[i] > 0) {
                    soilMoistBoxes.append($('<input>', { type: 'checkbox', id: 1000 + i - 4 + 56 }))
                        // no locale strings above 4 atm
                        .append($('<label>', { for: 1000 + i - 4 + 56, class: 'mylabel', html: 'Sensor ' + (i + 1) }))
                        .append($('<br>'));
                }
            }

            if (soilMoistBoxes.children().length > 0) {
                let soilMoistBlock = $('<div>', { class: 'my-unit' })
                    .append($('<div>', { class: 'ow-titleBar', html: '<h4>Soil Moisture</h4>' }))
                    .append(soilMoistBoxes);
                cards.append($('<div>', {class: 'ow-card'}).append(soilMoistBlock));
            }

            // leaf wetness
            let leafWetBoxes = $('<div>');

            for (var i = 0; i < 2; i++) {
                if (dataVisibility.leafwet.sensors[i] > 0) {
                    leafWetBoxes.append($('<input>', { type: 'checkbox', id: 1000 + i + 42 }))
                        .append($('<label>', { for: 1000 + i + 42, class: 'mylabel', html: localeStrings.leafWet[i] || 'Sensor ' + (i + 1) }))
                        .append($('<br>'));
                }
            }

            if (leafWetBoxes.children().length > 0) {
                let leafwetBlock = $('<div>', { class: 'my-unit' })
                    .append($('<div>', { class: 'ow-titleBar', html: '<h4>Leaf Wetness</h4>' }))
                    .append(leafWetBoxes);
                cards.append($('<div>', { class: 'ow-card'}).append(leafwetBlock));
            }

            // user temperature
            let userTempBoxes = $('<div>');

            for (var i = 0; i < 8; i++) {
                if (dataVisibility.usertemp.sensors[i] > 0) {
                    userTempBoxes.append($('<input>', { type: 'checkbox', id: 1000 + i + 76 }))
                        .append($('<label>', { for: 1000 + i + 76, class: 'mylabel', html: localeStrings.userTemp[i] || 'Sensor ' + (i + 1) }))
                        .append($('<br>'));
                }
            }

            if (userTempBoxes.children().length > 0) {
                let usertempBlock = $('<div>', { class: 'my-unit' })
                    .append($('<div>', { class: 'ow-titleBar', html: '<h4>User Temperature</h4>' }))
                    .append(userTempBoxes);
                cards.append($('<div>', { class: 'ow-card'}).append(usertempBlock));
            }

            // air quality
            let aqSensors = $('<div>)');

            for (var i = 0; i < 4; i++) {
                let aqBoxes = $('<div>');

                if (dataVisibility.aq.sensors[i].pm > 0) {
                    aqBoxes.append($('<input>', { type: 'checkbox', id: 1000 + i + 68 }))
                        .append($('<label>', { for: 1000 + i + 68, class: 'mylabel', html: 'PM' }))
                        .append($('<br>'));
                }
                if (dataVisibility.aq.sensors[i].pmavg > 0) {
                    aqBoxes.append($('<input>', { type: 'checkbox', id: 1000 + i + 72 }))
                        .append($('<label>', { for: 1000 + i + 72, class: 'mylabel', html: 'PM Avg' }))
                }
                if (aqBoxes.children().length > 0) {
                    aqSensors.append($('<span>', { class: 'dtitle', text: localeStrings.airQuality.sensor[i] || 'Sensor ' + (1 + i) }))
                        .append(aqBoxes);
                }
            }

            if (aqSensors.children().length > 0) {
                let aqBlock = $('<div>', { class: 'my-unit' })
                    .append($('<div>', { class: 'ow-titleBar', html: '<h4>Air Quality</h4>' }))
                    .append(aqSensors);
                cards.append($('<div>', { class: 'ow-card'}).append(aqBlock));
            }

            // co2
            let co2Boxes = $('<div>');

            if (dataVisibility.co2.co2 > 0) {
                co2Boxes.append($('<input>', { type: 'checkbox', id: '1084' }))
                    .append($('<label>', { for: '1084', class: 'mylabel', html: 'CO₂' }))
                    .append($('<br>'));
            }
            if (dataVisibility.co2.co2avg > 0) {
                co2Boxes.append($('<input>', { type: 'checkbox', id: '1085' }))
                    .append($('<label>', { for: '1085', class: 'mylabel', html: 'CO₂ Avg' }))
                    .append($('<br>'));
            }
            if (dataVisibility.co2.pm25 > 0) {
                co2Boxes.append($('<input>', { type: 'checkbox', id: '1086' }))
                    .append($('<label>', { for: '1086', class: 'mylabel', html: 'PM 2.5' }))
                    .append($('<br>'));
            }
            if (dataVisibility.co2.pm25avg > 0) {
                co2Boxes.append($('<input>', { type: 'checkbox', id: '1087' }))
                    .append($('<label>', { for: '1087', class: 'mylabel', html: 'PM 2.5 Avg' }))
                    .append($('<br>'));
            }
            if (dataVisibility.co2.pm10 > 0) {
                co2Boxes.append($('<input>', { type: 'checkbox', id: '1088' }))
                    .append($('<label>', { for: '1088', class: 'mylabel', html: 'PM 10' }))
                    .append($('<br>'));
            }
            if (dataVisibility.co2.pm10avg > 0) {
                co2Boxes.append($('<input>', { type: 'checkbox', id: '1089' }))
                    .append($('<label>', { for: '1089', class: 'mylabel', html: 'PM 10 Avg' }))
                    .append($('<br>'));
            }
            if (dataVisibility.co2.temp > 0) {
                co2Boxes.append($('<input>', { type: 'checkbox', id: '1090' }))
                    .append($('<label>', { for: '1090', class: 'mylabel', html: 'Temperature' }))
                    .append($('<br>'));
            }
            if (dataVisibility.co2.hum > 0) {
                co2Boxes.append($('<input>', { type: 'checkbox', id: '1091' }))
                    .append($('<label>', { for: '1091', class: 'mylabel', html: 'Humidity' }));
            }

            if (co2Boxes.children().length > 0) {
                let co2Block = $('<div>', { class: 'my-unit' })
                    .append($('<div>', { class: 'ow-titleBar', html: '<h4>CO₂</h4>' }))
                    .append(co2Boxes);
                cards.append($('<div>', { class: 'ow-card'}).append(co2Block));
            }

            $('#container').append(cards);
            // Phew!
        });


    $.datetimepicker.setDateFormatter('moment');

    var now = new Date();
    now.setHours(0, 0, 0, 0);

    $.ajax({
        url: '/api/tags/process.txt',
        dataType: 'text',
        method: 'POST',
        data: '<#recordsbegandate format="yyyy/MM/dd">',
        contentType: 'text/plain'
    })
    .done(function (startDate) {
        let startYear = startDate.substring(0, 4);

        fromDate = $('#dateFrom').datetimepicker({
            format: 'YYYY-MM-DD HH:mm',
            formatTime: 'HH:mm',
            maxDate: 0,
            minDate: startDate,
            yearStart: startYear,
            yearEnd: now.getFullYear(),
            onShow: function (ct) {
                var dat =  $('#dateTo').datetimepicker('getValue');
                var maxDat = dat.getFullYear() + '/' + (dat.getMonth() + 1) + '/' + dat[1] + dat.getDate();
                this.setOptions({
                    maxDate: $('#dateTo').val() ? maxDat : 0
                })
            },
            onChangeDateTime: function (ct, $i) {
                var dat =  this.getValue();
                var minDat = dat.getFullYear() + '/' + (dat.getMonth() + 1) + '/' + dat.getDate();
                toDate.datetimepicker('setOptions', { minDate: minDat });
            }

        });

        toDate = $('#dateTo').datetimepicker({
            format: 'YYYY-MM-DD HH:mm',
            formatTime: 'HH:mm',
            maxDate: 0,
            minDate: startDate,
            yearStart: startYear,
            yearEnd: now.getFullYear(),
            onShow: function (ct) {
                var dat =  $('#dateFrom').datetimepicker('getValue');
                var minDat = dat.getFullYear() + '/' + (dat.getMonth() + 1) + '/' + dat[1] + dat.getDate();
                this.setOptions({
                    minDate: $('#dateFrom').val() ? minDat : false
                })
            },
            onChangeDateTime: function (ct, $i) {
                var dat =  this.getValue();
                var maxDat = dat.getFullYear() + '/' + (dat.getMonth() + 1) + '/' + dat.getDate();
                fromDate.datetimepicker('setOptions', { maxDate: maxDat });
            }
        });

        now = roundMinutes(new Date());
        toDate.datetimepicker('setOptions', {value: formatUserDateStr(now)});
        now.setHours(now.getHours() - 1);
        fromDate.datetimepicker('setOptions', {value: formatUserDateStr(now)});
    });
});


function makeTable(D) {
    var a = '';
    a += '<table class="w3-table"><thead><tr>';

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
    var errMsg = '';
    if (url == '') {
        errMsg = 'No data types selected!';
    }

    if (fromDate.datetimepicker('getValue').getTime() > toDate.datetimepicker('getValue').getTime()) {
        errMsg += errMsg == '' ? '' : '\n';
        errMsg += "Start date/time cannot be after end date/time!";
    }

    if (errMsg != '') {
        alert(errMsg);
    } else {
        $.ajax({
            url: url,
            dataType: 'json',
            success: function (result) {
                createDataPage(result);
            },
            error: function (result) {
                console.log(result);
            }
        });
    }
}

function downloadData() {
    var url = createQuery();
    if (url == '') {
        alert('No data types selected!');
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

function formatDateStr(inDate) {
    return '' + inDate.getFullYear() + '-' + (inDate.getMonth() + 1) + '-' + (inDate.getDate());
}

function formatUserDateStr(inDate) {
    return '' + inDate.getFullYear() + '-' + addLeadingZeros(inDate.getMonth() + 1) + '-' + addLeadingZeros(inDate.getDate()) + ' ' + addLeadingZeros(inDate.getHours()) + ':' + addLeadingZeros(inDate.getMinutes());
}

function addLeadingZeros(n) {
    return n <= 9 ? '0' + n : n;
}

function roundMinutes(date) {
    date.setHours(date.getHours() + Math.round(date.getMinutes()/60));
    date.setMinutes(0, 0, 0); // Resets also seconds and milliseconds
    return date;
}

function createQuery() {
    let valid = false;
    let url = '/api/data/intervaldata.json?';

    url += 'from=' + Math.floor(fromDate.datetimepicker('getValue').getTime() / 1000) + '&to=' + Math.floor(toDate.datetimepicker('getValue').getTime() / 1000);

    url += '&data='
    $("input[type='checkbox']").each(function () {
        if ($(this).is(':checked')) {
            url += $(this).attr('id') + ',';
            valid = true;
        }
    });
    return valid ? url.slice(0, -1) : '';
}

function createDataPage(result) {
    let format = $('#format').val();
    let width = Math.min(screen.width, 600);
    let height = Math.min(screen.height, 800);
    let w = window.open('', 'IntervalData', 'status=no,location=no,toolbar=no,menubar=no,width=' + width + ',height=' + height);
    let html = '<!DOCTYPE html><html><head><title>Interval Data Viewer</title></head>';
    html += '<link rel="stylesheet" href="css/w3Pro+.css"><link rel="stylesheet" href="themes/Grey.css">';
    html += '<link rel="stylesheet" href="css/main.css"></head>';
    html += '<body><div class="ow-titleBar ow-theme" style="margin-bottom:1em; padding: 0 1em; border-bottom: 3px solid #f00;" >';
	html += '<div><img src="img/Interface-Logo.png" alt="CMX Logo" id="siteLogo" class="w3-image"></div>';
	html += '<div><h3>Daily Data Viewer</h3></div></div>';
    if (format == 'CSV') {
        html += '<div class="ow-container">' + convertToCSV(result, true) + '</div></body></html>';
    } else {
        html += '<div class="ow-container">' + makeTable(result) + '</div></body></html>';
    }
    w.document.open().write(html);
    w.focus();
}

function createDownloadData(result) {
    csv = 'data:text/csv;charset=utf-8,' + convertToCSV(result, false);
    excel = encodeURI(csv);
    link = document.createElement('a');
    link.setAttribute('href', excel);
    link.setAttribute('download', 'intervaldata.csv');
    link.click();
}
