// Last modified: 2025/09/15 21:51:10

var chart, config, available;

$(document).ready(function () {
    $('.btn').change(function () {

        var myRadio = $('input[name=options]');
        var checkedValue = myRadio.filter(':checked').val();

        doGraph(checkedValue);
    });

    var doGraph = function (value) {
        switch (value) {
            case 'temp':
                doTemp();
                break;
            case 'press':
                doPress();
                break;
            case 'wind':
                doWind();
                break;
            case 'windDir':
                doWindDir();
                break;
            case 'rain':
                doRain();
                break;
           case 'humidity':
                doHum();
                break;
            case 'solar':
                doSolar();
                break;
            case 'degdays':
                doDegDays();
                break;
            case 'tempsum':
                doTempSum();
                break;
            case 'chillhrs':
                doChillHrs();
                break;
            case 'snow':
                doSnow();
                break;
            default:
                doTemp();
                break;
        }
        parent.location.hash = value;
    };

    const availRes = $.ajax({ url: '/api/graphdata/availabledata.json', dataType: 'json' });
    const configRes = $.ajax({ url: '/api/graphdata/graphconfig.json', dataType: 'json' });

    Promise.all([availRes, configRes])
    .then(function (results) {

        available = results[0];
        config = results[1];

        if (available.Temperature === undefined || available.Temperature.Count == 0) {
            $('#temp').parent().remove();
        }
        if (available.Humidity === undefined || available.Humidity.Count == 0) {
            $('#humidity').parent().remove();
        }
        if (available.Solar === undefined || available.Solar.Count == 0) {
            $('#solar').parent().remove();
        }
        if (available.DegreeDays === undefined || available.DegreeDays.Count == 0) {
            $('#degdays').parent().remove();
        }
        if (available.TempSum === undefined || available.TempSum.Count == 0) {
            $('#tempsum').parent().remove();
        }
        if (available.ChillHours === undefined || available.ChillHours.Count == 0) {
            $('#chillhrs').parent().remove();
        }
        if (available.Snow === undefined || available.Snow.Count == 0) {
            $('#snow').parent().remove();
        }

        Highcharts.setOptions({
            time: {
                timezone: config.tz
            },
            chart: {
                style: {
                    fontSize: '1.5rem'
                }
            }
        });

        var value = parent.location.hash.replace('#', '');
        doGraph(value);
        // set the correct button
        if (value != '') {
            $('input[name=options]').removeAttr('checked').parent().removeClass('active');
            $('input[name=options][value=' + value + ']').prop('checked', true).parent().addClass('active');
        }
    });

    $.ajax({url: '/api/info/version.json', dataType: 'json'})
    .done(function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    });

});


