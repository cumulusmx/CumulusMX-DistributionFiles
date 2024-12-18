// Created: 2021/01/26 13:54:44
// Last modified: 2024/12/18 13:54:32

var chart, config, options;
var settings;
var freezing;
var txtSelect = 'Select Series';
var txtClear = 'Clear Series';

var compassP = function (deg) {
    var a = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return a[Math.floor((deg + 22.5) / 45) % 8];
};


$(document).ready(function () {
    settings = prefs.load();

    $.ajax({url: 'availabledata.json', dataType: "json", success: function (result1) {
        $.ajax({url: "graphconfig.json", dataType: "json", success: function (result2) {
            config = result2;

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

            // then the real series options
            for (var k in result1) {
                if (['DailyTemps', 'Sunshine', 'DegreeDays', 'TempSum', 'CO2', 'Snow', 'ChillHours'].indexOf(k) === -1) {
                    var optgrp = $('<optgroup />');
                    optgrp.attr('label', k);
                    result1[k].forEach(function (val) {
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
                title: {text: 'Recent Data Select-a-Chart'},
                credits: {enabled: true},
                xAxis: {
                    type: 'datetime',
                    ordinal: false,
                    dateTimeLabelFormats: {
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
                    xDateFormat: '%A, %b %e, %H:%M'
                },
                series: [],
                rangeSelector: {
                    buttons: [{
                            count: 12,
                            type: 'hour',
                            text: '12h'
                        }, {
                            count: 24,
                            type: 'hour',
                            text: '24h'
                        }, {
                            count: 2,
                            type: 'day',
                            text: '2d'
                        }, {
                            type: 'all',
                            text: 'All'
                        }],
                    inputEnabled: false,
                    selected: 1
                }
            };

            // draw the basic chart framework
            chart = new Highcharts.StockChart(options);

            // Set the dropdowns to defaults or previous values
            for (var i = 0; i < 6; i++) {
                $('#colour' + i).css('text-indent', '-99px');
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
        }});
    }});
});


var prefs = {
    data: {
        series: ['0','0','0','0','0','0'],
        colours: ['','','','','','']
    },
    load: function () {
        var cookie = document.cookie.split(';');
        cookie.forEach(function (val) {
            if (val.trim().startsWith('selecta=')) {
                var dat = decodeURIComponent(val).split('=');
                prefs.data = JSON.parse(dat[1]);
            }
        });
        return prefs.data;
    },
    save: function (settings) {
        this.data = settings;
        var d = new Date();
        d.setTime(d.getTime() + (365*24*60*60*1000));
        document.cookie = 'selecta=' + encodeURIComponent(JSON.stringify(this.data)) + ';expires=' + d.toUTCString();
    }
};

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

    prefs.save(settings);
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
    prefs.save(settings);
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
        chart.series[0].setOptions({showInNavigator: true});
        chart.navigator.baseSeries = chart.series[0];
        chart.navigator.update();
        chart.redraw();
    }
};


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
        title: {text: 'Temperature (°' + config.temp.units + ')'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: "Temperature",
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
        title: {text: 'Pressure (' + config.press.units + ')'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: "Pressure",
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
        title: {text: 'Humidity (%)'},
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
        title: {text: 'Soil Moisture'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'SoilMoist',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        min: 0,
        max: config.soilmoisture.units.includes('cb') ? 200 : 100, // Davis 0-200 cb, Ecowitt 0-100%
        allowDecimals: false
    }, false, false);
};

var addSolarAxis = function (idx) {
    // first check if we already have a solar axis
    if (checkAxisExists('Solar'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: 'Solar Radiation (W/m\u00B2)'},
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
        title:{text: 'UV Index'},
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
        title: {text: 'Wind Speed (' + config.wind.units + ')'},
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
        title: {text: 'Wind Bearing'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'Bearing',
        alignTicks: false,
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left',
            formatter: function () {
                var a = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
                return a[Math.floor((this.value + 22.5) / 45) % 8];
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
        title: {text: 'Rainfall (' + config.rain.units + ')'},
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
        title: {text: 'Rainfall Rate (' + config.rain.units + '/hr)'},
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
        title: {text: 'Particulates (µg/m³)'},
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
    if (checkAxisExists('LeafWet'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: 'Leaf wetness' + (config.leafwet.units == '' ? '' : '(' + config.leafwet.units + ')')},
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

    $.ajax({
        url: 'tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.temp,
                id: 'Temperature',
                name: 'Temperature',
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
        }
    });
};

var doInTemp = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: 'tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.intemp,
                id: 'Indoor Temp',
                name: 'Indoor Temp',
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
        }
    });
};

var doHeatIndex = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: 'tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.heatindex,
                id: 'Heat Index',
                name: 'Heat Index',
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
        }
    });
};

var doDewPoint = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: 'tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.dew,
                id: 'Dew Point',
                name: 'Dew Point',
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
        }
    });
};

var doWindChill = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: 'tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.wchill,
                id: 'Wind Chill',
                name: 'Wind Chill',
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
        }
    });
};

