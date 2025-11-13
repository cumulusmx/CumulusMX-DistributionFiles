/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: chartsperiod.js        	Ver: aiX-1.0
    Author: M Crossley & N Thomas
    Last Edit: 2025/10/04 16:06:27
    Last Edit (NT): 2025/03/21
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Charts for chartsperiod.html
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var chart, avail, config, options;
var cache = {};
var settings = {
	series: [],
	colours: []
}

var freezing;
var txtSelect = 'Select Series';
var txtClear = 'Clear Series';

var myRanges = {
	buttons: [{
		count: 1,
		type: 'day',
		text: '1d'
	}, {
		count: 7,
		type: 'day',
		text: '7d'
	}, {
		count: 28,
		type: 'day',
		text: '28d'
	}, {
		type: 'all',
		text: 'All',
		title: 'View all'
	}],
	inputEnabled: false,
	selected: 4,
	allButtonsEnabled: true
};

var myTooltipHead = '<table><tr><td colspan="2"><h5>{point.key}</h5></td></tr>';
var myTooltipPoint = '<tr><td><i class="fa-solid fa-diamond" style="color:{series.color}"></i>&nbsp;{series.name}</td>' +
					 '<td><strong>{point.y}</strong></td></tr>';
var beaufortScale, beaufortDesc, frostTemp;
beaufortDesc = ['Calm','Light Air','Light breeze','Gentle breeze','Moderate breeze','Fresh breeze','Strong breeze','Near gale','Gale','Strong gale','Storm','Violent storm','Hurricane'];

var compassP = function (deg) {
	var a = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
	return a[Math.floor((deg + 22.5) / 45) % 8];
};

var fromDate, toDate;
var now = new Date();
now.setHours(0,0,0,0);

