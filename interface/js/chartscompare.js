var chart, config, options;
var selValues = ['0', '0', '0', '0'];
var freezing;
var nullSelect = 'Select Series';

var compassP = function (deg) {
    var a = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return a[Math.floor((deg + 22.5) / 45) % 8];
};

$(document).ready(function () {
    $.ajax({url: "api/settings/version.json", dataType: "json", success: function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    }});

    $.ajax({url: 'api/graphdata/availabledata.json', success: function (result) {
        // add the default blank option
        var option = $('<option />');
        option.html(nullSelect);
        option.val(0);
        $('#data0').append(option.clone());
        $('#data1').append(option.clone());
        $('#data2').append(option.clone());
        $('#data3').append(option);

        // then the real options
        for (var k in result) {
            var optgrp = $('<optgroup />');
            optgrp.attr('label', k);
            result[k].forEach(function (val) {
                var option = $('<option />');
                option.html(val);
                option.val(val);
                optgrp.append(option);
            });
            $('#data0').append(optgrp.clone());
            $('#data1').append(optgrp.clone());
            $('#data2').append(optgrp.clone());
            $('#data3').append(optgrp);
        }

        $.ajax({url: "api/graphdata/graphconfig.json", success: function (result) {
            config = result;

            // The basic chart
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

            // draw the basic framework
            chart = new Highcharts.StockChart(options);
        }});
    }});
});


var updateChart = function (sel) {

    // compare the select value against the other selects, and update the chart if required
    var id = sel.id;
    var num = +id.slice(-1);
    var val = sel.value;

    if (val != '0' &&  selValues.indexOf(val) != -1) {
        $('#' + id).val(nullSelect);
        return;
    }

    // clear the existing series
    if (chart.series.length > 0)
        clearSeries(selValues[num]);

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
            $('#' + id).val(nullSelect);
            break;
    }

    selValues[num] = val;

};


var clearSeries = function (val) {
    // find the series
    var seriesIdx = -1;
    var i = 0;
    chart.series.forEach(function (ser) {
        if (ser.options.name == val && ser.yAxis.options.id != 'navigator-y-axis') {
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
        title: {text: 'Temperature (°' + config.temp.units + ')'},
        opposite: idx < 2 ? false : true,
        id: "Temperature",
        showEmpty: false,
        labels: {
            formatter: function () {
                return '<span style="fill: ' + (this.value <= freezing ? 'blue' : 'red') + ';">' + this.value + '</span>';
            }
        },
        plotLines: [{
            // freezing line
            value: freezing,
            color: 'rgb(0, 0, 180)',
            width: 1,
            zIndex: 2
        }]
    }, false, false);

};

var addPressureAxis = function (idx) {
    // first check if we already have a pressure axis
    if (checkAxisExists('Pressure'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: 'Pressure (' + config.press.units + ')'},
        opposite: idx < 2 ? false : true,
        id: "Pressure",
        showEmpty: false
    }, false, false);
};

var addHumidityAxis = function (idx) {
    // first check if we already have a humidity axis
    if (checkAxisExists('Humidity'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: 'Humidity (%)'},
        opposite: idx < 2 ? false : true,
        id: 'Humidity',
        showEmpty: false,
        min: 0,
        max: 100
    }, false, false);
};

var addSolarAxis = function (idx) {
    // first check if we already have a solar axis
    if (checkAxisExists('Solar'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: 'Solar Radiation (W/m\u00B2)'},
        opposite: idx < 2 ? false : true,
        id: 'Solar',
        showEmpty: false
    }, false, false);
};

var addUVAxis = function (idx) {
    // first check if we already have a UV axis
    if (checkAxisExists('UV'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title:{text: 'UV Index'},
        opposite: idx < 2 ? false : true,
        id: 'UV',
        showEmpty: false,
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
        opposite: idx < 2 ? false : true,
        id: 'Wind',
        showEmpty: false,
        min: 0
    }, false, false);
};

var addBearingAxis = function (idx) {
    // first check if we already have a bearing axis
    if (checkAxisExists('Bearing'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: 'Wind Bearing'},
        opposite: idx < 2 ? false : true,
        id: 'Bearing',
        alignTicks: false,
        showEmpty: false,
        labels: {
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
        opposite: idx < 2 ? false : true,
        id: 'Rain',
        showEmpty: false,
        min: 0
    }, false, false);
};

