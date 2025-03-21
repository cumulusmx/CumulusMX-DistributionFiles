// Last modified: 2024/10/29 10:11:47

var chart, config, doSelect;

var myRanges = {
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
};

$(document).ready(function () {
    $('#mySelect').change(function () {
        doSelect($('#mySelect').val());
    });

    $.ajax({
        url: '/api/graphdata/availabledata.json',
        dataType: 'json',
        success: function (result) {
            if (result.Temperature === undefined || result.Temperature.Count == 0) {
                $('#mySelect option[value="temp"]').remove();
            }
            if (result.DailyTemps === undefined || result.DailyTemps.Count == 0) {
                $('#mySelect option[value="dailytemp"]').remove();
            }
            if (result.Humidity === undefined || result.Humidity.Count == 0) {
                $('#mySelect option[value="humidity"]').remove();
            }
            if (result.Solar === undefined || result.Solar.Count == 0) {
                $('#mySelect option[value="solar"]').remove();
            }
            if (result.Sunshine === undefined || result.Sunshine.Count == 0) {
                $('#mySelect option[value="sunhours"]').remove();
            }
            if (result.AirQuality === undefined || result.AirQuality.Count == 0) {
                $('#mySelect option[value="airquality"]').remove();
            }
            if (result.ExtraTemp == undefined || result.ExtraTemp.Count == 0) {
                $('#mySelect option[value="extratemp"]').remove();
            }
            if (result.ExtraHum == undefined || result.ExtraHum.Count == 0) {
                $('#mySelect option[value="extrahum"]').remove();
            }
            if (result.ExtraDewPoint == undefined || result.ExtraDewPoint.Count == 0) {
                $('#mySelect option[value="extradew"]').remove();
            }
            if (result.SoilTemp == undefined || result.SoilTemp.Count == 0) {
                $('#mySelect option[value="soiltemp"]').remove();
            }
            if (result.SoilMoist == undefined || result.SoilMoist.Count == 0) {
                $('#mySelect option[value="soilmoist"]').remove();
            }
            if (result.LeafWetness == undefined || result.LeafWetness.Count == 0) {
                $('#mySelect option[value="leafwet"]').remove();
            }
            if (result.UserTemp == undefined || result.UserTemp.Count == 0) {
                $('#mySelect option[value="usertemp"]').remove();
            }
            if (result.CO2 == undefined || result.CO2.Count == 0) {
                $('#mySelect option[value="co2"]').remove();
            }
        }
    });

    doSelect = function (sel) {
        switch (sel) {
            case 'temp':
                doTemp();
                break;
            case 'dailytemp':
                doDailyTemp();
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
            case 'dailyrain':
                doDailyRain();
                break;
            case 'humidity':
                doHum();
                break;
            case 'solar':
                doSolar();
                break;
            case 'sunhours':
                doSunHours();
                break;
            case 'airquality':
                doAirQuality();
                break;
            case 'extratemp':
                doExtraTemp();
                break;
            case 'extrahum':
                doExtraHum();
                break;
            case 'extradew':
                doExtraDew();
                break;
            case 'soiltemp':
                doSoilTemp();
                break;
            case 'soilmoist':
                doSoilMoist();
                break;
            case 'leafwet':
                doLeafWet();
                break;
            case 'usertemp':
                doUserTemp();
                break;
            case 'co2':
                doCO2();
                break;
            default:
                doTemp();
                break;
        }

        parent.location.hash = sel;
    };

    $.ajax({url: '/api/info/version.json', dataType: 'json', success: function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    }});

    $.ajax({url: '/api/graphdata/graphconfig.json', success: function (result) {
        config = result;
        var value = parent.location.hash.replace('#', '');

        if (value == '')
            value = 'temp';

        doSelect(value);
        // set the correct option
        $('#mySelect option[value="' + value + '"]').attr('selected', true);
    }});
});

