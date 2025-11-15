/*	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Script:	charts.js
 * 	Author:	M Crossley & N Thomas
 * 	(MC) Last Edit:	2025/11/13 10:07:28
 * 	Last Edit (NT):	2025-11-15 12:11:01
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Role: Draw charts based on readings
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

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

	$('.ax-btnBar').children().on('click', function() {
		doSelect( this.id );
	})
    Promise.all([availRes, configRes])
    .then((results) => {
        // available data
        avail = results[0];
        config = results[1];

        if (avail.Temperature === undefined || avail.Temperature.length == 0) {
            $('#mySelect option[value="temp"]').remove();
			$('#temp').remove();
        }
        if (avail.DailyTemps === undefined || avail.DailyTemps.length == 0) {
            $('#mySelect option[value="dailytemp"]').remove();
			$('#dailytemp').remove();
        }
        if (avail.Humidity === undefined || avail.Humidity.length == 0) {
            $('#mySelect option[value="humidity"]').remove();
			$('#humidity').remove();
        }
        if (avail.Solar === undefined || avail.Solar.length == 0) {
            $('#mySelect option[value="solar"]').remove();
			$('#solar').remove();
        }
        if (avail.Sunshine === undefined || avail.Sunshine.length == 0) {
            $('#mySelect option[value="sunhours"]').remove();
			$('#sunhours').remove();
        }
        if (avail.AirQuality === undefined || avail.AirQuality.length == 0) {
            $('#mySelect option[value="airquality"]').remove();
			$('#airquality').remove();
        }
        if (avail.ExtraTemp == undefined || avail.ExtraTemp.length == 0) {
            $('#mySelect option[value="extratemp"]').remove();
			$('#extratemp').remove();
        }
        if (avail.ExtraHum == undefined || avail.ExtraHum.length == 0) {
            $('#mySelect option[value="extrahum"]').remove();
			$('#extrahum').remove();
        }
        if (avail.ExtraDewPoint == undefined || avail.ExtraDewPoint.length == 0) {
            $('#mySelect option[value="extradew"]').remove();
			$('#extradew').remove();
        }
        if (avail.SoilTemp == undefined || avail.SoilTemp.length == 0) {
            $('#mySelect option[value="soiltemp"]').remove();
			$('#soiltemp').remove();
        }
        if (avail.SoilMoist == undefined || avail.SoilMoist.length == 0) {
            $('#mySelect option[value="soilmoist"]').remove();
			$('#soilmoist').remove();
        }
        if (avail.LeafWetness == undefined || avail.LeafWetness.length == 0) {
            $('#mySelect option[value="leafwet"]').remove();
			$('#leafwet').remove();
        }
        if (avail.UserTemp == undefined || avail.UserTemp.length == 0) {
            $('#mySelect option[value="usertemp"]').remove();
			$('#usertemp').remove();
        }
        if (avail.CO2 == undefined || avail.CO2.length == 0) {
            $('#mySelect option[value="co2"]').remove();
			$('#co2').remove();
        }
        if (avail.LaserDepth == undefined || avail.LaserDepth.length == 0) {
            $('#mySelect option[value="laserdepth"]').remove();
			$('#laserdepth').remove();
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
            pointRadius: 0,
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
            pointRadius: 0,
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
            pointRadius: 0,
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
            pointRadius: 0,
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
            pointRadius: 0,
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
            pointRadius: 0,
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
            pointRadius: 0,
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
            pointRadius: 0,
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
            pointRadius: 0,
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
            pointRadius: 0,
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
            pointRadius: 0,
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
            pointRadius: 0,
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
            pointRadius: 0,
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
            pointRadius: 0,
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
            pointRadius: 0,
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
            pointRadius: 0,
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
            pointRadius: 0,
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

/*	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Script:	charts.js				Ver: aiX-1.0
 * 	Author:	M Crossley & N Thomas
 * 	(MC) Last Edit:	2025/10/04 16:27:45
 * 	Last Edit (NT):	2025/05/05
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Role: Draw charts based on readings
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var chart, config, doSelect, freezing, frostTemp;
//	Added by Neil
var myTooltipHead = '<table><tr><td colspan="2"><h5>{point.key}</h5></td></tr>';
var myTooltipPoint = '<tr><td><i class="fa-solid fa-diamond" style="color:{series.color}"></i>&nbsp;{series.name}</td>' +
					 '<td><strong>{point.y}</strong></td></tr>';
var beaufortScale, beaufortDesc, frostTemp;

beaufortDesc = ['Calm','Light Air','Light breeze','Gentle breeze','Moderate breeze','Fresh breeze','Strong breeze','Near gale','Gale','Strong gale','Storm','Violent storm','Hurricane'];
//	End New content

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

var myBackground = {
	linearGradient: [0, 0, 300, 600],
	stops: [
		[0.3, 'var(--color5)'],
		[1, 'var(--color4)']
	]
}

$().ready(function () {

	$('.selectGraph').click( function() {
		doSelect( this.id );
	});

	const availRes = $.ajax({ url: '/api/graphdata/availabledata.json', dataType: 'json' });
    const configRes = $.ajax({ url: '/api/graphdata/graphconfig.json', dataType: 'json' });

    Promise.all([availRes, configRes])
    .then(function (results) {
        avail = results[0];
        config = results[1];

		Highcharts.setOptions({
            time: {
                timezone: config.tz
            },
            chart: {
                style: {
                    fontSize: '1rem'
                }
            }
        });

		if (avail.Temperature === undefined || avail.Temperature.length == 0) {
			$('#temp').remove();
		}
		if (avail.DailyTemps === undefined || avail.DailyTemps.length == 0) {
			$('#dailytemp').remove()
		}
		if (avail.Humidity === undefined || avail.Humidity.length == 0) {
			$('#humidity').remove()
		}
		if (avail.Solar === undefined || avail.Solar.length == 0) {
			$('#solar').remove();
		}
		if (avail.Sunshine === undefined || avail.Sunshine.length == 0) {
			$('#sunhours').remove();
		}
		if (avail.AirQuality === undefined || avail.AirQuality.length == 0) {
			$('#airquality').remove();
		}
		if (avail.ExtraTemp == undefined || avail.ExtraTemp.length == 0) {
			$('#extratemp').remove();
		}
		if (avail.ExtraHum == undefined || avail.ExtraHum.length == 0) {
			$('#extrahum').remove();
		}
		if (avail.ExtraDewPoint == undefined || avail.ExtraDewPoint.length == 0) {
			$('#extradew').remove();
		}
		if (avail.SoilTemp == undefined || avail.SoilTemp.length == 0) {
			$('#soiltemp').remove();
		}
		if (avail.SoilMoist == undefined || avail.SoilMoist.length == 0) {
			$('#soilmoist').remove();
		}
		if (avail.LeafWetness == undefined || avail.LeafWetness.length == 0) {
			$('#leafwet').remove();
		}
		if (avail.UserTemp == undefined || avail.UserTemp.length == 0) {
			$('#usertemp').remove();
		}
		if (avail.CO2 == undefined || avail.CO2.length == 0) {
			$('#co2').remove();
		}
		if (avail.LaserDepth == undefined || avail.LaserDepth.length == 0) {
			$('#laserdepth').remove();
		}

		//	New
		switch (config.wind.units) {
			case 'mph':   beaufortScale = [ 1, 3, 7,12,18,24,31,38,46,54, 63, 72]; break;
			case 'km/h':  beaufortScale = [ 2, 5,11,19,29,39,50,61,74,87,101,116]; break;
			case 'm/s':   beaufortScale = [ 0, 0, 1, 1, 2, 3, 4, 5, 7,10, 12, 16]; break;
			case 'knots': beaufortScale = [ 3, 6,10,16,21,27,33,40,47,55, 63, 65]; break;
			default: 	  beaufortScale = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, -1, -1];
			// NOTE: Using -1 means the line will never be seen.  No line is drawn for Hurricane.
		}

		freezing = config.temp.units === 'C' ? 0 : 32;
		frostTemp = config.temp.units === 'C' ? 4 : 39;

		console.log("Storage: " + CMXSession.Charts.Trends)

		if (CMXSession.Charts.Trends == null || CMXSession.Charts.Trends == '') {
			chart = 'temp';
		} else {
			chart = CMXSession.Charts.Trends;
		}

		doSelect( chart );
	});

	doSelect = function (sel) {
		CMXSession.Charts.Trends = sel;
		sessionStorage.setItem(axStore, JSON.stringify(CMXSession) );
		$('.selectGraph').removeClass('w3-disabled');
		$('#' + sel).addClass('w3-disabled');
		switch (sel) {
			case 'temp':		doTemp();		break;
			case 'dailytemp':	doDailyTemp();	break;
			case 'press':		doPress();		break;
			case 'wind':		doWind();		break;
			case 'windDir':		doWindDir();	break;
			case 'rain':		doRain();		break;
			case 'dailyrain':	doDailyRain();	break;
			case 'humidity':	doHum();		break;
			case 'solar':		doSolar();		break;
			case 'sunhours':	doSunHours();	break;
			case 'airquality':	doAirQuality();	break;
			case 'extratemp':	doExtraTemp();	break;
			case 'extrahum':	doExtraHum();	break;
			case 'extradew':	doExtraDew();	break;
			case 'soiltemp':	doSoilTemp();	break;
			case 'soilmoist':	doSoilMoist();	break;
			case 'leafwet':		doLeafWet();	break;
			case 'usertemp':	doUserTemp();	break;
			case 'co2':			doCO2();		break;
			case 'laserdepth':	doLaserDepth();	break;
			default:
				doTemp();
				$('#temp').addClass('w3-disabled');
				break;
		}

	};

	$.ajax({url: "/api/graphdata/graphconfig.json", success: function (result) {
		config = result;

	}});
});

var doTemp = function () {
	$('#chartdescription').text('Line chart showing recent temperature and various derived temperature values at a one minute resolution.');
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'line',
			zoomType: 'x',
			borderWidth: 0,
			alignTicks: false
		},
		title: {text: 'Temperature'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
				week: '%e %b %y',
				month: '%b %y',
				year: '%Y'
			}
		},
		yAxis: [{
				// left
				title: {margin: 40, text: 'Temperature (°' + config.temp.units + ')'},
				opposite: false,
				accessibility: { enabled: true, description: 'Temperature'},
				labels: {
					align: 'right',
					x: 15,
					formatter: function () {
						return '<span style="fill: ' + (this.value <= freezing ? 'blue' : 'red') + ';">' + this.value + '</span>';
					}
				},
				plotLines: [{
						// freezing line
						value: freezing,
						color: 'rgb(0, 0, 180)',
						width: 1,
						zIndex: 2,
						label: {text:'Freezing', align:'center', style: {color: 'var(--color5)'}}
					},{
						value: frostTemp,
						color: 'rgb(128,128,255)', width: 1, zIndex: 2,
						label: {text: 'Frost possible',y:12,align:'center', style: {color: 'var(--color5)'}}
					}]
			}, {
				// right
				gridLineWidth: 0,
				opposite: true,
				linkedTo: 0,
				labels: {
					align: 'left',
					x: -15,
					formatter: function () {
						return '<span style="fill: ' + (this.value <= freezing ? 'blue' : 'red') + ';">' + this.value + '</span>';
					}
				}
			}],
		legend: {enabled: true },
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
		lang: { noData: 'No temperature data to display' },
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
			valueSuffix: ' °' + config.temp.units,
			valueDecimals: config.temp.decimals,
			xDateFormat: "%A, %b %e, %H:%M"
		},
		series: [],
		rangeSelector: myRanges
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
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
			type: 'spline',
			zoomType: 'x',
			borderWidth: 0,
			alignTicks: false
		},
		title: {text: 'Pressure'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
				week: '%e %b %y',
				month: '%b %y',
				year: '%Y'
			}
		},
		yAxis: [{
				// left
				title: {text: 'Pressure (' + config.press.units + ')'},
				opposite: false,
				accessibility: { enabled: true, description: 'Pressure'},
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
		legend: {enabled: true },
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
			spline: {lineWidth: 2}
		},
		lang: { noData: 'No pressure data to display' },
		noData: {
			style: {fontWeight: 'bold', fontSize: '20px', color: '#FF3030'}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
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
	chart.hideNoData();
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
			zoomType: 'x',
			borderWidth: 0,
			alignTicks: false
		},
		title: {text: 'Wind Direction' },
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
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
				week: '%e %b %y',
				month: '%b %y',
				year: '%Y'
			}
		},
		yAxis: [{
				// left
				title: {text: 'Bearing'},
				opposite: false,
				accessibility: { enabled: true, description: 'Bearing'},
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
		legend: {enabled: true, itemStyle: { color: 'var(--sub5)' } },
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
		lang: {
			noData: 'No wind direction data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			enabled: true,
			split: true,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
		},
		series: [{
				name: 'Bearing',
				type: 'scatter',
				color: config.series.bearing.colour,
				marker: {
					symbol: 'circle',
					radius: 1
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
					xDateFormat: '%A, %b %e %H:%M ',
					pointFormatter() {
						return '<tr><td><span style="color:' + this.color + '"><i class="fa-solid fa-diamond"></i></span> ' +
							this.series.name + ': </td><td><b>' + (this.y == 0 ? 'calm' : this.y + '°') + '</b></td></tr>';
					}
				}
			}
		],
		rangeSelector: myRanges
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
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
			type: 'spline',
			zoomType: 'x',
			borderWidth:0,
			alignTicks: false
		},
		title: {text: 'Wind Speed'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
				week: '%e %b %y',
				month: '%b %y',
				year: '%Y'
			}
		},
		yAxis: [{
				// left
				title: {text: 'Wind Speed (' + config.wind.units + ')'},
				opposite: false,
				accessibility: { enabled: true, description: 'Wind speed'},
				min: 0,
				labels: {
					align: 'right',
					x: -5
				},
				plotLines: [{
					value: beaufortScale[1],
					color: 'rgb(255,220,0)', width: 1,zIndex:1,
					label: { text: beaufortDesc[1], y:12, style: {color: 'var(--color5)'}}
				},{
					value: beaufortScale[2],
					color: 'rgb(255,200,0)', width:1,zIndex:1,
					label: {text: beaufortDesc[2], y:12, style: {color: 'var(--color5)'}}
				},{
					value: beaufortScale[3],
					color: 'rgb(255,180,0)', width:1, zIndex:1,
					label: {text: beaufortDesc[3], y:12, style: {color: 'var(--color5)'}}
				},{
					value: beaufortScale[4],
					color: 'rgb(255,160,0)', width:1, zIndex:1,
					label: {text: beaufortDesc[4], y:12, style: {color: 'var(--color5)'}}
				},{
					value: beaufortScale[5],
					color: 'rgb(255,140,0)', width:1, zIndex:1,
					label: {text:beaufortDesc[5], y:12, style: {color: 'var(--color5)'}}
				},{
					value: beaufortScale[6],
					color: 'rgb(255,120,0)', width:1, zIndex:1,
					label: { text: beaufortDesc[6], y:12, style: {color: 'var(--color5)'}}
				},{
					value: beaufortScale[7],
					color: 'rgb(255,100,0)', width:1, zIndex:1,
					label: {text: beaufortDesc[7], y:12, style: {color: 'var(--color5)'}}
				},{
					value: beaufortScale[8],
					color: 'rgb(255,80,0)', width:1, zIndex:1,
					label: {text: beaufortDesc[8], y:12, style: {color: 'var(--color5)'}}
				},{
					value: beaufortScale[9],
					color: 'rgb(255,60,0)', width:1, zIndex:1,
					label: {text: beaufortDesc[9], y:12, style: {color: 'var(--color5)'}}
				},{
					value: beaufortScale[10],
					color: 'rgb(255,40,0)', width:1, zIndex:1,
					label: {text:beaufortDesc[10], y:12, style: {color: 'var(--color5)'}}
				},{
					value: beaufortScale[11],
					color: 'rgb(255,20,0)', width:1, zIndex:1,
					label: { text: beaufortDesc[11], y:12, style: {color: 'var(--color5)'}}
				},{
					value: beaufortScale[11],// Note use of previous line
					//color: 'rgb(255,0,0)', width:1, zIndex:1,
					label: {text: beaufortDesc[12], style: {color: 'var(--color5)'}}
				}]
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
			spline: {lineWidth: 2}
		},
		lang:{
			noData: 'No wind data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
			valueSuffix: ' ' + config.wind.units,
			valueDecimals: config.wind.decimals,
			xDateFormat: "%A, %b %e, %H:%M"
		},
		series: [{
				name: 'Wind Speed',
				color: config.series.wspeed.colour
			}, {
				name: 'Wind Gust',
				color: config.series.wgust.colour
		}],
		rangeSelector: myRanges
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
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
			//backgroundColor: myBackground,
			plotBackgroundColor: '#fff',
			zoomType: 'x',
			borderWidth:0,
			alignTicks: true
		},
		title: {text: 'Rainfall'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
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
				accessibility: { enabled: true, description: 'Rainfall Rate'},
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
		navigator: {
			yAxis: { min:0, softMax:4}
		},
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
		lang:{
			noData: 'No rainfall data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
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
	chart.hideNoData();
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
			type: 'spline',
			zoomType: 'x',
			borderWidth:0,
			alignTicks: false
		},
		title: {text: 'Relative Humidity'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
				week: '%e %b %y',
				month: '%b %y',
				year: '%Y'
			}
		},
		yAxis: [{
				// left
				title: {text: 'Humidity (%)'},
				opposite: false,
				accessibility: { enabled: true, description: 'Humidity %'},
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
		lang:{
			noData: 'No humidity data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
			valueSuffix: ' %',
			valueDecimals: config.hum.decimals,
			xDateFormat: "%A, %b %e, %H:%M"
		},
		series: [],
		rangeSelector: myRanges
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
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
			zoomType: 'x',
			borderWidth:0,
			alignTicks: true
		},
		title: {text: 'Solar'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
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
		lang: {
			noData: 'No solar data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
			xDateFormat: "%A, %b %e, %H:%M"
		},
		series: [],
		rangeSelector: myRanges
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
	chart.showLoading();

	$.ajax({
		url: '/api/graphdata/solardata.json',
		dataType: 'json',
		success: function (resp) {
			var titles = {
				SolarRad       : 'Solar Radiation (W/m\u00B2)',
				CurrentSolarMax: 'Theoretical Max (W/m\u00B2)',
				UV: 'UV Index'
			};
			var types = {
				SolarRad: 'area',
				CurrentSolarMax: 'area',
				UV: 'spline'
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
							title:{text: titles['UV']},
							accessibility: { enabled: true, description: 'UV Index'},
							opposite: true,
							allowDecimals: false,
							min: 0,
							labels: {
								align: 'left'
							}
						});
					} else if (!solarAxisCreated) {
						chart.addAxis({
							id: 'solar',
							title: {text: 'Solar Radiation (W/m\u00B2)'},
							accessibility: { enabled: true, description: 'Solar Radiation'},
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
			zoomType: 'x',
			borderWidth:0,
			alignTicks: false
		},
		title: {text: 'Sunshine Hours'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
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
				accessibility: { enabled: true, description: 'Sunshine Hours'},
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
		lang: {
			noData: 'No Sunshine Hours data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
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
	chart.hideNoData();
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
			zoomType: 'x',
			borderWidth:0,
			alignTicks: false
		},
		title: {text: 'Daily Rainfall'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
				week: '%e %b %y',
				month: '%b %y',
				year: '%Y'
			}
		},
		yAxis: [{
				// left
				title: {text: 'Daily Rainfall ' + config.rain.units},
				min: 0,
				opposite: false,
				accessibility: { enabled: true, description: 'Daily Rainfall'},
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
		lang:{
			noData: 'No Daily Rainfall data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
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
	chart.hideNoData();
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
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'spline',
			zoomType: 'x',
			borderWidth:0,
			alignTicks: false
		},
		title: {text: 'Daily Temperature'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
				week: '%e %b %y',
				month: '%b %y',
				year: '%Y'
			}
		},
		yAxis: [{
				// left
				title: {margin: 40, text: 'Daily Temperature (°' + config.temp.units + ')'},
				opposite: false,
				accessibility: { enabled: true, description: 'Daily Temperature'},
				labels: {
					align: 'right',
					x: 15,
					formatter: function () {
						return '<span style="fill: ' + (this.value <= 0 ? 'blue' : 'red') + ';">' + this.value + '</span>';
					}
				},
				plotLines: [{
					// freezing line
					value: freezing,
					color: 'rgb(0, 0, 180)',
					width: 1,
					zIndex: 2,
					label:{text:'Freezing', align:'center',	style: {color: 'var(--color5)'}}
				},{
					value: frostTemp,
					color: 'rgb(128,128,255)',
					width: 1,
					zIndex: 2,
					label: {text: 'Frost possible',y:12, align:'center', style: {color: 'var(--color5)'}}
				}]
			}, {
				// right
				linkedTo: 0,
				gridLineWidth: 0,
				opposite: true,
				title: {text: null},
				labels: {
					align: 'left',
					x: -15,
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
		lang:{
			noData: 'No Daily Temperature data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
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
	chart.hideNoData();
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
			zoomType: 'x',
			borderWidth:0,
			alignTicks: false
		},
		title: {text: '<h4>Air Quality</h4>', useHTML: true, },
		credits: {enabled: true},
		navigator: {
			maskFill: 'var(--modal)'
		},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
				week: '%e %b %y',
				month: '%b %y',
				year: '%Y'
			}
		},
		yAxis: [{
				// left
				title: {text: 'µg/m³'},
				opposite: false,
				accessibility: { enabled: true, description: 'Particles'},
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
		lang: {
			noData: 'No Air Quality data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
			valueSuffix: ' µg/m³',
			valueDecimals: 1,
			xDateFormat: "%A, %b %e, %H:%M"
		},
		series: [],
		rangeSelector: myRanges
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
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
	$('#chartdescription').text('Line chart showing recent additional temperature sensor values at the logging interval resolution. These sensors can display any sort of data from pool temperatures to freezer temperatures depending on station usage.');
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'line',
			backgroundColor: myBackground,
			plotBackgroundColor: '#fff',
			zoomType: 'x',
			borderWidth:0,
			alignTicks: false
		},
		title: {text: 'Extra Temperature'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
				week: '%e %b %y',
				month: '%b %y',
				year: '%Y'
			}
		},
		yAxis: [{
				// left
				title: {margin:40,text: 'Temperature (°' + config.temp.units + ')'},
				opposite: false,
				accessibility: { enabled: true, description: 'Temperature'},
				labels: {
					align: 'right',
					x: 15,
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
				},{
					value: frostTemp,
					color: 'rgb(128,128,255)', width: 1, zIndex: 2,
					label: {text: 'Frost possible',y:12}
				}]
			}, {
				// right
				gridLineWidth: 0,
				opposite: true,
				linkedTo: 0,
				labels: {
					align: 'left',
					x: -15,
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
		lang: {
			noData: 'No Extra Temperature data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
			valueSuffix: ' °' + config.temp.units,
			valueDecimals: config.temp.decimals,
			xDateFormat: "%A, %b %e, %H:%M"
		},
		series: [],
		rangeSelector: myRanges
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
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
	$('#chartdescription').text('Line chart showing recent additional humidity sensor values at the logging interval resolution. These sensors are unique to the station and placed to suit the station requirements.');
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'line',
			zoomType: 'x',
			borderWidth:0,
			alignTicks: false
		},
		title: {text: 'Extra Humidity'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
				week: '%e %b %y',
				month: '%b %y',
				year: '%Y'
			}
		},
		yAxis: [{
				// left
				title: {text: 'Humidity (%)'},
				opposite: false,
				accessibility: { enabled: true, description: 'Humidity %'},
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
		lang: {
			noData: 'No Extra Humidity data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
			valueSuffix: ' %',
			valueDecimals: config.hum.decimals,
			xDateFormat: "%A, %b %e, %H:%M"
		},
		series: [],
		rangeSelector: myRanges
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
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
	$('#chartdescription').text('Line chart showing recent additional dew point sensor values at the logging interval resolution. These sensors are unique to the station and placed to suit the station requirements.');
	var freezing = config.temp.units === 'C' ? 0 : 32;
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'line',
			zoomType: 'x',
			borderWidth:0,
			alignTicks: false
		},
		title: {text: 'Extra Dew Point'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
				week: '%e %b %y',
				month: '%b %y',
				year: '%Y'
			}
		},
		yAxis: [{
				// left
				title: {margin:40, text: 'Dew Point (°' + config.temp.units + ')'},
				opposite: false,
				accessibility: { enabled: true, description: 'Dew Point'},
				labels: {
					align: 'right',
					x: 15,
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
					x: -15,
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
		lang: {
			noData: 'No Extra Dew Point data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
			valueSuffix: ' °' + config.temp.units,
			valueDecimals: config.temp.decimals,
			xDateFormat: "%A, %b %e, %H:%M"
		},
		series: [],
		rangeSelector: myRanges
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
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
	$('#chartdescription').text('Line chart showing recent soil tempertaure sensor values at the logging interval resolution. These sensors are unique to the station and placed at depths to suit the station requirements.');
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'line',
			zoomType: 'x',
			borderWidth:0,
			alignTicks: false
		},
		title: {text: 'Soil Temperature'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
				week: '%e %b %y',
				month: '%b %y',
				year: '%Y'
			}
		},
		yAxis: [{
				// left
				title: {margin: 40, text: 'Temperature (°' + config.temp.units + ')'},
				opposite: false,
				accessibility: { enabled: true, description: 'Temperature'},
				labels: {
					align: 'right',
					x: 15,
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
				},{
					value: frostTemp,
					color: 'rgb(128,128,255)', width: 1, zIndex: 2,
					label: {text: 'Frost possible',y:12}
				}]
			}, {
				// right
				gridLineWidth: 0,
				opposite: true,
				linkedTo: 0,
				labels: {
					align: 'left',
					x: -15,
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
		lang: {
			noData: 'No Soil Temperature data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
			valueSuffix: ' °' + config.temp.units,
			valueDecimals: config.temp.decimals,
			xDateFormat: "%A, %b %e, %H:%M"
		},
		series: [],
		rangeSelector: myRanges
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
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
	$('#chartdescription').text('Line chart showing recent soil moisture sensor values at a the logging interval resolution. These sensors are unique to the station and placed at depths to suit the station requirements.');
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'line',
			zoomType: 'x',
			borderWidth:0,
			alignTicks: false
		},
		title: {text: 'Soil Moisture'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
				week: '%e %b %y',
				month: '%b %y',
				year: '%Y'
			}
		},
		yAxis: [{
				// left
				title: {text: 'Soil Moisture'},
				opposite: false,
				accessibility: { enabled: true, description: 'Moisture'},
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
		lang:{
			noData: 'No Soil Moisture data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
			//valueSuffix: ' ' + config.soilmoisture.units,
			valueDecimals: 0,
			xDateFormat: "%A, %b %e, %H:%M"
		},
		series: [],
		rangeSelector: myRanges
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
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
	$('#chartdescription').text('Line chart showing recent leaf wetness sensor values at the logging interval resolution. These sensors are unique to the station and placed to suit the station requirements.');
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'line',
			zoomType: 'x',
			borderWidth:0,
			alignTicks: false
		},
		title: {text: 'Leaf Wetness'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
				week: '%e %b %y',
				month: '%b %y',
				year: '%Y'
			}
		},
		yAxis: [{
				// left
				title: {text: 'Leaf Wetness' + (config.leafwet.units == '' ? '' : '(' + config.leafwet.units + ')')},
				opposite: false,
				accessibility: { enabled: true, description: 'Leaf Wetness'},
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
		lang:{
			noData: 'No Leaf Wetness data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
			valueSuffix: ' ' + config.leafwet.units,
			valueDecimals: config.leafwet.decimals,
			xDateFormat: "%A, %b %e, %H:%M"
		},
		series: [],
		rangeSelector: myRanges
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
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
	$('#chartdescription').text('Line chart showing recent additional temperature sensor values at the logging interval resolution. These sensors can display any sort of data from pool temperatures to freezer temperatures depending on station usage.');
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'line',
			zoomType: 'x',
			borderWidth:0,
			alignTicks: false
		},
		title: {text: 'User Temperature'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
				week: '%e %b %y',
				month: '%b %y',
				year: '%Y'
			}
		},
		yAxis: [{
				// left
				title: {margin:40, text: 'Temperature (°' + config.temp.units + ')'},
				opposite: false,
				accessibility: { enabled: true, description: 'Temperature'},
				labels: {
					align: 'right',
					x: 15,
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
				},{
					value: frostTemp,
					color: 'rgb(128,128,255)', width: 1, zIndex: 2,
					label: {text: 'Frost possible',y:12}
				}]
			}, {
				// right
				gridLineWidth: 0,
				opposite: true,
				linkedTo: 0,
				labels: {
					align: 'left',
					x: -15,
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
		lang: {
			noData: 'No User Temperature data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
			valueSuffix: ' °' + config.temp.units,
			valueDecimals: config.temp.decimals,
			xDateFormat: "%A, %b %e, %H:%M"
		},
		series: [],
		rangeSelector: myRanges
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
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
	$('#chartdescription').text('Line chart showing recent carbon dioxide sensor values at the logging interval resolution. Typically these sensors only provide meaningful data indoors. This sensor may also show particulate matter, temperature and humidity values.');
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'line',
			zoomType: 'x',
			borderWidth:0,
			alignTicks: false
		},
		title: {text: 'CO&#8322; Sensor'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
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
				accessibility: { enabled: true, description: 'CO&#8332'},
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
		lang: {
			noData: 'No CO2 data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: true,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
			xDateFormat: "%A, %b %e, %H:%M"
		},
		series: [],
		rangeSelector: myRanges
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
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
		},
		complete: function () {
			chart.hideLoading();
			chart.redraw();
		}
	});
};

var doLaserDepth = function () {
	$('#chartdescription').text('Line chart showing recent laser sensor depth values at the logging interval resolution.');
	var freezing = config.temp.units === 'C' ? 0 : 32;
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'line',
			alignTicks: false
		},
		title: {text: 'Laser Depth'},
		credits: {enabled: true},
		xAxis: {
			type: 'datetime',
			ordinal: false,
			accessibility: { enabled: true, description: 'Date of reading'},
			dateTimeLabelFormats: {
				day: '<b>%e %b</b>',
				week: '%e %b %y',
				month: '%b %y',
				year: '%Y'
			}
		},
		yAxis: [{
				// left
				title: {text: 'Depth (' + config.laser.units + ')'},
				opposite: false,
				accessibility: { enabled: true, description: 'Laser depth'},
				labels: {
					align: 'right',
					x: 15
				}
			}, {
				// right
				gridLineWidth: 0,
				opposite: true,
				linkedTo: 0,
				labels: {
					align: 'left',
					x: -15
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
		lang: {
			noData: 'No Laser Depth data to display'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'
			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat:  myTooltipPoint,
			footerFormat: '</table>',
			valueSuffix: ' ' + config.laser.units,
			valueDecimals: config.laser.decimals,
			xDateFormat: "%A, %b %e, %H:%M"
		},
		series: [],
		rangeSelector: myRanges
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
	chart.showLoading();

	$.ajax({
		url: '/api/graphdata/laserdepth.json',
		dataType: 'json',
		success: function (resp) {
			Object.entries(resp).forEach(([key, value]) => {
				var id = config.series.laserdepth.name.findIndex(val => val == key);
				chart.addSeries({
					name: key,
					color: config.series.laserdepth.colour[id],
					data: value
				});
			});

			chart.hideLoading();
			chart.redraw();
		}
	});
};
*/