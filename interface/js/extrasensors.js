// Last modified: 2025/02/11 16:13:48

// set defaults
$.extend( $.fn.dataTable.defaults, {
    searching: false,
    ordering:  false,
    paging: false,
    info: false,
    language: {
        emptyTable: 'No sensors enabled'
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
    var emptyTable = 'No sensors enabled. Enable in: Settings|Display&nbsp;Options|Graphs|Data Visibility';

    $.ajax({url: '/api/info/version.json', dataType:'json', success: function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    }});

    var tempTable = $('#TempTable').DataTable({
        ajax: '/api/extra/temp.json'
    });

    var humTable = $('#HumTable').DataTable({
        ajax: '/api/extra/hum.json'
    });

    var dewTable = $('#DewTable').DataTable({
        ajax: '/api/extra/dew.json'
    });

    var soiltempTable = $('#SoilTempTable').DataTable({
        ajax: '/api/extra/soiltemp.json'
    });

    var soilmoistureTable = $('#SoilMoistureTable').DataTable({
        ajax: '/api/extra/soilmoisture.json'
    });

    var leafTable = $('#LeafTable').DataTable({
        ajax: '/api/extra/leaf8.json'
    });

    var airqualTable = $('#AirQualityTable').DataTable({
        ajax: '/api/extra/airqual.json'
    });

    var co2Table = $('#CO2Table').DataTable({
        ajax: '/api/extra/co2sensor.json'
    });

    var lightningTable = $('#LightningTable').DataTable({
        ajax: '/api/extra/lightning.json'
    });

    var userTempTable = $('#UserTempTable').DataTable({
        ajax: '/api/extra/usertemp.json'
    });

    var laserDepthTable = $('#LaserDepthTable').DataTable({
        ajax: '/api/extra/laserdepth.json'
    });

    var laserDistTable = $('#LaserDistTable').DataTable({
        ajax: '/api/extra/laserdistance.json'
    });

    var snow24hTable = $('#Snow24hTable').DataTable({
        ajax: '/api/extra/snow24h.json'
    });

    var snowSeasonTable = $('#SnowSeasonTable').DataTable({
        ajax: '/api/extra/snowseason.json'
    });

    setInterval(function () {
        tempTable.ajax.url('/api/extra/temp.json').load();
        humTable.ajax.url('/api/extra/hum.json').load();
        dewTable.ajax.url('/api/extra/dew.json').load();
        soiltempTable.ajax.url('/api/extra/soiltemp.json').load();
        soilmoistureTable.ajax.url('/api/extra/soilmoisture.json').load();
        leafTable.ajax.url('/api/extra/leaf8.json').load();
        airqualTable.ajax.url('/api/extra/airqual.json').load();
        co2Table.ajax.url('/api/extra/co2sensor.json').load();
        lightningTable.ajax.url('/api/extra/lightning.json').load();
        userTempTable.ajax.url('/api/extra/usertemp.json').load();
        laserDepthTable.ajax.url('/api/extra/laserdepth.json').load();
        laserDistTable.ajax.url('/api/extra/laserdistance.json').load();
        snow24hTable.ajax.url('/api/extra/snow24h.json').load();
        snowSeasonTable.ajax.url('/api/extra/snowseason.json').load();
    }, 10000);

});


