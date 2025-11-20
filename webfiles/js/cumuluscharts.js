// Last modified: 2025/11/20 13:56:11

let mainChart, navChart, config, avail;

const myRangeBtns = {
    buttons: [{
        count: 12,
        type: 'hour',
        text: '12h'
    }, {
        count: 24,
        type: 'hour',
        text: '24h'
    }, {
        count: 48,
        type: 'hour',
        text: '2d'
    }, {
        type: 'all',
        text: 'All'
    }],
    selected: 1
};

let defaultEnd, defaultStart;
let selection = { start: 0, end: 0 };
let dragging = null;
let dragStartX = 0;
let currentCursor = 'default';
let temperatureScale;

const availRes = $.getJSON({ url: 'availabledata.json' });
const configRes = $.getJSON({ url: 'graphconfig.json' });


$(document).ready(() => {
    $('#mySelect').change(() => {
        changeGraph($('#mySelect').val());
    });

    Promise.all([availRes, configRes])
    .then((results) => {
        avail = results[0];
        config = results[1];

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
                text: `Temperature (°${config.temp.units})`
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

        CmxChartJsHelpers.AddPrintButtonHandler();

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
        if (avail.CO2 == undefined || avail.CO2.Count == 0) {
            $('#mySelect option[value="co2"]').remove();
        }
        if (avail.LaserDepth == undefined || avail.LaserDepth.length == 0) {
            $('#mySelect option[value="laserdepth"]').remove();
        }

        let value = parent.location.hash.replace('#', '');

        if (value == '') value = 'temp';

        changeGraph(value);
        // set the correct option
        $('#mySelect option[value="' + value + '"]').attr('selected', true);
    });
});


