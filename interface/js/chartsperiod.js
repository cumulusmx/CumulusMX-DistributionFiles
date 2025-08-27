// Created: 2023/09/22 19:07:25
// Last modified: 2025/08/27 22:12:03

var chart, avail, config, options;
var cache = {};
var settings = {
    series: [],
    colours: [],
    fromDate: "",
    toDate: ""
}

var freezing;
var txtSelect = '{{SELECT_SERIES}}';
var txtClear = '{{CLEAR_SERIES}}';

var myRanges = {
    buttons: [{
        count: 1,
        type: 'day',
        text: '{{TIME_1D}}'
    }, {
        count: 7,
        type: 'day',
        text: '{{TIME_7D}}'
    }, {
        count: 28,
        type: 'day',
        text: '{{TIME_28D}}'
    }, {
        type: 'all',
        text: 'All',
        title: '{{ALL}}'
    }],
    inputEnabled: true,
    selected: 3,
    allButtonsEnabled: false
};

var compassP = function (deg) {
    var a = ['{{COMPASS_N}}', '{{COMPASS_NE}}', '{{COMPASS_E}}', '{{COMPASS_SE}}', '{{COMPASS_S}}', '{{COMPASS_SW}}', '{{COMPASS_W}}', '{{COMPASS_NW}}'];
    return a[Math.floor((deg + 22.5) / 45) % 8];
};

var fromDate, toDate;
var now = new Date();
now.setHours(0,0,0,0);
var then = new Date(now.setMonth(now.getMonth() - 1));

