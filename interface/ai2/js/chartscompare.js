// Created: 2021/01/21 17:10:29
// Last modified: 2025/11/14 14:54:30

let mainChart, navChart, config, avail, options;
let settings;

let datasetsReady = false;

const txtSelect = '{{SELECT_SERIES}}';
const txtClear = '{{CLEAR_SERIES}}';

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

const plotColours = ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'];

const compassP = (deg) => {
    const compassPoints = ['{{COMPASS_N}}', '{{COMPASS_NE}}', '{{COMPASS_E}}', '{{COMPASS_SE}}', '{{COMPASS_S}}', '{{COMPASS_SW}}', '{{COMPASS_W}}', '{{COMPASS_NW}}'];
    if (deg === 0) {
        return '{{CALM}}';
    }
    return compassPoints[Math.floor((deg + 22.5) / 45) % 8];
};

let defaultEnd, defaultStart, selection;
let dragging = null;
let dragStartX = 0;
let currentCursor = 'default';

$(document).ready(() => {
    $.getJSON({url: '/api/info/version.json'})
    .done((result) => {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    });


    const availRes = $.getJSON({ url: '/api/graphdata/availabledata.json' });
    const settingsRes = $.getJSON({ url: '/api/graphdata/selectachart.json' });
    const configRes = $.getJSON({ url: '/api/graphdata/graphconfig.json' });

    Promise.all([availRes, settingsRes, configRes])
    .then((results) => {

        avail = results[0];
        settings = results[1];
        config = results[2];

        // add the default select option
        let option = $('<option />');
        option.html(txtSelect);
        option.val(0);
        $('#data0').append(option.clone());
        $('#data1').append(option.clone());
        $('#data2').append(option.clone());
        $('#data3').append(option.clone());
        $('#data4').append(option.clone());
        $('#data5').append(option);

        // then the real series options
        for (var k in avail) {
            if (['DailyTemps', 'Sunshine', 'DegreeDays', 'TempSum', 'CO2', 'Snow', 'ChillHours'].indexOf(k) === -1) {
                let optgrp = $('<optgroup />');
                optgrp.attr('label', k);
                avail[k].forEach(function (val) {
                    if (['Humidex'].indexOf(val) === -1) {
                        let option = $('<option />');
                        option.html(val);
                        if (['ExtraTemp', 'ExtraHum', 'ExtraDewPoint', 'SoilMoist', 'SoilTemp', 'UserTemp', 'LeafWetness', 'LaserDepth'].indexOf(k) === -1) {
                            option.val(val);
                        } else {
                            option.val(k + '-' + val);
                        }
                        optgrp.append(option);
                    }
                });
                $('#data0').append(optgrp.clone());
                $('#data1').append(optgrp.clone());
                $('#data2').append(optgrp.clone());
                $('#data3').append(optgrp.clone());
                $('#data4').append(optgrp.clone());
                $('#data5').append(optgrp);
            }
        }

        // add the chart theme colours
        plotColours.forEach(function(col, idx) {
            let option = $('<option style="background-color:' + col + '"/>');
            option.html(idx);
            option.val(col);
            $('#colour0').append(option.clone());
            $('#colour1').append(option.clone());
            $('#colour2').append(option.clone());
            $('#colour3').append(option.clone());
            $('#colour4').append(option.clone());
            $('#colour5').append(option);
        });

        CmxChartJsHelpers.SetRangeButtons('rangeButtons', myRangeBtns.buttons);
        CmxChartJsHelpers.SetupNavigatorSelection('navChart')

        // Global plugins
        Chart.register(CmxChartJsPlugins.chartAreaBorder);

        Chart.defaults.locale = config.locale;
        Chart.defaults.scales.time.adapters = {date: {zone: config.tz}}
        Chart.defaults.datasets.line.pointRadius = 0;
        Chart.defaults.datasets.line.pointHoverRadius = 5;
        Chart.defaults.datasets.line.borderWidth = 2;
        Chart.defaults.scales.linear.title = {font: {weight: 'bold', size: 12}, padding: {bottom: -2}};
        Chart.defaults.scales.linear.ticks.precision = 0;
        Chart.defaults.scales.linear.grid = {display: false};
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

        document.getElementById('btnFullscreen').addEventListener('click', () => {
            CmxChartJsHelpers.ToggleFullscreen(document.getElementById('chartcontainer'));
        });

        // Draw the basic chart
        mainChart = new Chart(document.getElementById('mainChart'), {
            type: 'line',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {x: CmxChartJsHelpers.TimeScale},
                plugins: {
                    legend: {
                        display: true
                    },
                    title: {
                        display: true,
                        text: 'Recent Data Select-a-Chart'
                    }
                }
            },
            plugins: [CmxChartJsPlugins.hideUnusedAxesPlugin]
        });

        const navDataset = {
            label: 'Navigator',
            data: [0,0],
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

        selection = {
            start: 0, end: 0
        };

        const pendingCalls = [];

        // Set the dropdowns to defaults or previous values
        for (var i = 0; i < 6; i++) {
            if (settings.colours[i] == '' || settings.colours[i] == null) {
                $('#colour' + i).css('background', chart.options.colors[i]);
                $('#colour' + i).val(chart.options.colors[i]);
                settings.colours[i] = chart.options.colors[i];
            } else {
                $('#colour' + i).css('background', settings.colours[i]);
                $('#colour' + i).val(settings.colours[i]);
            }
            if (settings.series[i] != '0') {
                // This series has some data associated with it
                $('#data' + i + ' option:contains(' + txtSelect +')').text(txtClear);
                $('#data' + i).val(settings.series[i]);
                // Draw it on the chart
                promise = updateChart(settings.series[i], i, 'data' + i);
                pendingCalls.push(promise);
            }
        }

        Promise.all(pendingCalls).then(() => {
            mainChart.config.update();
            mainChart.update();
            checkNavChartDataSet();
        });
    });
});