var doTemp = function () {
    $('#chartdescription').text('{{CHART_HIST_TEMP_DESC}}');
    var freezing = config.temp.units === 'C' ? 0 : 32;
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: '{{TEMPERATURE}}'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b %y',
                week: '%e %b %y',
                month: '%b %y',
                year: '%Y'
            }
        },
        yAxis: [{
                // left
                title: {text: '{{TEMPERATURE}} (°' + config.temp.units + ')'},
                opposite: false,
                labels: {
                    align: 'right',
                    x: -5,
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
            }, {
                // right
                gridLineWidth: 0,
                opposite: true,
                linkedTo: 0,
                labels: {
                    align: 'left',
                    x: 5,
                    formatter: function () {
                        return '<span style="fill: ' + (this.value <= 0 ? 'blue' : 'red') + ';">' + this.value + '</span>';
                    }
                }
            }],
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
            valueSuffix: ' °' + config.temp.units,
            valueDecimals: config.temp.decimals,
            xDateFormat: '%e %b %y'
        },
        series: [],
        rangeSelector: {
            inputEnabled: false,
            selected: 1
        }
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/dailygraphdata/tempdata.json',
        dataType: 'json'
    })
    .done(function (resp) {
        var titles = {
            'minTemp'  : '{{TEMP_MIN}}',
            'maxTemp'  : '{{TEMP_MAX}}',
            'avgTemp'  : '{{TEMP_AVG}}',
            'heatIndex': '{{HEAT_INDEX}}',
            'minApp'   : '{{APPARENT_TEMP_MIN}}',
            'maxApp'   : '{{APPARENT_TEMP_MAX}}',
            'minDew'   : '{{DEW_POINT_MIN}}',
            'maxDew'   : '{{DEW_POINT_MAX}}',
            'minFeels' : '{{FEELS_LIKE_MIN}}',
            'maxFeels' : '{{FEELS_LIKE_MAX}}',
            'humidex'  : '{{HUMIDEX}}',
            'windChill': '{{WIND_CHILL}}'
        };
        var visibility = {
            'minTemp'  : true,
            'maxTemp'  : true,
            'avgTemp'  : false,
            'heatIndex': false,
            'minApp'   : false,
            'maxApp'   : false,
            'minDew'   : false,
            'maxDew'   : false,
            'minFeels' : false,
            'maxFeels' : false,
            'humidex'  : false,
            'windChill': false
            };
        var idxs = ['minTemp', 'maxTemp', 'avgTemp', 'heatIndex', 'minApp', 'maxApp', 'minDew', 'maxDew', 'minFeels', 'maxFeels', 'windChill', 'humidex'];

        idxs.forEach(function(idx) {
            var valueSuffix = ' °' + config.temp.units;
            yaxis = 0;

            if (idx in resp) {
                var clrIdx = idx.toLowerCase();
                if ('heatIndex' === idx || 'humidex' === idx) {
                    clrIdx = 'max' + clrIdx;
                } else if ('windChill' === idx) {
                    clrIdx = 'min' + clrIdx;
                }

                if (idx === 'humidex') {
                    valueSuffix = null;
                    if (config.temp.units == 'F') {
                        chart.yAxis[1].remove();
                        chart.addAxis({
                            id: 'humidex',
                            title:{text: '{{HUMIDEX}}'},
                            opposite: true,
                            labels: {
                                align: 'left'
                            },
                            alignTicks: true,
                            gridLineWidth: 0, // Not working?
                            gridZIndex: -10, // Hides the grid lines for this axis
                            showEmpty: false
                        });

                        yaxis = 'humidex';
                    }
                }

                chart.addSeries({
                    name: titles[idx],
                    data: resp[idx],
                    color: config.series[clrIdx].colour,
                    visible: visibility[idx],
                    showInNavigator: visibility[idx],
                    yAxis: yaxis,
                    tooltip: {valueSuffix: valueSuffix}
                }, false);

            }
        });
        chart.hideLoading();
        chart.redraw();
    });
};

var doPress = function () {
    $('#chartdescription').text('Line chart showing daily high and low atmospheric pressure values.');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: '{{PRESSURE}}'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b %y',
                week: '%e %b %y',
                month: '%b %y',
                year: '%Y'
            }
        },
        yAxis: [{
                // left
                title: {text: '{{PRESSURE}} (' + config.press.units + ')'},
                opposite: false,
                labels: {
                    align: 'right',
                    x: -5
                }
            }, {
                // right
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                title: {text: null},
                labels: {
                    align: 'left',
                    x: 5
                }
            }],
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
            valueSuffix: ' ' + config.press.units,
            valueDecimals: config.press.decimals,
            xDateFormat: '%e %b %y'
        },
        series: [{
                name: '{{HIGH_PRESSURE}}',
                color: config.series.maxpress.colour,
                showInNavigator: true
            }, {
                name: '{{LOW_PRESSURE}}',
                color: config.series.minpress.colour,
                showInNavigator: true
            }],
        rangeSelector: {
            inputEnabled: false,
            selected: 1
        }
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/dailygraphdata/pressdata.json',
        dataType: 'json'
    })
    .done(function (resp) {
        chart.hideLoading();
        chart.series[0].setData(resp.maxBaro);
        chart.series[1].setData(resp.minBaro);
    });
};

