// Last modified: 2025/11/20 14:01:48

let mainChart, navChart, config, avail;

const myRangeBtns = {
    buttons: [{
        count: 1,
        type: 'month',
        text: '1m'
    }, {
        count: 3,
        type: 'month',
        text: '3m'
    }, {
        count: 6,
        type: 'month',
        text: '6m'
    }, {
        type: 'ytd',
        text: 'YTD'
    }, {
        count: 1,
        type: 'year',
        text: '1y'
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

$(document).ready(() => {
    const availRes = $.getJSON({ url: 'availabledata.json' });
    const configRes = $.getJSON({ url: 'graphconfig.json' });

    Promise.all([availRes, configRes])
    .then((results) => {
        available = results[0];
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
        Chart.defaults.plugins.tooltip.callbacks.title =
            (context) => {
                const date = new Date(context[0].parsed.x);
                return date.toLocaleString(config.locale, { day: '2-digit', month: 'long', year: 'numeric' });
            };
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

        if (available.Temperature === undefined || available.Temperature.Count == 0) {
            $('#btnTemp').remove();
        }
        if (available.Humidity === undefined || available.Humidity.Count == 0) {
            $('#btnHum').remove();
        }
        if (available.Solar === undefined || available.Solar.Count == 0) {
            $('#btnSolar').remove();
        }
        if (available.DegreeDays === undefined || available.DegreeDays.Count == 0) {
            $('#btnDegDay').remove();
        }
        if (available.TempSum === undefined || available.TempSum.Count == 0) {
            $('#btnTempSum').remove();
        }
        if (available.ChillHours === undefined || available.ChillHours.Count == 0) {
            $('#btnChillHrs').remove();
        }
        if (available.Snow === undefined || available.Snow.Count == 0) {
            $('#btnSnow').remove();
        }

        changeGraph(parent.location.hash.replace('#', ''));
    });
});


const changeGraph = (graph) => {
    CmxChartJsHelpers.ShowLoading();

    switch (graph) {
        case 'temp':
            doTemp();
            break;
        case 'press':
            doPress();
            break;
        case 'wind':
            doWind();
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
        case 'degday':
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
    parent.location.hash = graph;
}

const doTemp = () => {
    removeOldCharts(true);

    $.getJSON({
        url: 'alldailytempdata.json'
    })
    .done((resp) => {
        const titles = {
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
            'humidex'  : 'Humidex',
            'windChill': 'Wind Chill'
        };
        const hidden = {
            'minTemp'  : false,
            'maxTemp'  : false,
            'avgTemp'  : true,
            'heatIndex': true,
            'minApp'   : true,
            'maxApp'   : true,
            'minDew'   : true,
            'maxDew'   : true,
            'minFeels' : true,
            'maxFeels' : true,
            'humidex'  : true,
            'windChill': true
        };
        const idxs = ['maxTemp', 'avgTemp', 'minTemp', 'heatIndex', 'maxApp', 'minApp', 'maxDew', 'minDew', 'maxFeels', 'minFeels', 'windChill', 'humidex'];

        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        let xscale = CmxChartJsHelpers.TimeScaleDaily;
        xscale.min = selection.start;
        xscale.max = selection.end;

        const scales = {
            x: xscale,
            y_temp: temperatureScale
        };

        let dataSets = [];

        idxs.forEach((idx) => {
            if (idx in resp) {
                let clrIdx = idx.toLowerCase();

                if ('heatIndex' === idx || 'humidex' === idx) {
                    clrIdx = 'max' + clrIdx;
                } else if ('windChill' === idx) {
                    clrIdx = 'min' + clrIdx;
                }

                let yaxis, suffix;

                if (idx === 'humidex') {
                    suffix = 'y_temp';
                    // Link Humidex and temp scales if using Celsius
                    // For Fahrenheit use separate scales
                    if (config.temp.units === 'F') {
                        scales.y_humidex = {
                            title: {
                                display: true,
                                text: 'Humidex'
                            },
                            position: 'right'
                        };
                        yaxis = 'y_humidex';
                    }
                } else {
                    suffix = `°${config.temp.units}`;
                    yaxis = 'y_temp';
                }

                dataSets.push({
                    label: config.series[clrIdx].name,
                    data: resp[idx],
                    borderColor: config.series[clrIdx].colour,
                    backgroundColor: config.series[clrIdx].colour,
                    yAxisID: yaxis,
                    tooltip: {
                        callbacks: {
                            label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${suffix}`
                        }
                    },
                    hidden: hidden[idx]
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
                        text: 'Temperature'
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

const doPress = () => {
    removeOldCharts(true);

    $.getJSON({
        url: 'alldailypressdata.json'
    })
    .done((resp) => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        let xscale = CmxChartJsHelpers.TimeScaleDaily;
        xscale.min = selection.start;
        xscale.max = selection.end;

        const scales = {
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

        const dataSets = [{
            label: config.series.maxpress.name,
            data: resp.maxBaro,
            borderColor: config.series.maxpress.colour,
            backgroundColor: config.series.maxpress.colour,
            yAxisID: 'y_press',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${config.press.units}`
                }
            }
        }, {
            label: config.series.minpress.name,
            data: resp.minBaro,
            borderColor: config.series.minpress.colour,
            backgroundColor: config.series.minpress.colour,
            yAxisID: 'y_press',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${config.press.units}`
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
            data: resp.maxBaro,
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

const compassP = (deg) => {
    if (deg === 0) {
        return 'calm';
    }
    const a = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return a[Math.floor((deg + 22.5) / 45) % 8];
};

const doWind = () => {
    removeOldCharts(true);

    $.getJSON({
        url: 'alldailywinddata.json'
    })
    .done((resp) => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        let xscale = CmxChartJsHelpers.TimeScaleDaily;
        xscale.min = selection.start;
        xscale.max = selection.end;

        const scales = {
            x: xscale,
            y_wind: {
                title: {
                    display: true,
                    text: `Wind Speed (${config.wind.units})`
                },
                min: 0
            },
            y_run: {
                title: {
                    display: true,
                    text: `Wind Run (${config.wind.rununits})`
                },
                min: 0,
                position: 'right'
            }
        };

        const dataSets = [{
            label: 'Wind Speed',
            data: resp.maxWind,
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
            data: resp.maxGust,
            borderColor: config.series.wgust.colour,
            backgroundColor: config.series.wgust.colour,
            yAxisID: 'y_wind',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y.toFixed(config.wind.gustdecimals)} ${config.wind.units}`
                }
            }
        }, {
            label: 'Wind Run',
            data: resp.windRun,
            borderColor: config.series.windrun.colour,
            backgroundColor: config.series.windrun.colour,
            yAxisID: 'y_run',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${config.wind.rununits}`
                }
            },
            hidden: true
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
            },
            plugins: [CmxChartJsPlugins.hideUnusedAxesPlugin]
        });

        const navDataset = {
            label: 'Navigator',
            data: resp.maxGust,
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

    $.getJSON({
        url: 'alldailyraindata.json'
    })
    .done((resp) => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        let xscale = CmxChartJsHelpers.TimeScaleDaily;
        xscale.min = selection.start;
        xscale.max = selection.end;
        xscale.time = {unit: 'day'};

        const scales = {
            x: xscale,
            y_rain: {
                id: 'rain',
                title: {
                    display: true,
                    text: `${config.series.rfall.name} (${config.rain.units})`
                },
                categoryPercentage: 1,
                barPercentage: 1,
                min: 0
            },
            y_rainRate: {
                id: 'rate',
                title: {
                    display: true,
                    text: `${config.series.rrate.name} (${config.rain.units}/hr)`
                },
                grid: {display: false},
                categoryPercentage: 1,
                barPercentage: 1,
                min: 0,
                position: 'right'
            }
        };

        // normalize incoming data to explicit {x, y} points
        // Not sure why this is needed for bar charts - not needed for the nav chart
        const rainData = resp.rain.map(p => {
            return { x: p[0], y: p[1] };
        });
        const rateData = resp.maxRainRate.map(p => {
            return { x: p[0], y: p[1] };
        });

        const dataSets = [{
            label: config.series.rrate.name,
            fill: true,
            data: rateData,
            borderColor: config.series.rrate.colour,
            backgroundColor: config.series.rrate.colour,
            yAxisID: 'y_rainRate',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${config.rain.units}/hr`
                }
            },
            order: 0,
            hidden: true
        }, {
            label: config.series.rfall.name,
            fill: true,
            data: rainData,
            borderColor: config.series.rfall.colour,
            backgroundColor: config.series.rfall.colour,
            yAxisID: 'y_rain',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${config.rain.units}`
                }
            },
            order: 1
        }];

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'bar',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            usePointStyle: false
                        }
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
            data: resp.rain,
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

    $.getJSON({
        url: 'alldailyhumdata.json'
    })
    .done((resp) => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const xscale = CmxChartJsHelpers.TimeScaleDaily;
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

        const titles = {
            'minHum'  : 'Minimum Humidity',
            'maxHum': 'Maximum Humidity'
        };
        const idxs = ['minHum', 'maxHum'];
        let dataSets = [];

        idxs.forEach((idx) => {
            if (idx in resp) {
                dataSets.push({
                    label: titles[idx],
                    data: resp[idx],
                    borderColor: config.series[idx.toLowerCase()].colour,
                    backgroundColor: config.series[idx.toLowerCase()].colour,
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

const doSolar = () => {
    removeOldCharts(true);

    $.getJSON({
        url: 'alldailysolardata.json'
    })
    .done((resp) => {
        const titles = {
            solarRad: 'Solar Radiation',
            uvi     : 'UV Index',
            sunHours: 'Sunshine Hours'
        };
        const types = {
            solarRad: 'line',
            uvi     : 'line',
            sunHours: 'bar'
        };
        const tooltips = {
            solarRad: {
                valueSuffix: 'W/m²',
                valueDecimals: 0
            },
            uvi: {
                valueSuffix: '',
                valueDecimals: config.uv.decimals
            },
            sunHours: {
                valueSuffix: 'hours',
                valueDecimals: 1
            }
        };
        const indexes = {
            solarRad: 1,
            uvi     : 0,
            sunHours: 1
        }
        const idxs = ['solarRad', 'uvi', 'sunHours'];

        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const xscale = CmxChartJsHelpers.TimeScaleDaily;
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
            },
            y_sun: {
                title: {
                    display: true,
                    text: 'Sunshine Hours'
                },
                min: 0,
                position: 'right'
            }
        };

        let dataSets = [];

        idxs.forEach((idx) => {
            if (idx in resp) {
                let clrIdx;
                if (idx === 'uvi')
                    clrIdx ='uv';
                else if (idx === 'solarRad')
                    clrIdx = 'solarrad';
                else if (idx === 'sunHours')
                    clrIdx = 'sunshine';

                let dataPoints = [];
                if (idx === 'sunHours') {
                    dataPoints = resp[idx].map(p => {
                        return { x: p[0], y: p[1] };
                    });
                } else {
                    dataPoints = resp[idx]
                }

                dataSets.push({
                    label: titles[idx],
                    type: types[idx],
                    fill: idx === 'solarRad',
                    data: dataPoints,
                    borderColor: config.series[clrIdx].colour,
                    backgroundColor: config.series[clrIdx].colour + (idx === 'solarRad' ? '40' : ''),
                    yAxisID: idx === 'uvi' ? 'y_uv' : idx === 'solarRad' ? 'y_solar' : 'y_sun',
                    tooltip: {
                        callbacks: {
                            label: item => ` ${item.dataset.label} ${item.parsed.y.toFixed(tooltips[idx].valueDecimals)} ${tooltips[idx].valueSuffix}`
                        }
                    },
                    order: indexes[idx]
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
                        display: true,
                        labels: {
                            usePointStyle: false
                        }
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
            data: resp.solarRad,
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

const doDegDays = () => {
    removeOldCharts(false);

    $.getJSON({
        url: 'alldailydegdaydata.json'
    })
    .done((resp) => {
        let subtitle = '';
        if (available.DegreeDays.indexOf('GDD1') != -1) {
            subtitle = 'GDD#1 base: ' + resp.options.gddBase1 + '°' + config.temp.units;
            if (available.DegreeDays.indexOf('GDD2') != -1) {
                subtitle += ' - ';
            }
        }
        if (available.DegreeDays.indexOf('GDD2') != -1) {
            subtitle += 'GDD#2 base: ' + resp.options.gddBase2 + '°' + config.temp.units;
        }

        const xscale = CmxChartJsHelpers.TimeScaleDaily;
        xscale.time = {displayFormats: {month: 'MMM'}};
        xscale.min = null;
        xscale.max = null;

        let scales = {
            x: xscale,
            y_gdd: {
                title: {
                    display: true,
                    text: `°${config.temp.units} days`
                },
                min: 0
            }
        };

        let dataSets = [];

        available.DegreeDays.forEach((idx) => {
            if (idx in resp) {
                Object.keys(resp[idx]).forEach(yr => {
                    dataSets.push({
                        label: idx + '-' + yr,
                        data: resp[idx][yr],
                        //borderColor: config.series[idx].colour,
                        //backgroundColor: config.series[idx].colour,
                        yAxisID: 'y_gdd',
                        tooltip: {
                            callbacks: {
                                label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'}`
                            }
                        },
                        hidden: true
                    });
                });

                // make the last series visible
                dataSets[dataSets.length -1].hidden = false;
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
                        display: true,
                    },
                    title: {
                        display: true,
                        text: 'Degree Days'
                    },
                    subtitle: {
                        display: true,
                        text: subtitle
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const date = new Date(context[0].parsed.x);
                                return date.toLocaleString(config.locale, { day: '2-digit', month: 'long' });
                            }
                        }
                    }
                }
            }
        });
    });
};

