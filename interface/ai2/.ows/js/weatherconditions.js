/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: weatherconditions.js	  Ver: aiX-1.0
    Author: N Thomas (taken from conditions html file)
    Last Edit (MC):	
    Last Edit (NT): 2025/03/22
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Data for weatherdiary.html
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

function loadCC() {
	$.ajax({
		url: '/api/edit/currentcond.json',
		dataType: 'json'
	})
	.done(function(resp) {
		//$('#inputCurrCond').val(resp.data);
		console.log('Load success');
		$('#inputCurrCond')[0].value = resp.data;
	})
	.fail(function(jqXHR, textStatus) {
		alert('Something went wrong loading the text! (' + JSON.stringify( jqXHR) + "\n" + textStatus + ')');
	});
}

function applyCCEntry() {
	var body = $('#inputCurrCond')[0].value;
			
	body = body.replace(/\n/g, ' ');
	$.ajax({
		url     : '/api/edit/currcond',
		type    : 'POST',
		data    : body,
		dataType: 'json'
	}).done(function (result) {
		console.log(result.result);
		// notify user
		if (result.result === 'Success') {
			$("#CCstatus").text('Entry added/updated OK.');
			timeOut("CCstatus");
			loadCC();
		} else {
			$("#CCstatus").text('Failed to add/update entry!');
			timeOut("CCstatus");
		}
	}
	).fail(function(jqXHR, textStatus) {
		$("#CCstatus").text('Something went wrong updating the text! (' + textStatus + ')');
		timeOut("CCstatus");
	});
}
		
//  --  Timout for BOTH status messages        
let timeOut = function(elId) {
	window,setTimeout( function(){$("#" + elId).html("");}, 4000);
};

