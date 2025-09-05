/*	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Script:	charts.js				Ver: aiX-1.0
 * 	Author:	M Crossley & N Thomas
 * 	(MC) Last Edit:	2025/09/03 15:54:40
 * 	Last Edit (NT):	2025/05/05
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Role: Draw charts based on readings
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

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

		if (avail.Temperature === undefined || avail.Temperature.Count == 0) {
			$('#temp').remove();
		}
		if (avail.DailyTemps === undefined || avail.DailyTemps.Count == 0) {
			$('#dailytemp').remove()
		}
		if (avail.Humidity === undefined || avail.Humidity.Count == 0) {
			$('#humidity').remove()
		}
		if (avail.Solar === undefined || avail.Solar.Count == 0) {
			$('#solar').remove();
		}
		if (avail.Sunshine === undefined || avail.Sunshine.Count == 0) {
			$('#sunhours').remove();
		}
		if (avail.AirQuality === undefined || avail.AirQuality.Count == 0) {
			$('#airquality').remove();
		}
		if (avail.ExtraTemp == undefined || avail.ExtraTemp.Count == 0) {
			$('#extratemp').remove();
		}
		if (avail.ExtraHum == undefined || avail.ExtraHum.Count == 0) {
			$('#extrahum').remove();
		}
		if (avail.ExtraDewPoint == undefined || avail.ExtraDewPoint.Count == 0) {
			$('#extradew').remove();
		}
		if (avail.SoilTemp == undefined || avail.SoilTemp.Count == 0) {
			$('#soiltemp').remove();
		}
		if (avail.SoilMoist == undefined || avail.SoilMoist.Count == 0) {
			$('#soilmoist').remove();
		}
		if (avail.LeafWetness == undefined || avail.LeafWetness.Count == 0) {
			$('#leafwet').remove();
		}
		if (avail.UserTemp == undefined || avail.UserTemp.Count == 0) {
			$('#usertemp').remove();
		}
		if (avail.CO2 == undefined || avail.CO2.Count == 0) {
			$('#co2').remove();
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
/**/

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