$(document).ready(function () {

	fromDate = $('#dateFrom').datepicker({
		dateFormat: 'dd-mm-yy',
		maxDate: '0d',
		firstDay: 1,
		changeMonth: true,
		changeYear: true,
	}).val(formatUserDateStr(now))
	.on('change', function() {
		var date = fromDate.datepicker('getDate');
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
            var date = toDate.datepicker('getDate');
            settings.toDate = formatDateStr(date);

            if (fromDate.datepicker('getDate') < date) {
                fromDate.datepicker('setDate', date);
                settings.fromDate = formatDateStr(date);
            }

            storeSettings();
		});

	$.ajax({
		url: '/api/info/dateformat.txt',
		dataType: 'text',
		success: function (result) {
			// we want all lower case and yy for the year not yyyy
			var format = result.toLowerCase().replace('yyyy','yy');
			fromDate.datepicker('option', 'dateFormat', format);
			toDate.datepicker('option', 'dateFormat', format);
		}
	});

	toDate.datepicker('setDate', now);
	var then = new Date(now.setMonth(now.getMonth() - 1));
	fromDate.datepicker('setDate', then);

	// get all the required config data before we start using it
    const availRes = $.ajax({ url: '/api/graphdata/availabledata.json', dataType: 'json' });
    const settingsRes = $.ajax({ url: '/api/graphdata/selectaperiod.json', dataType: 'json' });
    const configRes = $.ajax({ url: '/api/graphdata/graphconfig.json', dataType: 'json' });

    Promise.all([availRes, settingsRes, configRes])
    .then(function (results) {
        avail = results[0];
        settings = results[1];
        config = results[2];

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

		toDate.datepicker('setDate', settings.toDate ? new Date(settings.toDate) : now);
        fromDate.datepicker('setDate', settings.fromDate ? new Date(settings.fromDate) : then);
        toDate.datepicker('option', { minDate: fromDate.datepicker('getDate') });

		// then the real series options
		for (var k in avail) {
			if (['DailyTemps', 'Sunshine', 'DegreeDays', 'TempSum', 'CO2'].indexOf(k) === -1) {
				var optgrp = $('<optgroup />');
				optgrp.attr('label', k);
				avail[k].forEach(function (val) {
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
			title: {text: 'All Data Select-a-Chart'},
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
			lang: { noData: 'Please select some data to display' },
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
	var url = '/api/graphdata/selectaperiod.json';
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

var updateSeries = function() {
	cache = {};
	// update all the series
	for (var i = 0; i < 6; i++) {
		if (settings.series[i] != '0') {
			// This series has some data associated with it
			clearSeries(settings.series[i]);
			$('#data' + i + ' option:contains(' + txtSelect +')').text(txtClear);
			$('#data' + i).val(settings.series[i]);
			// Draw it on the chart
			updateChart(settings.series[i], i, 'data' + i);
		}
	}
	// now reset the range to All
	chart.rangeSelector.buttons[3].onEvents.click();
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
			color: 'rgb(0, 0, 180)', width: 1, zIndex: 2,
			label: { text:'Freezing', align: 'center'}
		},{
			value: frostTemp,
			color: 'rgb(64,64,255)', width:1, zIndex: 2,
			label: {text:'Frost possible', y:12, align:'center'}
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
		allowDecimals: false,
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
			color: 'rgb(255,220,0)', width: 1, zIndex:12,
			label: { text: beaufortDesc[1], y:12}
		},{
			value: beaufortScale[2],
			color: 'rgb(255,200,0)', width:1, zIndex:12,
			label: {text: beaufortDesc[2], y:12}
		},{
			value: beaufortScale[3],
			color: 'rgb(255,180,0)', width:1, zIndex:12,
			label: {text: beaufortDesc[3], y:12}
		},{
			value: beaufortScale[4],
			color: 'rgb(255,160,0)', width:1, zIndex:12,
			label: {text: beaufortDesc[4], y:12}
		},{
			value: beaufortScale[5],
			color: 'rgb(255,140,0)', width:1, zIndex:12,
			label: {text:beaufortDesc[5], y:12}
		},{
			value: beaufortScale[6],
			color: 'rgb(255,120,0)', width:1, zIndex:12,
			label: { text: beaufortDesc[6], y:12}
		},{
			value: beaufortScale[7],
			color: 'rgb(255,100,0)', width:1, zIndex:12,
			label: {text: beaufortDesc[7], y:12}
		},{
			value: beaufortScale[8],
			color: 'rgb(255,80,0)', width:1, zIndex:12,
			label: {text: beaufortDesc[8], y:12}
		},{
			value: beaufortScale[9],
			color: 'rgb(255,60,0)', width:1, zIndex:12,
			label: {text: beaufortDesc[9], y:12}
		},{
			value: beaufortScale[10],
			color: 'rgb(255,40,0)', width:1, zIndex:12,
			label: {text:beaufortDesc[10], y:12}
		},{
			value: beaufortScale[11],
			color: 'rgb(255,20,0)', width:1, zIndex:12,
			label: { text: beaufortDesc[11], y:12}
		},{
			value: beaufortScale[11],
			//color: 'rgb(255,0,0)', width:1, zIndex:12,
			label: {text: beaufortDesc[12]}
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
	chart.showLoading();

	addTemperatureAxis(idx);

	if (cache === null || cache.temp === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
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
			data: cache.temp.temp,
			id: 'Temperature',
			name: 'Temperature',
			yAxis: 'Temperature',
			type: 'spline',
			tooltip: {
				valueSuffix: ' °' + config.temp.units,
				valueDecimals: config.temp.decimals
			},
			visible: true,
			color: settings.colours[idx],
			zIndex: 100 - idx
		});
		chart.hideLoading();
	}
};

var doInTemp = function (idx) {
	chart.showLoading();

	addTemperatureAxis(idx);

	if (cache === null || cache.temp === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
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
			data: cache.temp.intemp,
			id: 'Indoor Temp',
			name: 'Indoor Temp',
			yAxis: 'Temperature',
			type: 'spline',
			tooltip: {
				valueSuffix: ' °' + config.temp.units,
				valueDecimals: config.temp.decimals
			},
			visible: true,
			color: settings.colours[idx],
			zIndex: 100 - idx
		});
		chart.hideLoading();
	}
};

var doHeatIndex = function (idx) {
	chart.showLoading();

	addTemperatureAxis(idx);

	if (cache === null || cache.temp === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
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
			data: cache.temp.heatindex,
			id: 'Heat Index',
			name: 'Heat Index',
			yAxis: 'Temperature',
			type: 'spline',
			tooltip: {
				valueSuffix: ' °' + config.temp.units,
				valueDecimals: config.temp.decimals
			},
			visible: true,
			color: settings.colours[idx],
			zIndex: 100 - idx
		});
		chart.hideLoading();
	}
};

var doDewPoint = function (idx) {
	chart.showLoading();

	addTemperatureAxis(idx);

	if (cache === null || cache.temp === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
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
			data: cache.temp.dew,
			id: 'Dew Point',
			name: 'Dew Point',
			yAxis: 'Temperature',
			type: 'spline',
			tooltip: {
				valueSuffix: ' °' + config.temp.units,
				valueDecimals: config.temp.decimals
			},
			visible: true,
			color: settings.colours[idx],
			zIndex: 100 - idx
		});
		chart.hideLoading();
	}
};