const doTempSum = () => {
    removeOldCharts(false);

    $.getJSON({
        url: 'alltempsumdata.json'
    })
    .done((resp) => {
        let subtitle = '';
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

        const xscale = CmxChartJsHelpers.TimeScaleDaily;
        xscale.time = {displayFormats: {month: 'MMM'}};
        xscale.min = null;
        xscale.max = null;

        let tempScale = temperatureScale;
        tempScale.title.text = `Total °${config.temp.units}`
        tempScale.beginAtZero = true;
        let scales = {
            x: xscale,
            y_sum: tempScale
        };

        let dataSets = [];

        available.TempSum.forEach((idx) => {
            if (idx in resp) {
                Object.keys(resp[idx]).forEach(yr => {
                    dataSets.push({
                        label: idx + '-' + yr,
                        data: resp[idx][yr],
                        yAxisID: 'y_sum',
                        tooltip: {
                            callbacks: {
                                label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'}`
                            }
                        },
                        hidden: true
                    });
                });

                // make the last series visible
                dataSets[dataSets.length -1].hidden = false;
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
                        display: true,
                    },
                    title: {
                        display: true,
                        text: 'Temperature Sum'
                    },
                    subtitle: {
                        display: true,
                        text: subtitle
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const date = new Date(context[0].parsed.x);
                                return date.toLocaleString(config.locale, { day: '2-digit', month: 'long' });
                            }
                        }
                    }
                }
            }
        });
    });
};

