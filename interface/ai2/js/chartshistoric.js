/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: chartshistoric.js
    Author: M Crossley & N Thomas
    (MC) Last Edit: 2025/11/21 16:01:00
    Last Edit (NT): 2025-11-16 09:58:25
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Charts for chartshistoric.html
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

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

let defaultEnd, defaultStart, selection;
let dragging = null;
let dragStartX = 0;
let currentCursor = 'default';
let temperatureScale;

$().ready(() => {

	$('.ax-btnBar').children().click( function() {
		CMXSession.Charts.Historic = this.id
		sessionStorage.setItem(axStore, JSON.stringify(CMXSession));
		//	Clear all buttons
		$('.ax-btnBar').children().removeClass('w3-disabled');
		$('#'+this.id).addClass('w3-disabled');
		doGraph( this.id );
	});


    const availRes = $.getJSON({ url: '/api/graphdata/availabledata.json' });
    const configRes = $.getJSON({ url: '/api/graphdata/graphconfig.json' });

    Promise.all([availRes, configRes])
    .then(function (results) {
        available = results[0];
        config = results[1];

        if (available.Temperature === undefined || available.Temperature.Count == 0) {
			$('#temp').remove();
        }
        if (available.Humidity === undefined || available.Humidity.Count == 0) {
			$('#humidity').remove();
        }
        if (available.Solar === undefined || available.Solar.Count == 0) {
			$('#solar').remove();
        }
        if (available.DegreeDays === undefined || available.DegreeDays.Count == 0) {
			$('#degdays').remove();
        }
        if (available.TempSum === undefined || available.TempSum.Count == 0) {
			$('#tempsum').remove();
        }
        if (available.ChillHours === undefined || available.ChillHours.Count == 0) {
			$('#chillhrs').remove();
        }
        if (available.Snow === undefined || available.Snow.Count == 0) {
			$('#snow').remove();
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
        Chart.defaults.plugins.tooltip.callbacks.title =
            (context) => {
                const date = new Date(context[0].parsed.x);
                return date.toLocaleString(config.locale, { day: '2-digit', month: 'long', year: 'numeric' });
            };
        Chart.defaults.plugins.title.font.size = 18;
        Chart.defaults.plugins.title.font.color = '#000';
        Chart.defaults.plugins.decimation.enabled = true;
        Chart.defaults.plugins.chartAreaBorder = {borderColor: '#858585'}

        document.getElementById('btnFullscreen').addEventListener('click', () => {
            CmxChartJsHelpers.ToggleFullscreen(document.getElementById('chartcontainer'));
        });

        CmxChartJsHelpers.AddPrintButtonHandler();

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

		var current = CMXSession.Charts.Historic;
		if( current === ''){
			current = 'temp';
		}
		$('#' + current).addClass('w3-disabled');
		doGraph( current );

    });

    $.getJSON({url: '/api/info/version.json'})
    .done((result) => {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    });

});

const doGraph = (value) => {
    CmxChartJsHelpers.ShowLoading();

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


const doTemp = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_HIST_TEMP_DESC}}');

    $.getJSON({
        url: '/api/dailygraphdata/tempdata.json',
    })
    .done((resp) => {
        const titles = {
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
                                text: '{{HUMIDEX}}'
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
                            label: item => ` ${item.dataset.label} ${item.parsed.y} ${suffix}`
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

    $('#chartdescription').text('Line chart showing daily high and low atmospheric pressure values.');

    $.getJSON({
        url: '/api/dailygraphdata/pressdata.json',
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
                    text: `{{PRESSURE}} (${config.press.units})`
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
                    label: item => ` ${item.dataset.label} ${item.parsed.y} ${config.press.units}`
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
                    label: item => ` ${item.dataset.label} ${item.parsed.y} ${config.press.units}`
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
                        text: '{{PRESSURE}}'
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
        return '{{CALM}}';
    }
    var a = ['{{COMPASS_N}}', '{{COMPASS_NE}}', '{{COMPASS_E}}', '{{COMPASS_SE}}', '{{COMPASS_S}}', '{{COMPASS_SW}}', '{{COMPASS_W}}', '{{COMPASS_NW}}'];
    return a[Math.floor((deg + 22.5) / 45) % 8];
};

const doWind = () => {
    removeOldCharts(true);

    $('#chartdescription').text('{{CHART_HIST_WIND_DESC}}');

    $.getJSON({
        url: '/api/dailygraphdata/winddata.json',
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
                    text: `{{WIND_SPEED}} (${config.wind.units})`
                },
                min: 0
            },
            y_run: {
                title: {
                    display: true,
                    text: `{{WIND_RUN}} (${config.wind.rununits})`
                },
                min: 0,
                position: 'right'
            }
        };

        const dataSets = [{
            label: '{{WIND_SPEED}}',
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
            label: '{{WIND_GUST}}',
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
            label: '{{WIND_RUN}}',
            data: resp.windRun,
            borderColor: config.series.windrun.colour,
            backgroundColor: config.series.windrun.colour,
            yAxisID: 'y_run',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} ${config.wind.rununits}`
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
                        text: '{{WIND_SPEED}}'
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

    $('#chartdescription').text('{{CHART_HIST_RAIN_DESC}}');

    $.getJSON({
        url: '/api/dailygraphdata/raindata.json',
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
                    text: `{{RAINFALL}} (${config.rain.units})`
                },
                categoryPercentage: 1,
                barPercentage: 1,
                min: 0
            },
            y_rainRate: {
                id: 'rate',
                title: {
                    display: true,
                    text: `{{RAIN_RATE}} (${config.rain.units}/{{HOUR_SHORT_LC}})`
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
            label: '{{RAIN_RATE}}',
            fill: true,
            data: rateData,
            borderColor: config.series.rrate.colour,
            backgroundColor: config.series.rrate.colour,
            yAxisID: 'y_rainRate',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} ${config.rain.units}/{{HOUR_SHORT_LC}}`
                }
            },
            order: 0,
            hidden: true
        }, {
            label: '{{RAIN_DAILY}}',
            fill: true,
            data: rainData,
            borderColor: config.series.rfall.colour,
            backgroundColor: config.series.rfall.colour,
            yAxisID: 'y_rain',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} ${config.rain.units}`
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
                        text: '{{RAINFALL}}'
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

    $.getJSON({
        url: '/api/dailygraphdata/humdata.json',
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
            'minHum'  : '{{HUMIDITY_MINIMUM}}',
            'maxHum': '{{HUMIDITY_MAXIMUM}}'
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

    $('#chartdescription').text('{{CHART_HIST_SOLAR_DESC}}');

    $.getJSON({
        url: '/api/dailygraphdata/solardata.json'
    })
    .done((resp) => {
        const titles = {
            solarRad: '{{SOLAR_RADIATION}}',
            uvi     : '{{UV_INDEX}}',
            sunHours: '{{SUNSHINE_HOURS}}'
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
                valueSuffix: '{{HOURS}}',
                valueDecimals: 0
            }
        };
        const indexes = {
            solarRad: 1,
            uvi     : 2,
            sunHours: 0
        }
/*        const fillColor = {
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
        };*/
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
            },
            y_sun: {
                title: {
                    display: true,
                    text: '{{SUNSHINE_HOURS}}'
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
                        text: '{{SOLAR}}'
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


    $.getJSON({
        url: '/api/dailygraphdata/degdaydata.json',
    })
    .done((resp) => {
        let subtitle = '';
        if (available.DegreeDays.indexOf('GDD1') != -1) {
            subtitle = '{{GDD1_BASE}}: ' + resp.options.gddBase1 + '°' + config.temp.units;
            if (available.DegreeDays.indexOf('GDD2') != -1) {
                subtitle += ' - ';
            }
        }
        if (available.DegreeDays.indexOf('GDD2') != -1) {
            subtitle += '{{GDD2_BASE}}: ' + resp.options.gddBase2 + '°' + config.temp.units;
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
                                label: item => ` ${item.dataset.label} ${item.parsed.y}`
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
                        text: '{{DEGREE_DAYS}}'
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

    $('#chartdescription').text('{{CHART_HIST_TEMPSUM_DESC}}');

    $.getJSON({
        url: '/api/dailygraphdata/tempsumdata.json',
    })
    .done((resp) => {
        let subtitle = '';
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
                                label: item => ` ${item.dataset.label} ${item.parsed.y}`
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
                        text: '{{TEMPERATURE_SUM}}'
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

    $('#chartdescription').text('{{CHART_HIST_CHILL_HRS_DESC}}');

    $.getJSON({
        url: '/api/dailygraphdata/chillhrsdata.json',
    })
    .done((resp) => {
        const subtitle = '{{THRESHOLD}}: ' + resp.options.threshold + '°' + config.temp.units + ' {{BASE}}: ' + resp.options.basetemp + '°' + config.temp.units;

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
                        label: item => ` ${item.dataset.label} ${item.parsed.y} hrs`
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
                        text: '{{CHILL_HOURS}}'
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

    $('#chartdescription').text('{{CHART_HIST_SNOW_DESC}}');

    $.getJSON({
        url: '/api/dailygraphdata/dailysnow.json',
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
                label: '{{SNOW_DEPTH}}',
                data: dataPoints,
                borderColor: config.series.snowdepth.colour,
                backgroundColor: config.series.snowdepth.colour,
                yAxisID: 'y_snow',
                tooltip: {
                    callbacks: {
                        label: item => ` ${item.dataset.label} ${item.parsed.y === null ? '-' : item.parsed.y} ${config.snow.units}`
                    }
                }
            });
        }

        if ('Snow24h' in resp && resp.Snow24h.length > 0) {
            const dataPoints = resp.Snow24h.map(p => {
                return { x: p[0], y: p[1] };
            });

            dataSets.push({
                label: '{{SNOW_24H}}',
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
                        text: '{{SNOWFALL}}'
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