$(document).ready(function () {
    $.ajax({url: '/api/info/version.json', dataType: 'json', success: function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    }});

    fromDate = $('#dateFrom').datepicker({
        dateFormat: 'dd-mm-yy',
        maxDate: '0d',
        firstDay: 1,
        changeMonth: true,
        changeYear: true,
    }).val(formatUserDateStr(now))
    .on('change', function() {
        var date = fromDate.datepicker('getDate');
        settings.fromDate = formatDateStr(date);

        if (toDate.datepicker('getDate') < date) {
            toDate.datepicker('setDate', date);
            settings.toDate = formatDateStr(date);
        }

        toDate.datepicker('option', { minDate: date });
        storeSettings();
    });

    toDate = $('#dateTo').datepicker({
            dateFormat: 'dd-mm-yy',
            maxDate: '0d',
            firstDay: 1,
            changeMonth: true,
            changeYear: true,
        }).val(formatUserDateStr(now))
        .on('change', function() {
            var date = toDate.datepicker('getDate');
            settings.toDate = formatDateStr(date);

            if (fromDate.datepicker('getDate') < date) {
                fromDate.datepicker('setDate', date);
                settings.fromDate = formatDateStr(date);
            }

            storeSettings();
        });

    $.ajax({
        url: '/api/info/dateformat.txt',
        dataType: 'text',
        success: function (result) {
            // we want all lower case and yy for the year not yyyy
            var format = result.toLowerCase().replace('yyyy','yy');
            fromDate.datepicker('option', 'dateFormat', format);
            toDate.datepicker('option', 'dateFormat', format);
        }
    });

    // get all the required config data before we start using it
    const availRes = $.ajax({ url: '/api/graphdata/availabledata.json', dataType: 'json' });
    const settingsRes = $.ajax({ url: '/api/graphdata/selectaperiod.json', dataType: 'json' });
    const configRes = $.ajax({ url: '/api/graphdata/graphconfig.json', dataType: 'json' });

    Promise.all([availRes, settingsRes, configRes])
    .then(function (results) {
        avail = results[0];
        settings = results[1];
        config = results[2];

        Highcharts.setOptions({
            time: {
                timezone: config.tz,
                useUTC: false
            },
            chart: {
                style: {
                    fontSize: '1.5rem'
                }
            }
        });

        // add the default select option
        var option = $('<option />');
        option.html(txtSelect);
        option.val(0);
        $('#data0').append(option.clone());
        $('#data1').append(option.clone());
        $('#data2').append(option.clone());
        $('#data3').append(option.clone());
        $('#data4').append(option.clone());
        $('#data5').append(option);

        toDate.datepicker('setDate', settings.toDate ? new Date(settings.toDate) : now);
        fromDate.datepicker('setDate', settings.fromDate ? new Date(settings.fromDate) : then);
        toDate.datepicker('option', { minDate: fromDate.datepicker('getDate') });

        // then the real series options
        for (var k in avail) {
            if (['DailyTemps', 'Sunshine', 'DegreeDays', 'TempSum', 'CO2', 'Snow', 'ChillHours'].indexOf(k) === -1) {
                var optgrp = $('<optgroup />');
                optgrp.attr('label', k);
                avail[k].forEach(function (val) {
                    var option = $('<option />');
                    option.html(val);
                    if (['ExtraTemp', 'ExtraHum', 'ExtraDewPoint', 'SoilMoist', 'SoilTemp', 'UserTemp', 'LeafWetness'].indexOf(k) === -1) {
                        option.val(val);
                    } else {
                        option.val(k + '-' + val);
                    }
                    optgrp.append(option);
                });
                $('#data0').append(optgrp.clone());
                $('#data1').append(optgrp.clone());
                $('#data2').append(optgrp.clone());
                $('#data3').append(optgrp.clone());
                $('#data4').append(optgrp.clone());
                $('#data5').append(optgrp);
            }
        }

        // add the chart theme colours
        Highcharts.theme.colors.forEach(function(col, idx) {
            var option = $('<option style="background-color:' + col + '"/>');
            option.html(idx);
            option.val(col);
            $('#colour0').append(option.clone());
            $('#colour1').append(option.clone());
            $('#colour2').append(option.clone());
            $('#colour3').append(option.clone());
            $('#colour4').append(option.clone());
            $('#colour5').append(option);
        });

        // Draw the basic chart
        freezing = config.temp.units === 'C' ? 0 : 32;
        var options = {
            chart: {
                renderTo: 'chartcontainer',
                type: 'line',
                alignTicks: true
            },
            title: {text: '{{ALL_DATA_SELECTACHART}}'},
            credits: {enabled: true},
            xAxis: {
                type: 'datetime',
                ordinal: false,
                dateTimeLabelFormats: {
                    hour: config.timeformat,
                    day: '%e %b',
                    week: '%e %b %y',
                    month: '%b %y',
                    year: '%Y'
                }
            },
            yAxis: [],
            legend: {enabled: true},
            plotOptions: {
                series: {
                    dataGrouping: {
                        enabled: false
                    },
                    states: {
                        hover: {
                            halo: {
                                size: 5,
                                opacity: 0.25
                            }
                        }
                    },
                    cursor: 'pointer',
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                enabled: true,
                                radius: 0.1
                            }
                        }
                    }
                },
                line: {lineWidth: 2}
            },
            tooltip: {
                shared: true,
                split: false,
                xDateFormat: "%A, %b %e, " + config.timeformat
            },
            series: [],
            rangeSelector: myRanges,
            navigator: {
                xAxis: {
                    dateTimeLabelFormats: {
                        hour: config.timeformat
                    }
                }
            }
        };

        // draw the basic chart framework
        chart = new Highcharts.StockChart(options);

        // Set the dropdowns to defaults or previous values
        for (var i = 0; i < 6; i++) {
            if (settings.colours[i] == '' || settings.colours[i] == null) {
                $('#colour' + i).css('background', chart.options.colors[i]);
                $('#colour' + i).val(chart.options.colors[i]);
                settings.colours[i] = chart.options.colors[i];
            } else {
                $('#colour' + i).css('background', settings.colours[i]);
                $('#colour' + i).val(settings.colours[i]);
            }
            if (settings.series[i] != '0') {
                // This series has some data associated with it
                $('#data' + i + ' option:contains(' + txtSelect +')').text(txtClear);
                $('#data' + i).val(settings.series[i]);
                // Draw it on the chart
                updateChart(settings.series[i], i, 'data' + i);
            }
        }
    });
});


var procDataSelect = function (sel) {

    // compare the select value against the other selects, and update the chart if required
    var id = sel.id;
    var num = +id.slice(-1);
    var val = sel.value;

    // Has this series already been selected? If so set the dropdown back to its previous value, then abort
    if (val != '0' &&  settings.series.indexOf(sel.value) != -1) {
        $('#' + id).val(settings.series[num]).prop('selected', true);
        return;
    }

    //
    if (val != '0') {
        $('#' + id + ' option:contains(' + txtSelect +')').text(txtClear);
    } else {
        $('#' + id + ' option:contains(' + txtClear +')').text(txtSelect);
    }


    // clear the existing series
    if (chart.series.length > 0)
        clearSeries(settings.series[num]);


    updateChart(val, num, id);

    settings.series[num] = val;

    storeSettings();
};

