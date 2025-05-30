/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: chartshistoric.js        Ver: aiX-1.0
    Author: M Crossley & N Thomas
    Last Edit (MC): 2024/12/28 12:09:59
    Last Edit (NT): 2025/03/21
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Charts for chartshistoric.html
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var chart, config, available;

var myTooltipHead = '<table><tr><td colspan="2"><h5>{point.key}</h5></td></tr>';
var myTooltipPoint = '<tr><td><i class="fa-solid fa-diamond" style="color:{series.color}"></i>&nbsp;{series.name}</td>' +
					 '<td><strong>{point.y}</strong></td></tr>';
var beaufortScale, beaufortDesc, frostTemp;

beaufortDesc = ['Calm','Light Air','Light breeze','Gentle breeze','Moderate breeze','Fresh breeze','Strong breeze','Near gale','Gale','Strong gale','Storm','Violent storm','Hurricane'];


$().ready(function () {
	/*
	$('.btn').change(function () {

		var myRadio = $('input[name=options]');
		var checkedValue = myRadio.filter(':checked').val();

		doGraph(checkedValue);
	});
	*/
   	$('.selectGraph').click( function() {
		CMXSession.Charts.Historic = this.id
		sessionStorage.setItem(CMXSession, JSON.stringify(CMXSession));
		doGraph( this.id );
	});
	
	$.ajax({
		url: "/api/graphdata/availabledata.json",
		dataType: "json",
		success: function (result) {
			//	Hide unwanted buttons
			available = result;
			if (result.Temperature === undefined || result.Temperature.Count == 0) {
				$('#temp').remove();
			}
			if (result.Humidity === undefined || result.Humidity.Count == 0) {
				$('#humidity').remove();
			}
			if (result.Solar === undefined || result.Solar.Count == 0) {
				$('#solar').remove();
			}
			if (result.DegreeDays === undefined || result.DegreeDays.Count == 0) {
				$('#degdays').remove();
			}
			if (result.TempSum === undefined || result.TempSum.Count == 0) {
				$('#tempsum').remove();
			}
			if (result.ChillHours === undefined || result.ChillHours.Count == 0) {
				$('#chillhrs').remove();
			}
			if (result.Snow === undefined || result.Snow.Count == 0) {
				$('#snow').remove();
			}
		}
	});

	var doGraph = function (value) {
		CMXSession.Charts.Historic = value;
		sessionStorage.setItem(axStore, JSON.stringify(CMXSession) );
		$('.selectGraph').removeClass('w3-disabled');
		$('#' + value).addClass('w3-disabled');
		switch (value) {
			case 'temp':		doTemp();		break;
			case 'press':		doPress();		break;
			case 'wind':		doWind();		break;
			case 'rain':		doRain();		break;
		    case 'humidity':	doHum();		break;
			case 'solar':		doSolar();		break;
			case 'degdays':		doDegDays();	break;
			case 'tempsum':		doTempSum();	break;
			case 'chillhrs':	doChillHrs();	break;
			case 'snow':		doSnow();		break;
			default:			doTemp();		$('#temp').addClass('w3-disabled');	break;
		}
		
//        parent.location.hash = value;
	};


	$.ajax({url: "/api/graphdata/graphconfig.json", success: function (result) {
		config = result;

		var chart = CMXSession.Charts.Historic;
		if( chart === null || chart =='') {
			chart = 'temp';
		}
//	New
		switch(config.wind.units){
			case 'mph':   beaufortScale = [ 1, 3, 7,12,18,24,31,38,46,54, 63, 72]; break;
			case 'km/h':  beaufortScale = [ 2, 5,11,19,29,39,50,61,74,87,101,116]; break;
			case 'm/s':   beaufortScale = [ 0, 0, 1, 1, 2, 3, 4, 5, 7,10, 12, 16]; break;
			case 'knots': beaufortScale = [ 3, 6,10,16,21,27,33,40,47,55, 63, 65]; break;
			default: 	  beaufortScale = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1, -1, -1];
			// NOTE: Using -1 means the line will never be seen.  No line is drawn for Hurricane.
		}

		doGraph( chart );
	}});
});

