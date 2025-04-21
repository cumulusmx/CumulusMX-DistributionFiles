/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: utilities.js		      Ver: aiX-1.0
    Author: N Thomas (taken from all utility html files)
    Last Edit (MC):	
    Last Edit (NT): 2025/03/21
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Data for utilities.html
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var prompt = '';

$( function () {

	//	Reload the DayFile
	$("#reLoad").click(function(event) {
		$('#dayFileStatus').html( prompt);
		$.ajax({
			url: "/api/utils/reloaddayfile",
			dataType: 'text'
		})
		.done(function (response) {
			$('#dayFileStatus').html( prompt + response)
		})
		.fail(function (jqXHR, response) {
			$('#dayFileStatus').html( prompt + response)
		});
		timeOut( 'dayFileStatus' );
	});

	//	Start FTP/Copy process
	$("#startFTP").click(function(event) {
		$('#ftpStatus').text('');
		$.post(
			"/api/utils/ftpnow.json",
			'{"dailygraphs":' + $('#dailygraphs').prop('checked') +
				',"noaa":' + $('#noaa').prop('checked') +
				',"graphs":' + $('#graphs').prop('checked') + '}' +
				',"logfiles":' + $('#logfiles').prop('checked') + '}',
		).done(function (response) {
			$('#ftpStatus').html( response);
		}).fail(function (jqXHR, response) {
			$('#ftpStatus').html( response);
		});
		timeOut( 'ftpStatus' );
	});
});

//  --  Timout for status messages
let timeOut = function(elId) {
	window.setTimeout( function(){$("#" + elId).text( prompt );}, 10000);
};