var compassP = function (deg) {
    var a = ['{{COMPASS_N}}', '{{COMPASS_NE}}', '{{COMPASS_E}}', '{{COMPASS_SE}}', '{{COMPASS_S}}', '{{COMPASS_SW}}', '{{COMPASS_W}}', '{{COMPASS_NW}}'];
    return a[Math.floor((deg + 22.5) / 45) % 8];
};

// var doWindDir = function () {
//     var options = {
//         chart: {
//             renderTo: 'chartcontainer',
//             type: 'scatter',
//             alignTicks: false
//         },
//         title: {text: 'Dominant Wind Direction'},
//         credits: {enabled: true},
//         boost: {
//             useGPUTranslations: false,
//             usePreAllocated: true
//         },
//         xAxis: {
//             type: 'datetime',
//             ordinal: false,
//             dateTimeLabelFormats: {
//                 day: '%e %b %y',
//                 week: '%e %b %y',
//                 month: '%b %y',
//                 year: '%Y'
//             }
//         },
//         yAxis: [{
//                 // left
//                 title: {text: 'Bearing'},
//                 opposite: false,
//                 min: 0,
//                 max: 360,
//                 tickInterval: 45,
//                 labels: {
//                     align: 'right',
//                     x: -5,
//                     formatter: function () {
//                         return compassP(this.value);
//                     }
//                 }
//             }, {
//                 // right
//                 linkedTo: 0,
//                 gridLineWidth: 0,
//                 opposite: true,
//                 title: {text: null},
//                 min: 0,
//                 max: 360,
//                 tickInterval: 45,
//                 labels: {
//                     align: 'left',
//                     x: 5,
//                     formatter: function () {
//                         return compassP(this.value);
//                     }
//                 }
//             }],
//         legend: {enabled: true},
//         plotOptions: {
//             scatter: {
//                 animationLimit: 1,
//                 cursor: 'pointer',
//                 enableMouseTracking: false,
//                 boostThreshold: 200,
//                 marker: {
//                     states: {
//                         hover: {enabled: false},
//                         select: {enabled: false},
//                         normal: {enabled: false}
//                     }
//                 },
//                 shadow: false,
//                 label: {enabled: false}
//             }
//         },
//         tooltip: {
//             enabled: false
//         },
//         series: [{
//                 name: 'Bearing',
//                 type: 'scatter',
//                 marker: {
//                     symbol: 'circle',
//                     radius: 2
//                 }
//             }],
//         rangeSelector: {
//             inputEnabled: false,
//             selected: 1
//         }
//     };

//     chart = new Highcharts.StockChart(options);
//     chart.showLoading();

//     $.ajax({
//         url: '/api/dailygraphdata/wdirdata.json',
//         dataType: 'json',
//         success: function (resp) {
//             chart.hideLoading();
//             chart.series[0].setData(resp.windDir);
//         }
//     });
// };

var doWind = function () {
    $('#chartdescription').text('{{CHART_HIST_WIND_DESC}}');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: '{{WIND_SPEED}}'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b %y',
                week: '%e %b %y',
                month: '%b %y',
                year: '%Y'
            }
        },
        yAxis: [{
                // left
                title: {text: '{{WIND_SPEED}} (' + config.wind.units + ')'},
                opposite: false,
                min: 0,
                labels: {
                    align: 'right',
                    x: -5
                }
            }, {
                // right
                //linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                min: 0,
                title: {text: '{{WIND_RUN}} (' + config.wind.rununits + ')'},
                labels: {
                    align: 'left',
                    x: 5
                }
            }],
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
            valueSuffix: ' ' + config.wind.units,
            valueDecimals: config.wind.decimals,
            xDateFormat: '%e %b %y'
        },
        series: [{
                name: '{{WIND_SPEED}}',
                color: config.series.wspeed.colour,
                showInNavigator: true,
                tooltip: {
                    valueDecimals: config.wind.avgdecimals
                }
            }, {
                name: '{{WIND_GUST}}',
                color: config.series.wgust.colour,
                showInNavigator: true,
                tooltip: {
                    valueDecimals: config.wind.gustdecimals
                }
            }, {
                name: '{{WIND_RUN}}',
                type: 'column',
                color: config.series.windrun.colour,
                yAxis: 1,
                visible: false,
                tooltip: {
                    valueSuffix: ' ' + config.wind.rununits,
                    valueDecimals: 0
                },
                zIndex: -1
            }],
        rangeSelector: {
            inputEnabled: false,
            selected: 1
        }
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/dailygraphdata/winddata.json',
        dataType: 'json'
    })
    .done(function (resp) {
        chart.hideLoading();
        chart.series[0].setData(resp.maxWind);
        chart.series[1].setData(resp.maxGust);
        chart.series[2].setData(resp.windRun);
    });
};