var doTemp = function () {
	$('#chartdescription').text('Curved line chart showing daily temperature values. Shown are the maximum, minimum, and average temperatures for each day along with many possible derived temperature values.');
	freezing = config.temp.units === 'C' ? 0 : 32;
	frostTemp = config.temp.units === 'C' ? 4 : 39;		//	Added by Neil
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'spline',
			zooming:{type:'x'},
			alignTicks: false
		},
		title: {text: 'Temperature'},
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
				title: {margin: 40, text: 'Temperature (°' + config.temp.units + ')'},
				opposite: false,
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
					label:{text:'Freezing', align:'center'}
				},{
					value: frostTemp,
					color: 'rgb(128,128,255)',
					width: 1,
					zIndex: 2,
					label: {text: 'Frost possible',y:12, align:'center'}
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
		lang: {
			noData: 'No temperature data available'
		},
		noData: {
			style: {
				fontWeight: 'bold',
				fontSize: '20px',
				color: '#FF3030'			}
		},
		tooltip: {
			shared: true,
			split: false,
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat: myTooltipPoint,
			footerFormat: '</table>',
			valueSuffix: ' °' + config.temp.units,
			valueDecimals: config.temp.decimals,
			xDateFormat: '%A %e %b %Y'
		},
		series: [],
		rangeSelector: {
			inputEnabled: false,
			selected: 1
		}
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
	chart.showLoading();

	$.ajax({
		url: '/api/dailygraphdata/tempdata.json',
		dataType: 'json',
		success: function (resp) {
		   var titles = {
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
			var visibility = {
				'minTemp'  : true,
				'maxTemp'  : true,
				'avgTemp'  : false,
				'heatIndex': false,
				'minApp'   : false,
				'maxApp'   : false,
				'minDew'   : false,
				'maxDew'   : false,
				'minFeels' : false,
				'maxFeels' : false,
				'humidex'  : false,
				'windChill': false
			 };
			var idxs = ['minTemp', 'maxTemp', 'avgTemp', 'heatIndex', 'minApp', 'maxApp', 'minDew', 'maxDew', 'minFeels', 'maxFeels', 'windChill', 'humidex'];

			idxs.forEach(function(idx) {
				var valueSuffix = ' °' + config.temp.units;
				yaxis = 0;

				if (idx in resp) {
					var clrIdx = idx.toLowerCase();
					if ('heatIndex' === idx || 'humidex' === idx) {
						clrIdx = 'max' + clrIdx;
					} else if ('windChill' === idx) {
						clrIdx = 'min' + clrIdx;
					}

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
							});

							yaxis = 'humidex';
						}
					}

					chart.addSeries({
						name: titles[idx],
						data: resp[idx],
						color: config.series[clrIdx].colour,
						visible: visibility[idx],
						showInNavigator: visibility[idx],
						yAxis: yaxis,
						tooltip: {valueSuffix: valueSuffix}
					}, false);

				}
			});
			chart.hideLoading();
			chart.redraw();
		}
	});
};

var doPress = function () {
	$('#chartdescription').text('Curved line chart showing daily high and low atmospheric pressure values.');
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'spline',
			zooming:{type:'x'},
			alignTicks: false
		},
		title: {text: 'Pressure'},
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
				title: {text: 'Pressure (' + config.press.units + ')'},
				opposite: false,
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
			noData: 'No pressure data available'
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
			pointFormat: myTooltipPoint,
			footerFormat: '</table>',
			valueSuffix: ' ' + config.press.units,
			valueDecimals: config.press.decimals,
			xDateFormat: '%A %e %b %Y'
		},
		series: [{
				name: 'High Pressure',
				color: config.series.maxpress.colour,
				showInNavigator: true
			}, {
				name: 'Low Pressure',
				color: config.series.minpress.colour,
				showInNavigator: true
			}],
		rangeSelector: {
			inputEnabled: false,
			selected: 1
		}
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
	chart.showLoading();

	$.ajax({
		url: '/api/dailygraphdata/pressdata.json',
		dataType: 'json',
		success: function (resp) {
			chart.hideLoading();
			chart.series[0].setData(resp.maxBaro);
			chart.series[1].setData(resp.minBaro);
		}
	});
};

var compassP = function (deg) {
	var a = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
	return a[Math.floor((deg + 22.5) / 45) % 8];
};