var doAppTemp = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: 'tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.apptemp,
                id: 'Apparent Temp',
                name: 'Apparent Temp',
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
        }
    });
};

var doFeelsLike = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: 'tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.feelslike,
                id: 'Feels Like',
                name: 'Feels Like',
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
        }
    });
};


var doHumidity = function (idx) {
    chart.showLoading();

    addHumidityAxis(idx);

    $.ajax({
        url: 'humdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.hum,
                id: 'Humidity',
                name: 'Humidity',
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
        }
    });
};

var doInHumidity = function (idx) {
    chart.showLoading();

    addHumidityAxis(idx);

    $.ajax({
        url: 'humdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.inhum,
                id: 'Indoor Hum',
                name: 'Indoor Hum',
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
        }
    });
};


var doSolarRad = function (idx) {
    chart.showLoading();

    addSolarAxis(idx);

    $.ajax({
        url: 'solardata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.SolarRad,
                id: 'Solar Rad',
                name: 'Solar Rad',
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
        }
    });
};

var doUV = function (idx) {
    chart.showLoading();

    addUVAxis(idx);

    $.ajax({
        url: 'solardata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.UV,
                id: 'UV Index',
                name: 'UV Index',
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
        }
    });
};


var doPress = function (idx) {
    chart.showLoading();

    addPressureAxis(idx);

    $.ajax({
        url: 'pressdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.press,
                id: 'Pressure',
                name: 'Pressure',
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
        }
    });
};


var doWindSpeed = function (idx) {
    chart.showLoading();

    addWindAxis(idx);

    $.ajax({
        url: 'winddata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.wspeed,
                id: 'Wind Speed',
                name: 'Wind Speed',
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
        }
    });
};

var doWindGust = function (idx) {
    chart.showLoading();

    addWindAxis(idx);

    $.ajax({
        url: 'winddata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.wgust,
                id: 'Wind Gust',
                name: 'Wind Gust',
                yAxis: 'Wind',
                type: 'line',
                tooltip: {
                    valueSuffix: ' ' + config.wind.units,
                    valueDecimals: config.wind.gustdecimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doWindDir = function (idx) {
    chart.showLoading();

    addBearingAxis(idx);

    $.ajax({
        url: 'wdirdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.avgbearing,
                id: 'Wind Bearing',
                name: 'Wind Bearing',
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
        }
    });
};


var doRainfall = function (idx) {
    chart.showLoading();

    addRainAxis(idx);

    $.ajax({
        url: 'raindata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.rfall,
                id: 'Rainfall',
                name: 'Rainfall',
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
        }
    });
};

var doRainRate = function (idx) {
    chart.showLoading();

    addRainRateAxis(idx);

    $.ajax({
        url: 'raindata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.rrate,
                id: 'Rainfall Rate',
                name: 'Rainfall Rate',
                yAxis: 'RainRate',
                type: 'line',
                tooltip: {
                    valueSuffix: ' ' + config.rain.units + '/hr',
                    valueDecimals: config.rain.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};


var doPm2p5 = function (idx) {
    chart.showLoading();

    addAQAxis(idx);

    $.ajax({
        url: 'airquality.json',
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
        url: 'airquality.json',
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

    $.ajax({
        url: 'extratempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp[name],
                id: val,
                name: name,
                yAxis: "Temperature",
                type: "line",
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doUserTemp = function (idx, val) {
    chart.showLoading();

    addTemperatureAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    $.ajax({
        url: 'usertempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp[name],
                id: val,
                name: name,
                yAxis: "Temperature",
                type: "line",
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doExtraHum = function (idx, val) {
    chart.showLoading();

    addHumidityAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    $.ajax({
        url: 'extrahumdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp[name],
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
        }
    });
};

var doExtraDew = function (idx, val) {
    chart.showLoading();

    addTemperatureAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    $.ajax({
        url: 'extradewdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp[name],
                id: val,
                name: name,
                yAxis: "Temperature",
                type: "line",
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doSoilTemp = function (idx, val) {
    chart.showLoading();

    addTemperatureAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    $.ajax({
        url: 'soiltempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp[name],
                id: val,
                name: name,
                yAxis: "Temperature",
                type: "line",
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doSoilMoist = function (idx, val) {
    chart.showLoading();

    addSoilMoistAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');
    var unitIdx = config.series.soilmoist.name.indexOf(name);
    var suffix = unitIdx == -1 ? '' : ' ' + config.soilmoisture.units[unitIdx];

    $.ajax({
        url: 'soilmoistdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp[name],
                id: val,
                name: name,
                yAxis: "SoilMoist",
                type: "line",
                tooltip: {
                    valueSuffix: suffix
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doLeafWet = function (idx, val) {
    chart.showLoading();

    addLeafWetAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    $.ajax({
        url: 'leafwetdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp[name],
                id: val,
                name: name,
                yAxis: "LeafWetness",
                type: "line",
                tooltip: {
                    valueSuffix: ' ' + config.leafwet.units
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};
