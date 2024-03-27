/*	--------------------------------------------------
 *	Script:	    extrasensors.js
 *	Author:	    Neil Thomas
 *  Based on:   /js/extrasensors.js
 *          By: Mark Crossley
 *  Last Edit:  2023/12/17 22:38:09
# * -------------------------------------------------
 * Changelog (NT)
 * 	Removed api call for version data - now in Page-Manager.js
 * 	Altered all API calls to use host root
 * -------------------------------------------------------------*/

// set defaults
$.extend( $.fn.dataTable.defaults, {
    searching: false,
    ordering:  false,
    paging: false,
    info: false,
    language: {
        "emptyTable": "No sensors enabled.<br>Enable in Setting~Display Options~Graphs~Data Visibility"
    },
    columnDefs: [
        {className: "left", targets: [0,2]},
        {className: "right", targets: [1]}
    ],
    bAutoWidth: false
} );

$(document).ready(function () {
    var emptyTable = "No sensors enabled. Enable in: Settings|Display&nbsp;Options|Graphs|Data Visibility";

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
    }, 10000);

});