var doWind = function () {
	$('#chartdescription').text('Curved line chart showing daily high gust, high average wind speed, and daily wind run values.');
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'spline',
			zooming:{type:'x'},
			alignTicks: false
		},
		title: {text: 'Wind Speed'},
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
				title: {text: 'Wind Speed (' + config.wind.units + ')'},
				opposite: false,
				min: 0,
				labels: {
					align: 'right',
					x: -5
				},
				plotLines: [{
					value: beaufortScale[1],
					color: 'rgb(255,220,0)', width: 1, zIndex:1,
					label: { text: beaufortDesc[1], y:12, style:{color:'var(--color5)'}}
				},{
					value: beaufortScale[2],
					color: 'rgb(255,200,0)', width:1, zIndex:1,
					label: {text: beaufortDesc[2], y:12, style:{color:'var(--color5)'}}
				},{
					value: beaufortScale[3],
					color: 'rgb(255,180,0)', width:1, zIndex:1,
					label: {text: beaufortDesc[3], y:12, style:{color:'var(--color5)'}}
				},{
					value: beaufortScale[4],
					color: 'rgb(255,160,0)', width:1, zIndex:1,
					label: {text: beaufortDesc[4], y:12, style:{color:'var(--color5)'}}
				},{
					value: beaufortScale[5],
					color: 'rgb(255,140,0)', width:1, zIndex:1,
					label: {text:beaufortDesc[5], y:12, style:{color:'var(--color5)'}}
				},{
					value: beaufortScale[6],
					color: 'rgb(255,120,0)', width:1, zIndex:1,
					label: { text: beaufortDesc[6], y:12, style:{color:'var(--color5)'}}
				},{
					value: beaufortScale[7],
					color: 'rgb(255,100,0)', width:1, zIndex:1,
					label: {text: beaufortDesc[7], y:12, style:{color:'var(--color5)'}}
				},{
					value: beaufortScale[8],
					color: 'rgb(255,80,0)', width:1, zIndex:1,
					label: {text: beaufortDesc[8], y:12, style:{color:'var(--color5)'}}
				},{
					value: beaufortScale[9],
					color: 'rgb(255,60,0)', width:1, zIndex:1,
					label: {text: beaufortDesc[9], y:12, style:{color:'var(--color5)'}}
				},{
					value: beaufortScale[10],
					color: 'rgb(255,40,0)', width:1, zIndex:1,
					label: {text:beaufortDesc[10], y:12, style:{color:'var(--color5)'}}
				},{
					value: beaufortScale[11],
					color: 'rgb(255,20,0)', width:1, zIndex:1,
					label: { text: beaufortDesc[11], y:12, style:{color:'var(--color5)'}}
				},{
					value: beaufortScale[11],
					//color: 'rgb(255,0,0)', width:1, zIndex:1,
					label: {text: beaufortDesc[12],style:{color:'var(--color5)'}}
				}]
			}, {
				// right
				//linkedTo: 0,
				gridLineWidth: 0,
				opposite: true,
				min: 0,
				title: {text: 'Wind Run (' + config.wind.rununits + ')'},
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
			noData: 'No wind data available'
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
			pointFormat: myTooltipPoint,
			footerFormat: '</table>',
			valueSuffix: ' ' + config.wind.units,
			valueDecimals: config.wind.decimals,
			xDateFormat: '%A %e %b %Y'
		},
		series: [{
				name: 'Wind Speed',
				color: config.series.wspeed.colour,
				showInNavigator: true
			}, {
				name: 'Wind Gust',
				color: config.series.wgust.colour,
				showInNavigator: true
			}, {
				name: 'Wind Run',
				type: 'column',
				color: config.series.windrun.colour,
				yAxis: 1,
				visible: false,
				tooltip: {
					valueSuffix: ' ' + config.wind.rununits,
					valueDecimals: 0
				},
				zIndex: -1
			}],
		rangeSelector: {
			inputEnabled: false,
			selected: 1
		}
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
	chart.showLoading();

	$.ajax({
		url: '/api/dailygraphdata/winddata.json',
		dataType: 'json',
		success: function (resp) {
			chart.hideLoading();
			chart.series[0].setData(resp.maxWind);
			chart.series[1].setData(resp.maxGust);
			chart.series[2].setData(resp.windRun);
		}
	});
};

