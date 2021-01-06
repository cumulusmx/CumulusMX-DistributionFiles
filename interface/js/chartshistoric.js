var chart, config;

$(document).ready(function () {
    $('.btn').change(function () {

        var myRadio = $('input[name=options]');
        var checkedValue = myRadio.filter(':checked').val();

        switch (checkedValue) {
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
        }
    });

    $.ajax({url: "api/settings/version.json", dataType: "json", success: function (result) {
            $('#Version').text(result.Version);
            $('#Build').text(result.Build);
        }});

    $.ajax({url: "api/graphdata/graphconfig.json", success: function (result) {
            config = result;
            doTemp();
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
            var idxs = ['minTemp', 'maxTemp', 'avgTemp', 'heatIndex', 'minApp', 'maxApp', 'minDew', 'maxDew', 'minFeels', 'maxFeels', 'humidex'];
            var cnt = 0;
            idxs.forEach(function(idx) {
                if (idx in resp) {
                    chart.addSeries({
                        name: titles[idx],
                        data: resp[idx],
                        visible: visibility[idx]
                    }, false);

                    if (idx === 'humidex') {
                        chart.series[cnt].tooltipOptions.valueSuffix = '';
                        // Link Humidex and temp scales if using Celsius
                        // For farenheight use separate scales
                        if (config.temp.units = 'C') {
                            chart.yAxis[1].options.title.text = '';
                        } else {
                            chart.yAxis[1].options.linkedTo = null;
                            chart.series[cnt].yAxis = 1;
                        }
                    }
                    cnt++;
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
                }
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
                tooltip: {valueSuffix: ' ' + config.rain.units}
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
                sunHours: 'bar'
            };
            var yAxes = {
                solarRad: 'solar',
                uvi     : 'UV',
                sunHours: 'sunHrs'
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
            var idxs = ['solarRad', 'uvi', 'sunHours'];
            idxs.forEach(function(idx) {
                if (idx in resp) {
                    if (idx === 'uvi') {
                        chart.addAxis({
                            id: 'UV',
                            title: {text: 'UV Index'},
                            opposite: true,
                            min: 0,
                            labels: {
                                align: 'left'
                            }
                        });
                    } else if (idx === 'sunHours') {
                        chart.addAxis({
                            id: 'sunHrs',
                            title: {text: 'Sunshine Hours'},
                            opposite: true,
                            min: 0,
                            labels: {
                                align: 'left'
                            }
                        });
                    } else if (idx === 'solarRad') {
                        chart.addAxis({
                            id: 'solar',
                            title: {text: 'Solar Radiation (W/m\u00B2)'},
                            min: 0,
                            opposite: false,
                            labels: {
                                align: 'right',
                                x: -5
                            }
                        });
                    }
                    chart.addSeries({
                        name: titles[idx],
                        type: types[idx],
                        yAxis: yAxes[idx],
                        tooltip: tooltips[idx],
                        data: resp[idx]
                    }, false);
                }
            });

            chart.hideLoading();
            chart.redraw();
        }
    });
};

