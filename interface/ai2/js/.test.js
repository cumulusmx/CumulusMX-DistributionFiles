let getAlarmData = function() {
	//	Will always fail unless on CMX host machine
	$.ajax({
		url: '/api/settings/alarms.json',
		success: function( result ) {
			//console.log('API returned: ' + JSON.stringify( result ));
			$('#APIData').html( JSON.stringify(result).replaceAll(',',', ') );
			console.log('Keys in result: ' + Object.keys( result ));
			console.log('Keys in result: ' + Object.keys( result.data ));
			console.log('Keys in result: ' + Object.keys( result.units ));
			console.log('Keys in result: ' + Object.keys( result.email ));
			console.log('Data temp below in dot format: ' + result.data.tempBelow.Enabled);
			console.log('Data Temp Below Alarm in array format: ' + result.data['tempBelow']['Enabled']);
			console.log('Email: ' + JSON.stringify( result.email ));
			for ( key in result.data) {
				console.log( key + " - " + result.data[key].Enabled + ' Value: ' + result.data[key].Val );
			}
		},
		error: function( xhr ) {
			console.log( "Failed to load API data: " + xhr.status );
		}
	})
};

let customAlarmData = function() {
	$.ajax({
		url: '/api/settings/useralarms.json',
		success: function( result ) {
			$('#APIData').html(JSON.stringify( result).replaceAll(',',', '));
			$('#APIPairs').html( "Name: " + result.alarms[0].Name + '<br>Webtag: ' + result.alarms[0].WebTag);
		},
		error: function( xhr ) {
			console.log("Failed: " + xhr.status);
		}
	})
};

let getCurrentData = function() {
	$.ajax({
		url: '/api/data/currentdata',
		success: function( result ) {
			$('#APIData').html( JSON.stringify( result ).replaceAll(',',', '));
			var dataPairs = ""
			for (key in result) {
				 dataPairs += '#' + key + ": " + result[key] + '<br>';
			}
			$('#APIPairs').html( dataPairs );
		},
		error: function( xhr ) {
			console.log("API Call failed: " + xhr.status );
		}
	}) 
};

let getYesterdayData = function() {
	console.log('Function called');
	var dataPairs = '';
	$.ajax({
		url: '/api/todayyest/temp.json',
		success: function( result ) {
			console.log("API call successful");
			$('#APIData').html( JSON.stringify( result ).replaceAll(',',', '));
			for ( var itm = 0; itm < result.data.length; itm++) {
				dataPairs += result.data[itm][0] + ' yesterday: ' + result.data[itm][3] + ' @ ' + result.data[itm][4] + '<br>';
			}
		},
		error: function( xhr ) {
			console.log("API call for yesterdats temp data failed: " + xhr.status );
		}
	})
	
	$.ajax({
		url: '/api/todayyest/wind.json',
		success: function( result ) {
			$('#APIData').append( JSON.stringify( result ).replaceAll(',',', '));
			for ( itm=0; itm < result.data.length; itm++) {
				dataPairs += '#Y' + result.data[itm][0].replaceAll(' ','') + ': ' + result.data[itm][3];
				//if( result.data[itm][0] != 'Wind Run' || result.data[itm][0] != 'Dominant Direction' ) {
					dataPairs +=  ' <span class="ow-txt-small">@</span> ' + result.data[itm][4];
				//}
				dataPairs += '<br>';
			}
			$('#APIPairs').html(  dataPairs );
		},
		error: function( xhr ) {
			console.log('Errior collecting wind data');
		}
	})
};

let getAvailableData = function() {
	var pointer = 4;
	$.ajax({
		url: '/api/graphdata/availabledata.json',
		dataType: 'json',
		success: function(result){
			console.log("Data collected");
			$('#APIData').html( JSON.stringify( result ).replaceAll(',',', '));
			if(result.ExtraTemp || result.ExtraHum || result.ExtraDew || result.ExtraDewPoint || result.SoilMoist || result.Temp || result.LeafWetness || result.UserTemp || result.CO2) {
				console.log("Other sensors available");
			} else {
				console.log("Other sensors not available");
			}
			if(result.ExtraTemp){ 
				for (key of result.ExtraTemp) {
					console.log("Title H" + pointer + ": " + key);
					$('#test')
					pointer++;
				}
			}
		},
		error: function() {
			console.log("Failed to get data");
		}
	})
}