var doRain = function () {
	$('#chartdescription').text('Bar chart showing daily rainfall values.');
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'column',
			zooming:{type:'x'},
			alignTicks: true
		},
		title: {text: 'Rainfall'},
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
				title: {text: 'Rainfall (' + config.rain.units + ')'},
				opposite: false,
				min: 0,
				labels: {
					align: 'right',
					x: -5
				}
			}, {
				// right
				title: {text: 'Rainfall rate (' + config.rain.units + '/hr)'},
				opposite: true,
				min: 0,
				labels: {
					align: 'left',
					x: 5
				},
				showEmpty: false
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
			},
			line: {lineWidth: 2}
		},
		lang: {
			noData: 'No rainfall data available'
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
			pointFormat: myTooltipPoint,
			footerFormat: '</table>',
			valueDecimals: config.rain.decimals,
			xDateFormat: '%A %e %b %Y'
		},
		series: [{
				name: 'Daily rain',
				type: 'column',
				color: config.series.rfall.colour,
				yAxis: 0,
				tooltip: {valueSuffix: ' ' + config.rain.units},
			}, {
				name: 'Rain rate',
				type: 'column',
				color: config.series.rrate.colour,
				yAxis: 1,
				tooltip: {valueSuffix: ' ' + config.rain.units + '/hr'},
				visible: false
			}],
		rangeSelector: {
			inputEnabled: false,
			selected: 1
		}
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
	chart.showLoading();

	$.ajax({
		url: '/api/dailygraphdata/raindata.json',
		dataType: 'json',
		success: function (resp) {
			chart.hideLoading();
			chart.series[0].setData(resp.rain);
			chart.series[1].setData(resp.maxRainRate);
		}
	});
};

