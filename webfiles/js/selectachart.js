// Created: 2021/01/26 13:54:44
// Last modified: 2025/11/20 13:57:08

let settings;

let mainChart, navChart, config, avail, options;
let datasetsReady = false;
let lookups;

const txtSelect = 'Select Series';
const txtClear = 'Clear Series';

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
        count: 2,
        type: 'day',
        text: '2d'
    }, {
        type: 'all',
        text: 'All'
    }],
    selected: 1
};

const plotColours = ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'];

let defaultEnd, defaultStart;
let selection = { start: 0, end: 0 };
let dragging = null;
let dragStartX = 0;
let currentCursor = 'default';

const compassP = (deg) => {
    if (deg === 0) {
        return 'calm';
    }
    const a = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return a[Math.floor((deg + 22.5) / 45) % 8];
};

$(document).ready(() => {
    settings = prefs.load();

    const availRes = $.ajax({ url: 'availabledata.json', dataType: 'json' });
    const configRes = $.ajax({ url: 'graphconfig.json', dataType: 'json' });

    Promise.all([availRes, configRes])
    .then((results) => {
        avail = results[0];
        config = results[1];

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
        for (let k in avail) {
            if (['DailyTemps', 'Sunshine', 'DegreeDays', 'TempSum', 'CO2', 'Snow', 'ChillHours'].indexOf(k) === -1) {
                let optgrp = $('<optgroup />');
                optgrp.attr('label', k);
                avail[k].forEach((val) => {
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

        // TODO? add the chart theme colours

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

        CmxChartJsHelpers.AddPrintButtonHandler();

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
                },
                interaction: {
                    mode: 'DifferentTimeScalesMode',
                    //mode: 'nearest',
                    //intersect: false
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

        const pendingCalls = [];

        // Set the dropdowns to defaults or previous values
        for (let i = 0; i < 6; i++) {
            $('#colour' + i).css('text-indent', '-99px');
            if (settings.colours[i] == '' || settings.colours[i] == null) {
                $('#colour' + i).css('background', plotColours[i]);
                $('#colour' + i).val(plotColours[i]);
                settings.colours[i] = plotColours[i];
            } else {
                $('#colour' + i).css('background', settings.colours[i]);
                $('#colour' + i).val(settings.colours[i]);
            }
            if (settings.series[i] != '0') {
                // This series has some data associated with it
                $('#data' + i + ' option:contains(' + txtSelect +')').text(txtClear);
                $('#data' + i).val(settings.series[i]);
                // Draw it on the chart
                CmxChartJsHelpers.ShowLoading();
                promise = updateChart(settings.series[i], i, 'data' + i);
                pendingCalls.push(promise);
            }
        }

        Promise.all(pendingCalls).then(() => {
            CmxChartJsHelpers.HideLoading();
            mainChart.config.update();
            mainChart.update();
            checkNavChartDataSet();
        });

    });
});

let prefs = {
    data: {
        series: ['0','0','0','0','0','0'],
        colours: ['','','','','','']
    },
    load: () => {
        const cookie = document.cookie.split(';');
        cookie.forEach((val) => {
            if (val.trim().startsWith('selecta=')) {
                const dat = decodeURIComponent(val).split('=');
                prefs.data = JSON.parse(dat[1]);
            }
        });
        return prefs.data;
    },
    save: (settings) => {
        this.data = settings;
        let d = new Date();
        d.setTime(d.getTime() + (365*24*60*60*1000));
        document.cookie = 'selecta=' + encodeURIComponent(JSON.stringify(this.data)) + ';expires=' + d.toUTCString();
    }
};

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

    CmxChartJsHelpers.ShowLoading();
    const x = updateChart(val, num, id);

    Promise.all([x]).then(() => {
        CmxChartJsHelpers.HideLoading();
        mainChart.config.update();
        mainChart.update();
        checkNavChartDataSet();
    });

    settings.series[num] = val;

    prefs.save(settings);
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
        mainChart.config.data.datasets.forEach((dataSet) => {
            if (dataSet.id == settings.series[num]) {
                seriesIdx = i;
            }
            i++;
        });

        if (seriesIdx === -1)
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
    prefs.save(settings);
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
};

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
            text: `Temperature (°${config.temp.units})`
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
            text: `Pressure (${config.press.units})`
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
            text: 'Humidity (%)'
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
            text: 'Soil Moisture'
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
            text: 'Solar Radiation (W/m²)'
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
            text: 'UV Index'
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
            text: `Wind Speed (${config.wind.units})`
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
            text: 'Bearing'
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
            text: `Rainfall (${config.rain.units})`
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
            text: `Rainfall Rate (${config.rain.units}/hr)`
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
            text: 'Particulates (µg/m³)'
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
            text: `Leaf Wetness (${config.leafwet.units == '' ? '' : config.leafwet.units})`
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
            text: `Laser Depth (${config.laser.units})`
        },
        position: idx < settings.series.length / 2 ? 'left' : 'right'
    }
};