const procDataSelect = (sel) => {
    // compare the select value against the other selects, and update the chart if required
    const id = sel.id;
    const num = +id.slice(-1);
    const val = sel.value;

    // Has this series already been selected? If so set the dropdown back to its previous value, then abort
    if (val != '0' &&  settings.series.indexOf(sel.value) != -1) {
        $('#' + id).val(settings.series[num]).prop('selected', true);
        return;
    }

    //
    if (val != '0') {
        $('#' + id + ' option:contains(' + txtSelect +')').text(txtClear);
    } else {
        $('#' + id + ' option:contains(' + txtClear +')').text(txtSelect);
    }

    // clear the existing series
    if (mainChart.data.datasets.length > 0)
        clearSeries(settings.series[num]);

    const x = updateChart(val, num, id);
    Promise.all([x]).then(() => {
        mainChart.config.update();
        mainChart.update();
        checkNavChartDataSet();
    });

    settings.series[num] = val;

    storeSettings();
};

const updateChart = (val, num, id) => {
    // test for the extra sensor series first
    if (val.startsWith('ExtraTemp-')) {
        return doExtraTemp(num, val);
    } else if (val.startsWith('ExtraHum-')) {
        return doExtraHum(num, val);
    } else if (val.startsWith('ExtraDewPoint-')) {
        return doExtraDew(num, val);
    } else if (val.startsWith('UserTemp-')) {
        return doUserTemp(num, val);
    } else if (val.startsWith('SoilMoist-')) {
        return doSoilMoist(num, val);
    } else if (val.startsWith('SoilTemp-')) {
        return doSoilTemp(num, val);
    } else if (val.startsWith('LeafWetness-')) {
        return doLeafWet(num, val);
    } else if (val.startsWith('LaserDepth-')) {
       return doLaserDepth(num, val);
    }

    // no? then do the "standard" data
    switch (val) {
        case '0':
            // clear this series
            break;
        case 'Temperature':
            return doTemp(num);
        case 'Indoor Temp':
            return doInTemp(num);
        case 'Heat Index':
            return doHeatIndex(num);
        case 'Dew Point':
            return doDewPoint(num);
        case 'Wind Chill':
            return doWindChill(num);
        case 'Apparent Temp':
            return doAppTemp(num);
        case 'Feels Like':
            return doFeelsLike(num);
        case 'Humidex':
            return doHumidex(num);

        case 'Humidity':
            return doHumidity(num);
        case 'Indoor Hum':
            return doInHumidity(num);

        case 'Solar Rad':
            return doSolarRad(num);
        case 'UV Index':
            return doUV(num);

        case 'Pressure':
            return doPress(num);

        case 'Wind Speed':
            return doWindSpeed(num);
        case 'Wind Gust':
            return doWindGust(num);
        case 'Wind Bearing':
            return doWindDir(num);

        case 'Rainfall':
            return doRainfall(num);
        case 'Rainfall Rate':
            return doRainRate(num);

        case 'PM 2.5':
            return doPm2p5(num);
        case 'PM 10':
            return doPm10(num);

        default:
            $('#' + id).val(txtSelect);
            break;
    }
}

const updateColour = (sel) => {
    const id = sel.id;
    const num = +id.slice(-1);
    const val = sel.value;

    // set the selection colour
    $('#' + id).css('background', val);
    settings.colours[num] = val;


    // do we need to update the associated data series?
    if (settings.series[num] != '0') {
            // find the series
        let seriesIdx = -1;
        let i = 0;
        chart.series.forEach(function (ser) {
            if (ser.options.name == settings.series[num] && ser.yAxis.options.id != 'navigator-y-axis') {
                seriesIdx = i;
            }
            i++;
        });

        if (seriesIdx == -1)
            return;

        mainChart.config.data.datasets[seriesIdx].borderColor = settings.colours[num];
        mainChart.config.data.datasets[seriesIdx].backgroundColor = settings.colours[num];
        mainChart.update('none');

        if (navChart.data.datasets[0].id === mainChart.config.data.datasets[seriesIdx].id) {
            navChart.config.data.datasets[0].borderColor = settings.colours[num];
            navChart.config.data.datasets[0].backgroundColor = settings.colours[num];
            navChart.update('none');
        }
    }
    storeSettings();
};

const storeSettings = () => {
    $.ajax({
        url: '/api/graphdata/selectachart.json',
        type: 'POST',
        contentType: false,
        data: JSON.stringify(settings),
        dataType: 'json'
    });
};

const clearSeries = (val) => {
    // find the series
    let found = false;
    // clear the series - if found
    for (let i = 0; i < mainChart.config.data.datasets.length; i++) {
        if (mainChart.config.data.datasets[i].id === val) {
            mainChart.config.data.datasets.splice(i, 1);
            found = true;
            break;
        }
    };

    if (!found) return;

    // check the navigator - have we just removed the series it was using, and is there at least one series we can use instead?
    checkNavChartDataSet();

    mainChart.update('none');
    navChart.update('none');
}

const checkNavChartDataSet = () => {
    let order = 100;
    let useSet = -1;

    for (let i = 0; i < mainChart.data.datasets.length; i++) {
        if (mainChart.data.datasets[i].order < order) {
            order = mainChart.data.datasets[i].order;
            useSet = i;
        }
    }

    if (useSet > -1) {
        if (navChart.data.datasets[0].data == null || navChart.data.datasets[0].data.length == 0) {// initial state
            navChart.data.datasets[0].id = mainChart.data.datasets[useSet].id;
            navChart.data.datasets[0].data = mainChart.data.datasets[useSet].data
            navChart.data.datasets[0].borderColor = mainChart.data.datasets[useSet].borderColor;
            navChart.update();
        } else if (navChart.data.datasets[0].id != mainChart.data.datasets[useSet].id) {
            navChart.data.datasets[0].id = mainChart.data.datasets[useSet].id;
            navChart.data.datasets[0].data = mainChart.data.datasets[useSet].data;
            navChart.data.datasets[0].borderColor = mainChart.data.datasets[useSet].borderColor;
            navChart.update();
        }
    } else {
        navChart.data.datasets[0].data = [];
        navChart.update();
    }
};

const setInitialRange = (data) => {
    // Initial x-range
    if ((mainChart.data.datasets == null || mainChart.data.datasets.length === 0) && (data != null && data.length > 0)) {
        CmxChartJsHelpers.SetInitialRange(data);

        mainChart.config.options.scales.x.min = selection.start;
        mainChart.config.options.scales.x.max = selection.end;
    }
}

const checkAxisExists = (name) => {
    return name in mainChart.scales;
};

