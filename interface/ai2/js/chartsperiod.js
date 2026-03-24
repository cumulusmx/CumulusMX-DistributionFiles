// Created: 2023/09/22 19:07:25
// Last modified: 2025/11/21 15:56:45

let cache = {};
let mainChart, navChart, config, avail, options;
let settings;

var txtSelect = '{{SELECT_SERIES}}';
var txtClear = '{{CLEAR_SERIES}}';

var myRangeBtns = {
    buttons: [{
        count: 1,
        type: 'day',
        text: '{{TIME_1D}}'
    }, {
        count: 7,
        type: 'day',
        text: '{{TIME_7D}}'
    }, {
        count: 28,
        type: 'day',
        text: '{{TIME_28D}}'
    }, {
        type: 'all',
        text: 'All',
        title: '{{ALL}}'
    }],
    selected: 3
};

const plotColours = ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'];

const compassP = (deg) => {
    const compassPoints = ['{{COMPASS_N}}', '{{COMPASS_NE}}', '{{COMPASS_E}}', '{{COMPASS_SE}}', '{{COMPASS_S}}', '{{COMPASS_SW}}', '{{COMPASS_W}}', '{{COMPASS_NW}}'];
    if (deg === 0) {
        return '{{CALM}}';
    }
    return compassPoints[Math.floor((deg + 22.5) / 45) % 8];
};

let fromDate, toDate;
let now = new Date();
now.setHours(0,0,0,0);
let then = new Date(now.setMonth(now.getMonth() - 1));

let defaultEnd, defaultStart;
let selection = { start: 0, end: 0 };
let dragging = null;
let dragStartX = 0;
let currentCursor = 'default';