const doTemp = (idx) => {
    return $.getJSON({
        url: 'tempdata.json'
    })
    .done((resp) => {
        setInitialRange(resp.temp);

        const data = resp.temp.map(p => {
            return { x: p[0], y: p[1] };
        });

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'Temperature',
            type: 'line',
            data: resp.temp,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doInTemp = (idx) => {
    return $.getJSON({
        url: 'tempdata.json'
    })
    .done((resp) => {
        setInitialRange(resp.intemp);

        const data = resp.intemp.map(p => {
            return { x: p[0], y: p[1] };
        });

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'Indoor Temp',
            type: 'line',
            data: resp.intemp,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doHeatIndex = (idx) => {
    return $.getJSON({
        url: 'tempdata.json'
    })
    .done((resp) => {
        setInitialRange(resp.heatindex);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'Heat Index',
            type: 'line',
            data: resp.heatindex,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doDewPoint = (idx) => {
    return $.getJSON({
        url: 'tempdata.json'
    })
    .done((resp) => {
        setInitialRange(resp.dew);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'Dew Point',
            type: 'line',
            data: resp.dew,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doWindChill = (idx) => {
    return $.getJSON({
        url: 'tempdata.json'
    })
    .done((resp) => {
        setInitialRange(resp.wchill);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'Wind Chill',
            type: 'line',
            data: resp.wchill,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doAppTemp = (idx) => {
    return $.getJSON({
        url: 'tempdata.json'
    })
    .done((resp) => {
        setInitialRange(resp.apptemp);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'Apparent Temp',
            type: 'line',
            data: resp.apptemp,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doFeelsLike = (idx) => {
    return $.getJSON({
        url: 'tempdata.json'
    })
    .done((resp) => {
        setInitialRange(resp.feelslike);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'Feels Like',
            type: 'line',
            data: resp.feelslike,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_temp',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doHumidity = (idx) => {
    return $.getJSON({
        url: 'humdata.json'
    })
    .done((resp) => {
        setInitialRange(resp.hum);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'Humidity',
            type: 'line',
            data: resp.hum,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_hum',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} %`
                }
            },
            order: idx
        });

        addHumidityAxis(idx);
    });
};

const doInHumidity = (idx) => {
    return $.getJSON({
        url: 'humdata.json'
    })
    .done((resp) => {
        setInitialRange(resp.inhum);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'Indoor Hum',
            type: 'line',
            data: resp.inhum,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_hum',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} %`
                }
            },
            order: idx
        });

        addHumidityAxis(idx);
    });
};

const doSolarRad = (idx) => {
    return $.getJSON({
        url: 'solardata.json'
    })
    .done((resp) => {
        setInitialRange(resp.SolarRad);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'Solar Rad',
            type: 'line',
            fill: true,
            data: resp.SolarRad,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx] + '40',
            yAxisID: 'y_solar',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} W/m²`
                }
            },
            order: idx
        });

        addSolarAxis(idx);
    });
};

const doUV = (idx) => {
    return $.getJSON({
        url: 'solardata.json'
    })
    .done((resp) => {
        setInitialRange(resp.UV);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'UV Index',
            type: 'line',
            data: resp.UV,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_uv',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'}`
                }
            },
            order: idx
        });

        addUVAxis(idx);
    });
};

const doPress = (idx) => {
    return $.getJSON({
        url: 'pressdata.json'
    })
    .done((resp) => {
        setInitialRange(resp.press);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'Pressure',
            type: 'line',
            data: resp.press,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_press',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${config.press.units}`
                }
            },
            order: idx
        });

        addPressureAxis(idx);
    });
};

const doWindSpeed = (idx) => {
    return $.getJSON({
        url: 'winddata.json'
    })
    .done((resp) => {
        setInitialRange(resp.wspeed);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'Wind Speed',
            type: 'line',
            data: resp.wspeed,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_wind',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${config.wind.units}`
                }
            },
            order: idx
        });

        addWindAxis(idx);
    });
};