const addTemperatureAxis = (idx) => {
    // first check if we already have a temperature axis
    if (checkAxisExists('y_temp'))
        return;

    // nope no existing axis, add one
    const freezing = config.temp.units === 'C' ? 0 : 32;

    mainChart.options.scales.y_temp = {
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
        },
        position: idx < settings.series.length / 2 ? 'left' : 'right'
    };
};

const addPressureAxis = (idx) => {
    // first check if we already have a pressure axis
    if (checkAxisExists('y_press'))
        return;

    // nope no existing axis, add one
    mainChart.options.scales.y_press = {
        title: {
            display: true,
            text: `{{PRESSURE}} (${config.press.units})`
        },
        ticks: {
            // suppress thousands separator for hPa
            callback: (value, index, ticks) => { return Number(value); }
        },
        grace: config.press.units === 'inHg' ? 0.2 : 1,
        position: idx < settings.series.length / 2 ? 'left' : 'right'
    };
};

const addHumidityAxis = (idx) => {
    // first check if we already have a humidity axis
    if (checkAxisExists('y_hum'))
        return;

    // nope no existing axis, add one
    mainChart.options.scales.y_hum = {
        title: {
            display: true,
            text: '{{HUMIDITY}} (%)'
        },
        min: 0,
        max: 100,
        position: idx < settings.series.length / 2 ? 'left' : 'right'
    };
};

const addSoilMoistAxis = (idx) => {
    // first check if we already have a soil moisture axis
    if (checkAxisExists('y_moist'))
        return;

    // nope no existing axis, add one
    mainChart.options.scales.y_moist = {
        title: {
            display: true,
            text: '{{SOIL_MOISTURE}}'
        },
        min: 0,
        max: config.soilmoisture.units.includes('cb') ? 200 : 100, // Davis 0-200 cb, Ecowitt 0-100%
        position: idx < settings.series.length / 2 ? 'left' : 'right'
    };
};

const addSolarAxis = (idx) => {
    // first check if we already have a solar axis
    if (checkAxisExists('y_solar'))
        return;

    // nope no existing axis, add one
    mainChart.options.scales.y_solar = {
        title: {
            display: true,
            text: '{{SOLAR_RADIATION}} (W/m²)'
        },
        min: 0,
        position: idx < settings.series.length / 2 ? 'left' : 'right'
    };
};

const addUVAxis = (idx) => {
    // first check if we already have a UV axis
    if (checkAxisExists('y_uv'))
        return;

    // nope no existing axis, add one
    mainChart.options.scales.y_uv = {
        title: {
            display: true,
            text: '{{UV_INDEX}}'
        },
        min: 0,
        position: idx < settings.series.length / 2 ? 'left' : 'right'
    };
};

const addWindAxis = (idx) => {
    // first check if we already have a wind axis
    if (checkAxisExists('y_wind'))
        return;

    // nope no existing axis, add one
    mainChart.options.scales.y_wind = {
        title: {
            display: true,
            text: `{{WIND_SPEED}} (${config.wind.units})`
        },
        min: 0,
        position: idx < settings.series.length / 2 ? 'left' : 'right'
    };
};

const addBearingAxis = (idx) => {
    // first check if we already have a bearing axis
    if (checkAxisExists('y_bearing'))
        return;

    // nope no existing axis, add one
    mainChart.options.scales.y_bearing = {
        title: {
            display: true,
            text: '{{WIND_BEARING}}'
        },
        min: 0,
        max: 360,
        ticks: {
            callback: (val, index) => {
                return compassP(val);
            },
            stepSize: 45
        },
        position: idx < settings.series.length / 2 ? 'left' : 'right'
    };
};

const addRainAxis = (idx) => {
    // first check if we already have a rain axis
    if (checkAxisExists('y_rain'))
        return;

    // nope no existing axis, add one
    mainChart.options.scales.y_rain = {
        title: {
            display: true,
            text: `{{RAINFALL}} (${config.rain.units})`
        },
        beginAtZero: true,
        grace: 0,
        position: idx < settings.series.length / 2 ? 'left' : 'right'
    };
};

const addRainRateAxis = (idx) => {
    // first check if we already have a rain rate axis
    if (checkAxisExists('y_rainRate'))
        return;

    // nope no existing axis, add one
    mainChart.options.scales.y_rainRate = {
        title: {
            display: true,
            text: `{{RAINFALL_RATE}} (${config.rain.units}/{{SHORT_HR}})`
        },
        beginAtZero: true,
        grace: 0,
        position: idx < settings.series.length / 2 ? 'left' : 'right'
    };
};

const addAQAxis = (idx) => {
    // first check if we already have a AQ axis
    if (checkAxisExists('y_pm'))
        return;

    // nope no existing axis, add one
    mainChart.options.scales.y_pm = {
        title: {
            display: true,
            text: '{{PARTICULATES}} (µg/m³)'
        },
        min: 0,
        position: idx < settings.series.length / 2 ? 'left' : 'right'
    };
};

const addLeafWetAxis = (idx) => {
    // first check if we already have a humidity axis
    if (checkAxisExists('y_leaf'))
        return;

    // nope no existing axis, add one
    mainChart.options.scales.y_leaf = {
        title: {
            display: true,
            text: `{{LEAF_WETNESS}} (${config.leafwet.units == '' ? '' : config.leafwet.units})`
        },
        min: 0,
        position: idx < settings.series.length / 2 ? 'left' : 'right'
    }
};

const addLaserAxis = (idx) => {
    // first check if we already have a laser axis
    if (checkAxisExists('y_laser'))
        return;

    // nope no existing axis, add one
    mainChart.options.scales.y_laser = {
        title: {
            display: true,
            text: `{{LASER_DEPTH}} (${config.laser.units})`
        },
        position: idx < settings.series.length / 2 ? 'left' : 'right'
    }
};