$(document).ready(() => {
    $.getJSON({url: '/api/info/version.json'})
    .done((result) => {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    });

    fromDate = $('#dateFrom').datepicker({
        dateFormat: 'dd-mm-yy',
        maxDate: '0d',
        firstDay: 1,
        changeMonth: true,
        changeYear: true,
    }).val(formatUserDateStr(now))
    .on('change', function() {
        const date = fromDate.datepicker('getDate');
        settings.fromDate = formatDateStr(date);

        if (toDate.datepicker('getDate') < date) {
            toDate.datepicker('setDate', date);
            settings.toDate = formatDateStr(date);
        }

        toDate.datepicker('option', { minDate: date });
        storeSettings();
    });

    toDate = $('#dateTo').datepicker({
        dateFormat: 'dd-mm-yy',
        maxDate: '0d',
        firstDay: 1,
        changeMonth: true,
        changeYear: true,
    }).val(formatUserDateStr(now))
    .on('change', function() {
        const date = toDate.datepicker('getDate');
        settings.toDate = formatDateStr(date);

        if (fromDate.datepicker('getDate') < date) {
            fromDate.datepicker('setDate', date);
            settings.fromDate = formatDateStr(date);
        }

        storeSettings();
    });

    $.ajax({
        url: '/api/info/dateformat.txt',
        dataType: 'text'
    })
    .done((result) => {
        // we want all lower case and yy for the year not yyyy
        const format = result.toLowerCase().replace('yyyy','yy');
        fromDate.datepicker('option', 'dateFormat', format);
        toDate.datepicker('option', 'dateFormat', format);
    });

    // get all the required config data before we start using it
    const availRes = $.getJSON({ url: '/api/graphdata/availabledata.json' });
    const settingsRes = $.getJSON({ url: '/api/graphdata/selectaperiod.json' });
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

        toDate.datepicker('setDate', settings.toDate ? new Date(settings.toDate) : now);
        fromDate.datepicker('setDate', settings.fromDate ? new Date(settings.fromDate) : then);
        toDate.datepicker('option', { minDate: fromDate.datepicker('getDate') });

        // then the real series options
        for (var k in avail) {
            if (['DailyTemps', 'Sunshine', 'DegreeDays', 'TempSum', 'CO2', 'Snow', 'ChillHours'].indexOf(k) === -1) {
                var optgrp = $('<optgroup />');
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

        CmxChartJsHelpers.AddPrintButtonHandler();

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
        url: '/api/graphdata/selectaperiod.json',
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

const updateSeries = () => {
    cache = {};
    const pendingCalls = [];

    // update all the series
    for (var i = 0; i < 6; i++) {
        if (settings.series[i] != '0') {
            // This series has some data associated with it
            clearSeries(settings.series[i]);
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
}

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
    const addSeries = () => {
        setInitialRange(cache.temp.temp);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{TEMPERATURE}}',
            type: 'line',
            data: cache.temp.temp,
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
    };

    if (cache === null || cache.temp === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.temp = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

var doInTemp = function (idx) {
    const addSeries = () => {
        setInitialRange(cache.temp.intemp);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{INDOOR_TEMP}}',
            type: 'line',
            data: cache.temp.intemp,
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
    };

    if (cache === null || cache.temp === undefined) {
        return $.getJSON({
                url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.temp = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const doHeatIndex = (idx) => {
    const addSeries = () => {
        setInitialRange(cache.temp.heatindex);
        chart.addSeries({
            index: idx,
            data: cache.temp.heatindex,
            id: 'Heat Index',
            name: '{{HEAT_INDEX}}',
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

        addTemperatureAxis(idx);
    }

    if (cache === null || cache.temp === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.temp = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const doDewPoint = (idx) => {
    const addSeries = () => {
        setInitialRange(cache.temp.dew);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{DEW_POINT}}',
            type: 'line',
            data: cache.temp.dew,
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
    };

    if (cache === null || cache.temp === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.temp = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const doWindChill = (idx) => {
    const addSeries = () => {
        setInitialRange(cache.temp.wchill);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{WIND_CHILL}}',
            type: 'line',
            data: cache.temp.wchill,
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
    };

    if (cache === null || cache.temp === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.temp = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const doAppTemp = (idx) => {
    const addSeries = () => {
        setInitialRange(cache.temp.apptemp);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{APPARENT_TEMP}}',
            type: 'line',
            data: cache.temp.apptemp,
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
    };

    if (cache === null || cache.temp === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.temp = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const doFeelsLike = (idx) => {
    const addSeries = () => {
        setInitialRange(cache.temp.feelslike);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{FEELS_LIKE}}',
            type: 'line',
            data: cache.temp.feelslike,
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
    };

    if (cache === null || cache.temp === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.temp = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

/*
var doHumidex = function (idx) {
    chart.showLoading();

    addTemperatureAxis(idx);

    if (cache === null || cache.temp === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.temp = resp;
                addSeries();
            },
            async: false
        });
    }
    else
    {
        addSeries();
    }

    function addSeries() {
        chart.addSeries({
            index: idx,
            data: cache.temp.humidex,
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
        chart.hideLoading();
    }
};
*/

const doHumidity = (idx) => {
    const addSeries = () => {
        setInitialRange(cache.hum.hum);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{HUMIDITY}}',
            type: 'line',
            data: cache.hum.hum,
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
    };

    if (cache === null || cache.hum === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvhum.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.hum = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const doInHumidity = (idx) => {
    const addSeries = () => {
        setInitialRange(cache.hum.inhum);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{INDOOR_HUM}}',
            type: 'line',
            data: cache.hum.inhum,
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
    };

    if (cache === null || cache.hum === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvhum.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.hum = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};


const doSolarRad = (idx) => {
    const addSeries = () => {
        setInitialRange(cache.solar.SolarRad);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{SOLAR_RAD}}',
            type: 'line',
            fill: true,
            data: cache.solar.SolarRad,
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
    };

    if (cache === null || cache.solar === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvsolar.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.solar = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const doUV = (idx) => {
    const addSeries = () => {
        setInitialRange(cache.solar.UV);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{UV_INDEX}}',
            type: 'line',
            data: cache.solar.UV,
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
    };

    if (cache === null || cache.solar === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvsolar.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.solar = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};


const doPress = (idx) => {
    const addSeries = () => {
        setInitialRange(cache.press);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{PRESSURE}}',
            type: 'line',
            data: cache.press,
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
    };

    if (cache === null || cache.press === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvpress.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.press = resp.press;
            addSeries();
        });
    } else {
        addSeries();
    }
};


const doWindSpeed = (idx) => {
    const addSeries = () => {
        setInitialRange(cache.wind.wspeed);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{WIND_SPEED}}',
            type: 'line',
            data: cache.wind.wspeed,
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
    };

    if (cache === null || cache.wind === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvwind.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.wind = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const doWindGust = (idx) => {
    const addSeries = () => {
        setInitialRange(cache.wind.wgust);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{WIND_GUST}}',
            type: 'line',
            data: cache.wind.wgust,
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
    };

    if (cache === null || cache.wind === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvwind.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.wind = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const doWindDir = (idx) => {
    const addSeries = () => {
        setInitialRange(cache.wind.avgbearing);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'WIND_BEARING',
            type: 'scatter',
            data: cache.wind.avgbearing,
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
    };

    if (cache === null || cache.wind === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvwind.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.wind = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};


const doRainfall = (idx) => {
    const addSeries = () => {
        setInitialRange(cache.rain.rfall);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{RAINFALL}}',
            type: 'line',
            fill: true,
            data: cache.rain.rfall,
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
    };

    if (cache === null || cache.rain === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvrain.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.rain = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const doRainRate = (idx) => {
    const addSeries = () => {
        setInitialRange(cache.rain.rrate);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: '{{RAINFALL_RATE}}',
            type: 'line',
            data: cache.rain.rrate,
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
    };

    if (cache === null || cache.rain === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvrain.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.rain = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};


const doPm2p5 = (idx) => {
    const addSeries = () => {
        setInitialRange(cache.pm.pm2p5);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'PM 2.5',
            type: 'line',
            data: cache.pm.pm2p5,
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
    };

    if (cache === null || cache.hum === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvairquality.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.pm = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const doPm10 = (idx) => {
    const addSeries = () => {
        setInitialRange(cache.pm.pm10);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: 'PM 10',
            type: 'line',
            data: cache.pm.pm10,
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
    };

    if (cache === null || cache.hum === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvairquality.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.pm = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

var doExtraTemp = function (idx, val) {
    const addSeries = () => {
        // get the sensor name
        const name = val.split('-').slice(1).join('-');
        setInitialRange(cache.extratemp[name]);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: name,
            type: 'line',
            data: cache.extratemp[name],
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
    };

    if (cache === null || cache.extratemp === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvextratemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.extratemp = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

var doUserTemp = function (idx, val) {
    const addSeries = () => {
        // get the sensor name
        const name = val.split('-').slice(1).join('-');
        setInitialRange(cache.usertemp[name]);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: name,
            type: 'line',
            data: cache.usertemp[name],
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
    };

    if (cache === null || cache.usertemp === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvusertemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.usertemp = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const doExtraHum = (idx, val) => {
    const addSeries = () => {
        // get the sensor name
        const name = val.split('-').slice(1).join('-');
        setInitialRange(cache.extrahum[name]);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: name,
            type: 'line',
            data: cache.extrahum[name],
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
    };

    if (cache === null || cache.extrahum === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvextrahum.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.extrahum = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const doExtraDew = (idx, val) => {
    const addSeries = () => {
        // get the sensor name
        const name = val.split('-').slice(1).join('-');
        setInitialRange(cache.extradew[name]);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: name,
            type: 'line',
            data: cache.extradew[name],
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
    };

    if (cache === null || cache.extradew === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvextradew.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.extradew = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const doSoilTemp = (idx, val) => {
    const addSeries = () => {
        // get the sensor name
        const name = val.split('-').slice(1).join('-');
        setInitialRange(cache.soiltemp[name]);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: name,
            type: 'line',
            data: cache.soiltemp[name],
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
    };

    if (cache === null || cache.soiltemp === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvsoiltemp.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.soiltemp = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const doSoilMoist = (idx, val) => {
    const addSeries = () => {
        // get the sensor name
        const name = val.split('-').slice(1).join('-');
        const unitIdx = config.series.soilmoist.name.indexOf(name);
        const suffix = unitIdx == -1 ? '' : ' ' + config.soilmoisture.units[unitIdx];
        setInitialRange(cache.soilmoist[name]);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: name,
            type: 'line',
            data: cache.soilmoist[name],
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
    };

    if (cache === null || cache.soilmoist === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvsoilmoist.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.soilmoist = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const doLeafWet = (idx, val) => {
    const addSeries = () => {
        // get the sensor name
        const name = val.split('-').slice(1).join('-');
        setInitialRange(cache.leafwet[name]);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: name,
            type: 'line',
            data: cache.leafwet[name],
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
    };

    if (cache === null || cache.leafwet === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvleafwetness.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.leafwet = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const doLaserDepth = (idx, val) => {
    const addSeries = () => {
        // get the sensor name
        const name = val.split('-').slice(1).join('-');
        setInitialRange(cache.laserdepth[name]);
        mainChart.data.datasets.push({
            id: settings.series[idx],
            label: name,
            type: 'line',
            data: cache.laserdepth[name],
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
    };

    if (cache === null || cache.laserdepth === undefined) {
        return $.getJSON({
            url: '/api/graphdata/intvlaserdepth.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
        })
        .done((resp) => {
            cache.laserdepth = resp;
            addSeries();
        });
    } else {
        addSeries();
    }
};

const formatDateStr = (inDate) => {
    return '' + inDate.getFullYear() + '-' + addLeadingZeros(inDate.getMonth() + 1) + '-' + addLeadingZeros(inDate.getDate());
};

const formatUserDateStr = (inDate) => {
    return  addLeadingZeros(inDate.getDate()) + '-' + addLeadingZeros(inDate.getMonth() + 1) + '-' + inDate.getFullYear();
};

const addLeadingZeros = (n) => {
    return n <= 9 ? '0' + n : n;
};

const getUnixTimeStamp = (inDate) => {
    return inDate.getTime() / 1000;
};
