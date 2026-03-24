// Last modified: 2026/03/09 16:48:46

// set defaults
$.extend( $.fn.dataTable.defaults, {
    searching: false,
    ordering:  false,
    paging: false,
    info: false,
    language: {
        emptyTable: '{{NO_SENSORS_ENABLED}}'
    },
    columnDefs: [
        {className: 'left', targets: [0,2]},
        {className: 'right', targets: [1]}
    ]
} );

$.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
    console.log(message);
};

$(document).ready(function () {
    $.ajax({url: '/api/info/version.json', dataType:'json', success: function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    }});

    var tempTable = $('#TempTable').DataTable({
        ajax: {
            url: '/api/extra/temp.json',
            method: 'GET',
            dataSrc: function(json) {
                if (json.data && json.data.length > 0) {
                    $('#TempTableBlock').show();
                    return json.data;
                } else {
                    $('#TempTableBlock').hide();
                    return [];
                }
            }
        }
    });

    var humTable = $('#HumTable').DataTable({
        ajax: {
            url: '/api/extra/hum.json',
            method: 'GET',
            dataSrc: function(json) {
                if (json.data && json.data.length > 0) {
                    $('#HumTableBlock').show();
                    return json.data;
                } else {
                    $('#HumTableBlock').hide();
                    return [];
                }
            }
        }

    });

    var dewTable = $('#DewTable').DataTable({
        ajax: {
            url: '/api/extra/dew.json',
            method: 'GET',
            dataSrc: function(json) {
                if (json.data && json.data.length > 0) {
                    $('#DewTableBlock').show();
                    return json.data;
                } else {
                    $('#DewTableBlock').hide();
                    return [];
                }
            }
        }
    });

    var soiltempTable = $('#SoilTempTable').DataTable({
        ajax: {
            url: '/api/extra/soiltemp.json',
            method: 'GET',
            dataSrc: function(json) {
                if (json.data && json.data.length > 0) {
                    $('#SoilTempTableBlock').show();
                    return json.data;
                } else {
                    $('#SoilTempTableBlock').hide();
                    return [];
                }
            }
        }
    });

    var soilmoistureTable = $('#SoilMoistureTable').DataTable({
        ajax: {
            url: '/api/extra/soilmoisture.json',
            method: 'GET',
            dataSrc: function(json) {
                if (json.data && json.data.length > 0) {
                    $('#SoilMoistureTableBlock').show();
                    return json.data;
                } else {
                    $('#SoilMoistureTableBlock').hide();
                    return [];
                }
            }
        }
    });

    var leafTable = $('#LeafTable').DataTable({
        ajax: {
            url: '/api/extra/leaf8.json',
            method: 'GET',
            dataSrc: function(json) {
                if (json.data && json.data.length > 0) {
                    $('#LeafTableBlock').show();
                    return json.data;
                } else {
                    $('#LeafTableBlock').hide();
                    return [];
                }
            }
        }
    });

    var airqualTable = $('#AirQualityTable').DataTable({
        ajax: {
            url: '/api/extra/airqual.json',
            method: 'GET',
            dataSrc: function(json) {
                if (json.data && json.data.length > 0) {
                    $('#AirQualityTableBlock').show();
                    return json.data;
                } else {
                    $('#AirQualityTableBlock').hide();
                    return [];
                }
            }
        }
    });

    var co2Table = $('#CO2Table').DataTable({
        ajax: {
            url: '/api/extra/co2sensor.json',
            method: 'GET',
            dataSrc: function(json) {
                if (json.data && json.data.length > 0) {
                    $('#CO2TableBlock').show();
                    return json.data;
                } else {
                    $('#CO2TableBlock').hide();
                    return [];
                }
            }
        }
    });

    var lightningTable = $('#LightningTable').DataTable({
        ajax: {
            url: '/api/extra/lightning.json',
            method: 'GET',
            dataSrc: function(json) {
                if (json.data && json.data.length > 0) {
                    $('#LightningTableBlock').show();
                    return json.data;
                } else {
                    $('#LightningTableBlock').hide();
                    return [];
                }
            }
        }
    });

    var bgtTable = $('#BGTTable').DataTable({
        ajax: {
            url: '/api/extra/bgt.json',
            method: 'GET',
            dataSrc: function(json) {
                if (json.data && json.data.length > 0) {
                    $('#BGTTableBlock').show();
                    return json.data;
                } else {
                    $('#BGTTableBlock').hide();
                    return [];
                }
            }
        }
    });

    var userTempTable = $('#UserTempTable').DataTable({
        ajax: {
            url: '/api/extra/usertemp.json',
            method: 'GET',
            dataSrc: function(json) {
                if (json.data && json.data.length > 0) {
                    $('#UserTempTableBlock').show();
                    return json.data;
                } else {
                    $('#UserTempTableBlock').hide();
                    return [];
                }
            }
        }
    });

    var laserDepthTable = $('#LaserDepthTable').DataTable({
        ajax: {
            url: '/api/extra/laserdepth.json',
            method: 'GET',
            dataSrc: function(json) {
                if (json.data && json.data.length > 0) {
                    $('#LaserDepthTableBlock').show();
                    return json.data;
                } else {
                    $('#LaserDepthTableBlock').hide();
                    return [];
                }
            }
        }
    });

    var laserDistTable = $('#LaserDistTable').DataTable({
        ajax: {
            url: '/api/extra/laserdistance.json',
            method: 'GET',
            dataSrc: function(json) {
                if (json.data && json.data.length > 0) {
                    $('#LaserDistTableBlock').show();
                    return json.data;
                } else {
                    $('#LaserDistTableBlock').hide();
                    return [];
                }
            }
        }
    });

    var snow24hTable = $('#Snow24hTable').DataTable({
        ajax: {
            url: '/api/extra/snow24h.json',
            method: 'GET',
            dataSrc: function(json) {
                if (json.data && json.data.length > 0) {
                    $('#Snow24hTableBlock').show();
                    return json.data;
                } else {
                    $('#Snow24hTableBlock').hide();
                    return [];
                }
            }
        }
    });

    var snowSeasonTable = $('#SnowSeasonTable').DataTable({
        ajax: {
            url: '/api/extra/snowseason.json',
            method: 'GET',
            dataSrc: function(json) {
                if (json.data && json.data.length > 0) {
                    $('#SnowSeasonTableBlock').show();
                    return json.data;
                } else {
                    $('#SnowSeasonTableBlock').hide();
                    return [];
                }
            }
        }
    });

    setInterval(function () {
        tempTable.ajax.reload();
        humTable.ajax.reload();
        dewTable.ajax.reload();
        soiltempTable.ajax.reload();
        soilmoistureTable.ajax.reload();
        leafTable.ajax.reload();
        airqualTable.ajax.reload();
        co2Table.ajax.reload();
        lightningTable.ajax.reload();
        bgtTable.ajax.reload();
        userTempTable.ajax.reload();
        laserDepthTable.ajax.reload();
        laserDistTable.ajax.reload();
        snow24hTable.ajax.reload();
        snowSeasonTable.ajax.reload();
    }, 10000);

});


