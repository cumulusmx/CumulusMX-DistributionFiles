// Last modified: 2025/11/15 16:06:06

let mainChart, navChart, config, avail;

const myRangeBtns = {
    buttons: [{
        count: 12,
        type: 'hour',
        text: '{{TIME_12H}}'
    }, {
        count: 24,
        type: 'hour',
        text: '{{TIME_24H}}'
    }, {
        count: 2,
        type: 'day',
        text: '{{TIME_2D}}'
    }, {
        type: 'all',
        text: '{{ALL}}'
    }],
    selected: 1
};

let defaultEnd, defaultStart, selection;
let dragging = null;
let dragStartX = 0;
let currentCursor = 'default';
let temperatureScale;

const availRes = $.getJSON({url: '/api/graphdata/availabledata.json'});
const configRes = $.getJSON({url: '/api/graphdata/graphconfig.json'});

$(document).ready(() => {
    $('#mySelect').change(function () {
        doSelect($('#mySelect').val());
    });

    Promise.all([availRes, configRes])
    .then((results) => {
        // available data
        avail = results[0];
        config = results[1];

        if (avail.Temperature === undefined || avail.Temperature.length == 0) {
            $('#mySelect option[value="temp"]').remove();
        }
        if (avail.DailyTemps === undefined || avail.DailyTemps.length == 0) {
            $('#mySelect option[value="dailytemp"]').remove();
        }
        if (avail.Humidity === undefined || avail.Humidity.length == 0) {
            $('#mySelect option[value="humidity"]').remove();
        }
        if (avail.Solar === undefined || avail.Solar.length == 0) {
            $('#mySelect option[value="solar"]').remove();
        }
        if (avail.Sunshine === undefined || avail.Sunshine.length == 0) {
            $('#mySelect option[value="sunhours"]').remove();
        }
        if (avail.AirQuality === undefined || avail.AirQuality.length == 0) {
            $('#mySelect option[value="airquality"]').remove();
        }
        if (avail.ExtraTemp == undefined || avail.ExtraTemp.length == 0) {
            $('#mySelect option[value="extratemp"]').remove();
        }
        if (avail.ExtraHum == undefined || avail.ExtraHum.length == 0) {
            $('#mySelect option[value="extrahum"]').remove();
        }
        if (avail.ExtraDewPoint == undefined || avail.ExtraDewPoint.length == 0) {
            $('#mySelect option[value="extradew"]').remove();
        }
        if (avail.SoilTemp == undefined || avail.SoilTemp.length == 0) {
            $('#mySelect option[value="soiltemp"]').remove();
        }
        if (avail.SoilMoist == undefined || avail.SoilMoist.length == 0) {
            $('#mySelect option[value="soilmoist"]').remove();
        }
        if (avail.LeafWetness == undefined || avail.LeafWetness.length == 0) {
            $('#mySelect option[value="leafwet"]').remove();
        }
        if (avail.UserTemp == undefined || avail.UserTemp.length == 0) {
            $('#mySelect option[value="usertemp"]').remove();
        }
        if (avail.CO2 == undefined || avail.CO2.length == 0) {
            $('#mySelect option[value="co2"]').remove();
        }
        if (avail.LaserDepth == undefined || avail.LaserDepth.length == 0) {
            $('#mySelect option[value="laserdepth"]').remove();
        }

        CmxChartJsHelpers.SetRangeButtons('rangeButtons', myRangeBtns.buttons);
        CmxChartJsHelpers.SetupNavigatorSelection('navChart')

        // Global plugins
        Chart.register(CmxChartJsPlugins.chartAreaBorder);

        Chart.defaults.locale = config.locale;
        Chart.defaults.scales.time.adapters = {date: {zone: config.tz}}
        Chart.defaults.datasets.line.pointRadius = 0;
        Chart.defaults.datasets.line.pointHoverRadius = 5;
        Chart.defaults.datasets.line.borderWidth = 2;
        Chart.defaults.scales.linear.title = {font: {weight: 'bold', size: 14}};
        Chart.defaults.scales.linear.ticks.precision = 0;
        Chart.defaults.scales.linear.grace = '2.5%';
        // set legend to use point style of line
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
        Chart.defaults.plugins.legend.labels.pointStyle = 'line';
        // set legend to show a common tooltip for all data series
        Chart.defaults.interaction.mode = 'index';
        Chart.defaults.interaction.intersect = false;
        Chart.defaults.plugins.tooltip.boxHeight = 2;
        Chart.defaults.plugins.title.font.size = 18;
        Chart.defaults.plugins.title.font.color = '#000';
        Chart.defaults.plugins.decimation.enabled = true;
        Chart.defaults.plugins.chartAreaBorder = {borderColor: '#858585'}

        const freezing = config.temp.units === 'C' ? 0 : 32;
        temperatureScale = {
            title: {
                display: true,
                text: `{{TEMPERATURE}} (°${config.temp.units})`
            },
            grid: {
                color: (line) => (line.tick.value === freezing ? 'blue' : 'rgba(0, 0, 0, 0.1)')
            },
            ticks: {
                color: (context) => {
                    return context.tick.value <= freezing ? 'blue' : 'red'
                }
            }
        };

        document.getElementById('btnFullscreen').addEventListener('click', () => {
            CmxChartJsHelpers.ToggleFullscreen(document.getElementById('chartcontainer'));
        });

        let value = parent.location.hash.replace('#', '');

        if (value == '') value = 'temp';

        doSelect(value);
        // set the correct option
        $('#mySelect option[value="' + value + '"]').attr('selected', true);

    });

    doSelect = (sel) => {
        CmxChartJsHelpers.ShowLoading();

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
            case 'laserdepth':
                doLaserDepth();
                break;
            default:
                doTemp();
                break;
        }

        parent.location.hash = sel;
    };

    $.getJSON({url: '/api/info/version.json'})
    .done((result) => {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    });
});