const doTemp = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/tempdata.json',
    })
    .done((resp) => {
        setInitialRange(resp.temp);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{TEMPERATURE}}',
            type: 'line',
            data: resp.temp,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doInTemp = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/tempdata.json',
    })
    .done((resp) => {
        setInitialRange(resp.intemp);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{INDOOR_TEMP}}',
            type: 'line',
            data: resp.intemp,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doHeatIndex = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/tempdata.json',
    })
    .done((resp) => {
        setInitialRange(resp.heatindex);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{HEAT_INDEX}}',
            type: 'line',
            data: resp.heatindex,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doDewPoint = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/tempdata.json',
    })
    .done((resp) => {
        setInitialRange(resp.dew);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{DEW_POINT}}',
            type: 'line',
            data: resp.dew,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doWindChill = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/tempdata.json',
    })
    .done((resp) => {
        setInitialRange(resp.wchill);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{WIND_CHILL}}',
            type: 'line',
            data: resp.wchill,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doAppTemp = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/tempdata.json',
    })
    .done((resp) => {
        setInitialRange(resp.apptemp);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{APPARENT_TEMP}}',
            type: 'line',
            data: resp.apptemp,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doFeelsLike = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/tempdata.json',
    })
    .done((resp) => {
        setInitialRange(resp.feelslike);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{FEELS_LIKE}}',
            type: 'line',
            data: resp.feelslike,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

/*
var doHumidex = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: '/api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.humidex,
                id: 'Humidex',
                name: '{{HUMIDEX}}',
                yAxis: 'Temperature',
                type: 'line',
                tooltip: {
                    //valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};
*/

const doHumidity = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/humdata.json',
    })
    .done((resp) => {
        setInitialRange(resp.hum);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{HUMIDITY}}',
            type: 'line',
            data: resp.hum,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_hum',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} %`
                }
            },
            order: idx
        });

        addHumidityAxis(idx);
    });
};

const doInHumidity = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/humdata.json',
    })
    .done((resp) => {
        setInitialRange(resp.inhum);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{INDOOR_HUM}}',
            type: 'line',
            data: resp.inhum,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_hum',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} %`
                }
            },
            order: idx
        });

        addHumidityAxis(idx);
    });
};


const doSolarRad = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/solardata.json',
    })
    .done((resp) => {
        setInitialRange(resp.SolarRad);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{SOLAR_RAD}}',
            type: 'line',
            fill: true,
            data: resp.SolarRad,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx] + '40',
            yAxisID: 'y_solar',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} W/m²`
                }
            },
            order: idx
        });

        addSolarAxis(idx);
    });
};

const doUV = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/solardata.json',
    })
    .done((resp) => {
        setInitialRange(resp.UV);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{UV_INDEX}}',
            type: 'line',
            data: resp.UV,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_uv',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y}`
                }
            },
            order: idx
        });

        addUVAxis(idx);
    });
};


const doPress = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/pressdata.json',
    })
    .done((resp) => {
        setInitialRange(resp.press);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{PRESSURE}}',
            type: 'line',
            data: resp.press,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_press',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} ${config.press.units}`
                }
            },
            order: idx
        });

        addPressureAxis(idx);
    });
};


const doWindSpeed = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/winddata.json',
    })
    .done((resp) => {
        setInitialRange(resp.wspeed);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{WIND_SPEED}}',
            type: 'line',
            data: resp.wspeed,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_wind',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} ${config.wind.units}`
                }
            },
            order: idx
        });

        addWindAxis(idx);
    });
};

const doWindGust = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/winddata.json',
    })
    .done((resp) => {
        setInitialRange(resp.wgust);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{WIND_GUST}}',
            type: 'line',
            data: resp.wgust,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_wind',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} ${config.wind.units}`
                }
            },
            order: idx
        });

        addWindAxis(idx);
    });
};

const doWindDir = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/wdirdata.json',
    })
    .done((resp) => {
        setInitialRange(resp.avgbearing);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'WIND_BEARING',
            type: 'scatter',
            data: resp.avgbearing,
            borderColor: settings.colours[idx] + '60',
            backgroundColor: settings.colours[idx] + '60',
            yAxisID: 'y_bearing',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y == 0 ? 'calm' : item.parsed.y +'°'}`
                }
            },
            order: idx
        });

        addBearingAxis(idx);
    });
};


const doRainfall = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/raindata.json',
    })
    .done((resp) => {
        setInitialRange(resp.rfall);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{RAINFALL}}',
            type: 'line',
            fill: true,
            data: resp.rfall,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx] + '40',
            yAxisID: 'y_rain',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} ${config.rain.units}`
                }
            },
            order: idx
        });

        addRainAxis(idx);
    });
};

const doRainRate = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/raindata.json',
    })
    .done((resp) => {
        setInitialRange(resp.rrate);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{RAINFALL_RATE}}',
            type: 'line',
            data: resp.rrate,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_rainRate',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} ${config.rain.units}/hr`
                }
            },
            order: idx
        });

        addRainRateAxis(idx);
    });
};


const doPm2p5 = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/airqualitydata.json',
    })
    .done((resp) => {
        setInitialRange(resp.pm2p5);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'PM 2.5',
            type: 'line',
            data: resp.pm2p5,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_pm',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} µg/m³`
                }
            },
            order: idx
        });

        addAQAxis(idx);
    });
};

const doPm10 = (idx) => {
    return $.getJSON({
        url: '/api/graphdata/airqualitydata.json',
    })
    .done((resp) => {
        setInitialRange(resp.pm10);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'PM 10',
            type: 'line',
            data: resp.pm10,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_pm',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} µg/m³`
                }
            },
            order: idx
        });

        addAQAxis(idx);
    });
};