var doRain = function () {
    $('#chartdescription').text('{{CHART_HIST_RAIN_DESC}}');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'column',
            alignTicks: true
        },
        title: {text: '{{RAINFALL}}'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b %y',
                week: '%e %b %y',
                month: '%b %y',
                year: '%Y'
            }
        },
        yAxis: [{
                // left
                title: {text: '{{RAINFALL}} (' + config.rain.units + ')'},
                opposite: false,
                min: 0,
                labels: {
                    align: 'right',
                    x: -5
                }
            }, {
                // right
                title: {text: '{{RAINFALL_RATE}} (' + config.rain.units + '/{{HOUR_SHORT_LC}})'},
                opposite: true,
                min: 0,
                labels: {
                    align: 'left',
                    x: 5
                },
                showEmpty: false
            }],
        legend: {enabled: true},
        plotOptions: {
            series: {
                dataGrouping: {
                    enabled: false
                },
                pointPadding: 0,
                groupPadding: 0.1,
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
            valueDecimals: config.rain.decimals,
            xDateFormat: '%e %b %y'
        },
        series: [{
                name: '{{RAIN_DAILY}}',
                type: 'column',
                color: config.series.rfall.colour,
                yAxis: 0,
                tooltip: {valueSuffix: ' ' + config.rain.units},
            }, {
                name: '{{RAIN_RATE}}',
                type: 'column',
                color: config.series.rrate.colour,
                yAxis: 1,
                tooltip: {valueSuffix: ' ' + config.rain.units + '/{{HOUR_SHORT_LC}}'},
                visible: false
            }],
        rangeSelector: {
            inputEnabled: false,
            selected: 1
        }
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/dailygraphdata/raindata.json',
        dataType: 'json'
    })
    .done(function (resp) {
        chart.hideLoading();
        chart.series[0].setData(resp.rain);
        chart.series[1].setData(resp.maxRainRate);
    });
};

var doHum = function () {
    $('#chartdescription').text('{{CHART_HIST_HUM_DESC}}');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: '{{RELATIVE_HUMIDITY}}'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b %y',
                week: '%e %b %y',
                month: '%b %y',
                year: '%Y'
            }
        },
        yAxis: [{
                // left
                title: {text: '{{HUMIDITY}} (%)'},
                opposite: false,
                min: 0,
                max: 100,
                labels: {
                    align: 'right',
                    x: -5
                }
            }, {
                // right
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                min: 0,
                max: 100,
                title: {text: null},
                labels: {
                    align: 'left',
                    x: 5
                }
            }],
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
            valueSuffix: ' %',
            valueDecimals: config.hum.decimals,
            xDateFormat: '%e %b %y'
        },
        series: [],
        rangeSelector: {
            inputEnabled: false,
            selected: 1
        }
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/dailygraphdata/humdata.json',
        dataType: 'json'
    })
    .done(function (resp) {
        var titles = {
            'minHum'  : '{{HUMIDITY_MINIMUM}}',
            'maxHum': '{{HUMIDITY_MAXIMUM}}'
            }
            var idxs = ['minHum', 'maxHum'];
            var cnt = 0;
            idxs.forEach(function(idx) {
                if (idx in resp) {
                    chart.addSeries({
                        name: titles[idx],
                        color: config.series[idx.toLowerCase()].colour,
                        data: resp[idx],
                        showInNavigator: true
                    }, false);

                    cnt++;
                }
            });

        chart.hideLoading();
        chart.redraw();
    });
};