var doTemp = function () {
    var freezing = config.temp.units === 'C' ? 0 : 32;
    $('#chartdescription').text('Line chart showing recent temperature and various derived temperature values at a one minute resolution.');
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
                day: '%e %b',
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
                        return '<span style="fill: ' + (this.value <= freezing ? 'blue' : 'red') + ';">' + this.value + '</span>';
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
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [],
        rangeSelector: myRanges
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
           var titles = {
               'temp'     : 'Temperature',
               'dew'      : 'Dew Point',
               'apptemp'  : 'Apparent',
               'feelslike': 'Feels Like',
               'wchill'   : 'Wind Chill',
               'heatindex': 'Heat Index',
               'humidex'  : 'Humidex',
               'intemp'   : 'Inside'
            };
            var idxs = ['temp', 'dew', 'apptemp', 'feelslike', 'wchill', 'heatindex', 'humidex', 'intemp'];
            var yaxis = 0;

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
                            }, false, false);

                            yaxis = 'humidex';
                        }
                    }

                    chart.addSeries({
                        name: titles[idx],
                        id: 'series-' + idx,
                        data: resp[idx],
                        color: config.series[idx].colour,
                        yAxis: yaxis,
                        tooltip: {valueSuffix: valueSuffix}
                    }, false);

                    if (idx === 'temp') {
                        chart.get('series-' + idx).options.zIndex = 99;
                    }
                }
            });
            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doPress = function () {
    $('#chartdescription').text('Line chart showing recent pressure values at a one minute resolution.');
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
                day: '%e %b',
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
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [{
                name: 'Pressure',
                color: config.series.press.colour
            }],
        rangeSelector: myRanges
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/pressdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.series[0].setData(resp.press);
        }
    });
};

var compassP = function (deg) {
    var a = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return a[Math.floor((deg + 22.5) / 45) % 8];
};

var doWindDir = function () {
    $('#chartdescription').text('Scatter chart showing recent wind bearing spot and average values at a one minute resolution.');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'scatter',
            alignTicks: false
        },
        title: {text: 'Wind Direction'},
        credits: {enabled: true},
        boost: {
            useGPUTranslations: false,
            usePreAllocated: true
        },
        navigator: {
            series: {
                // pseudo scatter
                type: 'line',
                dataGrouping: {
                    groupPixelWidth: 1,
                    anchor: 1
                },
                lineWidth: 0,
                marker   : {
                    // enable the marker to simulate a scatter
                    enabled: true,
                    radius : 1
                }
            }
        },
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
        yAxis: [{
                // left
                title: {text: 'Bearing'},
                opposite: false,
                min: 0,
                max: 360,
                tickInterval: 45,
                labels: {
                    align: 'right',
                    x: -5,
                    formatter() {
                        return compassP(this.value);
                    }
                }
            }, {
                // right
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                title: {text: null},
                min: 0,
                max: 360,
                tickInterval: 45,
                labels: {
                    align: 'left',
                    x: 5,
                    formatter: function () {
                        return compassP(this.value);
                    }
                }
            }],
        legend: {enabled: true},
        plotOptions: {
            scatter: {
                animationLimit: 1,
                cursor: 'pointer',
                enableMouseTracking: true,
                boostThreshold: 200,
                marker: {
                    states: {
                        hover: {enabled: false},
                        select: {enabled: false}
                    }
                },
                shadow: false,
                //label: {enabled: false}
            }
        },
        tooltip: {
            enabled: true,
            split: true,
            useHTML: true
        },
        series: [{
                name: 'Bearing',
                type: 'scatter',
                color: config.series.bearing.colour,
                marker: {
                    symbol: 'circle',
                    radius: 2
                },
                enableMouseTracking: false,
                showInNavigator: false
            }, {
                name: 'Avg Bearing',
                type: 'scatter',
                color: config.series.avgbearing.colour,
                marker: {
                    symbol: 'circle',
                    radius: 2
                },
                showInNavigator: true,
                tooltip: {
                    headerFormat: '',
                    xDateFormat: '%A, %b %e %H:%M ',
                    pointFormatter() {
                        return '<span style="color:' + this.color + '">\u25CF</span> ' +
                            this.series.name + ': <b>' + (this.y == 0 ? 'calm' : this.y + '°') + '</b><br/>';
                    }
                }
            }
        ],
        rangeSelector: myRanges
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/wdirdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.series[0].setData(resp.bearing);
            chart.series[1].setData(resp.avgbearing);
        }
    });
};

var doWind = function () {
    $('#chartdescription').text('Line chart showing recent average wind speed and gust values at a one minute resolution.');
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
                day: '%e %b',
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
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                min: 0,
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
            valueSuffix: ' ' + config.wind.units,
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [{
                name: 'Wind Speed',
                color: config.series.wspeed.colour,
                tooltip: {
                    valueDecimals: config.wind.avgdecimals
                }
            }, {
                name: 'Wind Gust',
                color: config.series.wgust.colour,
                tooltip: {
                    valueDecimals: config.wind.gustdecimals
                }
        }],
        rangeSelector: myRanges
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/winddata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();

            chart.series[0].setData(resp.wspeed);
            chart.series[1].setData(resp.wgust);
        }
    });
};