const doExtraTemp = (idx, val) => {
    return $.getJSON({
        url: '/api/graphdata/extratemp.json',
    })
    .done((resp) => {
        // get the sensor name
        const name = val.split('-').slice(1).join('-');
        setInitialRange(resp[name]);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: name,
            type: 'line',
            data: resp[name],
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doUserTemp = (idx, val) => {
    return $.getJSON({
        url: '/api/graphdata/usertemp.json',
    })
    .done((resp) => {
        // get the sensor name
        const name = val.split('-').slice(1).join('-');
        setInitialRange(resp[name]);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: name,
            type: 'line',
            data: resp[name],
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doExtraHum = (idx, val) => {
    return $.getJSON({
        url: '/api/graphdata/extrahum.json',
    })
    .done((resp) => {
        // get the sensor name
        const name = val.split('-').slice(1).join('-');
        setInitialRange(resp[name]);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: name,
            type: 'line',
            data: resp[name],
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_hum',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} %`
                }
            },
            order: idx
        });

        addHumidityAxis(idx);
    });
};

const doExtraDew = (idx, val) => {
    return $.getJSON({
        url: '/api/graphdata/extradew.json',
    })
    .done((resp) => {
        // get the sensor name
        const name = val.split('-').slice(1).join('-');
        setInitialRange(resp[name]);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: name,
            type: 'line',
            data: resp[name],
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doSoilTemp = (idx, val) => {
    return $.getJSON({
        url: '/api/graphdata/soiltemp.json',
    })
    .done((resp) => {
        // get the sensor name
        const name = val.split('-').slice(1).join('-');
        setInitialRange(resp[name]);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: name,
            type: 'line',
            data: resp[name],
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doSoilMoist = (idx, val) => {
    return $.getJSON({
        url: '/api/graphdata/soilmoist.json',
    })
    .done((resp) => {
        // get the sensor name
        const name = val.split('-').slice(1).join('-');
        const unitIdx = config.series.soilmoist.name.indexOf(name);
        const suffix = unitIdx == -1 ? '' : ' ' + config.soilmoisture.units[unitIdx];
        setInitialRange(resp[name]);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: name,
            type: 'line',
            data: resp[name],
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_moist',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} ${suffix}`
                }
            },
            order: idx
        });

        addSoilMoistAxis(idx);
    });
};

const doLeafWet = (idx, val) => {
    return $.getJSON({
        url: '/api/graphdata/leafwetness.json',
    })
    .done((resp) => {
        // get the sensor name
        const name = val.split('-').slice(1).join('-');
        setInitialRange(resp[name]);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: name,
            type: 'line',
            data: resp[name],
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_leaf',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} ${config.leafwet.units}`
                }
            },
            order: idx
        });

        addLeafWetAxis(idx);
    });
};

const doLaserDepth = (idx, val) => {
    return $.getJSON({
        url: '/api/graphdata/laserdepth.json',
    })
    .done((resp) => {
        // get the sensor name
        const name = val.split('-').slice(1).join('-');
        setInitialRange(resp[name]);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: name,
            type: 'line',
            data: resp[name],
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_laser',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y} ${config.laser.units}`
                }
            },
            order: idx
        });

        addLaserAxis(idx);
    });
};


/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: chartscompare.js        Ver: aiX-1.0
    Author: M Crossley & N Thomas
    (MC) Last Edit: 2025/10/04 16:03:21
    Last Edit (NT): 2025/03/21
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Charts for chartscompare.html 
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var chart, avail, config, options;
var settings = {
    series: [],
    colours: []
}

var freezing, frostTemp;
var txtSelect = 'Select Series';
var txtClear = 'Clear Series';

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

var compassP = function (deg) {
    var a = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return a[Math.floor((deg + 22.5) / 45) % 8];
};

var myTooltipHead = '<table><tr><td colspan="2"><h5>{point.key}</h5></td></tr>';
var myTooltipPoint = '<tr><td><i class="fa-solid fa-diamond" style="color:{series.color}"></i>&nbsp;{series.name}</td>' +
					 '<td><strong>{point.y}</strong></td></tr>';
var beaufortScale, beaufortDesc, frostTemp;
beaufortDesc = ['Calm','Light Air','Light breeze','Gentle breeze','Moderate breeze','Fresh breeze','Strong breeze','Near gale','Gale','Strong gale','Storm','Violent storm','Hurricane'];

$().ready(function () {

    // get all the required config data before we start using it
    const availRes = $.ajax({ url: '/api/graphdata/availabledata.json', dataType: 'json' });
    const settingsRes = $.ajax({ url: '/api/graphdata/selectachart.json', dataType: 'json' });
    const configRes = $.ajax({ url: '/api/graphdata/graphconfig.json', dataType: 'json' });

    Promise.all([availRes, settingsRes, configRes])
    .then(function (results) {
        avail = results[0];
        settings = results[1];
        config = results[2];

        //  Configure for beaufort scale variations based on wind units
        switch(config.wind.units){
            case 'mph':   beaufortScale = [ 1, 3, 7,12,18,24,31,38,46,54, 63, 72]; break;
            case 'km/h':  beaufortScale = [ 2, 5,11,19,29,39,50,61,74,87,101,116]; break;
            case 'm/s':   beaufortScale = [ 0, 0, 1, 1, 2, 3, 4, 5, 7,10, 12, 16]; break;
            case 'knots': beaufortScale = [ 3, 6,10,16,21,27,33,40,47,55, 63, 65]; break;
            default: 	  beaufortScale = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, -1, -1];
            // NOTE: Using -1 means the line will never be seen.  No line is drawn for Hurricane.
        }

        // add the default select option
        var option = $('<option />');
        option.html(txtSelect);
        option.val(0);
        $('#data0').append(option.clone());
        $('#data1').append(option.clone());
        $('#data2').append(option.clone());
        $('#data3').append(option.clone());
        $('#data4').append(option.clone());
        $('#data5').append(option);

        // then the real series options
        for (var k in settings) {
            if (['DailyTemps', 'Sunshine', 'DegreeDays', 'TempSum', 'CO2'].indexOf(k) === -1) {
                var optgrp = $('<optgroup />');
                optgrp.attr('label', k);
                settings[k].forEach(function (val) {
                    var option = $('<option />');
                    option.html(val);
                    if (['ExtraTemp', 'ExtraHum', 'ExtraDewPoint', 'SoilMoist', 'SoilTemp', 'UserTemp', 'LeafWetness', 'LaserDepth'].indexOf(k) === -1) {
                        option.val(val);
                    } else {
                        option.val(k + '-' + val);
                    }
                    optgrp.append(option);
                });
                $('#data0').append(optgrp.clone());
                $('#data1').append(optgrp.clone());
                $('#data2').append(optgrp.clone());
                $('#data3').append(optgrp.clone());
                $('#data4').append(optgrp.clone());
                $('#data5').append(optgrp);
            }
        }

        // add the chart theme colours
        //console.log("Colours: " );
        Highcharts.theme.colors.forEach(function(col, idx) {
            var option = $('<option style="background-color:' + col + '"/>');
            option.html(idx);
            option.val(col);
            $('#colour0').append(option.clone());
            $('#colour1').append(option.clone());
            $('#colour2').append(option.clone());
            $('#colour3').append(option.clone());
            $('#colour4').append(option.clone());
            $('#colour5').append(option);
        });

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


        // Draw the basic chart
        freezing = config.temp.units === 'C' ? 0 : 32;
        frostTemp = config.temp.units === 'C' ? 4 : 39;
        var options = {
            chart: {
                renderTo: 'chartcontainer',
                type: 'spline',
                zoomType: 'x',
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
            lang: {
                noData: 'Please select some data to display'
            },
            noData: {
                style: { fontWeight: 'bold',
                    fontSize: '20px',
                    color: '#FF3030'
                }
            },
            tooltip: {
                shared: true,
                split: false,
                useHTML: true,
                className:'cmxToolTip',
                headerFormat: myTooltipHead,
                pointFormat: myTooltipPoint,
                footerFormat: '</table>',
                xDateFormat: '%A, %b %e, %H:%M'
            },
            series: [],
            rangeSelector: myRanges
        };

        // draw the basic chart framework
        chart = new Highcharts.StockChart(options);

        // Set the dropdowns to defaults or previous values
        for (var i = 0; i < 6; i++) {
            if (settings.colours[i] == '' || settings.colours[i] == null) {
                $('#colour' + i).css('background', chart.options.colors[i]);
                $('#colour' + i).val(chart.options.colors[i]);
                settings.colours[i] = chart.options.colors[i];
            } else {
                $('#colour' + i).css('background', settings.colours[i]);
                $('#colour' + i).val(settings.colours[i]);
            }
            if (settings.series[i] != '0') {
                // This series has some data associated with it
                $('#data' + i + ' option:contains(' + txtSelect +')').text(txtClear);
                $('#data' + i).val(settings.series[i]);
                // Draw it on the chart
                updateChart(settings.series[i], i, 'data' + i);
            }
        }
    });
});