var doSolar = function () {
    $('#chartdescription').text('{{CHART_HIST_SOLAR_DESC}}');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: true
        },
        title: {text: '{{SOLAR}}'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b %y',
                week: '%e %b %y',
                month: '%b %y',
                year: '%Y'
            }
        },
        yAxis: [],
        legend: {enabled: true},
        plotOptions: {
            boostThreshold: 0,
            series: {
                dataGrouping: {
                    enabled: false
                },
                pointPadding: 0,
                groupPadding: 0.1,
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
            xDateFormat: '%e %b %y'
        },
        series: [],
        rangeSelector: {
            inputEnabled: false,
            selected: 1
        }
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/dailygraphdata/solardata.json',
        dataType: 'json'
    })
    .done(function (resp) {
        var titles = {
            solarRad: '{{SOLAR_RADIATION}}',
            uvi     : '{{UV_INDEX}}',
            sunHours: '{{SUNSHINE_HOURS}}'
        };
        var types = {
            solarRad: 'area',
            uvi     : 'line',
            sunHours: 'column'
        };
        var tooltips = {
            solarRad: {
                valueSuffix: ' W/m\u00B2',
                valueDecimals: 0
            },
            uvi: {
                valueSuffix: ' ',
                valueDecimals: config.uv.decimals
            },
            sunHours: {
                valueSuffix: ' {{HOURS}}',
                valueDecimals: 0
            }
        };
        var indexes = {
            solarRad: 1,
            uvi     : 2,
            sunHours: 0
        }
        var fillColor = {
            solarRad: {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops: [
                    [0, config.series.solarrad.colour],
                    [1, Highcharts.color(config.series.solarrad.colour).setOpacity(0).get('rgba')]
                ]
            },
            uvi     : null,
            sunHours: null
        };
        var idxs = ['solarRad', 'uvi', 'sunHours'];

        idxs.forEach(function(idx) {
            if (idx in resp) {
                var clrIdx;
                if (idx === 'uvi')
                    clrIdx ='uv';
                else if (idx === 'solarRad')
                    clrIdx = 'solarrad';
                else if (idx === 'sunHours')
                    clrIdx = 'sunshine';

                if (idx === 'uvi') {
                    chart.addAxis({
                        id: idx,
                        title: {text: '{{UV_INDEX}}'},
                        opposite: true,
                        min: 0,
                        labels: {
                            align: 'left'
                        },
                        showEmpty: false
                    });
                } else if (idx === 'sunHours') {
                    chart.addAxis({
                        id: idx,
                        title: {text: '{{SUNSHINE_HOURS}}'},
                        opposite: true,
                        min: 0,
                        labels: {
                            align: 'left'
                        },
                        showEmpty: false
                    });
                } else if (idx === 'solarRad') {
                    chart.addAxis({
                        id: idx,
                        title: {text: '{{SOLAR_RADIATION}} (W/m\u00B2)'},
                        min: 0,
                        opposite: false,
                        labels: {
                            align: 'right',
                            x: -5
                        },
                        showEmpty: false
                    });
                }

                chart.addSeries({
                    name: titles[idx],
                    type: types[idx],
                    yAxis: idx,
                    tooltip: tooltips[idx],
                    data: resp[idx],
                    color: config.series[clrIdx].colour,
                    showInNavigator: idx !== 'solarRad',
                    index: indexes[idx],
                    fillColor: fillColor[idx],
                    zIndex: idx === 'uvi' ? 99 : null
                }, false);
            }
        });

        chart.hideLoading();
        chart.redraw();
    });
};

