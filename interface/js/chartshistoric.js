// Last modified: 2021/05/16 20:53:49

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
            default:
                doTemp();
                break;
        }
        parent.location.hash = value;
    };

    $.ajax({
        url: "api/graphdata/availabledata.json",
        dataType: "json",
        success: function (result) {
            available = result;
            if (result.Temperature === undefined || result.Temperature.Count == 0) {
                $('#temp').parent().remove();
            }
            if (result.Humidity === undefined || result.Humidity.Count == 0) {
                $('#humidity').parent().remove();
            }
            if (result.Solar === undefined || result.Solar.Count == 0) {
                $('#solar').parent().remove();
            }
            if (result.DegreeDays === undefined || result.DegreeDays.Count == 0) {
                $('#degdays').parent().remove();
            }
            if (result.TempSum === undefined || result.TempSum.Count == 0) {
                $('#tempsum').parent().remove();
            }
        }
    });


    $.ajax({url: "api/settings/version.json", dataType: "json", success: function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    }});

    $.ajax({url: "api/graphdata/graphconfig.json", success: function (result) {
        config = result;
        var value = parent.location.hash.replace('#', '');
        doGraph(value);
        // set the correct button
        if (value != '') {
            $('input[name=options]').removeAttr('checked').parent().removeClass('active');
            $('input[name=options][value=' + value + ']').prop('checked', true).parent().addClass('active');
        }
    }});
});


var doTemp = function () {
    var freezing = config.temp.units === 'C' ? 0 : 32;
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'Temperature'},
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
                title: {text: 'Temperature (°' + config.temp.units + ')'},
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
        url: 'api/dailygraphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
           var titles = {
               'minTemp'  : 'Min Temp',
               'maxTemp'  : 'Max Temp',
               'avgTemp'  : 'Avg Temp',
               'heatIndex': 'Heat Index',
               'minApp'   : 'Min Apparent',
               'maxApp'   : 'Max Apparent',
               'minDew'   : 'Min Dewpoint',
               'maxDew'   : 'Max Dewpoint',
               'minFeels' : 'Min Feels',
               'maxFeels' : 'Max Feels',
               'humidex'  : 'Humidex'
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
                'humidex'  : false
             };
             var colours = {
                'minTemp'  : '#0000ff',
                'maxTemp'  : '#ff1a1a',
                'avgTemp'  : null,
                'heatIndex': null,
                'minApp'   : null,
                'maxApp'   : false,
                'minDew'   : false,
                'maxDew'   : false,
                'minFeels' : false,
                'maxFeels' : false,
                'humidex'  : false
             }

            var idxs = ['minTemp', 'maxTemp', 'avgTemp', 'heatIndex', 'minApp', 'maxApp', 'minDew', 'maxDew', 'minFeels', 'maxFeels', 'humidex'];

            idxs.forEach(function(idx) {
                var valueSuffix = ' °' + config.temp.units;
                yaxis = 0;

                if (idx in resp) {
                    if (idx === 'humidex') {
                        valueSuffix = null;
                        if (config.temp.units == 'F') {
                            chart.yAxis[1].remove();
                            chart.addAxis({
                                id: 'humidex',
                                title:{text: 'Humidex'},
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
                        color: colours[idx],
                        visible: visibility[idx],
                        showInNavigator: visibility[idx],
                        yAxis: yaxis,
                        tooltip: {valueSuffix: valueSuffix}
                    }, false);

                }
            });
            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doPress = function () {
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'Pressure'},
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
                title: {text: 'Pressure (' + config.press.units + ')'},
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
                name: 'High Pressure'
            }, {
                name: 'Low Pressure'
            }],
        rangeSelector: {
            inputEnabled: false,
            selected: 1
        }
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: 'api/dailygraphdata/pressdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.series[0].setData(resp.maxBaro);
            chart.series[1].setData(resp.minBaro);
        }
    });
};

var compassP = function (deg) {
    var a = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
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
//         url: 'api/dailygraphdata/wdirdata.json',
//         dataType: 'json',
//         success: function (resp) {
//             chart.hideLoading();
//             chart.series[0].setData(resp.windDir);
//         }
//     });
// };

var doWind = function () {
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'Wind Speed'},
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
                title: {text: 'Wind Speed (' + config.wind.units + ')'},
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
                title: {text: 'Wind Run (' + config.wind.rununits + ')'},
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
                name: 'Wind Speed'
            }, {
                name: 'Wind Gust'
            }, {
                name: 'Wind Run',
                yAxis: 1,
                visible: false,
                tooltip: {
                    valueSuffix: ' ' + config.wind.rununits,
                    valueDecimals: 0
                }
            }],
        rangeSelector: {
            inputEnabled: false,
            selected: 1
        }
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: 'api/dailygraphdata/winddata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.series[0].setData(resp.maxWind);
            chart.series[1].setData(resp.maxGust);
            chart.series[2].setData(resp.windRun);
        }
    });
};