var procDataSelect = function (sel) {

    // compare the select value against the other selects, and update the chart if required
    var id = sel.id;
    var num = +id.slice(-1);
    var val = sel.value;

    // Has this series already been selected? If so set the dropdown back to its previous value, then abort
    if (val != '0' &&  settings.series.indexOf(sel.value) != -1) {
        $('#' + id).val(settings.series[num]).prop('selected', true);
        return;
    }

    //
    if (val != '0') {
        $('#' + id + ' option:contains(' + txtSelect +')').text(txtClear);
    } else {
        $('#' + id + ' option:contains(' + txtClear +')').text(txtSelect);
    }


    // clear the existing series
    if (chart.series.length > 0)
        clearSeries(settings.series[num]);


    updateChart(val, num, id);

    settings.series[num] = val;

    storeSettings();
};

var updateChart = function (val, num, id) {
    // test for the extra sensor series first
    if (val.startsWith('ExtraTemp-')) {
        doExtraTemp(num, val);
        return;
    } else if (val.startsWith('ExtraHum-')) {
        doExtraHum(num, val);
        return;
    } else if (val.startsWith('ExtraDewPoint-')) {
        doExtraDew(num, val);
        return;
    } else if (val.startsWith('UserTemp-')) {
        doUserTemp(num, val);
        return;
    } else if (val.startsWith('SoilMoist-')) {
        doSoilMoist(num, val);
        return;
    } else if (val.startsWith('SoilTemp-')) {
        doSoilTemp(num, val);
        return;
    } else if (val.startsWith('LeafWetness-')) {
        doLeafWet(num, val);
        return;
    } else if (val.startsWith('LaserDepth-')) {
        doLaserDepth(num, val);
        return;
    }

    // no? then do the "standard" data
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
        case 'Humidex':
            doHumidex(num);
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
            $('#' + id).val(txtSelect);
            break;
    }
}

var updateColour = function (sel) {
    var id = sel.id;
    var num = +id.slice(-1);
    var val = sel.value;

    // set the selection colour
    $('#' + id).css('background', val);
    settings.colours[num] = val;


    // do we need to update the associated data series?
    if (settings.series[num] != '0') {
            // find the series
        var seriesIdx = -1;
        var i = 0;
        chart.series.forEach(function (ser) {
            if (ser.options.name == settings.series[num] && ser.yAxis.options.id != 'navigator-y-axis') {
                seriesIdx = i;
            }
            i++;
        });

        if (seriesIdx == -1)
            return;

        chart.series[seriesIdx].options.color = settings.colours[num];
        chart.series[seriesIdx].update(chart.series[seriesIdx].options);
    }
    storeSettings();
};

var storeSettings = function () {
    var url = '/api/graphdata/selectachart.json';
    $.ajax({
        url: url,
        type: 'POST',
        contentType: false,
        data: JSON.stringify(settings),
        dataType: 'json'
    });
};

var clearSeries = function (val) {
    // find the series
    var seriesIdx = -1;
    var i = 0;
    chart.series.forEach(function (ser) {
        if (ser.options.id == val && ser.yAxis.options.id != 'navigator-y-axis') {
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
        chart.series[0].update({showInNavigator: true}, true);
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
        opposite: idx < settings.series.length / 2 ? false : true,
        id: "Temperature",
        showEmpty: false,
        labels: {
            formatter: function () {
                return '<span style="fill: ' + (this.value <= freezing ? 'blue' : 'red') + ';">' + this.value + '</span>';
            },
            align: idx < settings.series.length / 2 ? 'right' : 'left',
            x: idx < settings.series.length / 2 ? 15 : -15,
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
			label: {text: 'Frost possible',y:12, align:'center', style: {color: 'var(--color5)'}}
		}],
        minRange: config.temp.units == 'C' ? 5 : 10,
        allowDecimals: false
    }, false, false);

};

var addPressureAxis = function (idx) {
    // first check if we already have a pressure axis
    if (checkAxisExists('Pressure'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: 'Pressure (' + config.press.units + ')'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: "Pressure",
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        minRange: config.press.units == 'in' ? 1 : 5,
        allowDecimals: config.press.units == 'in' ? true : false
    }, false, false);
};

var addHumidityAxis = function (idx) {
    // first check if we already have a humidity axis
    if (checkAxisExists('Humidity'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: 'Humidity (%)'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'Humidity',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        min: 0,
        max: 100,
        allowDecimals: false
    }, false, false);
};

var addSoilMoistAxis = function (idx) {
    // first check if we already have a soil moisture axis
    if (checkAxisExists('SoilMoist'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: 'Soil Moisture'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'SoilMoist',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        min: 0,
        allowDecimals: false
    }, false, false);
};