var doDegDays = function () {
    $('#chartdescription').text('{{CHART_HIST_GDD_DESC}}');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false,
            zoomType: 'x'
        },
        title: {text: '{{DEGREE_DAYS}}'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b',
                week: '%e %b',
                month: '%b',
                year: ''
            }
        },
        yAxis: [{
                // left
                title: {text: '°' + config.temp.units + ' {{DAYS}}'},
                opposite: false,
                min: 0,
                labels: {
                    align: 'right',
                    x: -10
                }
            }, {
                // right
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                min: 0,
                title: {text: null},
                labels: {
                    align: 'left',
                    x: 10
                }
            }],
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
            xDateFormat: '%e %B',
            useHTML: true,
            headerFormat: '{point.key}<table>',
            pointFormat: '<tr style="font: 9pt Trebuchet MS, Verdana, sans-serif"><td><span style="color:{series.color}">\u25CF</span> {series.name}: </td>' +
            '<td style="text-align: right; font-weight: bold;">{point.y:.1f}</td></tr>',
            footerFormat: '</table>'
        },
        series: []
    };

    chart = new Highcharts.Chart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/dailygraphdata/degdaydata.json',
        dataType: 'json',
        success: function (resp) {
            var subtitle = '';
            if (available.DegreeDays.indexOf('GDD1') != -1) {
                subtitle = '{{GDD1_BASE}}: ' + resp.options.gddBase1 + '°' + config.temp.units;
                if (available.DegreeDays.indexOf('GDD2') != -1) {
                    subtitle += ' - ';
                }
            }
            if (available.DegreeDays.indexOf('GDD2') != -1) {
                subtitle += '{{GDD2_BASE}}: ' + resp.options.gddBase2 + '°' + config.temp.units;
            }

            chart.setSubtitle({text: subtitle});

            available.DegreeDays.forEach(idx => {
                 if (idx in resp) {
                    Object.keys(resp[idx]).forEach(yr => {
                        chart.addSeries({
                            name: idx + '-' + yr,
                            visible: false,
                            data: resp[idx][yr]
                        }, false);
                    });
                    // make the last series visible
                    chart.series[chart.series.length -1].visible = true;
                 }
             });

            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doTempSum = function () {
    $('#chartdescription').text('{{CHART_HIST_TEMPSUM_DESC}}');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false,
            zoomType: 'x'
        },
        title: {text: '{{TEMPERATURE_SUM}}'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b',
                week: '%e %b',
                month: '%b',
                year: ''
            }
        },
        yAxis: [{
                // left
                title: {text: '{{TOTAL}} °' + config.temp.units},
                opposite: false,
                labels: {
                    align: 'right',
                    x: -10
                }
            }, {
                // right
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                title: {text: null},
                labels: {
                    align: 'left',
                    x: 10
                }
            }],
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
            xDateFormat: '%e %B',
            useHTML: true,
            headerFormat: '{point.key}<table>',
            pointFormat: '<tr style="font: 9pt Trebuchet MS, Verdana, sans-serif"><td><span style="color:{series.color}">\u25CF</span> {series.name}: </td>' +
            '<td style="text-align: right; font-weight: bold;">{point.y:0f}</td></tr>',
            footerFormat: '</table>'
        },
        series: []
    };

    chart = new Highcharts.Chart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/dailygraphdata/tempsumdata.json',
        dataType: 'json'
    })
    .done(function (resp) {
        var subtitle = '';
        if (available.TempSum.indexOf('Sum0') != -1) {
            subtitle = '{{SUM0_BASE}}: 0°' + config.temp.units;
            if (available.TempSum.indexOf('Sum1') != -1 || available.TempSum.indexOf('Sum2') != -1) {
                subtitle += ' - ';
            }
        }
        if (available.TempSum.indexOf('Sum1') != -1) {
            subtitle += '{{SUM1_BASE}}: ' + resp.options.sumBase1 + '°' + config.temp.units;
            if (available.TempSum.indexOf('Sum2') != -1) {
                subtitle += ' - ';
            }
        }
        if (available.TempSum.indexOf('Sum2') != -1) {
            subtitle += '{{SUM2_BASE}}: ' + resp.options.sumBase2 + '°' + config.temp.units;
        }

        chart.setSubtitle({text: subtitle});

        available.TempSum.forEach(idx => {
            if (idx in resp) {
                Object.keys(resp[idx]).forEach(yr => {
                    chart.addSeries({
                        name: idx + '-' + yr,
                        visible: false,
                        data: resp[idx][yr]
                    }, false);
                });
                // make the last series visible
                chart.series[chart.series.length -1].visible = true;
            }
        });
    })
    .always(function() {
        chart.hideLoading();
        chart.redraw();
    });
};