var doRain = function () {
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'column',
            alignTicks: true
        },
        title: {text: 'Rainfall'},
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
                title: {text: 'Rainfall (' + config.rain.units + ')'},
                opposite: false,
                min: 0,
                labels: {
                    align: 'right',
                    x: -5
                }
            }, {
                // right
                title: {text: 'Rainfall rate (' + config.rain.units + '/hr)'},
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
                name: 'Daily rain',
                type: 'column',
                yAxis: 0,
                tooltip: {valueSuffix: ' ' + config.rain.units},
            }, {
                name: 'Rain rate',
                type: 'column',
                yAxis: 1,
                tooltip: {valueSuffix: ' ' + config.rain.units + '/hr'},
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
        url: 'api/dailygraphdata/raindata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.series[0].setData(resp.rain);
            chart.series[1].setData(resp.maxRainRate);
        }
    });
};

var doHum = function () {
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'Relative Humidity'},
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
                title: {text: 'Humidity (%)'},
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
        url: 'api/dailygraphdata/humdata.json',
        dataType: 'json',
        success: function (resp) {
            var titles = {
                'minHum'  : 'Minimum Humidity',
                'maxHum': 'Maximum Humidity'
             }
             var idxs = ['minHum', 'maxHum'];
             var cnt = 0;
             idxs.forEach(function(idx) {
                 if (idx in resp) {
                     chart.addSeries({
                         name: titles[idx],
                         data: resp[idx]
                     }, false);

                     cnt++;
                 }
             });

            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doSolar = function () {
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: true
        },
        title: {text: 'Solar'},
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
        url: 'api/dailygraphdata/solardata.json',
        dataType: 'json',
        success: function (resp) {
            var titles = {
                solarRad: 'Solar Radiation',
                uvi     : 'UV Index',
                sunHours: 'Sunshine Hours'
            };
            var types = {
                solarRad: 'area',
                uvi     : 'line',
                sunHours: 'column'
            };
            var colours = {
                solarRad: 'rgb(200,200,100)',
                uvi     : 'rgb(0,0,255)',
                sunHours: 'rgb(255,165,0)'
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
                    valueSuffix: ' hours',
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
                        [0, colours.solarRad],
                        [1, Highcharts.color(colours.solarRad).setOpacity(0).get('rgba')]
                    ]
                },
                uvi     : null,
                sunHours: null
            };
            var idxs = ['solarRad', 'uvi', 'sunHours'];
            var cnt = 0;

            idxs.forEach(function(idx) {
                if (idx in resp) {
                    if (idx === 'uvi') {
                        chart.addAxis({
                            id: idx,
                            title: {text: 'UV Index'},
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
                            title: {text: 'Sunshine Hours'},
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
                            title: {text: 'Solar Radiation (W/m\u00B2)'},
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
                        color: colours[idx],
                        showInNavigator: idx !== 'solarRad',
                        index: indexes[idx],
                        fillColor: fillColor[idx]
                    }, false);

                    if (idx === 'uvi') {
                        chart.series[cnt].options.zIndex = 99;
                    }
                    cnt++;
                }
            });

            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doDegDays = function () {
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false,
            zoomType: 'x'
        },
        title: {text: 'Degree Days'},
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
                title: {text: '°' + config.temp.units + ' days'},
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
        url: 'api/dailygraphdata/degdaydata.json',
        dataType: 'json',
        success: function (resp) {
            var subtitle = '';
            if (available.DegreeDays.indexOf('GDD1') != -1) {
                subtitle = 'GDD#1 base: ' + resp.options.gddBase1 + '°' + config.temp.units;
                if (available.DegreeDays.indexOf('GDD2') != -1) {
                    subtitle += ' - ';
                }
            }
            if (available.DegreeDays.indexOf('GDD2') != -1) {
                subtitle += 'GDD#2 base: ' + resp.options.gddBase2 + '°' + config.temp.units;
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
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false,
            zoomType: 'x'
        },
        title: {text: 'Temperature Sum'},
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
                title: {text: 'Total °' + config.temp.units},
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
        url: 'api/dailygraphdata/tempsumdata.json',
        dataType: 'json',
        success: function (resp) {
            var subtitle = '';
            if (available.TempSum.indexOf('Sum0') != -1) {
                subtitle = 'Sum#0 base: 0°' + config.temp.units;
                if (available.TempSum.indexOf('Sum1') != -1 || available.TempSum.indexOf('Sum2') != -1) {
                    subtitle += ' - ';
                }
            }
            if (available.TempSum.indexOf('Sum1') != -1) {
                subtitle += 'Sum#1 base: ' + resp.options.sumBase1 + '°' + config.temp.units;
                if (available.TempSum.indexOf('Sum2') != -1) {
                    subtitle += ' - ';
                }
            }
            if (available.TempSum.indexOf('Sum2') != -1) {
                subtitle += 'Sum#2 base: ' + resp.options.sumBase2 + '°' + config.temp.units;
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

            chart.hideLoading();
            chart.redraw();
        }
    });
};
