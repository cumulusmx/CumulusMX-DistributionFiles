/*	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	Script:		utilities.js
 * 	Author:		Neil Thomas
 * 	Last Edit:	27-04-2023 14:23
 * 	Based on:	/js/utilFTPnow.html & 
 *              /util_reloaddayfile.html
 * 			By:	Mark Crossley
 *		Edited:	2022/07/28 20:43:08 & 
 *              2022/07/28 20:44:09
 * 	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

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
				',"graphs":' + $('#graphs').prop('checked') + '}',
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