var doChillHrs = function () {
    $('#chartdescription').text('{{CHART_HIST_CHILL_HRS_DESC}}');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false,
            zoomType: 'x'
        },
        title: {text: '{{CHILL_HOURS}}'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b',
                week: '%e %b',
                month: '%b',
                year: ''
            }
        },
        yAxis: [{
                // left
                title: {text: '{{TOTAL_HOURS}}'},
                opposite: false,
                labels: {
                    align: 'right',
                    x: -10
                }
            }, {
                // right
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                title: {text: null},
                labels: {
                    align: 'left',
                    x: 10
                }
            }],
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
            xDateFormat: '%e %B',
            useHTML: true,
            headerFormat: '{point.key}<table>',
            pointFormat: '<tr style="font: 9pt Trebuchet MS, Verdana, sans-serif"><td><span style="color:{series.color}">\u25CF</span> {series.name}: </td>' +
            '<td style="text-align: right; font-weight: bold;">{point.y:0f} hrs</td></tr>',
            footerFormat: '</table>'
        },
        series: []
    };

    chart = new Highcharts.Chart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/dailygraphdata/chillhrsdata.json',
        dataType: 'json'
    })
    .done(function (resp) {
        var subtitle = '{{THRESHOLD}}: ' + resp.options.threshold + '°' + config.temp.units + ' {{BASE}}: ' + resp.options.basetemp + '°' + config.temp.units;
        chart.setSubtitle({text: subtitle});

        for (var yr in resp.data) {
            chart.addSeries({
                name: yr,
                visible: false,
                data: resp.data[yr]
            }, false);
        }

        // make the last series visible
        chart.series[chart.series.length -1].visible = true;
    })
    .always(function() {
        chart.hideLoading();
        chart.redraw();
    });
};


var doSnow = function () {
    $('#chartdescription').text('{{CHART_HIST_SNOW_DESC}}');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'column',
            alignTicks: true
        },
        title: {text: '{{SNOWFALL}}'},
        credits: {enabled: true},
        xAxis: {
            type: 'datetime',
            ordinal: false,
            dateTimeLabelFormats: {
                day: '%e %b %y',
                week: '%e %b %y',
                month: '%b %y',
                year: '%Y'
            }
        },
        yAxis: [{
                // left
                title: {text: '{{SNOW}} (' + config.snow.units + ')'},
                opposite: false,
                min: 0,
                labels: {
                    align: 'right',
                    x: -5
                }
            }],
        legend: {enabled: true},
        plotOptions: {
            column: {
                dataGrouping: {
                    enabled: false
                }
            },
            series: {
                grouping: false,
                pointPadding: 0,
                groupPadding: 0.05,
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
            }
        },
        tooltip: {
            shared: true,
            split: false,
            valueDecimals: 1,
            xDateFormat: '%e %b %y'
        },
        series: [],
        rangeSelector: {
            inputEnabled: false,
            selected: 1
        },
        navigator: {
            series: {
                type: 'column'
            }
        }
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/dailygraphdata/dailysnow.json',
        dataType: 'json'
    })
    .done(function (resp) {
        if ('SnowDepth' in resp && resp.SnowDepth.length > 0) {
            chart.addSeries({
                name: '{{SNOW_DEPTH}}',
                type: 'column',
                color: config.series.snowdepth.colour,
                tooltip: {valueSuffix: ' ' + config.snow.units},
                data: resp.SnowDepth,
                showInNavigator: true
            });
        }

        if ('Snow24h' in resp && resp.Snow24h.length > 0) {
            chart.addSeries({
                name: '{{SNOW_24H}}',
                type: 'column',
                color: config.series.snow24h.colour,
                tooltip: {valueSuffix: ' ' + config.snow.units},
                data: resp.Snow24h,
                showInNavigator: true
            });
        }
    })
    .always(function() {
        chart.hideLoading();
    });
};