var addRainRateAxis = function (idx) {
    // first check if we already have a rain rate axis
    if (checkAxisExists('RainRate'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: 'Rainfall Rate (' + config.rain.units + '/hr)'},
        opposite: idx < 2 ? false : true,
        id: 'RainRate',
        showEmpty: false,
        min: 0
    }, false, false);
};

var addAQAxis = function (idx) {
    // first check if we already have a AQ axis
    if (checkAxisExists('pm'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: 'Particulates (µg/m³)'},
        opposite: idx < 2 ? false : true,
        id: 'pm',
        showEmpty: false,
        min: 0
    }, false, false);
};


var doTemp = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: 'api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.temp,
                name: "Temperature",
                yAxis: "Temperature",
                type: "line",
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: chart.options.colors[idx]
            });
        }
    });
};

var doInTemp = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: 'api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.intemp,
                name: 'Indoor Temp',
                yAxis: 'Temperature',
                type: 'line',
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: chart.options.colors[idx]
            });
        }
    });
};

var doHeatIndex = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: 'api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.heatindex,
                name: 'Heat Index',
                yAxis: 'Temperature',
                type: 'line',
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: chart.options.colors[idx]
            });
        }
    });
};

var doDewPoint = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: 'api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.dew,
                name: 'Dew Point',
                yAxis: 'Temperature',
                type: 'line',
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: chart.options.colors[idx]
            });
        }
    });
};

var doWindChill = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: 'api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.wchill,
                name: 'Wind Chill',
                yAxis: 'Temperature',
                type: 'line',
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: chart.options.colors[idx]
            });
        }
    });
};

var doAppTemp = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: 'api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.apptemp,
                name: 'Apparent Temp',
                yAxis: 'Temperature',
                type: 'line',
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: chart.options.colors[idx]
            });
        }
    });
};

var doFeelsLike = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: 'api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.feelslike,
                name: 'Feels Like',
                yAxis: 'Temperature',
                type: 'line',
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: chart.options.colors[idx]
            });
        }
    });
};


var doHumidity = function (idx) {
    chart.showLoading();

    addHumidityAxis(idx);

    $.ajax({
        url: 'api/graphdata/humdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.hum,
                name: 'Humidity',
                yAxis: 'Humidity',
                type: 'line',
                tooltip: {
                    valueSuffix: ' %',
                    valueDecimals: config.hum.decimals
                },
                visible: true,
                color: chart.options.colors[idx]
            });
        }
    });
};

var doInHumidity = function (idx) {
    chart.showLoading();

    addHumidityAxis(idx);

    $.ajax({
        url: 'api/graphdata/humdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.inhum,
                name: 'Indoor Hum',
                yAxis: 'Humidity',
                type: 'line',
                tooltip: {
                    valueSuffix: ' %',
                    valueDecimals: config.hum.decimals
                },
                visible: true,
                color: chart.options.colors[idx]
            });
        }
    });
};


var doSolarRad = function (idx) {
    chart.showLoading();

    addSolarAxis(idx);

    $.ajax({
        url: 'api/graphdata/solardata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.SolarRad,
                name: 'Solar Rad',
                yAxis: 'Solar',
                type: 'area',
                tooltip: {
                    valueSuffix: ' W/m\u00B2',
                    valueDecimals: 0
                },
                visible: true,
                color: 'rgb(255,165,0)',
                fillOpacity: 0.5,
                boostThreshold: 0
            });
        }
    });
};

var doUV = function (idx) {
    chart.showLoading();

    addUVAxis(idx);

    $.ajax({
        url: 'api/graphdata/solardata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.UV,
                name: 'UV Index',
                yAxis: 'UV',
                type: 'line',
                tooltip: {
                    valueSuffix: null,
                    valueDecimals: config.uv.decimals
                },
                visible: true,
                color: chart.options.colors[idx]
            });
        }
    });
};


var doPress = function (idx) {
    // do we have a pressure series already?
    if (selValues.indexOf('Pressure') != -1) {
        $('data' + idx).val(nullSelect);
        return;
    }

    chart.showLoading();

    addPressureAxis(idx);

    $.ajax({
        url: 'api/graphdata/pressdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.press,
                name: 'Pressure',
                yAxis: 'Pressure',
                type: 'line',
                tooltip: {
                    valueSuffix: ' ' + config.press.units,
                    valueDecimals: config.press.decimals
                },
                visible: true,
                color: chart.options.colors[idx]
            });
        }
    });
};


