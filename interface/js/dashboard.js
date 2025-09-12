// Last modified: 2025/09/12 10:10:22

// Configuration section
let updateInterval = 3;   // update interval in seconds, if Ajax updating is used
// End of configuration section

let alarmSettings = {};

let alarmState = {};

let playList = [];

let timeFormat = {};

$(document).ready(function () {

    let lastUpdateTimer, ws;

    let audioElement = document.createElement('audio');

    function playSound() {
        if (playList.length) {
            playList[0].addEventListener('ended', function () {
                playList.shift();
                playSound()
            });
            let promise = playList[0].play();
            if (promise !== undefined) {
                log('Playing sound');
                promise.then(function(_){}).catch(function(_error) {
                    // Autoplay prevented, ask user to enable it
                    //alert('hi');
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
        let title = '{{CUMULUS_MX_ALARM}}';
        if ((text.match(/\n/g)).length > 1) {
            title += 's';
        }

        if (!('Notification' in window)) {
            // Check if the browser supports notifications
            alert(text);
        } else if (Notification.permission === 'granted') {
            // Check whether notification permissions have already been granted;
            // if so, create a notification
            let notification = new Notification(title, { body: text, icon: img });
        } else if (Notification.permission !== 'denied') {
            // We need to ask the user for permission
            Notification.requestPermission().then((permission) => {
                // If the user accepts, let's create a notification
                if (permission === 'granted') {
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
        $('#LastUpdateIcon').attr('src', 'img/down.png');
    }

    function onMessage(evt) {
        let data = JSON.parse(evt.data);
        updateDisplay(data);
    }

    function formatTime() {
        let d = new Date();
        let hr = d.getHours();
        let hrs = '';
        if (timeFormat.hours == 12) {
            if (hr > 12) hr -= 12;
            if (hr === 0) hr = 12;
            hrs = '' + hr;
        } else {
            hrs = ('' + hr).padStart(2, '0');
        }
        let tim = hrs + ':' + ('' + d.getMinutes()).padStart(2, '0') + ':' + ('' + d.getSeconds()).padStart(2, '0')
        if (timeFormat.hours == 12) {
            tim += ' ' + (d.getHours() < 12 ? timeFormat.am : timeFormat.pm);
        }
        return tim;
    }

    function updateDisplay(data) {
        // restart the timer that checks for the last update
        window.clearTimeout(lastUpdateTimer);
        lastUpdateTimer = setTimeout(updateTimeout, 60000);

        if ($('#LastUpdateIcon').attr('src') != 'img/up.png') {
            $('#LastUpdateIcon').attr('src', 'img/up.png');
        }


        if (data.DataStopped) {
            if ($('#DataStoppedIcon').attr('src') != 'img/down.png') {
                $('#DataStoppedIcon').attr('src', 'img/down.png');
            }
        } else if ($('#DataStoppedIcon').attr('src') != 'img/up.png'){
            $('#DataStoppedIcon').attr('src', 'img/up.png');
        }

        // Firefox gets arsy about multiple notifications so roll them up into one
        let sendNotification = false;
        let notificationMessage = '';

        // Get the keys from the object and set
        // the element with the same id to the value
        Object.keys(data).forEach(function (key) {
            let id = '#' + key;
            if (key == 'Alarms') {
                data[key].forEach(function (alarm) {
                    let alarmtag = '#' + alarm.id;

                    // set the indicator state
                    if (alarm.triggered && alarmState[alarm.id] == false) {
                        log(alarm.id + ' Triggered');

                        alarmState[alarm.id] = true;

                        // set the indicator
                        $(alarmtag).removeClass('indicatorOff').addClass('indicatorOn');

                        // make a sound?
                        if (alarmSettings[alarm.id].SoundEnabled) {
                            log(alarm.id + ' Queueing sound')
                            let soundFile = 'sounds/'+ alarmSettings[alarm.id].Sound;
                            playList.push(new Audio(soundFile));
                        }

                        // notify?
                        if (alarmSettings[alarm.id].Notify) {
                            sendNotification = true;
                            let message = '‣ ' + alarmSettings[alarm.id].Name;

                            log(alarm.id + ' Notify: ' + message);
                            notificationMessage += message + "\n";
                        }

                        // upgrade?
                        if (alarm.Id == 'AlarmUpgrade') {
                            $(alarmtag).parent().wrap('<a href="https://cumulus.hosiene.co.uk/viewtopic.php?f=40&t=17887&start=9999#bottom" target="_blank"></a>');
                        } else {
                            $(alarmtag).on("click", function () {
                                log("User clicked: " + $(this)[0].id);
                                clearAlarm($(this)[0].id);
                            });
                        }
                    } else if (!alarm.triggered && alarmState[alarm.id] == true) {
                        log(alarm.id + ' Cleared');
                        alarmState[alarm.id] = false;
                        $(alarmtag).removeClass('indicatorOn').addClass('indicatorOff');
                        $(alarmtag).prop("onclick", null).off("click");
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

        playSound();

        $('.WindUnit').text(data.WindUnit);
        $('.PressUnit').text(data.PressUnit);
        $('.TempUnit').text(data.TempUnit);
        $('.RainUnit').text(data.RainUnit);

        var tmpTrend = Number(data.TempTrend.replace(',','.'));
        if (tmpTrend < 0 && $('#TempTrendImg').attr('src') != 'img/down-small.png') {
            $('#TempTrendImg').attr('src', 'img/down-small.png');
        } else if (tmpTrend > 0 && $('#TempTrendImg').attr('src') != 'img/up-small.png') {
            $('#TempTrendImg').attr('src', 'img/up-small.png');
        } else if (tmpTrend == 0 && $('#TempTrendImg').attr('src') != 'img/nochange-small.png') {
            $('#TempTrendImg').attr('src', 'img/nochange-small.png');
        }

        tmpTrend = Number(data.PressTrend.replace(',','.'));
        if (tmpTrend < 0 && $('#PressTrendImg').attr('src') != 'img/down-small.png') {
            $('#PressTrendImg').attr('src', 'img/down-small.png');
        } else if (tmpTrend > 0 && $('#PressTrendImg').attr('src') != 'img/up-small.png') {
            $('#PressTrendImg').attr('src', 'img/up-small.png');
        } else if (tmpTrend == 0 && $('#PressTrendImg').attr('src') != 'img/nochange-small.png') {
            $('#PressTrendImg').attr('src', 'img/nochange-small.png');
        }

        wrData = data.WindRoseData.split(',');
        // convert array to numbers
        for (let i = 0; i < wrData.length; i++) {
            wrData[i] = +wrData[i];
        }
        data.WindRoseData = wrData;

        gauges.processData(convertJson(data));

        $('#lastupdatetime').text(formatTime());
    }

    let pad = function (x) {
        return x < 10 ? '0' + x : x;
    };

    let log = function (x) {
        console.log(new Date().toISOString().slice(11,23) + ' ' + x);
    }

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
            SensorContactLost: '0',
            forecast: (inp.Forecast || 'n/a').toString(),
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
            timeUTC: '',
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
            cloudbasevalue: '',
            cloudbaseunit: '',
            version: '',
            build: '',
            ver: '12'
        };
    }

    function doAjaxUpdate() {
        $.ajax({
            url: '/api/data/currentdata',
            dataType: 'json'
        })
        .done(function (data) {
            updateDisplay(data);
        });
    }

    function clearAlarm(id) {
        $.ajax({
            url: '/api/utils/clearalarm.txt',
            type: 'POST',
            data: id,
            contentType: 'plain/text; charset=UTF-8'
        })
        .done(function(result) {
            if (result == "Cleared") {
                log(id + ' Cleared');
                alarmState[id] = false;
                let alarmtag = '#' + id;
                $(alarmtag).removeClass('indicatorOn').addClass('indicatorOff');
                $(alarmtag).prop("onclick", null).off("click");
            } else {
                log(id + ' error: ' + result);
            }
        });
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
            let alarmTag = 'Alarm' + alarm.Id;

            alarmSettings[alarmTag] = alarm;
            alarmState[alarmTag] = false;


            $('#alarms').append('<div style="display:inline-block"><span class="indicator indicatorOff" id="' + alarmTag + '"></span>&nbsp;' + alarm.Name.replace(' ', '&nbsp;') + '</div>');

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
                log('This browser does not support notifications.');
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

    // get the preferred time format
    $.ajax({
        url: '/api/info/timeformat.json',
        dataType: 'json'
    })
    .done(function (result) {
        timeFormat = result;
        ticktock();
    });

    // Obtain the websockets port and open the connection
    $.ajax({
        url: '/api/info/wsport.json',
        dataType: 'json'
    })
    .done(function (result) {
        if (result.UseWebSockets)
        {
            OpenWebSocket(result.wsport);
        } else {
            // use Ajax
            doAjaxUpdate();

            // start the timer that checks for the last update
            lastUpdateTimer = setTimeout(updateTimeout, 60000);

            // start the timer for the display updates
            setInterval(doAjaxUpdate, updateInterval * 1000);
        }
    });

    // Calling ticktock() every 1 second
    setInterval(ticktock, 1000);
});