var doWindChill = function (idx) {
	chart.showLoading();

	addTemperatureAxis(idx);

	if (cache === null || cache.temp === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
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
			data: cache.temp.wchill,
			id: 'Wind Chill',
			name: 'Wind Chill',
			yAxis: 'Temperature',
			type: 'spline',
			tooltip: {
				valueSuffix: ' °' + config.temp.units,
				valueDecimals: config.temp.decimals
			},
			visible: true,
			color: settings.colours[idx],
			zIndex: 100 - idx
		});
		chart.hideLoading();
	}
};

var doAppTemp = function (idx) {
	chart.showLoading();

	addTemperatureAxis(idx);

	if (cache === null || cache.temp === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
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
			data: cache.temp.apptemp,
			id: 'Apparent Temp',
			name: 'Apparent Temp',
			yAxis: 'Temperature',
			type: 'spline',
			tooltip: {
				valueSuffix: ' °' + config.temp.units,
				valueDecimals: config.temp.decimals
			},
			visible: true,
			color: settings.colours[idx],
			zIndex: 100 - idx
		});
		chart.hideLoading();
	}
};

var doFeelsLike = function (idx) {
	chart.showLoading();

	addTemperatureAxis(idx);

	if (cache === null || cache.temp === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvtemp.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
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
			data: cache.temp.feelslike,
			id: 'Feels Like',
			name: 'Feels Like',
			yAxis: 'Temperature',
			type: 'spline',
			tooltip: {
				valueSuffix: ' °' + config.temp.units,
				valueDecimals: config.temp.decimals
			},
			visible: true,
			color: settings.colours[idx],
			zIndex: 100 - idx
		});
		chart.hideLoading();
	}
};

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
        chart.hideLoading();
    }
};

var doHumidity = function (idx) {
	chart.showLoading();

	addHumidityAxis(idx);

	if (cache === null || cache.hum === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvhum.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
			dataType: 'json',
			success: function (resp) {
				cache.hum = resp;
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
			data: cache.hum.hum,
			id: 'Humidity',
			name: 'Humidity',
			yAxis: 'Humidity',
			type: 'spline',
			tooltip: {
				valueSuffix: ' %',
				valueDecimals: config.hum.decimals
			},
			visible: true,
			color: settings.colours[idx],
			zIndex: 100 - idx
		});
		chart.hideLoading();
	}
};

var doInHumidity = function (idx) {
	chart.showLoading();

	addHumidityAxis(idx);

	if (cache === null || cache.hum === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvhum.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
			dataType: 'json',
			success: function (resp) {
				cache.hum = resp;
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
			data: cache.hum.hum,
			id: 'Indoor Hum',
			name: 'Indoor Hum',
			yAxis: 'Humidity',
			type: 'spline',
			tooltip: {
				valueSuffix: ' %',
				valueDecimals: config.hum.decimals
			},
			visible: true,
			color: settings.colours[idx],
			zIndex: 100 - idx
		});
		chart.hideLoading();
	}
};