var doHum = function () {
	$('#chartdescription').text('Curved line chart showing daily high and low relative humidity values.');
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'spline',
			zooming:{type:'x'},
			alignTicks: false
		},
		title: {text: 'Relative Humidity'},
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
				title: {text: 'Humidity (%)'},
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
		lang: {
			noData: 'No humidity data available'
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
			pointFormat: myTooltipPoint,
			footerFormat: '</table>',
			valueSuffix: ' %',
			valueDecimals: config.hum.decimals,
			xDateFormat: '%A %e %b %Y'
		},
		series: [],
		rangeSelector: {
			inputEnabled: false,
			selected: 1
		}
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
	chart.showLoading();

	$.ajax({
		url: '/api/dailygraphdata/humdata.json',
		dataType: 'json',
		success: function (resp) {
			var titles = {
				'minHum'  : 'Minimum Humidity',
				'maxHum': 'Maximum Humidity'
			 }
			 var idxs = ['minHum', 'maxHum'];
			 var cnt = 0;
			 idxs.forEach(function(idx) {
				 if (idx in resp) {
					 chart.addSeries({
						 name: titles[idx],
						 color: config.series[idx.toLowerCase()].colour,
						 data: resp[idx],
						 showInNavigator: true
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
	$('#chartdescription').text('Combination curved line and bar chart showing daily high solar irradiation and sunshine hours.');
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'line',
			zooming:{type:'x'},
			alignTicks: true
		},
		title: {text: 'Solar'},
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
		yAxis: [],
		legend: {enabled: true},
		plotOptions: {
			boostThreshold: 0,
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
			},
			line: {lineWidth: 2}
		},
		lang: {
			noData: 'No solar data available'
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
			pointFormat: myTooltipPoint,
			footerFormat: '</table>',
			xDateFormat: '%A %e %b %Y'
		},
		series: [],
		rangeSelector: {
			inputEnabled: false,
			selected: 1
		}
	};

	chart = new Highcharts.StockChart(options);
	chart.hideNoData();
	chart.showLoading();

	$.ajax({
		url: '/api/dailygraphdata/solardata.json',
		dataType: 'json',
		success: function (resp) {
			var titles = {
				solarRad: 'Solar Radiation',
				uvi     : 'UV Index',
				sunHours: 'Sunshine Hours'
			};
			var types = {
				solarRad: 'areaspline',
				uvi     : 'spline',
				sunHours: 'column'
			};
			var tooltips = {
				solarRad: {
					valueSuffix: ' W/m\u00B2',
					valueDecimals: 0
				},
				uvi: {
					valueSuffix: ' ',
					valueDecimals: config.uv.decimals
				},
				sunHours: {
					valueSuffix: ' hours',
					valueDecimals: 0
				}
			};
			var indexes = {
				solarRad: 1,
				uvi     : 2,
				sunHours: 0
			}
			var fillColor = {
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
			};
			var idxs = ['solarRad', 'uvi', 'sunHours'];

			idxs.forEach(function(idx) {
				if (idx in resp) {
					var clrIdx;
					if (idx === 'uvi')
						clrIdx ='uv';
					else if (idx === 'solarRad')
						clrIdx = 'solarrad';
					else if (idx === 'sunHours')
						clrIdx = 'sunshine';

					if (idx === 'uvi') {
						chart.addAxis({
							id: idx,
							title: {text: 'UV Index'},
							opposite: true,
							allowDecimals: false,
							min: 0,
							labels: {
								align: 'left'
							},
							showEmpty: false
						});
					} else if (idx === 'sunHours') {
						chart.addAxis({
							id: idx,
							title: {text: 'Sunshine Hours'},
							opposite: true,
							min: 0,
							labels: {
								align: 'left'
							},
							showEmpty: false
						});
					} else if (idx === 'solarRad') {
						chart.addAxis({
							id: idx,
							title: {text: 'Solar Radiation (W/m\u00B2)'},
							min: 0,
							opposite: false,
							labels: {
								align: 'right',
								x: -5
							},
							showEmpty: false
						});
					}

					chart.addSeries({
						name: titles[idx],
						type: types[idx],
						yAxis: idx,
						tooltip: tooltips[idx],
						data: resp[idx],
						color: config.series[clrIdx].colour,
						showInNavigator: idx !== 'solarRad',
						index: indexes[idx],
						fillColor: fillColor[idx],
						zIndex: idx === 'uvi' ? 99 : null
					}, false);
				}
			});

			chart.hideLoading();
			chart.redraw();
		}
	});
};

var doDegDays = function () {
	$('#chartdescription').text('Curved line chart showing daily increments to growing degree days. These values increase over the growing year, the year normally starts in January for the northern hemisphere, and July in the southern. Two ranges are defined for each year: range one incrementing when the temperature is above 5°C or 40°F, and range two incrementing when the temperature is above 10°C or 50°F. Though the station owner can override these values and define their own.');
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'spline',
			alignTicks: false,
			zooming:{type:'x'}
		},
		title: {text: 'Degree Days'},
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
				title: {text: '°' + config.temp.units + ' days'},
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
		lang: {
			noData: 'No degree day data available'
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
			xDateFormat: '%A %e %B',
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat: myTooltipPoint,
			footerFormat: '</table>'
		},
		series: []
	};

	chart = new Highcharts.Chart(options);
	chart.hideNoData();
	chart.showLoading();

	$.ajax({
		url: '/api/dailygraphdata/degdaydata.json',
		dataType: 'json',
		success: function (resp) {
			var subtitle = '';
			if (available.DegreeDays.indexOf('GDD1') != -1) {
				subtitle = 'GDD#1 base: ' + resp.options.gddBase1 + '°' + config.temp.units;
				if (available.DegreeDays.indexOf('GDD2') != -1) {
					subtitle += ' - ';
				}
			}
			if (available.DegreeDays.indexOf('GDD2') != -1) {
				subtitle += 'GDD#2 base: ' + resp.options.gddBase2 + '°' + config.temp.units;
			}

			chart.setSubtitle({text: subtitle});

			available.DegreeDays.forEach(idx => {
				 if (idx in resp) {
					Object.keys(resp[idx]).forEach(yr => {
						chart.addSeries({
							name: idx + '-' + yr,
							visible: false,
							data: resp[idx][yr]
						}, false);
					});
					// make the last series visible
					chart.series[chart.series.length -1].visible = true;
				 }
			 });

			chart.hideLoading();
			chart.redraw();
		}
	});
};

var doTempSum = function () {
	$('#chartdescription').text('Curved line chart showing daily increments to the annual temperature sum. These values increase over the year, the year normally starts in January for the northern hemisphere, and July in the southern. Three ranges are defined for each year: The ranges being measured relative to the base temperatures of; 0°C/32°F, 5°C/40°F, and 10°C/50°F respectively. Allthough the station owner can override these values and define their own.');
	var options = {
		chart: {
			renderTo: 'chartcontainer',
			type: 'spline',
			alignTicks: false,
			zooming:{type:'x'}
		},
		title: {text: 'Temperature Sum'},
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
				title: {text: 'Total °' + config.temp.units},
				opposite: false,
				labels: {
					align: 'right',
					x: -10
				}
			}, {
				// right
				linkedTo: 0,
				gridLineWidth: 0,
				opposite: true,
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
		lang: {
			noData: 'No temperature sum data available'
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
			xDateFormat: '%A %e %B',
			useHTML: true,
			className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat: myTooltipPoint,
			footerFormat: '</table>'
		},
		series: []
	};

	chart = new Highcharts.Chart(options);
	Chart.hideNoData();
	chart.showLoading();

	$.ajax({
		url: '/api/dailygraphdata/tempsumdata.json',
		dataType: 'json',
		success: function (resp) {
			var subtitle = '';
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

			chart.setSubtitle({text: subtitle});

			available.TempSum.forEach(idx => {
				if (idx in resp) {
				   Object.keys(resp[idx]).forEach(yr => {
					   chart.addSeries({
						   name: idx + '-' + yr,
						   visible: false,
						   data: resp[idx][yr]
					   }, false);
				   });
				   // make the last series visible
				   chart.series[chart.series.length -1].visible = true;
				}
			});

			chart.hideLoading();
			chart.redraw();
		}
	});
};

var doChillHrs = function () {
    $('#chartdescription').text('Line chart showing daily increments to the annual chill hours. These values increase over the year, the year normally starts in October for the northern hemisphere, and April in the southern. Three ranges are defined for each year: The ranges being measured relative to the base temperatures of; 0°C/32°F, 5°C/40°F, and 10°C/50°F respectively. Though the station owner can override these values and define their own.');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'line',
            alignTicks: false,
            zooming:{type:'x'}
        },
        title: {text: 'Chill Hours'},
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
                title: {text: 'Total Hours'},
                opposite: false,
                labels: {
                    align: 'right',
                    x: -10
                }
            }, {
                // right
                linkedTo: 0,
                gridLineWidth: 0,
                opposite: true,
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
		lang: {
			noData: 'No chill hours data available'
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
            xDateFormat: '%e %B',
            useHTML: true,
            className: 'cmxToolTip',
			headerFormat: myTooltipHead,
			pointFormat: myTooltipPoint,
            footerFormat: '</table>'
        },
        series: []
    };

    chart = new Highcharts.Chart(options);
    chart.hideNoData();
	chart.showLoading();

    $.ajax({
        url: '/api/dailygraphdata/chillhrsdata.json',
        dataType: 'json'
    })
    .done(function (resp) {
        var subtitle = 'Threshold: ' + resp.options.threshold + '°' + config.temp.units + ' Base: ' + resp.options.basetemp + '°' + config.temp.units;
        chart.setSubtitle({text: subtitle});

        for (var yr in resp.data) {
            chart.addSeries({
                name: yr,
                visible: false,
                data: resp.data[yr]
            }, false);
        }

        // make the last series visible
        chart.series[chart.series.length -1].visible = true;
    })
    .always(function() {
        chart.hideLoading();
        chart.redraw();
    });
};