const doWindGust = (idx) => {
    return $.getJSON({
        url: 'winddata.json'
    })
    .done((resp) => {
        setInitialRange(resp.wgust);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'Wind Gust',
            type: 'line',
            data: resp.wgust,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_wind',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${config.wind.units}`
                }
            },
            order: idx
        });

        addWindAxis(idx);
    });
};

const doWindDir = (idx) => {
    return $.getJSON({
        url: 'wdirdata.json'
    })
    .done((resp) => {
        setInitialRange(resp.avgbearing);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'Wind Bearing',
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
        url: 'raindata.json'
    })
    .done((resp) => {
        setInitialRange(resp.rfall);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'Rainfall',
            type: 'line',
            fill: true,
            data: resp.rfall,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx] + '40',
            yAxisID: 'y_rain',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${config.rain.units}`
                }
            },
            order: idx
        });

        addRainAxis(idx);
    });
};

const doRainRate = (idx) => {
    return $.getJSON({
        url: 'raindata.json'
    })
    .done((resp) => {
        setInitialRange(resp.rrate);

        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'Rainfall Rate',
            type: 'line',
            data: resp.rrate,
            borderColor: settings.colours[idx],
            backgroundColor: settings.colours[idx],
            yAxisID: 'y_rainRate',
            tooltip: {
                callbacks: {
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${config.rain.units}/hr`
                }
            },
            order: idx
        });

        addRainRateAxis(idx);
    });
};

const doPm2p5 = (idx) => {
    return $.getJSON({
        url: 'airquality.json'
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
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} µg/m³`
                }
            },
            order: idx
        });

        addAQAxis(idx);
    });
};

const doPm10 = (idx) => {
    return $.getJSON({
        url: 'airquality.json'
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
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} µg/m³`
                }
            },
            order: idx
        });

        addAQAxis(idx);
    });
};

const doExtraTemp = (idx, val) => {
    return $.getJSON({
        url: 'extratempdata.json'
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
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doUserTemp = (idx, val) => {
    return $.getJSON({
        url: 'usertempdata.json'
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
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doExtraHum = (idx, val) => {
    return $.getJSON({
        url: 'extrahumdata.json'
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
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} %`
                }
            },
            order: idx
        });

        addHumidityAxis(idx);
    });
};

const doExtraDew = (idx, val) => {
    return $.getJSON({
        url: 'extradewdata.json'
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
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doSoilTemp = (idx, val) => {
    return $.getJSON({
        url: 'soiltempdata.json'
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
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} °${config.temp.units}`
                }
            },
            order: idx
        });

        addTemperatureAxis(idx);
    });
};

const doSoilMoist = (idx, val) => {
    return $.getJSON({
        url: 'soilmoistdata.json'
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
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${suffix}`
                }
            },
            order: idx
        });

        addSoilMoistAxis(idx);
    });
};

const doLeafWet = (idx, val) => {
    return $.getJSON({
        url: 'leafwetdata.json'
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
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${config.leafwet.units}`
                }
            },
            order: idx
        });

        addLeafWetAxis(idx);
    });
};

const doLaserDepth = (idx, val) => {
    return $.getJSON({
        url: 'laserdepthdata.json'
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
                    label: item => ` ${item.dataset.label} ${item.parsed.y ?? '—'} ${config.laser.units}`
                }
            },
            order: idx
        });

        addLaserAxis(idx);
    });
};

Chart.Interaction.modes.DifferentTimeScalesMode = function(chart, e, options, useFinalPosition) {
    const toleranceMs = 300000; // default ±5 minute
    const position = Chart.helpers.getRelativePosition(e, chart);
    const dataX = chart.scales.x.getValueForPixel(position.x);
    const dataSets = chart.getSortedVisibleDatasetMetas();
    const items = [];

    dataSets.forEach((dataset) => {
        if (dataset.hidden != true) {
            let nearest = null;
            let minDiff = Infinity;

            for (let i = dataset.controller._drawStart; i < dataset._dataset.data.length; i++) {
                const diff = Math.abs(dataset._dataset.data[i][0] - dataX);
                if (diff < minDiff) {
                    minDiff = diff;
                    if (diff <= toleranceMs)
                        nearest = i;
                } else {
                    // Since the array is sorted, we can break early
                    break;
                }
            }

            if (nearest !== null) {
                items.push({
                    element: dataset.data[nearest],
                    datasetIndex: dataset.index,
                    index: nearest
                });
            }
        }
    });

    return items;
}

