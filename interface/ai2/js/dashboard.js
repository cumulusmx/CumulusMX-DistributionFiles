// Last modified: 2024/09/28 12:09:33

// Configuration section
let useWebSockets = true; // set to false to use Ajax updating
let updateInterval = 3;   // update interval in seconds, if Ajax updating is used
// End of configuration section

let alarmSettings = {};

let alarmState = {};

let playList = [];

$(document).ready(function () {

    let lastUpdateTimer, ws;

    let audioElement = document.createElement('audio');

    //	Added by NEIL
	$.ajax({
		url: '/api/settings/displayoptions.json',
		dataType: 'json',
		success: function (results) {
			var dataVisible = results.DataVisibility;
            if( dataVisible.solar.Solar == 0 && dataVisible.solar.UV == 0 ){
                //  Hide ethe panel
                $('[data-cmxData-Rad]').addClass('w3-hide');
            } else {
                if( dataVisible.solar.Solar == 0 ) { $('[data-cmxData-Solar]').addClass('w3-hide');}
                if( dataVisible.solar.UV == 0)  { $('[data-cmxData-UV]').addClass('w3-hide');}
            }
        }
    })

    function playSnd() {
        if (playList.length) {
            playList[0].addEventListener('ended', function () {
                playList.shift();
                playSnd()
            });
            let promise = playList[0].play();
            if (promise !== undefined) {
                promise.then(function(_){}).catch(function(_error) {
                    // Autoplay prevented, ask user to enable it
                    //alert("hi");
                    $('#bt').addClass('show').click(function () {
                        //audioElement.play();
                        $('#bt').removeClass('show');
                    })
                })
            }
        }
    }

    function createNotification(text) {
        // Create and show the notification, or alert if notifications are not supported by the browser

        let img = '/img/logo30.png';
        let title = 'Cumulus MX Alarm';
        if ((text.match(/\n/g)).length > 1) {
            title += 's';
        }

        if (!("Notification" in window)) {
            // Check if the browser supports notifications
            alert(text);
        } else if (Notification.permission === "granted") {
            // Check whether notification permissions have already been granted;
            // if so, create a notification
            let notification = new Notification(title, { body: text, icon: img });
        } else if (Notification.permission !== "denied") {
            // We need to ask the user for permission
            Notification.requestPermission().then((permission) => {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    let notification = new Notification(title, { body: text, icon: img });
                }
            });
        }
    }

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

    function updateDisplay(data) {
        // restart the timer that checks for the last update
        window.clearTimeout(lastUpdateTimer);
        lastUpdateTimer = setTimeout(updateTimeout, 60000);

        if ($('#LastUpdateIcon').attr('src') != 'img/green.png') {
            $('#LastUpdateIcon').attr('src', 'img/green.png');
        }


        if (data.DataStopped) {
            if ($('#DataStoppedIcon').attr('src') != 'img/red.png') {
                $('#DataStoppedIcon').attr('src', 'img/red.png');
            }
        } else if ($('#DataStoppedIcon').attr('src') != 'img/green.png'){
            $('#DataStoppedIcon').attr('src', 'img/green.png');
        }

        // Firefox gets arsy about multiple notifications so roll them up into one
        let sendNotification = false;
        let notificationMessage = "";

        // Get the keys from the object and set
        // the element with the same id to the value
        Object.keys(data).forEach(function (key) {
            let id = '#' + key;
            if (key == 'Alarms') {
                data[key].forEach(function (alarm) {
                    let id = '#' + alarm.id;

                    // set the indicator state
                    if (alarm.triggered && alarmState[alarm.id] == false) {
                        alarmState[alarm.id] = true;

                        // set the indicator
                        $(id).removeClass('indicatorOff ow-LED-off').addClass('indicatorOn ow-LED-on');

                        // make a sound?
                        if (alarmSettings[alarm.id].SoundEnabled) {
                            let sndFile = 'sounds/'+ alarmSettings[alarm.id].Sound;
                            playList.push(new Audio(sndFile));
                        }

                        // notify?
                        if (alarmSettings[alarm.id].Notify) {
                            sendNotification = true;
                            let message = '‣ ' + alarmSettings[alarm.id].Name;

                            console.log('Notify: ' + message);
                            notificationMessage += message + "\n";
                        }

                        // upgrade?
                        if (alarm.Id == 'AlarmUpgrade') {
                            $('#' + alarm.Id).parent().wrap('<a href="https://cumulus.hosiene.co.uk/viewtopic.php?f=40&t=17887&start=9999#bottom" target="_blank"></a>');
                        }
                   } else if (!alarm.triggered && alarmState[alarm.id] == true) {
                        alarmState[key] = false;
                        $(id).removeClass('indicatorOn ow-LED-on').addClass('indicatorOff ow-LED-off');
                    }
                });
            } else {
                if ($(id).length) {
                    $(id).text(data[key]);
                }
            }
        });

        if (sendNotification) {
            createNotification(notificationMessage);
        }

        playSnd();

        $('.WindUnit').text(data.WindUnit);
        $('.WindRunUnit').text(data.WindRunUnit);
        $('.PressUnit').text(data.PressUnit);
        $('.TempUnit').text(data.TempUnit);
        $('.RainUnit').text(data.RainUnit);

        //Modified by Neil
        var tmpTrend = Number(data.TempTrend.replace(',','.'));
        if (tmpTrend === 0 && $('#TempTrendImg').attr('src') != 'img/steady.png') {
            $('#TempTrendImg').attr('src', 'img/steady.png');
        } else if (tmpTrend > 0 && $('#TempTrendImg').attr('src') != 'img/up.png') {
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

        wrData = data.WindRoseData.split(',');
        // convert array to numbers
        for (let i = 0; i < wrData.length; i++) {
            wrData[i] = +wrData[i];
        }
        data.WindRoseData = wrData;

        gauges.processData(convertJson(data));

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

    // Convert from MX format to realtimeGauges.txt format
    function convertJson(inp) {
        return {
            temp: inp.OutdoorTemp.toString(),
            tempTL: inp.LowTempToday.toString(),
            tempTH: inp.HighTempToday.toString(),
            intemp: inp.IndoorTemp.toString(),
            dew: inp.OutdoorDewpoint.toString(),
            dewpointTL: inp.LowDewpointToday.toString(),
            dewpointTH: inp.HighDewpointToday.toString(),
            apptemp: inp.AppTemp.toString(),
            apptempTL: inp.LowAppTempToday.toString(),
            apptempTH: inp.HighAppTempToday.toString(),
            wchill: inp.WindChill.toString(),
            wchillTL: inp.LowWindChillToday.toString(),
            heatindex: inp.HeatIndex.toString(),
            heatindexTH: inp.HighHeatIndexToday.toString(),
            humidex: inp.Humidex.toString(),
            wlatest: inp.WindLatest.toString(),
            wspeed: inp.WindAverage.toString(),
            wgust: inp.Recentmaxgust.toString(),
            wgustTM: inp.HighGustToday.toString(),
            bearing: inp.Bearing.toString(),
            avgbearing: inp.Avgbearing.toString(),
            press: inp.Pressure.toString(),
            pressTL: inp.LowPressToday.toString(),
            pressTH: inp.HighPressToday.toString(),
            pressL: inp.AlltimeLowPressure.toString(),
            pressH: inp.AlltimeHighPressure.toString(),
            rfall: inp.RainToday.toString(),
            rrate: inp.RainRate.toString(),
            rrateTM: inp.HighRainRateToday.toString(),
            hum: inp.OutdoorHum.toString(),
            humTL: inp.LowHumToday.toString(),
            humTH: inp.HighHumToday.toString(),
            inhum: inp.IndoorHum.toString(),
            SensorContactLost: "0",
            forecast: (inp.Forecast || "n/a").toString(),
            tempunit: inp.TempUnit.substr(inp.TempUnit.length - 1),
            windunit: inp.WindUnit,
            pressunit: inp.PressUnit,
            rainunit: inp.RainUnit,
            temptrend: inp.TempTrend.toString(),
            TtempTL: inp.LowTempTodayTime,
            TtempTH: inp.HighTempTodayTime,
            TdewpointTL: inp.LowDewpointTodayTime,
            TdewpointTH: inp.HighDewpointTodayTime,
            TapptempTL: inp.LowAppTempTodayTime,
            TapptempTH: inp.HighAppTempTodayTime,
            TwchillTL: inp.LowWindChillTodayTime,
            TheatindexTH: inp.HighHeatIndexTodayTime,
            TrrateTM: inp.HighRainRateTodayTime,
            ThourlyrainTH: inp.HighHourlyRainTodayTime,
            LastRainTipISO: inp.LastRainTipISO,
            hourlyrainTH: inp.HighHourlyRainToday.toString(),
            ThumTL: inp.LowHumTodayTime,
            ThumTH: inp.HighHumTodayTime,
            TpressTL: inp.LowPressTodayTime,
            TpressTH: inp.HighPressTodayTime,
            presstrendval: inp.PressTrend.toString(),
            Tbeaufort: inp.HighBeaufortToday,
            TwgustTM: inp.HighGustTodayTime,
            windTM: inp.HighWindToday.toString(),
            bearingTM: inp.HighGustBearingToday.toString(),
            timeUTC: "",
            BearingRangeFrom10: inp.BearingRangeFrom10.toString(),
            BearingRangeTo10: inp.BearingRangeTo10.toString(),
            UV: inp.UVindex.toString(),
            UVTH: inp.HighUVindexToday.toString(),
            SolarRad: inp.SolarRad.toString(),
            SolarTM: inp.HighSolarRadToday.toString(),
            CurrentSolarMax: inp.CurrentSolarMax.toString(),
            domwinddir: inp.DominantWindDirection.toString(),
            WindRoseData: inp.WindRoseData,
            windrun: inp.WindRunToday.toString(),
            cloudbasevalue: "",
            cloudbaseunit: "",
            version: "",
            build: "",
            ver: "12"
        };
    }

    function doAjaxUpdate() {
        $.ajax({
            url: "/api/data/currentdata",
            dataType: "json"
        })
         .done(function (data) {
            updateDisplay(data);
        });
    }

    if (useWebSockets) {
        // Obtain the websockets port and open the connection
        $.ajax({
            url: '/api/info/wsport.json',
            dataType: 'json'
        })
        .done(function (result) {
            OpenWebSocket(result.wsport);
        });
    } else {
        // use Ajax
        doAjaxUpdate();

        // start the timer that checks for the last update
        lastUpdateTimer = setTimeout(updateTimeout, 60000);

        // start the timer for the display updates
        setInterval(doAjaxUpdate, updateInterval * 1000);
    }

    // Get the alarm settings - only do this on page load
    $.ajax({
        url: '/api/info/alarms.json',
        dataType: 'json'
    })
    .done(function (result) {
        let playSnd = false;
        let notify = false;

        result.forEach(function (alarm) {
            // save the setting for later
            alarmSettings[alarm.Id] = alarm;
            alarmState[alarm.Id] = false;

            if(alarm.Id.startsWith('AlarmUser')) {
                //console.log(alarm.Id);
                $('#alarms').append('<div ><div class="ow-led ' + CMXConfig.LEDs.userAlarm + '" id="' + alarm.Id + '"></div>' + alarm.Name + '</div>');
            } else {
                $('#alarms').append('<div ><div class="ow-led ' + CMXConfig.LEDs.defAlarm + '" id="' + alarm.Id + '"></div>' + alarm.Name + '</div>');
            }

            if (alarm.SoundEnabled) {
                playSnd = true;
            }
            if (alarm.Notify) {
                notify = true;
            }
        });

        if (playSnd) {
        }

        if (notify) {
            // Request notification permission
            function handlePermission(permission) {
                // Whatever the user answers, we make sure Chrome stores the information
                if (!('permission' in Notification)) {
                    Notification.permission = permission;
                }
            }

            function checkNotificationPromise() {
                try {
                    Notification.requestPermission().then();
                } catch(e) {
                    return false;
                }
                return true;
            }

            if (!('Notification' in window)) {
                console.log("This browser does not support notifications.");
                } else {
                    if (checkNotificationPromise()) {
                        Notification.requestPermission()
                        .then((permission) => {
                            handlePermission(permission);
                        })
                    } else {
                        Notification.requestPermission(function(permission) {
                        handlePermission(permission);
                    });
                }
            }
        }
    });

    // Get the station name - only do this on page load
    $.ajax({
        url: '/api/tags/process.json?locationJsEnc',
        dataType: 'json'
    })
    .done(function (result) {
        $('#StationName').html(result.locationJsEnc);
    });

    ticktock();

    // Calling ticktock() every 1 second
    setInterval(ticktock, 1000);

    //	Calling DavisStats every minute
    getStation();
});

//	Added by Neil
let DavisStats = function() {
    $.ajax({
        url: '/api/tags/process.txt',
        dataType: 'json',
        type: 'POST',
        data: DavisData
    })
    .done(function(data) {
        //console.log(data['DavisTotalPacketsReceived']);
        var batteries = data.txbattery.split(' ');
        var packetPercent = 0;
        if (data.DavisTotalPacketsReceived > 0) {
            packetPercent = Math.round(data.DavisTotalPacketsMissed / data.DavisTotalPacketsReceived * 1000)/10;
        }
        $('#DavisPacketsReceived').html(data.DavisTotalPacketsReceived);
        $('#DavisPacketsMissed').html(data.DavisTotalPacketsMissed);
        $('#DavisSuccess').html(packetPercent + '%');
        $('#DavisMaxInARow').html(data.DavisMaxInARow);
        $('#DavisCRCErrors').html(data.DavisNumCRCerrors);
        $('#ConsoleBattery').html(data.battery + 'v');

        for (var i = 0; i < 8; i++) {
            if (batteries[i].includes('NA')) {
                $('#DavisXmt' + i).addClass('w3-hide');
                $('#DavisPct' + i).addClass('w3-hide');
                $('#DavisRssi' + i).addClass('w3-hide');
            } else {
                $('#DavisXmt' + i).removeClass('w3-hide');
                $('#DavisPct' + i).removeClass('w3-hide');
                $('#DavisRssi' + i).removeClass('w3-hide');
                $('#DavisTXBattery' + i).html(batteries[i].slice(2,4).toUpperCase());
                $('#DavisPercentReceived' + i).html(data['DavisPercentReceived' + i]);
                $('#DavisTxRssi' + i).html(data['DavisTxRssi' + i]);
            }
        }
    })
    .always(function() {
        setTimeout(DavisStats, 60000);
    });
}

let getStation = function() {
    var reqData = 'stationId';
    $.ajax({
        url: '/api/tags/process.json?' + reqData,
        //dataType: 'json'
    })
    .done(function(result) {
        if (result.stationId == 1 || result.stationId == 11) {
            if (result.stationId == 1) {
                $('.davisWLL').addClass('w3-hide');

            } else { // WLL = 11
                $('.davisVP2').addClass('w3-hide');
            }

            DavisStats();
        } else {
            //	Need to unhide pane, button
            $('#Davis').addClass('w3-hide');
            $('#DavisPanel').addClass('w3-hide');
        }
    })
}

const DavisData = '{' +
    '"DavisTotalPacketsReceived": <#DavisTotalPacketsReceived>, ' +
    '"DavisTotalPacketsMissed": <#DavisTotalPacketsMissed>, ' +
    '"DavisMaxInARow": <#DavisMaxInARow>, ' +
    '"DavisNumCRCerrors": <#DavisNumCRCerrors>, ' +
    '"txbattery": "<#txbattery>", ' +
    '"battery": "<#battery rc=y>", ' +
    '"DavisPercentReceived0": <#DavisReceptionPercent tx=1>, ' +
    '"DavisPercentReceived1": <#DavisReceptionPercent tx=2>, ' +
    '"DavisPercentReceived2": <#DavisReceptionPercent tx=3>, ' +
    '"DavisPercentReceived3": <#DavisReceptionPercent tx=4>, ' +
    '"DavisPercentReceived4": <#DavisReceptionPercent tx=5>, ' +
    '"DavisPercentReceived5": <#DavisReceptionPercent tx=6>, ' +
    '"DavisPercentReceived6": <#DavisReceptionPercent tx=7>, ' +
    '"DavisPercentReceived7": <#DavisReceptionPercent tx=8>, ' +
    '"DavisTxRssi0": <#DavisTxRssi tx=1>, ' +
    '"DavisTxRssi1": <#DavisTxRssi tx=2>, ' +
    '"DavisTxRssi2": <#DavisTxRssi tx=3>, ' +
    '"DavisTxRssi3": <#DavisTxRssi tx=4>, ' +
    '"DavisTxRssi4": <#DavisTxRssi tx=5>, ' +
    '"DavisTxRssi5": <#DavisTxRssi tx=6>, ' +
    '"DavisTxRssi6": <#DavisTxRssi tx=7>, ' +
    '"DavisTxRssi7": <#DavisTxRssi tx=8>' +
    '}';