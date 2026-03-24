/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: records.js      Ver: aiX-1.0
    Author: M Crossley & N Thomas
    Last Edit (MC): 2024/10/29 11:27:28
    Last Edit (NT): 2025/03/21 
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Data for records.html
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var period = ['','{{MONTH_01}}','{{MONTH_02}}','{{MONTH_03}}','{{MONTH_04}}','{{MONTH_05}}','{{MONTH_06}}','{{MONTH_07}}','{{MONTH_08}}','{{MONTH_09}}','{{MONTH_10}}','{{MONTH_11}}','{{MONTH_12}}'];
var period = ['','January','February','March','April','May','June','July','August','September','October','Novermber','December','','']

$().ready( function() {

	var dateNow = new Date();
	var dataReq = '{"startDate":"<#recordsbegandate>"}';
	//console.log("dataReq: " + dataReq);
	$.ajax({
		url: '/api/tags/process.txt',
        dataType: 'json',
        type: 'POST',
        data: dataReq
    })
    .done( function (result) {
		var startDate = new Date(result.startDate);
		if( startDate.getFullYear() == dateNow.getFullYear()) {
			console.log("Hiding unavailable buttons");
			for ( var btn = 0; btn < startDate.getMonth(); btn++) {
				$('#btn' + ( btn + 1)).remove();
			}
			for (var btn = 11; btn > dateNow.getMonth(); btn--) {
				$('#btn' + (btn + 1)).remove();
			}
		}
		if ( startDate.getFullYear() == (dateNow.getFullYear() - 1) && startDate.getMonth() > dateNow.getMonth()){
			console.log("Removing middle buttons.")
			for (var btn = dateNow.getMonth() + 1; btn < startDate.getMonth(); btn++) {
				//console.log("Button to hide: " + btn);
				$('#btn' + (btn + 1)).remove();
			}
			var htmlX = '<span style="flex-grow:0;align-self:center;padding:0 3px;">';
        	htmlX += '<i class="fa-solid fa-diamond ows-theme5-txt w3-hide-small" style="font-size:70%;"></i></span>';
			//console.log("Insert after: " + parseInt(dateNow.getMonth() + 1));
        	$('#btn' + parseInt(dateNow.getMonth() + 1)).after(htmlX)
		}
	})
	.fail( function() {
		console.log("Failed to get data");
	})

	$('.w3-button').click( function() {
		cmxSession.Records.All = this.name;
		sessionStorage.setItem(owsStore, JSON.stringify(cmxSession));
		$('.ows-btnBar').children().removeClass('w3-disabled');
		$(this).addClass('w3-disabled');
		var urlPrefix ;
		switch( this.name ) {
			case 'alltime':
				urlPrefix = '/api/records/alltime/';
				$('#recPeriod').text('{{ALL_TIME}}');
				break;
			case 'thismonth':
				urlPrefix = '/api/records/thismonth/';
				$('#recPeriod').text("{{THIS_MONTH}}");
				break;
			case 'thisyear':
				urlPrefix = '/api/records/thisyear/';
				$('#recPeriod').text("{{THIS_YEAR}}");
				break;
			default:
				urlPrefix = '/api/records/month/' + this.name + '/';
				$('#recPeriod').text( period[this.name] );
		}

		getData( urlPrefix + 'temperature.json', 'Temperature');
		getData( urlPrefix + 'humidity.json', 'Humidity');
		getData( urlPrefix + 'pressure.json', 'Pressure');
		getData( urlPrefix + 'wind.json', 'Winds');
		getData( urlPrefix + 'rain.json', 'Rainfall');
	});

	switch( cmxSession.Records.All ){
		case '':
		case 'alltime':
			urlPrefix = '/api/records/alltime/';
			$('#recPeriod').text('All-time');
			$('#alltime').addClass('w3-disabled');
			break;
		case 'thisyear':
			urlPrefix = '/api/records/thisyear/';
			$('#recPeiod').text("This year's")
			$('#thisyear').addClass('w3-disabled');
			break;
		case 'thismonth':
			urlPrefix = '/api/records/thismonth/';
			$('#recPeriod').text("This month's");
			$('#thismonth').addClass('w3-disabled');
			break;
		default:
			urlPrefix = '/api/records/month/' + cmxSession.Records.All + '/';
			$('#recPeriod').text( period[cmxSession.Records.All])
			$('#btn' + cmxSession.Records.All).addClass('w3-disabled');
	}
	getData( urlPrefix + 'temperature.json', 'Temperature');
	getData( urlPrefix + 'rain.json', 'Rainfall');
	getData( urlPrefix + 'wind.json', 'Winds');
	getData( urlPrefix + 'humidity.json', 'Humidity');
	getData( urlPrefix + 'pressure.json', 'Pressure');

	//	Reset Seagull
	setPageGeometry( cmxConfig.Geometry );
});


//	Added by Neil
let getData = function( source, elId) {
	$.ajax({
		url: source,
		dataType: 'json',
		success: function( result ) {
			displayData( result.data, elId )
		} 
	})
}

let displayData = function( data, elId ){
	$('#' + elId).html('');	// Clear exsiting contents
	var dataLine = ''
	for( var i=0; i < data.length; i++) {
		dataLine += '<div class="ows-dataRowGrid threeC"><div class="ignore">';
		for( var j=0; j < data[i].length; j++) {
			if( j==1) {
				dataLine += '<p class="dataVal">' + data[i][j] + '</p>';
			}
			else {
				dataLine += '<p>' + data[i][j] + '</p>';
			}
		}
		dataLine += '</div></div>';
	}
	$('#'+elId).html( dataLine );
}