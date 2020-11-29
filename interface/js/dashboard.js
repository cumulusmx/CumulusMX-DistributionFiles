// Configuration section
let useWebSockets = true; // set to false to use Ajax updating
let updateInterval = 3;   // update interval in seconds, if Ajax updating is used
// End of configuration section

let alarmSettings;
let alarmTranslate = {
    AlarmGust: 'gustAbove',
    AlarmHighPress: 'pressAbove',
    AlarmHighTemp: 'tempAbove',
    AlarmLowPress: 'pressBelow',
    AlarmLowTemp: 'tempBelow',
    AlarmPressDn: 'pressChange',
    AlarmPressUp: 'pressChange',
    AlarmRain: 'rainAbove',
    AlarmRainRate: 'rainRateAbove',
    AlarmSensor: 'contactLost',
    AlarmTempDn: 'tempChange',
    AlarmTempUp: 'tempChange',
    AlarmWind: 'windAbove',
    AlarmData: 'dataStopped',
    AlarmBattery: 'batteryLow',
    AlarmSpike: 'spike'
};
let alarmState = {
    AlarmGust: false,
    AlarmHighPress: false,
    AlarmHighTemp: false,
    AlarmLowPress: false,
    AlarmLowTemp: false,
    AlarmPressDn: false,
    AlarmPressUp: false,
    AlarmRain: false,
    AlarmRainRate: false,
    AlarmSensor: false,
    AlarmTempDn: false,
    AlarmTempUp: false,
    AlarmWind: false,
    AlarmData: false,
    AlarmBattery: false,
    AlarmSpike: false
}
let alarmDisplay = {
    AlarmGust: 'Wind gust above',
    AlarmHighPress: 'Pressure above',
    AlarmHighTemp: 'Temperature above',
    AlarmLowPress: 'Pressure below',
    AlarmLowTemp: 'Temperature below',
    AlarmPressDn: 'Pressure decrease >',
    AlarmPressUp: 'Pressure increase >',
    AlarmRain: 'Rain above',
    AlarmRainRate: 'Rain Rate above',
    AlarmSensor: 'Sensor contact lost',
    AlarmTempDn: 'Temperature decrease >',
    AlarmTempUp: 'Temperature increase >',
    AlarmWind: 'Average wind speed above',
    AlarmData: 'Data Stopped',
    AlarmBattery: 'Battery Low',
    AlarmSpike: 'Data Spike'
};
let playList = [];