var doSolarRad = function (idx) {
	chart.showLoading();

	addSolarAxis(idx);

	if (cache === null || cache.solar === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvsolar.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
			dataType: 'json',
			success: function (resp) {
				cache.solar = resp;
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
			data: cache.solar.SolarRad,
			id: 'Solar Rad',
			name: 'Solar Rad',
			yAxis: 'Solar',
			type: 'areaspline',
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
		chart.hideLoading();
	}
};

var doUV = function (idx) {
	chart.showLoading();

	addUVAxis(idx);

	if (cache === null || cache.solar === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvsolar.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
			dataType: 'json',
			success: function (resp) {
				cache.solar = resp;
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
			data: cache.solar.UV,
			id: 'UV Index',
			name: 'UV Index',
			yAxis: 'UV',
			type: 'spline',
			tooltip: {
				valueSuffix: null,
				valueDecimals: config.uv.decimals
			},
			visible: true,
			color: settings.colours[idx],
			zIndex: 100 - idx
		});
		chart.hideLoading();
	}
};


var doPress = function (idx) {
	chart.showLoading();

	addPressureAxis(idx);

	if (cache === null || cache.press === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvpress.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
			dataType: 'json',
			success: function (resp) {
				cache.press = resp.press;
				addSeries();
			}
		});
	}
	else
	{
		addSeries();
	}

	function addSeries() {
		chart.addSeries({
			index: idx,
			data: cache.press,
			id: 'Pressure',
			name: 'Pressure',
			yAxis: 'Pressure',
			type: 'spline',
			tooltip: {
				valueSuffix: ' ' + config.press.units,
				valueDecimals: config.press.decimals
			},
			visible: true,
			color: settings.colours[idx],
			zIndex: 100 - idx
		});
		chart.hideLoading();
	}
};


var doWindSpeed = function (idx) {
	chart.showLoading();

	addWindAxis(idx);

	if (cache === null || cache.wind === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvwind.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
			dataType: 'json',
			success: function (resp) {
				cache.wind = resp;
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
			data: cache.wind.wspeed,
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
		chart.hideLoading();
	}
};

var doWindGust = function (idx) {
	chart.showLoading();

	addWindAxis(idx);

	if (cache === null || cache.wind === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvwind.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
			dataType: 'json',
			success: function (resp) {
				cache.wind = resp;
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
			data: cache.wind.wgust,
			id: 'Wind Gust',
			name: 'Wind Gust',
			yAxis: 'Wind',
			tooltip: {
				valueSuffix: ' ' + config.wind.units,
				valueDecimals: config.wind.decimals
			},
			visible: true,
			color: settings.colours[idx],
			zIndex: 100 - idx
		});
		chart.hideLoading();
	}
};

var doWindDir = function (idx) {
	chart.showLoading();

	addBearingAxis(idx);

	if (cache === null || cache.wind === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvwind.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
			dataType: 'json',
			success: function (resp) {
				cache.wind = resp;
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
			data: cache.wind.avgbearing,
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
		chart.hideLoading();
	}
};


var doRainfall = function (idx) {
	chart.showLoading();

	addRainAxis(idx);

	if (cache === null || cache.rain === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvrain.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
			dataType: 'json',
			success: function (resp) {
				cache.rain = resp;
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
			data: cache.rain.rfall,
			id: 'Rainfall',
			name: 'Rainfall',
			yAxis: 'Rain',
			type: 'area',
			tooltip: {
				valueDecimals: config.rain.decimals,
				valueSuffix: ' ' + config.rain.units
			},
			visible: true,
			color: settings.colours[idx],
			zIndex: 100 - idx,
			fillOpacity: 0.3,
			boostThreshold: 0
});
		chart.hideLoading();
	}
};