var doWindSpeed = function (idx) {
    // do we have a pressure series already?
    if (selValues.indexOf('Wind Speed') != -1) {
        $('data' + idx).val(nullSelect);
        return;
    }

    chart.showLoading();

    addWindAxis(idx);

    $.ajax({
        url: 'api/graphdata/winddata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.wspeed,
                name: 'Wind Speed',
                yAxis: 'Wind',
                type: 'line',
                tooltip: {
                    valueSuffix: ' ' + config.wind.units,
                    valueDecimals: config.wind.decimals
                },
                visible: true,
                color: chart.options.colors[idx]
            });
        }
    });
};

var doWindGust = function (idx) {
    // do we have a pressure series already?
    if (selValues.indexOf('Wind Gust') != -1) {
        $('data' + idx).val(nullSelect);
        return;
    }

    chart.showLoading();

    addWindAxis(idx);

    $.ajax({
        url: 'api/graphdata/winddata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.wgust,
                name: 'Wind Gust',
                yAxis: 'Wind',
                type: 'line',
                tooltip: {
                    valueSuffix: ' ' + config.wind.units,
                    valueDecimals: config.wind.decimals
                },
                visible: true,
                color: chart.options.colors[idx]
            });
        }
    });
};

var doWindDir = function (idx) {
    // do we have a bearing series already?
    if (selValues.indexOf('Wind Bearing') != -1) {
        $('data' + idx).val(nullSelect);
        return;
    }

    chart.showLoading();

    addBearingAxis(idx);

    $.ajax({
        url: 'api/graphdata/wdirdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.avgbearing,
                name: 'Wind Bearing',
                yAxis: 'Bearing',
                type: 'scatter',
                color: 'rgb(255,0,0)',
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
    // do we have a rainfall series already?
    if (selValues.indexOf('Rainfall') != -1) {
        $('data' + idx).val(nullSelect);
        return;
    }

    chart.showLoading();

    addRainAxis(idx);

    $.ajax({
        url: 'api/graphdata/raindata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.rfall,
                name: 'Rainfall',
                yAxis: 'Rain',
                type: 'area',
                tooltip: {
                    valueDecimals: config.rain.decimals,
                    valueSuffix: ' ' + config.rain.units
                },
                visible: true,
                color: chart.options.colors[idx],
                fillOpacity: 0.3,
                boostThreshold: 0
            });
        }
    });
};

var doRainRate = function (idx) {
    // do we have a rain rate series already?
    if (selValues.indexOf('Rainfall Rate') != -1) {
        $('data' + idx).val(nullSelect);
        return;
    }

    chart.showLoading();

    addRainRateAxis(idx);

    $.ajax({
        url: 'api/graphdata/raindata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.rrate,
                name: 'Rainfall Rate',
                yAxis: 'RainRate',
                type: 'line',
                tooltip: {
                    valueSuffix: ' ' + config.rain.units + '/hr',
                    valueDecimals: config.rain.decimals
                },
                visible: true,
                color: chart.options.colors[idx]
            });
        }
    });
};


var doPm2p5 = function (idx) {
    // do we have a rain rate series already?
    if (selValues.indexOf('PM 2.5') != -1) {
        $('data' + idx).val(nullSelect);
        return;
    }

    chart.showLoading();

    addAQAxis(idx);

    $.ajax({
        url: 'api/graphdata/airqualitydata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.pm2p5,
                name: 'PM 2.5',
                yAxis: 'pm',
                type: 'line',
                tooltip: {
                    valueSuffix: ' µg/m³',
                    valueDecimals: 1,
                },
                visible: true,
                color: chart.options.colors[idx]
            });
        }
    });
};

var doPm10 = function (idx) {
    // do we have a rain rate series already?
    if (selValues.indexOf('PM 10') != -1) {
        $('data' + idx).val(nullSelect);
        return;
    }

    chart.showLoading();

    addAQAxis(idx);

    $.ajax({
        url: 'api/graphdata/airqualitydata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.pm10,
                name: 'PM 10',
                yAxis: 'pm',
                type: 'line',
                tooltip: {
                    valueSuffix: ' µg/m³',
                    valueDecimals: 1,
                },
                visible: true,
                color: chart.options.colors[idx]
            });
        }
    });
};