var addSolarAxis = function (idx) {
    // first check if we already have a solar axis
    if (checkAxisExists('Solar'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: 'Solar Radiation (W/m\u00B2)'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'Solar',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        min: 0,
        allowDecimals: false
    }, false, false);
};

var addUVAxis = function (idx) {
    // first check if we already have a UV axis
    if (checkAxisExists('UV'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title:{text: 'UV Index'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'UV',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
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
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'Wind',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        plotLines: [{
			value: beaufortScale[1],
			color: 'rgb(255,220,0)', width: 1, zIndex:1,
			label: { text: beaufortDesc[1], y:12, style: {color: 'var(--color5)'} }
		},{
			value: beaufortScale[2],
			color: 'rgb(255,200,0)', width:1, zIndex:1,
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
			label: {text: beaufortDesc[8], y:12,    style: {color: 'var(--color5)'}}
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
			value: beaufortScale[11],
			//color: 'rgb(255,0,0)', width:1, zIndex:12,
			label: {text: beaufortDesc[12], style: {color: 'var(--color5)'}}
		}],
        min: 0,
        allowDecimals: config.wind.units == 'm/s' ? true : false
    }, false, false);
};

var addBearingAxis = function (idx) {
    // first check if we already have a bearing axis
    if (checkAxisExists('Bearing'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: 'Wind Bearing'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'Bearing',
        alignTicks: false,
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left',
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
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'Rain',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        min: 0,
        minRange: config.rain.units == 'in' ? 0.25 : 4,
        allowDecimals: config.rain.units == 'in' ? true : false
    }, false, false);
};

var addRainRateAxis = function (idx) {
    // first check if we already have a rain rate axis
    if (checkAxisExists('RainRate'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: 'Rainfall Rate (' + config.rain.units + '/hr)'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'RainRate',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        min: 0,
        minRange: config.rain.units == 'in' ? 0.25 : 4,
        allowDecimals: config.rain.units == 'in' ? true : false
    }, false, false);
};

var addAQAxis = function (idx) {
    // first check if we already have a AQ axis
    if (checkAxisExists('pm'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: 'Particulates (µg/m³)'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'pm',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        min: 0,
        allowDecimals: false
    }, false, false);
};

var addLeafWetAxis = function (idx) {
    // first check if we already have a humidity axis
    if (checkAxisExists('LeafWetness'))
        return;

    // nope no existing axis, add one
    chart.addAxis({
        title: {text: 'Leaf wetness' + (config.leafwet.units == '' ? '' : '(' + config.leafwet.units + ')')},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'LeafWetness',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left'
        },
        min: 0,
        allowDecimals: false
    }, false, false);
};

var addLaserAxis = function (idx) {
    // first check if we already have a laser axis
    if (checkAxisExists('Laser'))
        return;

    // nope no existing axis, add one
   chart.addAxis({
        title: {text: 'Laser Depth (' + config.laser.units + ')'},
        opposite: idx < settings.series.length / 2 ? false : true,
        id: 'Laser',
        showEmpty: false,
        labels: {
            align: idx < settings.series.length / 2 ? 'right' : 'left',
        },
        allowDecimals: false
    }, false, false);

};