var doSnow = function () {
    $('#chartdescription').text('Chart showing daily snow depth and last 24 hours snowfall.');
    var options = {
        chart: {
            renderTo: 'chartcontainer',
            type: 'column',
			zooming:{type:'x'},
            alignTicks: true
        },
        title: {text: 'Snowfall'},
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
                title: {text: 'Snow depth (' + config.snow.units + ')'},
                opposite: false,
                min: 0, softMax:5,
                labels: {
                    align: 'right',
                    x: -5
                }
            }],
        legend: {enabled: true},
        plotOptions: {
            column: {
                dataGrouping: {
                    enabled: false
                }
            },
            series: {
                grouping: false,
                pointPadding: 0.05,
                groupPadding: 0.05,
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
			noData: 'No snow data available'
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
			pointFormat: myTooltipPoint,
			footerFormat: '</table>',
            valueDecimals: 1,
            xDateFormat: '%e %b %y'
        },
        series: [],
        rangeSelector: {
            inputEnabled: false,
            selected: 1
        },
        navigator: {
            series: {
                type: 'column'
            }
        }
    };

    chart = new Highcharts.StockChart(options);
    chart.hideNoData();
	chart.showLoading();

    $.ajax({
        url: '/api/dailygraphdata/dailysnow.json',
        dataType: 'json'
    })
    .done(function (resp) {
        if ('SnowDepth' in resp && resp.SnowDepth.length > 0) {
            chart.addSeries({
                name: 'Snow Depth',
                type: 'column',
                color: config.series.snowdepth.colour,
                tooltip: {valueSuffix: ' ' + config.snow.units},
                data: resp.SnowDepth,
                showInNavigator: true
            });
        }

        if ('Snow24h' in resp && resp.Snow24h.length > 0) {
            chart.addSeries({
                name: 'Snowfall 24h',
                type: 'column',
                color: config.series.snow24h.colour,
                tooltip: {valueSuffix: ' ' + config.snow.units},
                data: resp.Snow24h,
                showInNavigator: true
            });
        }
    })
/*	.fail(function() {
		chart.lang.noData( 'No snow data available');
	})*/
    .always(function() {
        chart.hideLoading();
    });
};
