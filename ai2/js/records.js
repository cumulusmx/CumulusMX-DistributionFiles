// Last modified: 2021/05/16 20:55:18

$(document).ready(function () {
	var tempTable=$('#temperature').dataTable({
		"paging": false,
		"searching": false,
		"info": false,
		"ordering": false,
		"columns": [ null, {"width": "6em"}, {"width": "22.5em"}],
		"columnDefs": [
			{"className": "left", "targets": [0,2]},
			{"className": "w3-right-align", "targets": [1]}
		],
		"ajax": '/api/records/alltime/temperature.json'
	});

	var humTable=$('#humidity').dataTable({
		"paging": false,
		"searching": false,
		"info": false,
		"ordering": false,
		"columns": [ null, {"width": "6em"}, {"width": "22.5em"}],
		"columnDefs": [
			{"className": "left", "targets": [0,2]},
			{"className": "w3-right-align", "targets": [1]}
		],
		"ajax": '/api/records/alltime/humidity.json'
	});

	var pressTable=$('#pressure').dataTable({
		"paging": false,
		"searching": false,
		"info": false,
		"ordering": false,
		"columns": [ null, {"width": "8em"}, {"width": "22.5em"}],
		"columnDefs": [
			{"className": "left", "targets": [0,2]},
			{"className": "w3-right-align", "targets": [1]}
		],
		"ajax": '/api/records/alltime/pressure.json'
	});

	var windTable=$('#wind').dataTable({
		"paging": false,
		"searching": false,
		"info": false,
		"ordering": false,
		"columns": [ null, {"width": "8em"}, {"width": "22.5em"}],
		"columnDefs": [
			{"className": "left", "targets": [0,2]},
			{"className": "w3-right-align", "targets": [1]}
		],
		"ajax": '/api/records/alltime/wind.json'
	});

	var rainTable=$('#rain').dataTable({
		"paging": false,
		"searching": false,
		"info": false,
		"ordering": false,
		"columns": [ null, {"width": "8em"}, {"width": "22.5em"}],
		"columnDefs": [
			{"className": "left", "targets": [0,2]},
			{"className": "w3-right-align", "targets": [1]}
		],
		"ajax": '/api/records/alltime/rain.json'
	});

	$('#recPeriod').text('All-time');

	$('.w3-btn').click( function() {
		//console.log('Button ckicked is: ' + this.name);
		sessionStorage.setItem('CMXRecords', this.name);
		$('.w3-btn').removeClass('ow-theme-sub3');
		$(this).addClass('ow-theme-sub3');
		var urlPrefix ;
		if( this.name === 'alltime' ) {
			urlPrefix = '/api/records/alltime/';
			$('#recPeriod').text('All-time');
		} else if (this.name === 'thismonth') {
			urlPrefix = '/api/records/thismonth/';
			$('#recPeriod').text("This month's");
		} else if (this.name === 'thisyear' ) {
			urlPrefix = '/api/records/thisyear/';
			$('#recPeriod').text( "This year's" );
		} else {
			urlPrefix = '/api/records/month/' + this.name + '/';
			$('#recPeriod').text( period[this.name] );
		}

		tempTable.api().ajax.url( urlPrefix+'temperature.json' ).load();
		humTable.api().ajax.url( urlPrefix+'humidity.json' ).load();
		pressTable.api().ajax.url( urlPrefix+'pressure.json' ).load();
		windTable.api().ajax.url( urlPrefix+'wind.json' ).load();
		rainTable.api().ajax.url( urlPrefix+'rain.json' ).load();
	});
});

var period = ['','January','February','March','April','May','June','July','August','September','October','November','December'];

$(document).ready( function() {
	
	var dateNow = new Date();
	var dataReq = '{"startDate":"<#recordsbegandate>"}';
	$.ajax({
		url: '/api/tags/process.txt',
        dataType: 'json',
        type: 'POST',
        data: dataReq
    })
    .done( function (result) {
		var startDate = new Date(result.startDate);
		console.log("Start Date: " + startDate.getFullYear() + ' now: ' + dateNow.getFullYear());
		if( startDate.getFullYear() == dateNow.getFullYear()) {
			console.log("Need to hide some buttons");
			for ( var btn = 0; btn < startDate.getMonth(); btn++) {
				$('#btn' + ( btn + 1)).addClass('w3-hide');
			}
			for (var btn = 11; btn > dateNow.getMonth(); btn--) {
				$('#btn' + (btn + 1)).addClass('w3-hide');
			}
		}
	})
	.fail( function() {
		console.log("Failed to get data");
	})
});