var doTemp = function (idx) {
    chart.hideNoData();
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: '/api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.temp,
                id: 'Temperature',
                name: 'Temperature',
                yAxis: 'Temperature',
                type: 'line',
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doInTemp = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: '/api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.intemp,
                id: 'Indoor Temp',
                name: 'Indoor Temp',
                yAxis: 'Temperature',
                type: 'line',
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doHeatIndex = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: '/api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.heatindex,
                id: 'Heat Index',
                name: 'Heat Index',
                yAxis: 'Temperature',
                type: 'line',
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doDewPoint = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: '/api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.dew,
                id: 'Dew Point',
                name: 'Dew Point',
                yAxis: 'Temperature',
                type: 'line',
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doWindChill = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: '/api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.wchill,
                id: 'Wind Chill',
                name: 'Wind Chill',
                yAxis: 'Temperature',
                type: 'line',
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doAppTemp = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: '/api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.apptemp,
                id: 'Apparent Temp',
                name: 'Apparent Temp',
                yAxis: 'Temperature',
                type: 'line',
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doFeelsLike = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: '/api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.feelslike,
                id: 'Feels Like',
                name: 'Feels Like',
                yAxis: 'Temperature',
                type: 'line',
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doHumidex = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    $.ajax({
        url: '/api/graphdata/tempdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.humidex,
                id: 'Humidex',
                name: 'Humidex',
                yAxis: 'Temperature',
                type: 'line',
                tooltip: {
                    //valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doHumidity = function (idx) {
    chart.showLoading();

    addHumidityAxis(idx);

    $.ajax({
        url: '/api/graphdata/humdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.hum,
                id: 'Humidity',
                name: 'Humidity',
                yAxis: 'Humidity',
                type: 'line',
                tooltip: {
                    valueSuffix: ' %',
                    valueDecimals: config.hum.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doInHumidity = function (idx) {
    chart.showLoading();

    addHumidityAxis(idx);

    $.ajax({
        url: '/api/graphdata/humdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.inhum,
                id: 'Indoor Hum',
                name: 'Indoor Hum',
                yAxis: 'Humidity',
                type: 'line',
                tooltip: {
                    valueSuffix: ' %',
                    valueDecimals: config.hum.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};


var doSolarRad = function (idx) {
    chart.showLoading();

    addSolarAxis(idx);

    $.ajax({
        url: '/api/graphdata/solardata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.SolarRad,
                id: 'Solar Rad',
                name: 'Solar Rad',
                yAxis: 'Solar',
                type: 'area',
                tooltip: {
                    valueSuffix: ' W/m\u00B2',
                    valueDecimals: 0
                },
                visible: true,
                color: settings.colours[idx],
                fillOpacity: 0.5,
                boostThreshold: 0,
                zIndex: 100 - idx
            });
        }
    });
};

var doUV = function (idx) {
    chart.showLoading();

    addUVAxis(idx);

    $.ajax({
        url: '/api/graphdata/solardata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.UV,
                id: 'UV Index',
                name: 'UV Index',
                yAxis: 'UV',
                type: 'line',
                tooltip: {
                    valueSuffix: null,
                    valueDecimals: config.uv.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};


var doPress = function (idx) {
    chart.showLoading();

    addPressureAxis(idx);

    $.ajax({
        url: '/api/graphdata/pressdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.press,
                id: 'Pressure',
                name: 'Pressure',
                yAxis: 'Pressure',
                type: 'line',
                tooltip: {
                    valueSuffix: ' ' + config.press.units,
                    valueDecimals: config.press.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};


var doWindSpeed = function (idx) {
    chart.showLoading();

    addWindAxis(idx);

    $.ajax({
        url: '/api/graphdata/winddata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.wspeed,
                id: 'Wind Speed',
                name: 'Wind Speed',
                yAxis: 'Wind',
                type: 'line',
                tooltip: {
                    valueSuffix: ' ' + config.wind.units,
                    valueDecimals: config.wind.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doWindGust = function (idx) {
    chart.showLoading();

    addWindAxis(idx);

    $.ajax({
        url: '/api/graphdata/winddata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.wgust,
                id: 'Wind Gust',
                name: 'Wind Gust',
                yAxis: 'Wind',
                type: 'line',
                tooltip: {
                    valueSuffix: ' ' + config.wind.units,
                    valueDecimals: config.wind.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doWindDir = function (idx) {
    chart.showLoading();

    addBearingAxis(idx);

    $.ajax({
        url: '/api/graphdata/wdirdata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.avgbearing,
                id: 'Wind Bearing',
                name: 'Wind Bearing',
                yAxis: 'Bearing',
                type: 'scatter',
                color: settings.colours[idx],
                zIndex: 100 - idx,
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
    chart.showLoading();

    addRainAxis(idx);

    $.ajax({
        url: '/api/graphdata/raindata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.rfall,
                id: 'Rainfall',
                name: 'Rainfall',
                yAxis: 'Rain',
                type: 'area',
                tooltip: {
                    valueSuffix: config.rain.units,
                    valueDecimals: config.rain.decimals,
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx,
                fillOpacity: 0.3,
                boostThreshold: 0
            });
        }
    });
};

var doRainRate = function (idx) {
    chart.showLoading();

    addRainRateAxis(idx);

    $.ajax({
        url: '/api/graphdata/raindata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.rrate,
                id: 'Rainfall Rate',
                name: 'Rainfall Rate',
                yAxis: 'RainRate',
                type: 'line',
                tooltip: {
                    valueSuffix: ' ' + config.rain.units + '/hr',
                    valueDecimals: config.rain.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};


var doPm2p5 = function (idx) {
    chart.showLoading();

    addAQAxis(idx);

    $.ajax({
        url: '/api/graphdata/airqualitydata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.pm2p5,
                id: 'PM 2.5',
                name: 'PM 2.5',
                yAxis: 'pm',
                type: 'line',
                tooltip: {
                    valueSuffix: ' µg/m³',
                    valueDecimals: 1,
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doPm10 = function (idx) {
    chart.showLoading();

    addAQAxis(idx);

    $.ajax({
        url: '/api/graphdata/airqualitydata.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp.pm10,
                id: 'PM 10',
                name: 'PM 10',
                yAxis: 'pm',
                type: 'line',
                tooltip: {
                    valueSuffix: ' µg/m³',
                    valueDecimals: 1,
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doExtraTemp = function (idx, val) {
    chart.showLoading();

    addTemperatureAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    $.ajax({
        url: '/api/graphdata/extratemp.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp[name],
                id: val,
                name: name,
                yAxis: "Temperature",
                type: "line",
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doUserTemp = function (idx, val) {
    chart.showLoading();

    addTemperatureAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    $.ajax({
        url: '/api/graphdata/usertemp.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp[name],
                id: val,
                name: name,
                yAxis: "Temperature",
                type: "line",
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doExtraHum = function (idx, val) {
    chart.showLoading();

    addHumidityAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    $.ajax({
        url: '/api/graphdata/extrahum.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp[name],
                id: val,
                name: name,
                yAxis: 'Humidity',
                type: 'line',
                tooltip: {
                    valueSuffix: ' %',
                    valueDecimals: config.hum.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doExtraDew = function (idx, val) {
    chart.showLoading();

    addTemperatureAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    $.ajax({
        url: '/api/graphdata/extradew.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp[name],
                id: val,
                name: name,
                yAxis: "Temperature",
                type: "line",
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doSoilTemp = function (idx, val) {
    chart.showLoading();

    addTemperatureAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    $.ajax({
        url: '/api/graphdata/soiltemp.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp[name],
                id: val,
                name: name,
                yAxis: "Temperature",
                type: "line",
                tooltip: {
                    valueSuffix: ' °' + config.temp.units,
                    valueDecimals: config.temp.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doSoilMoist = function (idx, val) {
    chart.showLoading();

    addSoilMoistAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');
    var unitIdx = config.series.soilmoist.name.indexOf(name);
    var suffix = unitIdx == -1 ? '' : ' ' + config.soilmoisture.units[unitIdx];

    $.ajax({
        url: '/api/graphdata/soilmoist.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp[name],
                id: val,
                name: name,
                yAxis: "SoilMoist",
                type: "line",
                tooltip: {
                    valueSuffix: suffix
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doLeafWet = function (idx, val) {
    chart.showLoading();

    addLeafWetAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    $.ajax({
        url: '/api/graphdata/leafwetness.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp[name],
                id: val,
                name: name,
                yAxis: "LeafWetness",
                type: "line",
                tooltip: {
                    valueSuffix: ' ' + config.leafwet.units
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        }
    });
};

var doLaserDepth = function (idx, val) {
    chart.showLoading();

    addLaserAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    $.ajax({
        url: '/api/graphdata/laserdepth.json',
        dataType: 'json',
        success: function (resp) {
            chart.hideLoading();
            chart.addSeries({
                index: idx,
                data: resp[name],
                id: val,
                name: name,
                yAxis: 'Laser',
                type: 'line',
                tooltip: {
                    valueSuffix: ' ' + config.laser.units,
                    valueDecimals: config.laser.decimals
                },
                visible: true,
                color: settings.colours[idx],
                zIndex: 100 - idx
            });
        },
        async: false
    });
};
*/