$(document).ready(function () {

    let lastUpdateTimer, ws;

    let audioElement = document.createElement('audio');

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
        // Create and show the notification
        let img = '/img/logo30.png';
        let title = 'Cumulus MX Alarm';
        if ((text.match(/\n/g)).length > 1) {
            title += 's';
        }
        let notification = new Notification(title, { body: text, icon: img });
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
        $('#LastUpdateIcon').attr('src', 'img/down.png');
    }

    function onMessage(evt) {
        let data = JSON.parse(evt.data);

        updateDisplay(data);
    }

    function updateDisplay(data) {
        // restart the timer that checks for the last update
        window.clearTimeout(lastUpdateTimer);
        lastUpdateTimer = setTimeout(updateTimeout, 60000);

        $('#LastUpdateIcon').attr('src', 'img/up.png');

        let dataStopped = data.DataStopped;
        // Add an alarm value for dataStopped
        data.AlarmData = data.DataStopped;

        if (dataStopped) {
            $('#DataStoppedIcon').attr('src', 'img/down.png');
        } else {
            $('#DataStoppedIcon').attr('src', 'img/up.png');
        }


        // Firefox gets arsy about multiple notifications so roll them up into one
        let sendNotification = false;
        let notificationMessage = "";

        // Get the keys from the object and set
        // the element with the same id to the value
        Object.keys(data).forEach(function (key) {
            let id = '#' + key;
            if (key.indexOf('Alarm') == -1) {
                if ($(id).length) {
                    $(id).text(data[key]);
                }
            } else if (alarmSettings[alarmTranslate[key] + 'Enabled']) {
                // alarm data
                if (data[key]) {  // alarm set
                    $(id).removeClass('indicatorOff').addClass('indicatorOn');
                    if (!alarmState[key]) {
                        // make a sound?
                        if (alarmSettings[alarmTranslate[key] + 'SoundEnabled']) {
                            let sndFile = 'sounds/'+ alarmSettings[alarmTranslate[key] + 'Sound']
                            playList.push(new Audio(sndFile));
                        }
                        if (alarmSettings[alarmTranslate[key] + 'Notify']) {
                            sendNotification = true;
                            let message = '‣ ' + alarmDisplay[key];
                            if (alarmTranslate[key] + 'Val' in alarmSettings) {
                                message += ' ' + alarmSettings[alarmTranslate[key] + 'Val'];
                            }
                            console.log('Notify: ' + message);
                            notificationMessage += message + "\n";
                        }
                        alarmState[key] = true;
                    }
                } else {
                    $(id).removeClass('indicatorOn').addClass('indicatorOff');
                    alarmState[key] = false;
                }
            }
        });

        if (sendNotification) {
            createNotification(notificationMessage);
        }

        playSnd();

        $('.WindUnit').text(data.WindUnit);
        $('.PressUnit').text(data.PressUnit);
        $('.TempUnit').text(data.TempUnit);
        $('.RainUnit').text(data.RainUnit);

        if (data.TempTrend.replace(',','.') < 0) {
            $('#TempTrendImg').attr('src', 'img/down-small.png');
        } else {
            $('#TempTrendImg').attr('src', 'img/up-small.png');
        }

        if (data.PressTrend.replace(',','.') < 0) {
            $('#PressTrendImg').attr('src', 'img/down-small.png');
        } else {
            $('#PressTrendImg').attr('src', 'img/up-small.png');
        }

        wrData = data.WindRoseData.split(',');
        // convert array to numbers
        for (let i = 0; i < wrData.length; i++) {
            wrData[i] = +wrData[i];
        }
        data.WindRoseData = wrData;

        gauges.processData(convertJson(data));


        let lastupdatetime = new Date();
        let hours = pad(lastupdatetime.getHours());
        let minutes = pad(lastupdatetime.getMinutes());
        let seconds = pad(lastupdatetime.getSeconds());

        let time = [hours, minutes, seconds].join(':');

        $('#lastupdatetime').text(time);
    }

    let pad = function (x) {
        return x < 10 ? '0' + x : x;
    };

    let ticktock = function () {
        let d = new Date();

        let h = pad(d.getHours());
        let m = pad(d.getMinutes());
        let s = pad(d.getSeconds());

        let current_time = [h, m, s].join(':');

        $('.digiclock').text(current_time);

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
            url: "api/data/currentdata",
            dataType: "json",
            success: function (data) {
                updateDisplay(data);
            }
        });
    }

    if (useWebSockets) {
        // Obtain the websockets port and open the connection
        $.ajax({
            url: 'api/settings/wsport.json',
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

    // Get the alarm settings - only do this on page load
    $.ajax({
        url: 'api/settings/alarms.json',
        dataType: 'json',
        success: function (result) {
            let data = result.data;
            let playSnd = false;
            let notify = false;

            // save the setting for later
            alarmSettings = data;
            // set enabled alarm indicators to the off state
            if (data.tempBelowEnabled) {
                $('#AlarmLowTemp').addClass('indicatorOff');
                if (data.tempBelowSoundEnabled) {
                    playSnd = true;
                }
                if (data.tempBelowNotify) {
                    notify = true;
                }
            }
            if (data.tempAboveEnabled) {
                $('#AlarmHighTemp').addClass('indicatorOff');
                if (data.tempAboveSoundEnabled) {
                    playSnd = true;
                }
                if (data.tempAboveNotify) {
                    notify = true;
                }
             }
            if (data.tempChangeEnabled) {
                $('#AlarmTempUp').addClass('indicatorOff');
                $('#AlarmTempDn').addClass('indicatorOff');
                if (data.tempChangeSoundEnabled) {
                    playSnd = true;
                }
                if (data.tempChangeNotify) {
                    notify = true;
                }
            }
            if (data.pressBelowEnabled) {
                $('#AlarmLowPress').addClass('indicatorOff');
                if (data.pressBelowSoundEnabled) {
                    playSnd = true;
                }
                if (data.pressBelowNotify) {
                    notify = true;
                }
           }
            if (data.pressAboveEnabled) {
                $('#AlarmHighPress').addClass('indicatorOff');
                if (data.pressAboveSoundEnabled) {
                    playSnd = true;
                }
                if (data.pressAboveNotify) {
                    notify = true;
                }
            }
            if (data.pressChangeEnabled) {
                $('#AlarmPressUp').addClass('indicatorOff');
                $('#AlarmPressDn').addClass('indicatorOff');
                if (data.pressChangeSoundEnabled) {
                    playSnd = true;
                }
                if (data.pressChangeNotify) {
                    notify = true;
                }
            }
            if (data.rainAboveEnabled) {
                $('#AlarmRain').addClass('indicatorOff');
                if (data.rainAboveSoundEnabled) {
                    playSnd = true;
                }
                if (data.rainAboveNotify) {
                    notify = true;
                }
            }
            if (data.rainRateAboveEnabled) {
                $('#AlarmRainRate').addClass('indicatorOff');
                if (data.rainRateAboveSoundEnabled) {
                    playSnd = true;
                }
                if (data.rainAboveNotify) {
                    notify = true;
                }
            }
            if (data.gustAboveEnabled) {
                $('#AlarmGust').addClass('indicatorOff');
                if (data.gustAboveSoundEnabled) {
                    playSnd = true;
                }
                if (data.gustAboveNotify) {
                    notify = true;
                }
            }
            if (data.windAboveEnabled) {
                $('#AlarmWind').addClass('indicatorOff');
                if (data.windAboveSoundEnabled) {
                    playSnd = true;
                }
                if (data.windAboveNotify) {
                    notify = true;
                }
            }
            if (data.contactLostEnabled) {
                $('#AlarmSensor').addClass('indicatorOff');
                if (data.contactLostSoundEnabled) {
                    playSnd = true;
                }
                if (data.contactLostNotify) {
                    notify = true;
                }
            }
            if (data.dataStoppedEnabled) {
                $('#AlarmData').addClass('indicatorOff');
                if (data.dataStoppedSoundEnabled) {
                    playSnd = true;
                }
                if (data.dataStoppedNotify) {
                    notify = true;
                }
            }
            if (data.batteryLowEnabled) {
                $('#AlarmBattery').addClass('indicatorOff');
                if (data.batteryLowSoundEnabled) {
                    playSnd = true;
                }
                if (data.batteryLowNotify) {
                    notify = true;
                }
            }
            if (data.spikeEnabled) {
                $('#AlarmSpike').addClass('indicatorOff');
                if (data.spikeSoundEnabled) {
                    playSnd = true;
                }
                if (data.spikeSoundNotify) {
                    notify = true;
                }
            }
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
        }
    });

    ticktock();

    // Calling ticktock() every 1 second
    setInterval(ticktock, 1000);
});