const changeGraph = (graph) => {
    CmxChartJsHelpers.ShowLoading();

    switch (graph) {
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
        parent.location.hash = graph;
}

const doTemp = () => {
    removeOldCharts(true);

    $.ajax({
        url: 'tempdata.json',
        cache: false,
        dataType: 'json'
    })
    .done(resp => {
        const titles = {
            'temp'     : 'Temperature',
            'dew'      : 'Dew Point',
            'apptemp'  : 'Apparent',
            'feelslike': 'Feels Like',
            'wchill'   : 'Wind Chill',
            'heatindex': 'Heat Index',
            'humidex'  : 'Humidex',
            'intemp'   : 'Inside'
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
            tension: 0.1
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

    $.ajax({
        url: 'pressdata.json',
        dataType: 'json',
        cache: false
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
            y_press: {
                id: 'press',
                title: {
                    display: true,
                    text: `Pressure (${config.press.units})`
                },
                ticks: {
                    // suppress thousands separator for hPa
                    callback: (value, index, ticks) => { return Number(value); }
                }
            }
        };

        let dataSet = {
            label: 'Pressure',
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
                        text: 'Pressure'
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
            tension: 0.1
        };

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'line',
            data: {datasets: [navDataset]},
            options: CmxChartJsHelpers.NavChartOptions,
            plugins: [CmxChartJsPlugins.navigatorPlugin]
        });
    });
};

const compassP = deg => {
    if (deg === 0) {
        return 'calm';
    }
    const a = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return a[Math.floor((deg + 22.5) / 45) % 8];
};

const doWindDir = () => {
    removeOldCharts(true);

    $.ajax({
        url: 'wdirdata.json',
        dataType: 'json',
        cache: false
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
            y_bearing: {
                title: {
                    display: true,
                    text: 'Bearing'
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
            yAxisID: 'y_bearing'
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
                        text: 'Wind Direction'
                    },
                    tooltip: {
                        filter: (item) => { return item.datasetIndex === 0; }
                    }
                },
                interaction: {
                    mode: 'x'
                }
            }
        });

        const navDataset = {
            label: 'Navigator',
            data: resp.avgbearing,
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.1
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

    $.ajax({
        url: 'winddata.json',
        dataType: 'json',
        cache: false
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
                    text: `Wind Speed (${config.wind.units})`
                },
                min: 0
            }
        };

        let dataSets = [{
            label: 'Wind Speed',
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
            label: 'Wind Gust',
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
                        text: 'Wind Speed'
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
            tension: 0.1
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

    $.ajax({
        url: 'raindata.json',
        dataType: 'json',
        cache: false
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
                    text: `Rainfall (${config.rain.units})`
                },
                min: 0
            },
            y_rainRate: {
                id: 'rate',
                title: {
                    display: true,
                    text: `Rainfall Rate (${config.rain.units}/hr)`
                },
                grid: {display: false},
                min: 0,
                position: 'right'
            }
        };

        let dataSets = [{
            label: 'Daily Rainfall',
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
            label: 'Rain Rate',
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
            tension: 0.1
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

    $.ajax({
        url: 'humdata.json',
        dataType: 'json',
        cache: false
    })
    .done(resp => {
        const titles = {
            'hum'  : 'Outdoor Humidity',
            'inhum': 'Indoor Humidity'
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
                    text: 'Humidity (%)'
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
                            label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} %`
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
                        text: 'Relative Humidity'
                    }
                }
            }
        });

        const navDataset = {
            label: 'Navigator',
            data: resp.hum,
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.04)',
            pointStyle: false,
            tension: 0.1
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

    $.ajax({
        url: 'solardata.json',
        dataType: 'json',
        cache: false
    })
   .done(resp => {
        const chartConfig = {
            SolarRad: {
                title: 'Solar Radiation',
                type: 'area',
                order: 0,
                suffix: 'W/m²'
            },
            CurrentSolarMax: {
                title: 'Theoretical Max',
                type: 'area',
                order: 2,
                suffix: 'W/m²'
            },
            UV: {
                title: 'UV Index',
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
                    text: 'UV Index'
                },
                min: 0,
                position: 'right'
            },
            y_solar: {
                title: {
                    display: true,
                    text: 'Solar Radiation (W/m²)'
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
                            label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${chartConfig[idx].suffix}`
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
                        text: 'Solar'
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
            tension: 0.1
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

    $.ajax({
        url: 'sunhours.json',
        dataType: 'json',
        cache: false
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
                    text: 'Sunshine Hours'
                },
                min: 0
            }
        };

        // normalize incoming data to explicit {x, y} points
        const dataPoints = resp.sunhours.map(p => {
            return { x: p[0], y: p[1] };
        });


        let dataSet = {
            label: 'Sunshine Hours',
            data: dataPoints,
            borderColor: config.series.sunshine.colour,
            backgroundColor: config.series.sunshine.colour,
            yAxisID: 'y_sun',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} hrs`
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
                        text: 'Sunshine Hours'
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

    $.ajax({
        url: 'dailyrain.json',
        dataType: 'json',
        cache: false
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
                    text: `Daily Rainfall (${config.rain.units})`
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
            label: 'Daily Rainfall',
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
                        text: 'Daily Rainfall'
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
    removeOldCharts(false);

    $.ajax({
        url: 'dailytemp.json',
        dataType: 'json',
        cache: false
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
                        text: 'Daily Temperature'
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

    $.ajax({
        url: 'airquality.json',
        dataType: 'json',
        cache: false
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
                    text: `Particulates (${valueSuffix})`
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
                            label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${valueSuffix}`
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
                        text: 'Air Quality'
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
            tension: 0.1
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

    $.ajax({
        url: 'extratempdata.json',
        dataType: 'json'
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
                        text: 'Extra Temperatures'
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
            tension: 0.1
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

    $.ajax({
        url: 'extrahumdata.json',
        dataType: 'json'
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
                    text: 'Humidity (%)'
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
                        label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} %`
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
                        text: 'Extra Humidity'
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
            tension: 0.1
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

    $.ajax({
        url: 'extradewdata.json',
        dataType: 'json'
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
                        text: 'Extra Dew Point'
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
            tension: 0.1
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

    $.ajax({
        url: 'soiltempdata.json',
        dataType: 'json'
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
                        text: 'Soil Temperatures'
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
            tension: 0.1
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

    $.ajax({
        url: 'soilmoistdata.json',
        dataType: 'json'
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
                    text: 'Moisture'
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
                        label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${config.soilmoisture.units[id]}`
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
                        text: 'Soil Moisture'
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
            tension: 0.1
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

    $.ajax({
        url: 'leafwetdata.json',
        dataType: 'json'
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
                    text: 'Leaf Wetness' + valueSuffix
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
                        label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${config.leafwet.units}`
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
                        text: 'Leaf Wetness'
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
            tension: 0.1
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

    $.ajax({
        url: 'usertempdata.json',
        dataType: 'json'
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
                        text: 'User Temperatures'
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
            tension: 0.1
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

    $.ajax({
        url: 'co2sensordata.json',
        dataType: 'json'
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
                        text: 'Particulates (μg/m³)'
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
                        text: 'Humidity (%)'
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
                        label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${valueSuffix}`
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
                        text: 'CO₂ Sensor'
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
            tension: 0.1
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

    $.ajax({
        url: 'laserdepthdata.json',
        dataType: 'json'
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
                    text: `Laser Depth (${config.laser.units})`
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
                        label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${config.laser.units}`
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
                        text: 'Laser Depth'
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
            tension: 0.1
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