var updateChart = function (val, num, id) {
    // test for the extra sensor series first
    if (val.startsWith('ExtraTemp-')) {
        doExtraTemp(num, val);
        return;
    } else if (val.startsWith('ExtraHum-')) {
        doExtraHum(num, val);
        return;
    } else if (val.startsWith('ExtraDewPoint-')) {
        doExtraDew(num, val);
        return;
    } else if (val.startsWith('UserTemp-')) {
        doUserTemp(num, val);
        return;
    } else if (val.startsWith('SoilMoist-')) {
        doSoilMoist(num, val);
        return;
    } else if (val.startsWith('SoilTemp-')) {
        doSoilTemp(num, val);
        return;
    } else if (val.startsWith('LeafWetness-')) {
        doLeafWet(num, val);
        return;
    }

    // no? then do the "standard" data
    switch (val) {
        case '0':
            // clear this series
            break;
        case 'Temperature':
            doTemp(num);
            break;
        case 'Indoor Temp':
            doInTemp(num);
            break;
        case 'Heat Index':
            doHeatIndex(num);
            break;
        case 'Dew Point':
            doDewPoint(num);
            break;
        case 'Wind Chill':
            doWindChill(num);
            break;
        case 'Apparent Temp':
            doAppTemp(num);
            break;
        case 'Feels Like':
            doFeelsLike(num);
            break;
        case 'Humidex':
            doHumidex(num);
            break;

        case 'Humidity':
            doHumidity(num);
            break;
        case 'Indoor Hum':
            doInHumidity(num);
            break;

        case 'Solar Rad':
            doSolarRad(num);
            break;
        case 'UV Index':
            doUV(num);
            break;

        case 'Pressure':
            doPress(num);
            break;

        case 'Wind Speed':
            doWindSpeed(num);
            break;
        case 'Wind Gust':
            doWindGust(num);
            break;
        case 'Wind Bearing':
            doWindDir(num);
            break;

        case 'Rainfall':
            doRainfall(num);
            break;
        case 'Rainfall Rate':
            doRainRate(num);
            break;

        case 'PM 2.5':
            doPm2p5(num);
            break;
        case 'PM 10':
            doPm10(num);
            break;

        default:
            $('#' + id).val(txtSelect);
            break;
    }
}

var updateColour = function (sel) {
    var id = sel.id;
    var num = +id.slice(-1);
    var val = sel.value;

    // set the selection colour
    $('#' + id).css('background', val);
    settings.colours[num] = val;


    // do we need to update the associated data series?
    if (settings.series[num] != '0') {
            // find the series
        var seriesIdx = -1;
        var i = 0;
        chart.series.forEach(function (ser) {
            if (ser.options.name == settings.series[num] && ser.yAxis.options.id != 'navigator-y-axis') {
                seriesIdx = i;
            }
            i++;
        });

        if (seriesIdx == -1)
            return;

        chart.series[seriesIdx].options.color = settings.colours[num];
        chart.series[seriesIdx].update(chart.series[seriesIdx].options);
    }
    storeSettings();
};

var storeSettings = function () {
    var url = '/api/graphdata/selectaperiod.json';
    $.ajax({
        url: url,
        type: 'POST',
        contentType: false,
        data: JSON.stringify(settings),
        dataType: 'json'
    });
};

var clearSeries = function (val) {
    // find the series
    var seriesIdx = -1;
    var i = 0;
    chart.series.forEach(function (ser) {
        if (ser.options.id == val && ser.yAxis.options.id != 'navigator-y-axis') {
            seriesIdx = i;
        }
        i++;
    });

    if (seriesIdx == -1)
        return;

    // check no other series is using the yAxis
    var yAxisId = chart.series[seriesIdx].yAxis.options.id;
    var inUse = 0;

    chart.series.forEach(function (ser) {
        if (ser.yAxis.options.id == yAxisId) {
            inUse++;
        }
    });

    // clear the series
    chart.series[seriesIdx].remove();

    // Are we the only series using this axis, if so clear it
    if (inUse === 1) {
        var axisIdx = -1;
        // find which index of yAxis that in use
        for (i = 0; i < chart.yAxis.length; i++) {
            if (chart.yAxis[i].options.id == yAxisId)
                axisIdx = i;
        }

        // clear the yAxis
        chart.yAxis[axisIdx].remove();
    }

    // check the navigator - have we just removed the series it was using, and is there at least one series we can use instead?
    if (!chart.navigator.hasNavigatorData && chart.series.length > 0 ) {
        chart.series[0].update({showInNavigator: true}, true);
    }
}

