/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: todayVyesterday.js      Ver: aiX-1.0
    Author: M Crossley & N Thomas
    Last Edit (MC): 2021/05/16 20:55:48
    Last Edit (NT): 2025/03/21 - Modified classNames
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Data for todayVyesterday.html
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

$().ready(function () {
	// Hide unwanted panels based on 'Available Data' settings
	//	Added by NEIL
	$.ajax({
		url: '/api/settings/displayoptions.json',
		dataType: 'json',
		success: function (results) {
			var dataVisible = results.DataVisibility;
            if( dataVisible.solar.Solar == 0 && dataVisible.solar.UV == 0 ){
                //  Hide the panel
                $('[data-cmxData-Rad]').addClass('w3-hide');
			}
        }
    })

	getData('temp.json', 'Temp2');
	getData('rain.json', 'Rain2');
	getData('wind.json', 'Wind2');
	getData('hum.json', 'Hum2');
	getData('pressure.json', 'Press2');
	getData('solar.json', 'Solar2');
 
	setInterval(function () {
		getData('temp.json','Temp2');
		getData('rain.json','Rain2');
		getData('wind.json','Wind2');
		getData('hum.json','Hum2');
		getData('pressure.json','Press2');
		getData('solar.json','Solar2');
	}, 10000);

});

//	Added by Neil
let getData = function(source, elId) {
	$.ajax({
		url: '/api/todayyest/' + source,
		dataType: 'json',
		success: function( result ){
			displayData( result.data, elId );
		}
	})
}
let displayData = function( data, elId) {
	$('#' + elId).html('');	//	Clears existing content
	var line='';
	for( var i=0; i < data.length; i++){
		line += '<div class="ows-dataRowGrid fiveC"><div class="ignore">';
		for( var j=0; j < data[i].length; j++){
			if( j==1 || j==3) {
				line += '<p class="dataVal">' + data[i][j] + '</p>';
			} else {
				line += '<p>' + data[i][j] + '</p>';
			}
		}
		line += "</div></div>";
	}
	$('#'+elId).append( line );
}