const doChillHrs = () => {
    removeOldCharts(false);

    $.getJSON({
        url: 'allchillhrsdata.json'
    })
    .done((resp) => {
        const subtitle = 'Threshold: ' + resp.options.threshold + '°' + config.temp.units + ' Base: ' + resp.options.basetemp + '°' + config.temp.units;

        const xscale = CmxChartJsHelpers.TimeScaleDaily;
        xscale.time = {displayFormats: {month: 'MMM'}};
        xscale.min = null;
        xscale.max = null;

        let scales = {
            x: xscale,
            y_sum: {
                title: {
                    display: true,
                    text: 'Total Hours'
                },
                min: 0
            }
        };

        let dataSets = [];

        for (let yr in resp.data) {
            dataSets.push({
                label: yr.toString(),
                data: resp.data[yr],
                yAxisID: 'y_sum',
                tooltip: {
                    callbacks: {
                        label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} hrs`
                    }
                },
                hidden: true
            });
        }

        // make the last series visible
        dataSets[dataSets.length - 1].hidden = false;

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
                        text: 'Chill Hours'
                    },
                    subtitle: {
                        display: true,
                        text: subtitle
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const date = new Date(context[0].parsed.x);
                                return date.toLocaleString(config.locale, { day: '2-digit', month: 'long' });
                            }
                        }
                    }
                }
            }
        });
    });
};

const doSnow = () => {
    removeOldCharts(true);

    $.getJSON({
        url: 'alldailysnowdata.json'
    })
    .done((resp) => {
        // Initial x-range
        const key = Object.keys(resp)[0];
        CmxChartJsHelpers.SetInitialRange(resp[key]);

        const xscale = CmxChartJsHelpers.TimeScaleDaily;
        xscale.min = selection.start;
        xscale.max = selection.end;

        let scales = {
            x: xscale,
            y_snow: {
                title: {
                    display: true,
                    text: `Snow (${config.snow.units})`
                },
                min: 0
            }
        };

        let dataSets = [];

        if ('SnowDepth' in resp && resp.SnowDepth.length > 0) {
            const dataPoints = resp.SnowDepth.map(p => {
                return { x: p[0], y: p[1] };
            });

            dataSets.push({
                label: config.series.snowdepth.name,
                data: dataPoints,
                borderColor: config.series.snowdepth.colour,
                backgroundColor: config.series.snowdepth.colour,
                yAxisID: 'y_snow',
                tooltip: {
                    callbacks: {
                        label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${config.snow.units}`
                    }
                }
            });
        }

        if ('Snow24h' in resp && resp.Snow24h.length > 0) {
            const dataPoints = resp.Snow24h.map(p => {
                return { x: p[0], y: p[1] };
            });

            dataSets.push({
                label: config.series.snow24h.name,
                data: dataPoints,
                borderColor: config.series.snow24h.colour,
                backgroundColor: config.series.snow24h.colour,
                yAxisID: 'y_snow',
                tooltip: {
                    callbacks: {
                        label: item => ` ${item.dataset.label} ${item.parsed.y === null ? '-' : item.parsed.y} ${config.snow.units}`
                    }
                }
            });
        }

        CmxChartJsHelpers.HideLoading();

        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'bar',
            data: {datasets: dataSets},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: scales,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            usePointStyle: false
                        }
                    },
                    title: {
                        display: true,
                        text: 'Snow'
                    }
                }
            }
        });

        const navDataset = {
            label: 'Navigator',
            data: dataSets[dataSets.length - 1].data,
            borderColor: 'rgba(33,133,208,0.6)',
            backgroundColor: 'rgba(33,133,208,0.6)',
            pointStyle: false,
            tension: 0.1
        };

        var opts = CmxChartJsHelpers.NavChartOptions;
        opts.scales.y.min = 0;

        navChart = new Chart(document.getElementById('navChart'), {
            type: 'bar',
            data: {datasets: [navDataset]},
            options: opts,
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