var updateSeries = function() {
    cache = {};
    // update all the series
    for (var i = 0; i < 6; i++) {
        if (settings.series[i] != '0') {
            // This series has some data associated with it
            clearSeries(settings.series[i]);
            $('#data' + i + ' option:contains(' + txtSelect +')').text(txtClear);
            $('#data' + i).val(settings.series[i]);
            // Draw it on the chart
            updateChart(settings.series[i], i, 'data' + i);
        }
    }
    // now reset the range to All
    chart.rangeSelector.buttons[3].onEvents.click();
}

var checkAxisExists = function (name) {
    var exists = false;
    chart.yAxis.forEach(function (axis) {
        if (axis.options.id == name)
            exists = true;
    });
    return exists;
};

var addTemperatureAxis = function (idx) {
    // first check if we already have a temperature axis
    if (checkAxisExists('Temperature'))
        return;

    // nope no existing axis, add one
   chart.addAxis({
        title: {text: '{{TEMPERATURE}} (°' + config.temp.units + ')'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'Temperature',
        showEmpty: false,
        labels: {
            formatter: function () {
                return '<span style="fill: ' + (this.value <= freezing ? 'blue' : 'red') + ';">' + this.value + '</span>';
            },
            align: idx < settings.series.length / 2 ? 'right' : 'left',
        },
        plotLines: [{
            // freezing line
            value: freezing,
            color: 'rgb(0, 0, 180)',
            width: 1,
            zIndex: 2
        }],
        minRange: config.temp.units == 'C' ? 5 : 10,
        allowDecimals: false
    }, false, false);

};

var addPressureAxis = function (idx) {
    // first check if we already have a pressure axis
    if (checkAxisExists('Pressure'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: '{{PRESSURE}} (' + config.press.units + ')'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'Pressure',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        minRange: config.press.units == 'in' ? 1 : 5,
        allowDecimals: config.press.units == 'in' ? true : false
    }, false, false);
};

var addHumidityAxis = function (idx) {
    // first check if we already have a humidity axis
    if (checkAxisExists('Humidity'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: '{{HUMIDITY}} (%)'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'Humidity',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        min: 0,
        max: 100,
        allowDecimals: false
    }, false, false);
};

var addSoilMoistAxis = function (idx) {
    // first check if we already have a soil moisture axis
    if (checkAxisExists('SoilMoist'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: '{{SOIL_MOISTURE}}'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'SoilMoist',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        min: 0,
        allowDecimals: false
    }, false, false);
};

var addSolarAxis = function (idx) {
    // first check if we already have a solar axis
    if (checkAxisExists('Solar'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: '{{SOLAR_RADIATION}} (W/m\u00B2)'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'Solar',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        min: 0,
        allowDecimals: false
    }, false, false);
};

var addUVAxis = function (idx) {
    // first check if we already have a UV axis
    if (checkAxisExists('UV'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title:{text: '{{UV_INDEX}}'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'UV',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        min: 0
    }, false, false);
};

var addWindAxis = function (idx) {
    // first check if we already have a wind axis
    if (checkAxisExists('Wind'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: '{{WIND_SPEED}} (' + config.wind.units + ')'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'Wind',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        min: 0,
        allowDecimals: config.wind.units == 'm/s' ? true : false
    }, false, false);
};

var addBearingAxis = function (idx) {
    // first check if we already have a bearing axis
    if (checkAxisExists('Bearing'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: '{{WIND_BEARING}}'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'Bearing',
        alignTicks: false,
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left',
            formatter: function () {
                compassP(this.value + 22.5);
            }
        },
        min: 0,
        max: 360,
        tickInterval: 45,
        gridLineWidth: 0,
        minorGridLineWidth: 0
    }, false, false);
};

var addRainAxis = function (idx) {
    // first check if we already have a rain axis
    if (checkAxisExists('Rain'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: '{{RAINFALL}} (' + config.rain.units + ')'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'Rain',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        min: 0,
        minRange: config.rain.units == 'in' ? 0.25 : 4,
        allowDecimals: config.rain.units == 'in' ? true : false
    }, false, false);
};

var addRainRateAxis = function (idx) {
    // first check if we already have a rain rate axis
    if (checkAxisExists('RainRate'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: '{{RAINFALL_RATE}} (' + config.rain.units + '/{{HOUR_SHORT_LC}})'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'RainRate',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        min: 0,
        minRange: config.rain.units == 'in' ? 0.25 : 4,
        allowDecimals: config.rain.units == 'in' ? true : false
    }, false, false);
};

var addAQAxis = function (idx) {
    // first check if we already have a AQ axis
    if (checkAxisExists('pm'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: '{{PARTICULATES}} (µg/m³)'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'pm',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        min: 0,
        allowDecimals: false
    }, false, false);
};

var addLeafWetAxis = function (idx) {
    // first check if we already have a humidity axis
    if (checkAxisExists('LeafWetness'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: '{{LEAF_WETNESS}}' + (config.leafwet.units == '' ? '' : '(' + config.leafwet.units + ')')},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'LeafWetness',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        min: 0,
        allowDecimals: false
    }, false, false);
};


