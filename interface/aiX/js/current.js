/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: current.js        		Ver: aiX-1.0
    Author: M Crossley & N Thomas
    Last Edit (MC): 2024/09/27 10:21:36
    Last Edit (NT): 2025/03/21
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Data for current.html
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

// Configuration section
let useWebSockets = true; // set to false to use Ajax updating
let updateInterval = 3;   // update interval in seconds, if Ajax updating is used
let debug = false;


var cp = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
// End of configuration section

$(document).ready(function () {

	let lastUpdateTimer, ws;

	//	Added by NEIL
	$.ajax({
		url: '/api/settings/displayoptions.json',
		dataType: 'json',
		success: function (results) {
			var dataVisible = results.DataVisibility;
			if( dataVisible.temperature.Temp      == 0 ) { $('[data-cmxData="Temp"]').addClass('w3-hide');}
			if( dataVisible.temperature.InTemp    == 0 ) { $('[data-cmxData="InTemp"]').addClass('w3-hide');}
			if( dataVisible.temperature.DewPoint  == 0 ) { $('[data-cmxData="DewPoint"]').addClass('w3-hide');}
			if( dataVisible.temperature.HeatIndex == 0 ) { $('[data-cmxData="HeatIndex"]').addClass('w3-hide');}
			if( dataVisible.temperature.WindChill == 0 ) { $('[data-cmxData="WindChill"]').addClass('w3-hide');}
			if( dataVisible.temperature.AppTemp   == 0 ) { $('[data-cmxData="AppTemp"]').addClass('w3-hide');}
			if( dataVisible.temperature.FeelsLike == 0 ) { $('[data-cmxData="FeelsLike"]').addClass('w3-hide');}
			if( dataVisible.temperature.Humidex   == 0 ) { $('[data-cmxData="Humidex"]').addClass('w3-hide');}
			if( dataVisible.humidity.InHum        == 0 && dataVisible.humidity.Hum == 0 ) { 
				$('[data-cmxData="humidity"]').addClass('w3-hide');
			} else {
				if( dataVisible.humidity.Hum == 0 ) { $('[data-cmxData="Hum"]').addClass('w3-hide');}
				if( dataVisible.humidity.InHum == 0 ) { $('[data-cmxData="InHum"]').addClass('w3-hide');}
			}
			if( dataVisible.solar.UV == 0 && dataVisible.solar.Solar == 0 && dataVisible.solar.Sunshine == 0 ){
				$('[data-cmxData="solar"]').addClass('w3-hide');
			} else {
				if( dataVisible.solar.UV == 0 ) { $('[data-cmxData="UV"]').addClass('w3-hide');}
				if( dataVisible.solar.Solar == 0 ) { $('[data-cmxData="Solar"]').addClass('w3-hide');}
				if( dataVisible.solar.Sunshine == 0 ) { $('[data-cmxData="Sunshine"]').addClass('w3-hide')}
			}
			if( dataVisible.snow.Depth == 0) { $('[data-cmxData="Depth"]').addClass('w3-hide');}
			if( dataVisible.snow.Last24h == 0 ) { $('[data-cmxData="Last24h"]').addClass('w3-hide');}
		}
	})

	function OpenWebSocket(wsport) {
		if ('WebSocket' in window) {
			// Open the web socket
			ws = new WebSocket('ws://' + location.hostname + ':' + wsport + '/ws');
			ws.onopen = function () {
				// start the timer that checks for the last update
				lastUpdateTimer = setTimeout(updateTimeout, 60000);

				// send a message to stop the server timing out the connection
				keepAliveTimer = setInterval(function () {
					ws.send('Keep alive');
				}, 60000);
			};
			ws.onmessage = function (evt) {
				onMessage(evt);
			};

			// websocket is closed.
			ws.onclose = function () {
				alert('Connection is closed...');
			};

		} else {
			// The browser doesn't support WebSocket
			alert('WebSocket NOT supported by your Browser!');
		}
	}

	function updateTimeout() {
		// Change the icon on the last update to show that there has been no update for a while
		$('#LastUpdateIcon').attr('src', 'img/red.png');
	}

	function onMessage(evt) {
		let data = JSON.parse(evt.data);

		updateDisplay(data);
		if (debug) {
			showData(data);
		}
	}

	function formatTime() {
		let d = new Date();
		let ampm = $('#LastDataRead').text().indexOf(' ') > -1
		let hr = d.getHours();
		let hrs = '';
		if (ampm) {
			if (hr > 12) hr -= 12;
			if (hr === 0) hr = 12;
			hrs = '' + hr;
		} else {
			hrs = ('' + hr).padStart(2, '0');
		}
		let tim = hrs + ':' + ('' + d.getMinutes()).padStart(2, '0') + ':' + ('' + d.getSeconds()).padStart(2, '0')
		if (ampm) {
			tim += d.getHours() < 12 ? ' AM' : ' PM';
		}
		return tim;
	}

	//	Done by Neil
	function formatDateTime( aTime ) {
		var d = new Date( aTime );
		var tim;
		tim = ('' + d.getHours()).padStart(2,'0') + ':' + ('' + d.getMinutes()).padStart(2,'0') + ' on ';
		tim += d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear();

		return tim;
	}

	function updateDisplay(data) {
		// restart the timer that checks for the last update
		window.clearTimeout(lastUpdateTimer);
		lastUpdateTimer = setTimeout(updateTimeout, 60000);

		if ($('#LastUpdateIcon').attr('src') != 'img/green.png') {
			$('#LastUpdateIcon').attr('src', 'img/green.png');
		}

		let dataStopped = data.DataStopped;

		if (dataStopped) {
			if ($('#DataStoppedIcon').attr('src') != 'img/red.png') {
				$('#DataStoppedIcon').attr('src', 'img/red.png');
			}
		} else if ($('#DataStoppedIcon').attr('src') != 'img/green.png') {
			$('#DataStoppedIcon').attr('src', 'img/green.png');
		}

		// Get the keys from the object and set
		// the element with the same id to the value
		Object.keys(data).forEach(function (key) {
			let id = '#' + key;

			if (key.indexOf('Alarm') == -1) {
				if ($(id).length) {
					$(id).text(data[key]);
				}
			}
		});

		$('.WindUnit').text(data.WindUnit);
		$('.PressUnit').text(data.PressUnit);
		$('.TempUnit').text(data.TempUnit);
		$('.RainUnit').text(data.RainUnit);
		$('.WindRunUnit').text( data.WindUnit.slice(0, -2) );

		//Modified by Neil
		var tmpTrend = Number(data.TempTrend.replace(',','.'));
		if (tmpTrend === 0 && $('#TempTrendImg').attr('src') != 'img/steady.png') {
			$('#TempTrendImg').attr('src', 'img/steady.png');
		} else if (tmpTrend > 0  && $('#TempTrendImg').attr('src') != 'img/up.png') {
			$('#TempTrendImg').attr('src', 'img/up.png');
		} else if (tmpTrend < 0 && $('#TempTrendImg').attr('src') != 'img/down.png') {
			$('#TempTrendImg').attr('src', 'img/down.png');
		}

		tmpTrend = Number(data.PressTrend.replace(',','.'));
		if (tmpTrend == 0 && $('#PressTrendImg').attr('src') != 'img/steady.png') {
			$('#PressTrendImg').attr('src', 'img/steady.png');
		} else if (tmpTrend > 0 && $('#PressTrendImg').attr('src') != 'img/up.png') {
			$('#PressTrendImg').attr('src', 'img/up.png');
		} else if (tmpTrend < 0 && $('#PressTrendImg').attr('src') != 'img/down.png') {
			$('#PressTrendImg').attr('src', 'img/down.png');
		}

		//	Added by Neil
		var curRainRate = Number(data.RainRate.replace(',','.'));
		if (curRainRate > 0) {
			if (curRainRate < 5 && $('#RainRateImg').attr('src') != 'img/rain1.png') {
				$('#RainRateImg').attr('src', 'img/rain1.png');
			} else if (curRainRate < 10 && $('#RainRateImg').attr('src') != 'img/rain2.png') {
				$('#RainRateImg').attr('src', 'img/rain2.png');
			} else if (curRainRate >= 10 && $('#RainRateImg').attr('src') != 'img/rain3.png') {
				$('#RainRateImg').attr('src', 'img/rain3.png');
			}
		}  else if ($('#RainRateImg').attr('src') != 'img/rain0.png') {
			$('#RainRateImg').attr('src', 'img/rain0.png');
		}

		if (data.Bearing == 0) {
			$('#BearingCP').html('-');
		} else {
			$('#BearingCP').html(cp[Math.floor(((parseInt(data.Bearing) + 11) / 22.5) % 16)]);
		}
		if (data.Avgbearing == 0) {
			$('#AvgbearingCP').html('-');
		} else {
			$('#AvgbearingCP').html(cp[Math.floor(((parseInt(data.Avgbearing) + 11) / 22.5) % 16)]);
		}
		if (data.HighGustBearingToday === 0) {
			$('#GustBearingCP').html('-');
		} else {
			$('#GustBearingCP').html(  cp[Math.floor(((parseInt(data.HighGustBearingToday) + 11) / 22.5) % 16)] );
		}

		$('#LastRainTip').html(formatDateTime( data.LastRainTipISO ));

		let lastupdatetime = new Date();
		$('#lastupdatetime').text(formatTime());
	}

	let pad = function (x) {
		return x < 10 ? '0' + x : x;
	};

	let ticktock = function () {
		let d = new Date();
		$('.digiclock').text(formatTime());
	};

	function doAjaxUpdate() {
		$.ajax({
			url: "/api/data/currentdata",
			dataType: "json",
			success: function (data) {
				updateDisplay(data);
			}
		});
	}

	if (useWebSockets) {
		// Obtain the websockets port and open the connection
		$.ajax({
			url: '/api/info/wsport.json',
			dataType: 'json',
			success: function (result) {
				OpenWebSocket(result.wsport);
			}
		});
	} else {
		// use Ajax
		doAjaxUpdate();

		// start the timer that checks for the last update
		lastUpdateTimer = setTimeout(updateTimeout, 60000);

		// start the timer for the display updates
		setInterval(doAjaxUpdate, updateInterval * 1000);
	}

	// Get the station name - only do this on page load
	$.ajax({
		url: '/api/tags/process.json?locationJsEnc',
		dataType: 'json',
		success: function (result) {
			$('#StationName').html(result.locationJsEnc);
		}
	});

	ticktock();

	// Calling ticktock() every 1 second
	setInterval(ticktock, 1000);

});

let showData = function( data) {
	$('#availableData').removeClass('w3-hide');
	$('#availableData').html( JSON.stringify( data ).replaceAll(',',', '));
};
