/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: todayVyesterday.js      Ver: aiX-1.0
    Author: M Crossley & N Thomas
    Last Edit (MC): 2021/05/16 20:55:48
    Last Edit (NT): 2025/03/21 - Modified classNames
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Data for todayVyesterday.html
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

$().ready(function () {

	var tempTable = $('#TempTable').DataTable({
		"paging": false,
		"searching": false,
		"info": false,
		"ordering": false,
		"columnDefs": [
			{"className": "left", "targets": [0,2]},
			{"className": "w3-right-align", "targets": [1,3]}
		],
		"ajax": '/api/todayyest/temp.json'
	});

	var rainTable = $('#RainTable').DataTable({
		"paging": false,
		"searching": false,
		"info": false,
		"ordering": false,
		"columnDefs": [
			{"className": "left", "targets": [0,2]},
			{"className": "w3-right-align", "targets": [1,3]}
		],
		 "ajax": '/api/todayyest/rain.json'
	});

	var windTable = $('#WindTable').DataTable({
		"paging": false,
		"searching": false,
		"info": false,
		"ordering": false,
		"columnDefs": [
			{"className": "left", "targets": [0,2]},
			{"className": "w3-right-align", "targets": [1,3]}
		],
		 "ajax": '/api/todayyest/wind.json'
	});

	var humidityTable = $('#HumidityTable').DataTable({
		"paging": false,
		"searching": false,
		"info": false,
		"ordering": false,
		"columnDefs": [
			{"className": "left", "targets": [0,2]},
			{"className": "w3-right-align", "targets": [1,3]}
		],
		"ajax": '/api/todayyest/hum.json'
	});

	var pressureTable = $('#PressureTable').DataTable({
		"paging": false,
		"searching": false,
		"info": false,
		"ordering": false,
		"columnDefs": [
			{"className": "left", "targets": [0,2]},
			{"className": "w3-right-align", "targets": [1,3]}
		],
		 "ajax": '/api/todayyest/pressure.json'
	});

	var solarTable = $('#SolarTable').DataTable({
		"paging": false,
		"searching": false,
		"info": false,
		"ordering": false,
		"columnDefs": [
			{"className": "left", "targets": [0,2]},
			{"className": "w3-right-align", "targets": [1,3]}
		],
		 "ajax": '/api/todayyest/solar.json'
	});

	setInterval(function () {
		tempTable.ajax.url('/api/todayyest/temp.json').load();
		rainTable.ajax.url('/api/todayyest/rain.json').load();
		windTable.ajax.url('/api/todayyest/wind.json').load();
		humidityTable.ajax.url('/api/todayyest/hum.json').load();
		pressureTable.ajax.url('/api/todayyest/pressure.json').load();
		solarTable.ajax.url('/api/todayyest/solar.json').load();
	}, 10000);

});