const doTemp = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_RECENT_TEMP_DESC}}');

    $.getJSON({
        url: '/api/graphdata/tempdata.json'
    })
    .done((resp) => {
        const titles = {
            'temp'     : '{{TEMPERATURE}}',
            'dew'      : '{{DEW_POINT}}',
            'apptemp'  : '{{APPARENT_TEMP_SHORT}}',
            'feelslike': '{{FEELS_LIKE}}',
            'wchill'   : '{{WIND_CHILL}}',
            'heatindex': '{{HEAT_INDEX}}',
            'humidex'  : '{{HUMIDEX}}',
            'intemp'   : '{{INDOOR}}'
        };

        const idxs = ['temp', 'dew', 'apptemp', 'feelslike', 'wchill', 'heatindex', 'humidex', 'intemp'];

        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const xscale = CmxChartJsHelpers.TimeScale;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale,
            y_temp: temperatureScale
        };

        let dataSets = [];

        idxs.forEach((idx) => {
            if (idx in resp) {
                dataSets.push({
                    label: titles[idx],
                    data: resp[idx],
                    borderColor: config.series[idx].colour,
                    backgroundColor: config.series[idx].colour,
                    yAxisID: 'y_temp',
                    tooltip: {
                        callbacks: {
                            label: item => ` ${item.dataset.label} ${item.parsed.y.toFixed(config.temp.decimals)} °${config.temp.units}`
                        }
                    }
                });
            }
        });

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true
                    },
                    title: {
                        display: true,
                        text: titles.temp
                    }
                }
            }
        });

        const navDataset = {
            label: 'Navigator',
            data: resp[key],
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.15
        };

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: CmxChartJsHelpers.NavChartOptions,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const doPress = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_RECENT_PRESS_DESC}}');

    $.getJSON({
        url: '/api/graphdata/pressdata.json'
    })
    .done((resp) => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const xscale = CmxChartJsHelpers.TimeScale;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale,
            y_press: {
                id: 'press',
                title: {
                    display: true,
                    text: `{{PRESSURE}} (${config.press.units})`
                },
                ticks: {
                    // suppress thousands separator for hPa
                    callback: (value, index, ticks) => { return Number(value); }
                }
            }
        };

        let dataSet = {
            label: '{{PRESSURE}}',
            data: resp.press,
            borderColor: config.series.press.colour,
            backgroundColor: config.series.press.colour,
            yAxisID: 'y_press',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y.toFixed(config.press.decimals)} ${config.press.units}`
                }
            }
        };

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            data: {datasets: [dataSet]},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: '{{PRESSURE}}'
                    }
                }
            }
        });

        const navDataset = {
            label: 'Navigator',
            data: resp.press,
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.15
        };

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: CmxChartJsHelpers.NavChartOptions,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const compassP = (deg) => {
    if (deg === 0) {
        return '{{WIND_CALM}}';
    }
    var a = ['{{COMPASS_N}}', '{{COMPASS_NE}}', '{{COMPASS_E}}', '{{COMPASS_SE}}', '{{COMPASS_S}}', '{{COMPASS_SW}}', '{{COMPASS_W}}', '{{COMPASS_NW}}'];
    return a[Math.floor((deg + 22.5) / 45) % 8];
};

const doWindDir = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_RECENT_WINDDIR_DESC}}');

    $.getJSON({
        url: '/api/graphdata/wdirdata.json'
    })
    .done((resp) => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const xscale = CmxChartJsHelpers.TimeScale;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale,
            y_bearing: {
                title: {
                    display: true,
                    text: '{{BEARING}}'
                },
                min: 0,
                max: 360,
                ticks: {
                    callback: (val, index) => {
                        return compassP(val);
                    },
                    stepSize: 30
                }
            }
        };

        let dataSets = [{
            label: config.series.avgbearing.name,
            data: resp.avgbearing,
            borderColor:  config.series.avgbearing.colour,
            backgroundColor: config.series.avgbearing.colour,
            yAxisID: 'y_bearing',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y == 0 ? 'calm' : item.parsed.y +'°'}`
                }
            }
        }, {
            label: config.series.bearing.name,
            data: resp.bearing,
            borderColor:  config.series.bearing.colour,
            backgroundColor: config.series.bearing.colour,
            yAxisID: 'y_bearing',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y == 0 ? 'calm' : item.parsed.y +'°'}`
                }
            }
        }];

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'scatter',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true
                    },
                    title: {
                        display: true,
                        text: '{{WIND_DIRECTION}}'
                    }
                }
            }
        });

        const navDataset = {
            label: 'Navigator',
            data: resp.avgbearing,
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.15
        };

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: CmxChartJsHelpers.NavChartOptions,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const doWind = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_RECENT_WIND_DESC}}');

    $.getJSON({
        url: '/api/graphdata/winddata.json'
    })
    .done(resp => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const xscale = CmxChartJsHelpers.TimeScale;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale,
            y_wind: {
                title: {
                    display: true,
                    text: `{{WIND_SPEED}} (${config.wind.units})`
                },
                min: 0
            }
        };

        let dataSets = [{
            label: '{{WIND_SPEED}}',
            data: resp.wspeed,
            borderColor: config.series.wspeed.colour,
            backgroundColor: config.series.wspeed.colour,
            yAxisID: 'y_wind',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y.toFixed(config.wind.avgdecimals)} ${config.wind.units}`
                }
            }
        }, {
            label: '{{WIND_GUST}}',
            data: resp.wgust,
            borderColor: config.series.wgust.colour,
            backgroundColor: config.series.wgust.colour,
            yAxisID: 'y_wind',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y.toFixed(config.wind.gustdecimals)} ${config.wind.units}`
                }
            }
        }];

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true,
                    },
                    title: {
                        display: true,
                        text: '{{WIND_SPEED}}'
                    }
                }
            }
        });

        const navDataset = {
            label: 'Navigator',
            data: resp.wgust,
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.15
        };

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: CmxChartJsHelpers.NavChartOptions,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const doRain = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_RECENT_RAIN_DESC}}');

    $.getJSON({
        url: '/api/graphdata/raindata.json'
    })
    .done(resp => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const xscale = CmxChartJsHelpers.TimeScale;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale,
            y_rain: {
                id: 'rain',
                title: {
                    display: true,
                    text: `{{RAINFALL}} (${config.rain.units})`
                },
                min: 0
            },
            y_rainRate: {
                id: 'rate',
                title: {
                    display: true,
                    text: `{{RAINFALL_RATE}} (${config.rain.units}/hr)`
                },
                grid: {display: false},
                min: 0,
                position: 'right'
            }
        };

        let dataSets = [{
            label: '{{DAILY_RAIN}}',
            fill: true,
            data: resp.rfall,
            borderColor: config.series.rfall.colour,
            backgroundColor: config.series.rfall.colour + '40', // add transparency
            yAxisID: 'y_rain',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y.toFixed(config.rain.decimals)} ${config.rain.units}`
                }
            },
            order: 1
        }, {
            label: '{{RAINFALL_RATE}}',
            data: resp.rrate,
            borderColor: config.series.rrate.colour,
            backgroundColor: config.series.rrate.colour,
            yAxisID: 'y_rainRate',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y.toFixed(config.rain.decimals)} ${config.rain.units}/hr`
                }
            },
            order: 0
        }];

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true,
                    },
                    title: {
                        display: true,
                        text: 'Rainfall'
                    }
                }
            },
            plugins: [CmxChartJsPlugins.hideUnusedAxesPlugin]
        });

        const navDataset = {
            label: 'Navigator',
            data: resp.rfall,
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.15
        };

        let navOptions = CmxChartJsHelpers.NavChartOptions;
        navOptions.scales.y.min = 0;

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: navOptions,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const doHum = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_RECENT_HUM_DESC}}');

    $.getJSON({
        url: '/api/graphdata/humdata.json'
    })
    .done(resp => {
        const titles = {
            'hum'  : '{{OUTDOOR_HUMIDITY}}',
            'inhum': '{{INDOOR_HUMIDITY}}'
        };
        const idxs = ['hum', 'inhum'];

        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const xscale = CmxChartJsHelpers.TimeScale;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale,
            y_hum: {
                id: 'hum',
                title: {
                    display: true,
                    text: '{{HUMIDITY}} (%)'
                },
                min: 0,
                max: 100
            }
        };

        let dataSets = [];

        idxs.forEach((idx) => {
            if (idx in resp) {
                dataSets.push({
                    label: titles[idx],
                    data: resp[idx],
                    borderColor: config.series[idx].colour,
                    backgroundColor: config.series[idx].colour,
                    yAxisID: 'y_hum',
                    tooltip: {
                        callbacks: {
                            label: item => ` ${item.dataset.label} ${item.parsed.y} %`
                        }
                    }
                });
            }
        });

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true
                    },
                    title: {
                        display: true,
                        text: '{{RELATIVE_HUMIDITY}}'
                    }
                }
            }
        });

        const navDataset = {
            label: 'Navigator',
            data: resp.hum,
            pointStyle: false,
            tension: 0.15
        };

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: CmxChartJsHelpers.NavChartOptions,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const doSolar = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_RECENT_SOLAR_DESC}}');

    $.getJSON({
        url: '/api/graphdata/solardata.json'
    })
   .done(resp => {
        const chartConfig = {
            SolarRad: {
                title: '{{SOLAR_RADIATION}}',
                type: 'area',
                order: 0,
                suffix: 'W/m²'
            },
            CurrentSolarMax: {
                title: '{{THEORETICAL_MAX}}',
                type: 'area',
                order: 2,
                suffix: 'W/m²'
            },
            UV: {
                title: '{{UV_INDEX}}',
                type: 'line',
                order: 1,
                suffix: ''
            }
        };

        const idxs = ['SolarRad', 'CurrentSolarMax', 'UV'];

        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const xscale = CmxChartJsHelpers.TimeScale;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale,
            y_uv: {
                title: {
                    display: true,
                    text: '{{UV_INDEX}}'
                },
                min: 0,
                position: 'right'
            },
            y_solar: {
                title: {
                    display: true,
                    text: '{{SOLAR_RADIATION}} (W/m²)'
                },
                min: 0
            }
        };

        let dataSets = [];

        idxs.forEach((idx) => {
            if (idx in resp) {
                dataSets.push({
                    label: chartConfig[idx].title,
                    fill: chartConfig[idx].type === 'area',
                    data: resp[idx],
                    borderColor: config.series[idx.toLowerCase()].colour,
                    backgroundColor: config.series[idx.toLowerCase()].colour + '40',
                    yAxisID: idx === 'UV' ? 'y_uv' : 'y_solar',
                    tooltip: {
                        callbacks: {
                            label: item => ` ${item.dataset.label} ${item.parsed.y} ${chartConfig[idx].suffix}`
                        }
                    },
                    order: chartConfig[idx].order
                });
            }
        });

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true
                    },
                    title: {
                        display: true,
                        text: '{{SOLAR}}'
                    }
                }
            },
            plugins: [CmxChartJsPlugins.hideUnusedAxesPlugin]
        });

        const navDataset = {
            label: 'Navigator',
            data: resp.SolarRad,
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.15
        };

        var opts = CmxChartJsHelpers.NavChartOptions;
        opts.scales.y.min = 0;

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: opts,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const doSunHours = () => {
    removeOldCharts(false);

    $('#chartdescription').text('{{CHART_RECENT_SUNSHOURS_DESC}}');

    $.getJSON({
        url: '/api/graphdata/sunhours.json'
    })
    .done(resp => {
        let scales = {
            x: {
                type: 'time',
                unit: 'day',
                offset: true
            },
            y_sun: {
                title: {
                    display: true,
                    text: '{{SUNSHINE_HOURS}}'
                },
                min: 0
            }
        };

        // normalize incoming data to explicit {x, y} points
        const dataPoints = resp.sunhours.map(p => {
            return { x: p[0], y: p[1] };
        });


        let dataSet = {
            label: '{{SUNSHINE_HOURS}}',
            data: dataPoints,
            borderColor: config.series.sunshine.colour,
            backgroundColor: config.series.sunshine.colour,
            yAxisID: 'y_sun',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} {{HOURS_SHORT}}`
                }
            }
        };

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'bar',
            data: {datasets: [dataSet]},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: '{{SUNSHINE_HOURS}}'
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const date = new Date(context[0].parsed.x);
                                return date.toLocaleString(config.locale, { day: '2-digit', month: 'long', year: 'numeric' });
                            }
                        }
                    }
                }
            }
        });
    });
};