var doTemp = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    if (cache === null || cache.temp === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.temp = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.temp.temp,
            id: 'Temperature',
            name: '{{TEMPERATURE}}',
            yAxis: 'Temperature',
            type: 'line',
            tooltip: {
                valueSuffix: ' °' + config.temp.units,
                valueDecimals: config.temp.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};

var doInTemp = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    if (cache === null || cache.temp === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.temp = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.temp.intemp,
            id: 'Indoor Temp',
            name: '{{INDOOR_TEMP}}',
            yAxis: 'Temperature',
            type: 'line',
            tooltip: {
                valueSuffix: ' °' + config.temp.units,
                valueDecimals: config.temp.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};

var doHeatIndex = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    if (cache === null || cache.temp === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.temp = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.temp.heatindex,
            id: 'Heat Index',
            name: '{{HEAT_INDEX}}',
            yAxis: 'Temperature',
            type: 'line',
            tooltip: {
                valueSuffix: ' °' + config.temp.units,
                valueDecimals: config.temp.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};

var doDewPoint = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    if (cache === null || cache.temp === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.temp = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.temp.dew,
            id: 'Dew Point',
            name: '{{DEW_POINT}}',
            yAxis: 'Temperature',
            type: 'line',
            tooltip: {
                valueSuffix: ' °' + config.temp.units,
                valueDecimals: config.temp.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};

var doWindChill = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    if (cache === null || cache.temp === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.temp = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.temp.wchill,
            id: 'Wind Chill',
            name: '{{WIND_CHILL}}',
            yAxis: 'Temperature',
            type: 'line',
            tooltip: {
                valueSuffix: ' °' + config.temp.units,
                valueDecimals: config.temp.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};

var doAppTemp = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    if (cache === null || cache.temp === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.temp = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.temp.apptemp,
            id: 'Apparent Temp',
            name: '{{APPARENT_TEMP}}',
            yAxis: 'Temperature',
            type: 'line',
            tooltip: {
                valueSuffix: ' °' + config.temp.units,
                valueDecimals: config.temp.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};

var doFeelsLike = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    if (cache === null || cache.temp === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.temp = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.temp.feelslike,
            id: 'Feels Like',
            name: '{{FEELS_LIKE}}',
            yAxis: 'Temperature',
            type: 'line',
            tooltip: {
                valueSuffix: ' °' + config.temp.units,
                valueDecimals: config.temp.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};

var doHumidex = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    if (cache === null || cache.temp === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.temp = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.temp.humidex,
            id: 'Humidex',
            name: '{{HUMIDEX}}',
            yAxis: 'Temperature',
            type: 'line',
            tooltip: {
                //valueSuffix: ' °' + config.temp.units,
                valueDecimals: config.temp.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};


var doHumidity = function (idx) {
    chart.showLoading();

    addHumidityAxis(idx);

    if (cache === null || cache.hum === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvhum.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.hum = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.hum.hum,
            id: 'Humidity',
            name: '{{HUMIDITY}}',
            yAxis: 'Humidity',
            type: 'line',
            tooltip: {
                valueSuffix: ' %',
                valueDecimals: config.hum.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};

var doInHumidity = function (idx) {
    chart.showLoading();

    addHumidityAxis(idx);

    if (cache === null || cache.hum === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvhum.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.hum = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.hum.inhum,
            id: 'Indoor Hum',
            name: '{{INDOOR_HUM}}',
            yAxis: 'Humidity',
            type: 'line',
            tooltip: {
                valueSuffix: ' %',
                valueDecimals: config.hum.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};


var doSolarRad = function (idx) {
    chart.showLoading();

    addSolarAxis(idx);

    if (cache === null || cache.solar === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvsolar.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.solar = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.solar.SolarRad,
            id: 'Solar Rad',
            name: '{{SOLAR_RAD}}',
            yAxis: 'Solar',
            type: 'area',
            tooltip: {
                valueSuffix: ' W/m\u00B2',
                valueDecimals: 0
            },
            visible: true,
            color: settings.colours[idx],
            fillOpacity: 0.5,
            boostThreshold: 0,
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};

var doUV = function (idx) {
    chart.showLoading();

    addUVAxis(idx);

    if (cache === null || cache.solar === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvsolar.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.solar = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.solar.UV,
            id: 'UV Index',
            name: '{{UV_INDEX}}',
            yAxis: 'UV',
            type: 'line',
            tooltip: {
                valueSuffix: null,
                valueDecimals: config.uv.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};


var doPress = function (idx) {
    chart.showLoading();

    addPressureAxis(idx);

    if (cache === null || cache.press === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvpress.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.press = resp.press;
                addSeries();
            }
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.press,
            id: 'Pressure',
            name: '{{PRESSURE}}',
            yAxis: 'Pressure',
            type: 'line',
            tooltip: {
                valueSuffix: ' ' + config.press.units,
                valueDecimals: config.press.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};


var doWindSpeed = function (idx) {
    chart.showLoading();

    addWindAxis(idx);

    if (cache === null || cache.wind === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvwind.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.wind = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.wind.wspeed,
            id: 'Wind Speed',
            name: '{{WIND_SPEED}}',
            yAxis: 'Wind',
            type: 'line',
            tooltip: {
                valueSuffix: ' ' + config.wind.units,
                valueDecimals: config.wind.avgdecimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};

var doWindGust = function (idx) {
    chart.showLoading();

    addWindAxis(idx);

    if (cache === null || cache.wind === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvwind.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.wind = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.wind.wgust,
            id: 'Wind Gust',
            name: '{{WIND_GUST}}',
            yAxis: 'Wind',
            tooltip: {
                valueSuffix: ' ' + config.wind.units,
                valueDecimals: config.wind.gustdecimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};

var doWindDir = function (idx) {
    chart.showLoading();

    addBearingAxis(idx);

    if (cache === null || cache.wind === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvwind.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.wind = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.wind.avgbearing,
            id: 'Wind Bearing',
            name: '{{WIND_BEARING}}',
            yAxis: 'Bearing',
            type: 'scatter',
            color: settings.colours[idx],
            zIndex: 100 - idx,
            marker: {
                enabled: true,
                symbol: 'circle',
                radius: 2,
                states: {
                    hover: {enabled: false},
                    select: {enabled: false},
                    normal: {enabled: false}
                }
            },
            tooltip: {
                enabled: false
            },
            animationLimit: 1,
            cursor: 'pointer',
            enableMouseTracking: false,
            label: {enabled: false}
        });
        chart.hideLoading();
    }
};


var doRainfall = function (idx) {
    chart.showLoading();

    addRainAxis(idx);

    if (cache === null || cache.rain === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvrain.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.rain = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.rain.rfall,
            id: 'Rainfall',
            name: '{{RAINFALL}}',
            yAxis: 'Rain',
            type: 'area',
            tooltip: {
                valueDecimals: config.rain.decimals,
                valueSuffix: ' ' + config.rain.units
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx,
            fillOpacity: 0.3,
            boostThreshold: 0
});
        chart.hideLoading();
    }
};

var doRainRate = function (idx) {
    chart.showLoading();

    addRainRateAxis(idx);

    if (cache === null || cache.rain === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvrain.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.rain = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.rain.rrate,
            id: 'Rainfall Rate',
            name: '{{RAINFALL_RATE}}',
            yAxis: 'RainRate',
            type: 'line',
            tooltip: {
                valueSuffix: ' ' + config.rain.units + '/{{HOUR_SHORT_LC}}',
                valueDecimals: config.rain.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};


var doPm2p5 = function (idx) {
    chart.showLoading();

    addAQAxis(idx);

    $.ajax({
        url: '/api/graphdata/intvairquality.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.pm2p5,
                id: 'PM 2.5',
                name: 'PM 2.5',
                yAxis: 'pm',
                type: 'line',
                tooltip: {
                    valueSuffix: ' µg/m³',
                    valueDecimals: 1,
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doPm10 = function (idx) {
    chart.showLoading();

    addAQAxis(idx);

    $.ajax({
        url: '/api/graphdata/intvairquality.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.pm10,
                id: 'PM 10',
                name: 'PM 10',
                yAxis: 'pm',
                type: 'line',
                tooltip: {
                    valueSuffix: ' µg/m³',
                    valueDecimals: 1,
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doExtraTemp = function (idx, val) {
    chart.showLoading();

    addTemperatureAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    if (cache === null || cache.extratemp === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvextratemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.extratemp = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.extratemp[name],
            id: val,
            name: name,
            yAxis: 'Temperature',
            type: 'line',
            tooltip: {
                valueSuffix: ' °' + config.temp.units,
                valueDecimals: config.temp.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};

var doUserTemp = function (idx, val) {
    chart.showLoading();

    addTemperatureAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    if (cache === null || cache.usertemp === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvusertemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.usertemp = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.usertemp[name],
            id: val,
            name: name,
            yAxis: 'Temperature',
            type: 'line',
            tooltip: {
                valueSuffix: ' °' + config.temp.units,
                valueDecimals: config.temp.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};

var doExtraHum = function (idx, val) {
    chart.showLoading();

    addHumidityAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    if (cache === null || cache.extrahum === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvextrahum.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.extrahum = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.extrahum[name],
            id: val,
            name: name,
            yAxis: 'Humidity',
            type: 'line',
            tooltip: {
                valueSuffix: ' %',
                valueDecimals: config.hum.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};

var doExtraDew = function (idx, val) {
    chart.showLoading();

    addTemperatureAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    if (cache === null || cache.extradew === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvextradew.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.extradew = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.extradew[name],
            id: val,
            name: name,
            yAxis: 'Temperature',
            type: 'line',
            tooltip: {
                valueSuffix: ' °' + config.temp.units,
                valueDecimals: config.temp.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};

var doSoilTemp = function (idx, val) {
    chart.showLoading();

    addTemperatureAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    if (cache === null || cache.soiltemp === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvsoiltemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.soiltemp = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.soiltemp[name],
            id: val,
            name: name,
            yAxis: 'Temperature',
            type: 'line',
            tooltip: {
                valueSuffix: ' °' + config.temp.units,
                valueDecimals: config.temp.decimals
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};

var doSoilMoist = function (idx, val) {
    chart.showLoading();

    addSoilMoistAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');
    var unitIdx = config.series.soilmoist.name.indexOf(name);
    var suffix = unitIdx == -1 ? '' : ' ' + config.soilmoisture.units[unitIdx];

    if (cache === null || cache.soilmoist === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvsoilmoist.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.soilmoist = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.soilmoist[name],
            id: val,
            name: name,
            yAxis: 'SoilMoist',
            type: 'line',
            tooltip: {
                valueSuffix: suffix
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
        });
        chart.hideLoading();
    }
};

var doLeafWet = function (idx, val) {
    chart.showLoading();

    addLeafWetAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    if (cache === null || cache.leafwet === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvleafwetness.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.leafwet = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.leafwet[name],
            id: val,
            name: name,
            yAxis: 'LeafWetness',
            type: 'line',
            tooltip: {
                valueSuffix: ' ' + config.leafwet.units
            },
            visible: true,
            color: settings.colours[idx],
            zIndex: 100 - idx
});
        chart.hideLoading();
    }
};

function formatDateStr(inDate) {
    return '' + inDate.getFullYear() + '-' + addLeadingZeros(inDate.getMonth() + 1) + '-' + addLeadingZeros(inDate.getDate());
}

function formatUserDateStr(inDate) {
    return  addLeadingZeros(inDate.getDate()) + '-' + addLeadingZeros(inDate.getMonth() + 1) + '-' + inDate.getFullYear();
}

function addLeadingZeros(n) {
    return n <= 9 ? '0' + n : n;
}

function getUnixTimeStamp(inDate) {
    return inDate.getTime() / 1000;
}