var doRain = function () {
    $('#chartdescription').text('Line chart showing the cumulative daily rainfall and rainfall rate at a one minute resolution');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: true
        },
        title: {text: 'Rainfall'},
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
        yAxis: [{
                // left
                title: {text: 'Rainfall rate (' + config.rain.units + '/hr)'},
                min: 0,
                opposite: false,
                labels: {
                    align: 'right',
                    x: -5
                },
                showEmpty: false
            }, {
                // right
                opposite: true,
                title: {text: 'Rainfall (' + config.rain.units + ')'},
                min: 0,
                labels: {
                    align: 'left',
                    x: 5
                }
            }],
        legend: {enabled: true},
        plotOptions: {
            series: {
                boostThreshold: 0,
                dataGrouping: {
                    enabled: false
                },
                showInNavigator: true,
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
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [{
                name: 'Daily rain',
                type: 'area',
                color: config.series.rfall.colour,
                yAxis: 1,
                tooltip: {valueSuffix: ' ' + config.rain.units},
                fillOpacity: 0.3
            }, {
                name: 'Rain rate',
                type: 'line',
                color: config.series.rrate.colour,
                yAxis: 0,
                tooltip: {valueSuffix: ' ' + config.rain.units + '/hr'}
        }],
        rangeSelector: myRanges
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/raindata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.series[0].setData(resp.rfall);
            chart.series[1].setData(resp.rrate);
        }
    });
};

var doHum = function () {
    $('#chartdescription').text('Line chart showing outdoor (and optionally indoor) relative humidity at a one minute resolution.');
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
                day: '%e %b',
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
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [],
        rangeSelector: myRanges
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/humdata.json',
        dataType: 'json',
        success: function (resp) {
            var titles = {
                'hum'  : 'Outdoor Humidity',
                'inhum': 'Indoor Humidity'
             }
             var idxs = ['hum', 'inhum'];
             var cnt = 0;
             idxs.forEach(function(idx) {
                 if (idx in resp) {
                     chart.addSeries({
                         name: titles[idx],
                         color: config.series[idx].colour,
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
    $('#chartdescription').text('Line chart showing recent solar irradiation and UV index values at a one minute resolution. This station may not have both sensors. For comparision the chart also shows the calculated theoretical solar value.');
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
                boostThreshold: 0,
                dataGrouping: {
                    enabled: false
                },
                showInNavigator: true,
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
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [],
        rangeSelector: myRanges
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/solardata.json',
        dataType: 'json',
        success: function (resp) {
            var titles = {
                SolarRad       : 'Solar Radiation',
                CurrentSolarMax: 'Theoretical Max',
                UV: 'UV Index'
            };
            var types = {
                SolarRad: 'area',
                CurrentSolarMax: 'area',
                UV: 'line'
            };
            var tooltips = {
                SolarRad: {
                    valueSuffix: ' W/m\u00B2',
                    valueDecimals: 0
                },
                CurrentSolarMax: {
                    valueSuffix: ' W/m\u00B2',
                    valueDecimals: 0
                },
                UV: {
                    valueSuffix: null,
                    valueDecimals: config.uv.decimals
                }
            };

            var idxs = ['SolarRad', 'CurrentSolarMax', 'UV'];
            var cnt = 0;
            var solarAxisCreated = false;

            idxs.forEach(function(idx) {
                if (idx in resp) {
                    if (idx === 'UV') {
                        chart.addAxis({
                            id: 'uv',
                            title:{text: 'UV Index'},
                            opposite: true,
                            min: 0,
                            labels: {
                                align: 'left'
                            }
                        });
                    } else if (!solarAxisCreated) {
                        chart.addAxis({
                            id: 'solar',
                            title: {text: 'Solar Radiation (W/m\u00B2)'},
                            min: 0,
                            opposite: false,
                            labels: {
                                align: 'right',
                                x: -5
                            },
                            showEmpty: false
                        });
                        solarAxisCreated = true;
                    }

                    chart.addSeries({
                        name: titles[idx],
                        type: types[idx],
                        yAxis: idx === 'UV' ? 'uv' : 'solar',
                        tooltip: tooltips[idx],
                        data: resp[idx],
                        color: config.series[idx.toLowerCase()].colour,
                        fillOpacity: idx === 'CurrentSolarMax' ? 0.2 : 0.5,
                        zIndex: 100 - cnt
                    }, false);

                    cnt++;
                }
            });

            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doSunHours = function () {
    $('#chartdescription').text('Bar chart showing recent daily sunshine hours values.');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'column',
            alignTicks: false
        },
        title: {text: 'Sunshine Hours'},
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
        yAxis: [{
                // left
                title: {text: 'Sunshine Hours'},
                min: 0,
                opposite: false,
                labels: {
                    align: 'right',
                    x: -12
                }
            }, {
                // right
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                title: {text: null},
                labels: {
                    align: 'left',
                    x: 12
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
            }
        },
        tooltip: {
            shared: true,
            split: false,
            xDateFormat: "%A, %b %e"
        },
        series: [{
                name: 'Sunshine Hours',
                type: 'column',
                color: config.series.sunshine.colour,
                yAxis: 0,
                valueDecimals: 1,
                tooltip: {valueSuffix: ' Hrs'}
            }]
    };

    chart = new Highcharts.Chart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/sunhours.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.series[0].setData(resp.sunhours);
        }
    });
};

var doDailyRain = function () {
    $('#chartdescription').text('Bar chart showing recent daily rainfall values.');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'column',
            alignTicks: false
        },
        title: {text: 'Daily Rainfall'},
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
        yAxis: [{
                // left
                title: {text: 'Daily Rainfall'},
                min: 0,
                opposite: false,
                labels: {
                    align: 'right',
                    x: -12
                }
            }, {
                // right
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                title: {text: null},
                labels: {
                    align: 'left',
                    x: 12
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
            }
        },
        tooltip: {
            shared: true,
            split: false,
            xDateFormat: "%A, %b %e"
        },
        series: [{
                name: 'Daily Rainfall',
                type: 'column',
                color: config.series.rfall.colour,
                yAxis: 0,
                valueDecimals: config.rain.decimals,
                tooltip: {valueSuffix: ' ' + config.rain.units}
            }]
    };

    chart = new Highcharts.Chart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/dailyrain.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.series[0].setData(resp.dailyrain);
        }
    });
};