const doDailyRain = () => {
    removeOldCharts(false);

    $('#chartdescription').text('{{CHART_RECENT_DAILYRAIN_DESC}}');

    $.getJSON({
        url: '/api/graphdata/dailyrain.json',
    })
    .done(resp => {
        let scales = {
            x: {
                type: 'time',
                unit: 'day',
                offset: true
            },
            y_rain: {
                title: {
                    display: true,
                    text: `{{DAILY_RAINFALL}} (${config.rain.units})`
                },
                min: 0
            }
        };

        // normalize incoming data to explicit {x, y} points
        // needed for bar charts
        const dataPoints = resp.dailyrain.map(p => {
            return { x: p[0], y: p[1] };
        });

        let dataSet = {
            label: '{{DAILY_RAINFALL}}',
            data: dataPoints,
            borderColor: config.series.rfall.colour,
            backgroundColor: config.series.rfall.colour,
            yAxisID: 'y_rain',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y.toFixed(config.rain.decimals)} ${config.rain.units}`
                }
            }
        };

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'bar',
            data: {datasets: [dataSet]},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: '{{DAILY_RAINFALL}}'
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const date = new Date(context[0].parsed.x);
                                return date.toLocaleString(config.locale, { day: '2-digit', month: 'long', year: 'numeric' });
                            }
                        }
                    }
                }
            }
        });
    });
};

const doDailyTemp = () => {
    const freezing = config.temp.units === 'C' ? 0 : 32;

    removeOldCharts(false);

    $('#chartdescription').text('{{CHART_RECENT_DAILYTEMP_DESC}}');

    $.getJSON({
        url: '/api/graphdata/dailytemp.json'
    })
    .done(resp => {
        const titles = {
            'avgtemp': 'Avg Temp',
            'mintemp': 'Min Temp',
            'maxtemp': 'Max Temp'
        };
        const idxs = ['avgtemp', 'mintemp', 'maxtemp'];

        let scales = {
            x: {
                type: 'time',
                unit: 'day'
            },
            y_temp: temperatureScale
        };

        let dataSets = [];

        idxs.forEach((idx) => {
            if (idx in resp) {
                dataSets.push({
                    label: titles[idx],
                    data: resp[idx],
                    borderColor: config.series[idx].colour,
                    backgroundColor: config.series[idx].colour,
                    yAxisID: 'y_temp',
                    tooltip: {
                        callbacks: {
                            label: item => ` ${item.dataset.label} ${item.parsed.y.toFixed(config.temp.decimals)} °${config.temp.units}`
                        }
                    }
                });
            }
        });

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true
                    },
                    title: {
                        display: true,
                        text: '{{DAILY_TEMPERATURE}}'
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const date = new Date(context[0].parsed.x);
                                return date.toLocaleString(config.locale, { day: '2-digit', month: 'long', year: 'numeric' });
                            }
                        }
                    }
                }
            }
        });
    });
};

const doAirQuality = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_RECENT_AQ_DESC}}');

    $.getJSON({
        url: '/api/graphdata/airqualitydata.json',
    })
    .done(resp => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const valueSuffix = 'µg/m³';
        const xscale = CmxChartJsHelpers.TimeScale;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale,
            y_pm: {
                title: {
                    display: true,
                    text: `{{PARTICULATES}} (${valueSuffix})`
                },
                min: 0
            }
        };

        const titles = {
            'pm2p5': 'PM 2.5',
            'pm10' : 'PM 10'
            }
        const idxs = ['pm2p5', 'pm10'];

        let dataSets = [];

        idxs.forEach((idx) => {
            if (idx in resp) {
                dataSets.push({
                    label: titles[idx],
                    data: resp[idx],
                    borderColor: config.series[idx].colour,
                    backgroundColor: config.series[idx].colour,
                    yAxisID: 'y_pm',
                    tooltip: {
                        callbacks: {
                            label: item => ` ${item.dataset.label} ${item.parsed.y} ${valueSuffix}`
                        }
                    }
                });
            }
        });

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true
                    },
                    title: {
                        display: true,
                        text: '{{AIR_QUALITY}}'
                    }
                }
            }
        });

        const navDataset = {
            label: 'Navigator',
            data: resp.pm2p5,
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.15
        };

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: CmxChartJsHelpers.NavChartOptions,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const doExtraTemp = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_RECENT_EXTRATEMP_DESC}}');

    $.getJSON({
        url: '/api/graphdata/extratemp.json'
    })
    .done(resp => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const xscale = CmxChartJsHelpers.TimeScale;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale,
            y_temp: temperatureScale
        };

        let dataSets = [];

        Object.entries(resp).forEach(([key, value]) => {
            const id = config.series.extratemp.name.findIndex(val => val == key);
            dataSets.push({
                label: key,
                data: value,
                borderColor: config.series.extratemp.colour[id],
                backgroundColor: config.series.extratemp.colour[id],
                yAxisID: 'y_temp',
                tooltip: {
                    callbacks: {
                        label: item => ` ${item.dataset.label} ${item.parsed.y.toFixed(config.temp.decimals)} °${config.temp.units}`
                    }
                }
            });
        });

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true
                    },
                    title: {
                        display: true,
                        text: '{{EXTRA_TEMPERATURE}}'
                    }
                }
            }
        });

        const navDataset = {
            label: 'Navigator',
            data: resp[key],
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.15
        };

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: CmxChartJsHelpers.NavChartOptions,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const doExtraHum = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_RECENT_EXTRAHUM_DESC}}');

    $.getJSON({
        url: '/api/graphdata/extrahum.json'
    })
    .done(resp => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const valueSuffix = ' °' + config.temp.units;
        const xscale = CmxChartJsHelpers.TimeScale;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale,
            y_hum: {
                title: {
                    display: true,
                    text: '{{HUMIDITY}} (%)'
                },
                min: 0,
                max: 100
            }
        };

        let dataSets = [];

        Object.entries(resp).forEach(([key, value]) => {
            const id = config.series.extrahum.name.findIndex(val => val == key);
            dataSets.push({
                label: key,
                data: value,
                borderColor: config.series.extrahum.colour[id],
                backgroundColor: config.series.extrahum.colour[id],
                yAxisID: 'y_hum',
                tooltip: {
                    callbacks: {
                        label: item => ` ${item.dataset.label} ${item.parsed.y} %`
                    }
                }
            });
        });

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true
                    },
                    title: {
                        display: true,
                        text: '{{EXTRA_HUMIDITY}}'
                    }
                }
            }
        });

        const navDataset = {
            label: 'Navigator',
            data: resp[key],
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.15
        };

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: CmxChartJsHelpers.NavChartOptions,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const doExtraDew = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_RECENT_EXTRADEW_DESC}}');

    $.getJSON({
        url: '/api/graphdata/extradew.json',
    })
    .done(resp => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const xscale = CmxChartJsHelpers.TimeScale;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale,
            y_temp: temperatureScale
        };

        let dataSets = [];

        Object.entries(resp).forEach(([key, value]) => {
            const id = config.series.extradew.name.findIndex(val => val == key);
            dataSets.push({
                label: key,
                data: value,
                borderColor: config.series.extradew.colour[id],
                backgroundColor: config.series.extradew.colour[id],
                yAxisID: 'y_temp',
                tooltip: {
                    callbacks: {
                        label: item => ` ${item.dataset.label} ${item.parsed.y.toFixed(config.temp.decimals)} °${config.temp.units}`
                    }
                }
            });
        });

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true
                    },
                    title: {
                        display: true,
                        text: '{{EXTRA_DEW_POINT}}'
                    }
                }
            }
        });

        const navDataset = {
            label: 'Navigator',
            data: resp[key],
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.15
        };

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: CmxChartJsHelpers.NavChartOptions,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const doSoilTemp = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_RECENT_SOILTEMP_DESC}}');

    $.getJSON({
        url: '/api/graphdata/soiltemp.json',
    })
    .done (resp => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const xscale = CmxChartJsHelpers.TimeScale;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale,
            y_temp: temperatureScale
        };

        let dataSets = [];

        Object.entries(resp).forEach(([key, value]) => {
            const id = config.series.soiltemp.name.findIndex(val => val == key);
            dataSets.push({
                label: key,
                data: value,
                borderColor: config.series.soiltemp.colour[id],
                backgroundColor: config.series.soiltemp.colour[id],
                yAxisID: 'y_temp',
                tooltip: {
                    callbacks: {
                        label: item => ` ${item.dataset.label} ${item.parsed.y.toFixed(config.temp.decimals)} °${config.temp.units}`
                    }
                }
            });
        });

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true
                    },
                    title: {
                        display: true,
                        text: '{{SOIL_TEMPERATURE}}'
                    }
                }
            }
        });

        const navDataset = {
            label: 'Navigator',
            data: resp[key],
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.15
        };

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: CmxChartJsHelpers.NavChartOptions,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const doSoilMoist = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_RECENT_SOILMOIST_DESC}}');

    $.getJSON({
        url: '/api/graphdata/soilmoist.json'
    })
    .done(resp => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const xscale = CmxChartJsHelpers.TimeScale;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale,
            y_moist: {
                title: {
                    display: true,
                    text: '{{SOIL_MOISTURE}}'
                },
                min: 0
            }
        };

        let dataSets = [];

        Object.entries(resp).forEach(([key, value]) => {
            const id = config.series.soilmoist.name.findIndex(val => val == key);
            dataSets.push({
                label: key,
                data: value,
                borderColor: config.series.soilmoist.colour[id],
                backgroundColor: config.series.soilmoist.colour[id],
                yAxisID: 'y_moist',
                tooltip: {
                    callbacks: {
                        label: item => ` ${item.dataset.label} ${item.parsed.y} ${config.soilmoisture.units[id]}`
                    }
                }
            });
        });

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true
                    },
                    title: {
                        display: true,
                        text: '{{SOIL_MOISTURE}}'
                    }
                }
            }
        });

        const navDataset = {
            label: 'Navigator',
            data: resp[key],
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.15
        };

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: CmxChartJsHelpers.NavChartOptions,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const doLeafWet = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_RECENT_LEAFWET_DESC}}');

    $.getJSON({
        url: '/api/graphdata/leafwetness.json',
    })
    .done(resp => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const valueSuffix = config.leafwet.units == '' ? '' : ' (' + config.leafwet.units + ')'
        const xscale = CmxChartJsHelpers.TimeScale;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale,
            y_leaf: {
                title: {
                    display: true,
                    text: '{{LEAF_WETNESS}}' + valueSuffix
                },
                min: 0
            }
        };

        let dataSets = [];

        Object.entries(resp).forEach(([key, value]) => {
            const id = config.series.leafwet.name.findIndex(val => val == key);
            dataSets.push({
                label: key,
                data: value,
                borderColor: config.series.leafwet.colour[id],
                backgroundColor: config.series.leafwet.colour[id],
                yAxisID: 'y_leaf',
                tooltip: {
                    callbacks: {
                        label: item => ` ${item.dataset.label} ${item.parsed.y} ${config.leafwet.units}`
                    }
                }
            });
        });

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true
                    },
                    title: {
                        display: true,
                        text: '{{LEAF_WETNESS}}'
                    }
                }
            }
        });

        const navDataset = {
            label: 'Navigator',
            data: resp[key],
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.15
        };

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: CmxChartJsHelpers.NavChartOptions,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const doUserTemp = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_RECENT_USERTEMP_DESC}}');

    $.getJSON({
        url: '/api/graphdata/usertemp.json'
    })
    .done(resp => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const xscale = CmxChartJsHelpers.TimeScale;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale,
            y_temp: temperatureScale
        };

        let dataSets = [];

        Object.entries(resp).forEach(([key, value]) => {
            const id = config.series.usertemp.name.findIndex(val => val == key);
            dataSets.push({
                label: key,
                data: value,
                borderColor: config.series.usertemp.colour[id],
                backgroundColor: config.series.usertemp.colour[id],
                yAxisID: 'y_temp',
                tooltip: {
                    callbacks: {
                        label: item => ` ${item.dataset.label} ${item.parsed.y.toFixed(config.temp.decimals)} °${config.temp.units}`
                    }
                }
            });
        });

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true
                    },
                    title: {
                        display: true,
                        text: '{{USER_TEMPERATURE}}'
                    }
                }
            }
        });

        const navDataset = {
            label: 'Navigator',
            data: resp[key],
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.15
        };

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: CmxChartJsHelpers.NavChartOptions,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const doCO2 = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_RECENT_CO2_DESC}}');

    $.getJSON({
        url: '/api/graphdata/co2sensor.json',
    })
    .done(resp => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const xscale = CmxChartJsHelpers.TimeScale;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale
        };

        let dataSets = [];

        Object.entries(resp).forEach(([key, value]) => {
            // id - remove all spaces and lowercase
            const id = key.toLowerCase().split(' ').join('');
            let yaxis, valueSuffix;

            if (key == 'CO2' || key == 'CO2 Average') {
                yaxis = 'y_co2';
                valueSuffix = 'ppm';
                scales.y_co2 = {
                    title: {
                        display: true,
                        text: 'CO₂ (ppm)'
                    }
                };
            } else if (key.startsWith('PM')) {
                yaxis = 'y_pm';
                valueSuffix= 'μg/m³';
                scales.y_pm = {
                    title: {
                        display: true,
                        text: '{{PARTICULATES}} (μg/m³)'
                    },
                    min: 0
                };
            } else if (key == 'Temperature') {
                yaxis = 'y_temp';
                const tempScale = temperatureScale;
                tempScale.position = 'right';
                scales.y_temp = tempScale;
            } else if (key == 'Humidity') {
                yaxis = 'y_hum';
                valueSuffix = '%';
                scales.y_hum = {
                    title: {
                        display: true,
                        text: '{{HUMIDITY}} (%)'
                    },
                    min: 0,
                    max: 100,
                    position: 'right'
                };
            }

            dataSets.push({
                label: config.series.co2[id].name,
                data: value,
                borderColor: config.series.co2[id].colour,
                backgroundColor: config.series.co2[id].colour,
                yAxisID: yaxis,
                tooltip: {
                    callbacks: {
                        label: item => ` ${item.dataset.label} ${item.parsed.y} ${valueSuffix}`
                    }
                }
            });
        });

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true
                    },
                    title: {
                        display: true,
                        text: '{{CO2_SENSOR}}'
                    }
                }
            },
            plugins: [CmxChartJsPlugins.hideUnusedAxesPlugin]
        });

        const navDataset = {
            label: 'Navigator',
            data: resp[key],
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.15
        };

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: CmxChartJsHelpers.NavChartOptions,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const doLaserDepth = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_RECENT_LASERDEPTH_DESC}}');

    $.getJSON({
        url: '/api/graphdata/laserdepth.json',
    })
    .done(resp => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const xscale = CmxChartJsHelpers.TimeScale;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale,
            y_depth: {
                title: {
                    display: true,
                    text: `{{LASER_DEPTH}} (${config.laser.units})`
                }
            }
        };

        let dataSets = [];

        Object.entries(resp).forEach(([key, value]) => {
            const id = config.series.laserdepth.name.findIndex(val => val == key);
            dataSets.push({
                label: key,
                data: value,
                borderColor: config.series.laserdepth.colour[id],
                backgroundColor: config.series.laserdepth.colour[id],
                yAxisID: 'y_depth',
                tooltip: {
                    callbacks: {
                        label: item => ` ${item.dataset.label} ${item.parsed.y} ${config.laser.units}`
                    }
                }
            });
        });

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true
                    },
                    title: {
                        display: true,
                        text: '{{LASER_DEPTH}}'
                    }
                }
            }
        });

        const navDataset = {
            label: 'Navigator',
            data: resp[key],
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.15
        };

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: CmxChartJsHelpers.NavChartOptions,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const removeOldCharts = (showButtons) => {
    if (mainChart) {
        mainChart.destroy();
    }
    if (navChart) {
        navChart.destroy();
    }

    document.getElementById('rangeButtons').style.visibility = showButtons ? 'visible' : 'hidden';
    document.getElementById('navChartContainer').style.display = showButtons ? null : 'none';
};