var doRainRate = function (idx) {
	chart.showLoading();

	addRainRateAxis(idx);

	if (cache === null || cache.rain === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvrain.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
			dataType: 'json',
			success: function (resp) {
				cache.rain = resp;
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
			data: cache.rain.rrate,
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
		chart.hideLoading();
	}
};


var doPm2p5 = function (idx) {
	chart.showLoading();

	addAQAxis(idx);

	$.ajax({
        url: '/api/graphdata/intvairquality.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
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
        url: '/api/graphdata/intvairquality.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
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

	if (cache === null || cache.extratemp === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvextratemp.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
			dataType: 'json',
			success: function (resp) {
				cache.extratemp = resp;
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
			data: cache.extratemp[name],
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
		chart.hideLoading();
	}
};

var doUserTemp = function (idx, val) {
	chart.showLoading();

	addTemperatureAxis(idx);

	// get the sensor name
	var name = val.split('-').slice(1).join('-');

	if (cache === null || cache.usertemp === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvusertemp.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
			dataType: 'json',
			success: function (resp) {
				cache.usertemp = resp;
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
			data: cache.usertemp[name],
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
		chart.hideLoading();
	}
};

var doExtraHum = function (idx, val) {
	chart.showLoading();

	addHumidityAxis(idx);

	// get the sensor name
	var name = val.split('-').slice(1).join('-');

	if (cache === null || cache.extrahum === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intextrahum.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
			dataType: 'json',
			success: function (resp) {
				cache.extrahum = resp;
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
			data: cache.extrahum[name],
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
		chart.hideLoading();
	}
};

var doExtraDew = function (idx, val) {
	chart.showLoading();

	addTemperatureAxis(idx);

	// get the sensor name
	var name = val.split('-').slice(1).join('-');

	if (cache === null || cache.extradew === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvextradew.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
			dataType: 'json',
			success: function (resp) {
				cache.extradew = resp;
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
			data: cache.extradew[name],
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
		chart.hideLoading();
	}
};

var doSoilTemp = function (idx, val) {
	chart.showLoading();

	addTemperatureAxis(idx);

	// get the sensor name
	var name = val.split('-').slice(1).join('-');

	if (cache === null || cache.soiltemp === undefined)
	{
		$.ajax({
			url: '/api/graphdata/intvsoiltemp.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
			dataType: 'json',
			success: function (resp) {
				cache.soiltemp = resp;
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
			data: cache.soiltemp[name],
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
		chart.hideLoading();
	}
};

var doSoilMoist = function (idx, val) {
	chart.showLoading();

	addSoilMoistAxis(idx);
    var name = val.split('-').slice(1).join('-');
    var unitIdx = config.series.soilmoist.name.indexOf(name);
    var suffix = unitIdx == -1 ? '' : ' ' + config.soilmoisture.units[unitIdx];

	// get the sensor name
	var name = val.split('-').slice(1).join('-');

	if (cache === null || cache.soilmoist === undefined)
	{
		$.ajax({
            url: '/api/graphdata/intvsoilmoist.json?start=' + formatDateStr($("#dateFrom").datepicker('getDate')) + '&end=' + formatDateStr($("#dateTo").datepicker('getDate')),
			dataType: 'json',
			success: function (resp) {
				cache.soilmoist = resp;
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
			data: cache.soilmoist[name],
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
		chart.hideLoading();
	}
};

var doLeafWet = function (idx, val) {
	chart.showLoading();

	addLeafWetAxis(idx);

	// get the sensor name
	var name = val.split('-').slice(1).join('-');

	if (cache === null || cache.leafwet === undefined)
	{
		$.ajax({
            url: '/api/graphdata/intvleafwetness.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
			dataType: 'json',
			success: function (resp) {
				cache.leafwet = resp;
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
			data: cache.leafwet[name],
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
		chart.hideLoading();
	}
};

var doLaserDepth = function (idx, val) {
    chart.showLoading();

    addLaserAxis(idx);

    // get the sensor name
    var name = val.split('-').slice(1).join('-');

    if (cache === null || cache.laserdepth === undefined)
    {
        $.ajax({
            url: '/api/graphdata/intvlaserdepth.json?start=' + formatDateStr($('#dateFrom').datepicker('getDate')) + '&end=' + formatDateStr($('#dateTo').datepicker('getDate')),
            dataType: 'json',
            success: function (resp) {
                cache.laserdepth = resp;
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
            data: cache.laserdepth[name],
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
        chart.hideLoading();
    }
};

function formatDateStr(inDate) {
    return '' + inDate.getFullYear() + '-' + addLeadingZeros(inDate.getMonth() + 1) + '-' + addLeadingZeros(inDate.getDate());
}

function formatUserDateStr(inDate) {
	return  addLeadingZeros(inDate.getDate()) + '-' + addLeadingZeros(inDate.getMonth() + 1) + '-' + inDate.getFullYear();
}

function addLeadingZeros(n) {
	return n <= 9 ? '0' + n : n;
}

function getUnixTimeStamp(inDate) {
	return inDate.getTime() / 1000;
}