var doDailyTemp = function () {
    $('#chartdescription').text('Line chart showing recent daily temperature values. Shown are the maximum, minimum, and average temperatures for each day. The site owner may choose to not display all these values');
    var freezing = config.temp.units === 'C' ? 0 : 32;
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'Daily Temperature'},
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
        yAxis: [{
                // left
                title: {text: 'Daily Temperature (°' + config.temp.units + ')'},
                opposite: false,
                labels: {
                    align: 'right',
                    x: -5,
                    formatter: function () {
                        return '<span style="fill: ' + (this.value <= 0 ? 'blue' : 'red') + ';">' + this.value + '</span>';
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
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
                title: {text: null},
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
            xDateFormat: "%A, %b %e"
        },
        rangeSelector: {
            enabled: false
        },
        series: []
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/dailytemp.json',
        dataType: 'json',
        success: function (resp) {
            var titles = {
                'avgtemp': 'Avg Temp',
                'mintemp': 'Min Temp',
                'maxtemp': 'Max Temp'
            };
            var idxs = ['avgtemp', 'mintemp', 'maxtemp'];

            idxs.forEach(function (idx) {
                if (idx in resp) {
                    chart.addSeries({
                        name: titles[idx],
                        data: resp[idx],
                        color: config.series[idx].colour
                    }, false);
                }
            });

            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doAirQuality = function () {
    $('#chartdescription').text('Line chart showing recent air bourne particulate matter concentrations at a one minute resolution. Air quality is typically measured using two particulate sizes of 2.5 microns and 10 microns.');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'Air Quality'},
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
        yAxis: [{
                // left
                title: {text: 'µg/m³'},
                opposite: false,
                min: 0,
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
            valueSuffix: ' µg/m³',
            valueDecimals: 1,
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [],
        rangeSelector: myRanges
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/airqualitydata.json',
        dataType: 'json',
        success: function (resp) {
            var titles = {
                'pm2p5': 'PM 2.5',
                'pm10' : 'PM 10'
             }
             var idxs = ['pm2p5', 'pm10'];
             idxs.forEach(function(idx) {
                 if (idx in resp) {
                     chart.addSeries({
                         name: titles[idx],
                         color: config.series[idx].colour,
                         data: resp[idx]
                     }, false);
                 }
             });

            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doExtraTemp = function () {
    $('#chartdescription').text('Line chart showing recent additional temperature sensor values at a one minute resolution. These sensors can display any sort of data from pool temperatures to freezer temperatures depending on station usage.');
    var freezing = config.temp.units === 'C' ? 0 : 32;
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'Extra Temperature'},
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
                        return '<span style="fill: ' + (this.value <= freezing ? 'blue' : 'red') + ';">' + this.value + '</span>';
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
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [],
        rangeSelector: myRanges
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/extratemp.json',
        dataType: 'json',
        success: function (resp) {
            Object.entries(resp).forEach(([key, value]) => {
                var id = config.series.extratemp.name.findIndex(val => val == key);
                chart.addSeries({
                    name: key,
                    color: config.series.extratemp.colour[id],
                    data: value
                });
             });

            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doExtraHum = function () {
    $('#chartdescription').text('Line chart showing recent additional humidity sensor values at a one minute resolution. These sensors are unique to the station and placed to suit the station requirements.');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'Extra Humidity'},
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
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [],
        rangeSelector: myRanges
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/extrahum.json',
        dataType: 'json',
        success: function (resp) {
            Object.entries(resp).forEach(([key, value]) => {
                var id = config.series.extrahum.name.findIndex(val => val == key);
                chart.addSeries({
                    name: key,
                    color: config.series.extrahum.colour[id],
                    data: value
                });
             });

            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doExtraDew = function () {
    $('#chartdescription').text('Line chart showing recent additional dew point sensor values at a one minute resolution. These sensors are unique to the station and placed to suit the station requirements.');
    var freezing = config.temp.units === 'C' ? 0 : 32;
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'Extra Dew Point'},
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
        yAxis: [{
                // left
                title: {text: 'Dew Point (°' + config.temp.units + ')'},
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
                        return '<span style="fill: ' + (this.value <= freezing ? 'blue' : 'red') + ';">' + this.value + '</span>';
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
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [],
        rangeSelector: myRanges
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/extradew.json',
        dataType: 'json',
        success: function (resp) {
            Object.entries(resp).forEach(([key, value]) => {
                var id = config.series.extradew.name.findIndex(val => val == key);
                chart.addSeries({
                    name: key,
                    color: config.series.extradew.colour[id],
                    data: value
                });
             });

            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doSoilTemp = function () {
    $('#chartdescription').text('Line chart showing recent soil tempertaure sensor values at a one minute resolution. These sensors are unique to the station and placed at depths to suit the station requirements.');
    var freezing = config.temp.units === 'C' ? 0 : 32;
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'Soil Temperature'},
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
                        return '<span style="fill: ' + (this.value <= freezing ? 'blue' : 'red') + ';">' + this.value + '</span>';
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
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [],
        rangeSelector: myRanges
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/soiltemp.json',
        dataType: 'json',
        success: function (resp) {
            Object.entries(resp).forEach(([key, value]) => {
                var id = config.series.soiltemp.name.findIndex(val => val == key);
                chart.addSeries({
                    name: key,
                    color: config.series.soiltemp.colour[id],
                    data: value
                });
             });

            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doSoilMoist = function () {
    $('#chartdescription').text('Line chart showing recent soil moisture sensor values at a one minute resolution. These sensors are unique to the station and placed at depths to suit the station requirements.');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'Soil Moisture'},
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
        yAxis: [{
                // left
                title: {text: 'Soil Moisture'},
                opposite: false,
                labels: {
                    align: 'right',
                    x: -5
                }
            }, {
                // right
                gridLineWidth: 0,
                opposite: true,
                linkedTo: 0,
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
            //valueSuffix: ' ' + config.soilmoisture.units,
            valueDecimals: 0,
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [],
        rangeSelector: myRanges
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/soilmoist.json',
        dataType: 'json',
        success: function (resp) {
            Object.entries(resp).forEach(([key, value]) => {
                var id = config.series.soilmoist.name.findIndex(val => val == key);
                chart.addSeries({
                    name: key,
                    color: config.series.soilmoist.colour[id],
                    data: value,
                    tooltip: {valueSuffix: ' ' + config.soilmoisture.units[id]}
                });
             });

            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doLeafWet = function () {
    $('#chartdescription').text('Line chart showing recent leaf wetness sensor values at a one minute resolution. These sensors are unique to the station and placed to suit the station requirements.');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'Leaf Wetness'},
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
        yAxis: [{
                // left
                title: {text: 'Leaf Wetness' + (config.leafwet.units == '' ? '' : '(' + config.leafwet.units + ')')},
                opposite: false,
                min: 0,
                labels: {
                    align: 'right',
                    x: -5
                }
            }, {
                // right
                gridLineWidth: 0,
                opposite: true,
                min: 0,
                linkedTo: 0,
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
            valueSuffix: ' ' + config.leafwet.units,
            valueDecimals: config.leafwet.decimals,
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [],
        rangeSelector: myRanges
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/leafwetness.json',
        dataType: 'json',
        success: function (resp) {
            Object.entries(resp).forEach(([key, value]) => {
                var id = config.series.leafwet.name.findIndex(val => val == key);
                chart.addSeries({
                    name: key,
                    color: config.series.leafwet.colour[id],
                    data: value
                });
             });

            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doUserTemp = function () {
    $('#chartdescription').text('Line chart showing recent additional temperature sensor values at a one minute resolution. These sensors can display any sort of data from pool temperatures to freezer temperatures depending on station usage.');
    var freezing = config.temp.units === 'C' ? 0 : 32;
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'User Temperature'},
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
                        return '<span style="fill: ' + (this.value <= freezing ? 'blue' : 'red') + ';">' + this.value + '</span>';
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
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [],
        rangeSelector: myRanges
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/usertemp.json',
        dataType: 'json',
        success: function (resp) {
            Object.entries(resp).forEach(([key, value]) => {
                var id = config.series.usertemp.name.findIndex(val => val == key);
                chart.addSeries({
                    name: key,
                    color: config.series.usertemp.colour[id],
                    data: value
                });
             });

            chart.hideLoading();
            chart.redraw();
        }
    });
};

var doCO2 = function () {
    $('#chartdescription').text('Line chart showing recent carbon dioxide sensor values at a one minute resolution. Typically these sensors only provide meaningful data indoors. This sensor may also show particulate matter, temperature and humidity values.');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false
        },
        title: {text: 'CO&#8322; Sensor'},
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
        yAxis: [{
                // left
                id: 'co2',
                title: {text: 'CO&#8322; (ppm)'},
                opposite: false,
                min: 0,
                minRange: 10,
                alignTicks: true,
                showEmpty: false,
                labels: {
                    align: 'right',
                    x: -5
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
            split: true,
            xDateFormat: "%A, %b %e, %H:%M"
        },
        series: [],
        rangeSelector: myRanges
    };

    chart = new Highcharts.StockChart(options);
    chart.showLoading();

    $.ajax({
        url: '/api/graphdata/co2sensor.json',
        dataType: 'json',
        success: function (resp) {
            Object.entries(resp).forEach(([key, value]) => {
                var yaxis = 0;
                var tooltip;
                // id - remove all spaces and lowercase
                var id = key.toLowerCase().split(' ').join('');

                if (key == 'CO2' || key == 'CO2 Average') {
                    yaxis = 'co2';
                    tooltip = {valueSuffix: ' ppm'};
                } else if (key.startsWith('PM')) {
                    yaxis = 'pm';
                    tooltip = {valueSuffix: ' &#181;g/m&#179;'};


                    if (!chart.get('pm')) {
                        chart.addAxis({
                            // left
                            id: 'pm',
                            title: {text: 'PM (&#181;g/m&#179;)'},
                            opposite: false,
                            min: 0,
                            minRange: 10,
                            alignTicks: true,
                            showEmpty: false,
                            labels: {
                                align: 'right',
                                x: -5
                            }
                        });
                    }
                } else if (key == 'Temperature') {
                    yaxis = 'temp';
                    tooltip = {valueSuffix: ' °' + config.temp.units};
                    chart.addAxis({
                        // right
                        id: 'temp',
                        title: {text: 'Temperature (°' + config.temp.units + ')'},
                        //gridLineWidth: 0,
                        opposite: true,
                        alignTicks: true,
                        showEmpty: false,
                        labels: {
                            align: 'left',
                            x: 5
                        }
                    });
                } else if (key == 'Humidity') {
                    yaxis = 'hum';
                    tooltip = {valueSuffix: ' %'};
                    chart.addAxis({
                        // right
                        id: 'hum',
                        title: {text: 'Humidity (%)'},
                        min: 0,
                        //gridLineWidth: 0,
                        opposite: true,
                        alignTicks: true,
                        showEmpty: false,
                        labels: {
                            align: 'left',
                            x: 5
                        }
                    });
                }

                chart.addSeries({
                    name: config.series.co2[id].name,
                    color: config.series.co2[id].colour,
                    data: value,
                    yAxis: yaxis,
                    tooltip: tooltip
                });

             });

            chart.hideLoading();
            chart.redraw();
        }
    });
};
