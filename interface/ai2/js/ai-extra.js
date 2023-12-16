/*	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Script:	ai-extra.js			v3.0.1
 * 	Author:	Neil Thomas		 Sept 2023
 * 	Last Edit:	17/09/2023 12:06
 * 	Role:
 * 		To provide AI specific scripts
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


//	Page Ready
$( function() {
	//localStorage.removeItem( 'CMXai2.1' );	// Forces to new install
	getConfig();
	getMenu();
	//configPage();
	getVersion();	//	Posibly conditional
	checkPanels();
	getExtras();
	//configPage();
});

/*	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	The stored configuaration is loaded if it exists
 * 	otherwise, the default configuration is stored and used.
 *	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
let getConfig = function() {
	if( typeof( Storage ) === "undefined" ) {
		console.log('Storage unavailable; hardwired config being used');
	} else {
		var storedConfig = JSON.parse( localStorage.getItem( 'CMXai2.1' ));
		if( storedConfig === null ) {
			console.log('First use;');
			storeDefault();
		} else {
			console.log('Configuration stored already; reading..');
			CMXConfig = storedConfig;
			checkTheme();
		}
	}
};

let storeDefault = function() {
	console.log('Storing default configuration');
	localStorage.setItem( 'CMXai2.1', JSON.stringify( CMXConfig ));
};

let getVersion = function() {
	//	Will always fail unless on CMX host machine
	$.ajax({
		url: '/api/info/version.json',
		success: function( result ) {
			$('[data-cmxData=Version]').html( result.Version );
			$('[data-cmxData=Build]').html( result.Build );
		},
		error: function( xhr ) {
			console.log( "Failed to load version data: " + xhr.status );
			$('[data-cmxdata=Version]').html('<span style="color:#C00">-Not known-</span>');
		}
	})
	$('[data-OWdata=Version]').html( CMXConfig.Version );
};

let getMenu = function() {
	// Load AI Menues
	console.log("Loading AI menues.");
	$('#Menues').load("menues.html", function( response, status, xhr) {
		if( status == "error") {
			var msg = "Sorry but there was an error:  ";
			console.log( msg + xhr.status + ": " + xhr.statusTxt );
		}
		configPage();
	});
}


//	Mine
let toggleArea = function(element) {
	//	Function shows/hides alarm and davis panels. 
	$('#' + element.id + 'Panel').toggleClass("w3-hide", "w3-show");
	var btnText = $('#' + element.id).text();
	if( btnText.slice(0,4) == 'Show') {
		$('#' + element.id).text( btnText.replace('Show','Hide'));
		localStorage.setItem( 'CMX' + element.id, 'Show');
	} else {
		$('#' + element.id).text( btnText.replace('Hide','Show'));
		localStorage.setItem( 'CMX' + element.id , 'Hide' );
	}
};

let checkPanels = function() {
	console.log("Checking panels");
	if( localStorage.getItem('CMXAlarms') == 'Hide') {
		$('#Alarms').trigger('click');
	}
	if( localStorage.getItem('CMXDavis') == 'Hide') {
		$('#Davis').trigger('click');
	}
};
	
let getExtras = function() {
	//	Gets the weather station Lat, Long & altitude
	var data = '{"Latitude": "<#latitude>", "Longitude": "<#longitude>", "Altitude": "<#altitude>", ' + 
			   '"CurrentDate": "<#shortdayname>, <#day> <#monthname> <#year>", ' +
			   '"Yesterday":"<#yesterday format=\"ddd dd MMM yyyy\">"}';
	$.ajax({
		url: '/api/tags/process.txt',
        dataType: 'json',
        type: 'POST',
        data: data
        //data: '{"Latitude": "<#latitude>", "Longitude": "<#longitude>", "Altitude": "<#altitude>", "CurrentDate": "<#shortdayname>, <#day> <#monthname> <#year>"}'
    })
    .done( function (result) {
		//console.log('Returned ' + jQuery.params( result ));
		$("[data-cmxdata='Latitude']").html( result.Latitude);
		$("[data-cmxdata='Longitude']").html( result.Longitude );
		$("[data-cmxdata='Altitude']").html( result.Altitude );
		$("[data-OWData='Date']").html( result.CurrentDate );
		$("[data-OWData='Yesterday']").html( result.Yesterday );
	})
	
	.fail( function() {
		console.log("Failed to get data");
	})
	/* */
};
