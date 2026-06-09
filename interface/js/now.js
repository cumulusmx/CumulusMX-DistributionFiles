// Last modified: 2026/06/03 09:40:13

// Configuration section
const updateInterval = 3;   // update interval in seconds, if Ajax updating is used
// End of configuration section


const availRes = $.getJSON({ url: '/api/graphdata/availabledata.json' });

$(document).ready(() => {
    let lastUpdateTimer, keepAliveTimer, ws;
    let cp = ['{{COMPASS_N}}', '{{COMPASS_NNE}}', '{{COMPASS_NE}}', '{{COMPASS_ENE}}', '{{COMPASS_E}}', '{{COMPASS_ESE}}', '{{COMPASS_SE}}', '{{COMPASS_SSE}}', '{{COMPASS_S}}', '{{COMPASS_SSW}}', '{{COMPASS_SW}}', '{{COMPASS_WSW}}', '{{COMPASS_W}}', '{{COMPASS_WNW}}', '{{COMPASS_NW}}', '{{COMPASS_NNW}}'];

    $('[id$=Table]').DataTable({
        'paging': false,
        'searching': false,
        'info': false,
        'ordering': false
    });

    availRes.done(function (avail) {
        if (avail.Temperature != undefined && avail.Temperature.length > 0) {
            if (!avail.Temperature.includes('Dew Point')) $('#DewPointRow').remove();
            if (!avail.Temperature.includes('Wind Chill')) $('#WindChillRow').remove();
            if (!avail.Temperature.includes('Apparent Temp')) $('#ApparentTempRow').remove();
            if (!avail.Temperature.includes('Feels Like')) $('#FeelsLikeRow').remove();
            if (!avail.Temperature.includes('Heat Index')) $('#HeatIndexRow').remove();
            if (!avail.Temperature.includes('Humidex')) $('#HumidexRow').remove();
            if (!avail.Temperature.includes('BGT')) { $('#BGTRow').remove(); $('#WBGTRow').remove(); }
            if (!avail.Temperature.includes('Indoor Temp')) $('#IndoorTempRow').remove();
        }
        if (avail.Humidity != undefined && avail.Humidity.length > 0) {
            if (!avail.Humidity.includes('Indoor Hum')) $('#IndoorHumRow').remove();
        }
        if (avail.Solar != undefined && avail.Solar.length > 0) {
            if (!avail.Solar.includes('Solar Rad')) { $('#SolarRadRow').remove(); $('#SunshineRow').remove(); }
            if (!avail.Solar.includes('UV Index')) $('#UVindexRow').remove();
        }
    });

    const OpenWebSocket = () => {
        if ('WebSocket' in window) {
            // Open the web socket
            ws = new WebSocket('/ws');
            ws.onopen = function() {
                // start the timer that checks for the last update
                lastUpdateTimer = setTimeout(updateTimeout, 60000);

                keepAliveTimer = setInterval(keepAlive, 60000);
            };
            ws.onmessage = function(evt) {
                onMessage(evt);
            };

            ws.onclose = function(evt) {
                onClose(evt);
            };

        } else {
            // The browser doesn't support WebSocket
            alert('WebSocket NOT supported by your Browser!');
        }
    };

    const updateTimeout = () => {
        // Change the icon on the last update to show that there has been no update for a while
        $('#LastUpdateIcon').attr('src', 'img/down.png');
    };

    const keepAlive = () => {
        // send a message to stop the server timing out the connection
        ws.send('Keep alive');
    };


    const onMessage = (evt) => {
        const data = JSON.parse(evt.data);

        updateDisplay(data);
    };

    const updateDisplay = (data) => {
        // restart the timer that checks for the last update
        window.clearTimeout(lastUpdateTimer);
        lastUpdateTimer = setTimeout(updateTimeout, 60000);

        // Get the keys from the object and set
        // the element with the same id to the value
        Object.keys(data).forEach(function(key) {
            var id = '#' + key;
            if ($(id).length) {
                $(id).text(data[key]);
            }
        });

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

        $('.WindUnit').text(data.WindUnit);
        $('.WindRunUnit').text(data.WindRunUnit);
        $('.PressUnit').text(data.PressUnit);
        $('.TempUnit').text(data.TempUnit);
        $('.RainUnit').text(data.RainUnit);

        var lastupdatetime = new Date();
        var hours = lastupdatetime.getHours();
        var minutes = lastupdatetime.getMinutes();
        var seconds = lastupdatetime.getSeconds();

        if (hours < 10) {
            hours = '0' + hours;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        if (seconds < 10) {
            seconds = '0' + seconds;
        }

        var time = hours + ':' + minutes + ':' + seconds;

        $('#lastupdatetime').text(time);
    };

    const onClose = () => {
        // websocket is closed.
        alert('Connection is closed...');
    };

    const doAjaxUpdate = () => {
        $.getJSON({
            url: '/api/data/currentdata'
        })
        .done(function (data) {
            updateDisplay(data);
        });
    };

    $.getJSON({
        url: '/api/info/wsport.json'
    })
    .done(function (result) {
        if (result.UseWebSockets) {
            OpenWebSocket();
        } else {
            // use Ajax
            doAjaxUpdate();

            // start the timer that checks for the last update
            lastUpdateTimer = setTimeout(updateTimeout, 60000);

            // start the timer for the display updates
            setInterval(doAjaxUpdate, updateInterval * 1000);
        }
    });
});