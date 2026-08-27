/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: utilities.js		      Ver: 2.0
    Author: N Thomas (taken from all utility html files)
    Last Edit (MC):	
    Last Edit (NT): 2026-08-11 09:59:40
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Process FTP & Reload options on utilities page
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
			$('#dayFileStatus').html( prompt + response);
			timeOut( ' dayFileStatus' );
		})
		.fail(function (jqXHR, response) {
			$('#dayFileStatus').html( prompt + response)
			//	Don't clear the status bar
		});
	});

	//	Start FTP/Copy process
	$("#startFTP").click(function(event) {
		$('#ftpStatus').text('');
		$.post(
			"/api/utils/ftpnow.json",
            '{"dailygraphs":' + $('#dailygraphs').prop('checked') +
            	',"noaa":' + $('#noaa').prop('checked') +
            	',"graphs":' + $('#graphs').prop('checked') +
                ',"logfiles":' + $('#logfiles').prop('checked') + '}',
		).done(function (response) {
			$('#ftpStatus').html( response);
			timeOut( 'ftpStatus' );
		}).fail(function (jqXHR, response) {
			$('#ftpStatus').html( response);
			//	Don't clear the status bar
		});
	});
});

//  --  Timout for status messages
let timeOut = function(elId) {
	window.setTimeout( function(){$("#" + elId).text( prompt );}, 10000);
};
