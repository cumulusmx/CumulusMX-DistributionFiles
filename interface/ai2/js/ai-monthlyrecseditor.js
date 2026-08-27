/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: ai-monthlyrecseditor.js   | version 1.0.0
    Author: DNC Thomas                | 2026-05-19 09
    Edited:	2026-08-11 09:56:48
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Configuration settings for AI2
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*/

$().ready( function() {
	console.log('Configuring buttons');
	$('.months').children('button').on('click', function() {
		$('.months').children('button').removeClass('ow-disabled');
		$(this).addClass('ow-disabled');
		cmxSession.Records.Monthly = this.id;

        sessionStorage.setItem(owStore , JSON.stringify(cmxSession));
		//	Now hide all tables and reveal the required one
		$('table').addClass('ow-hide');
		$('#month-' + this.id). removeClass('ow-hide');
		$('.months').children('button').attr('aria-selected', false);
		$(this).attr('aria-selected', true);
	});

    //	Remove unwanted buttons
	var months = ['Jan', 'Feb','Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var startYear, startMonth, thisYear, thisMonth;
	$.ajax( {
		url: '/api/tags/process.txt',
		dataType: 'json',
		type: 'POST',
		data: '{"startDate":"<#recordsbegandate format=\"yyyy MM\">"}'
	})
	.done( function (result){
		startYear = parseInt(result.startDate.slice(0,4));
		startMonth = parseInt(result.startDate.slice(5,7)) - 1;
		currentYear = new Date().getFullYear();
		currentMonth = new Date().getMonth() ;

        if( (startYear + 1) == currentYear && currentMonth < startMonth ) {
			for ( var mon = currentMonth + 1; mon < (startMonth - 1); mon++) {
				$('#' + months[mon]).addClass('ow-hide');
			}
			Diamond = '<span style="flex-grow:0;align-self:center;padding:0 3px;">';
			Diamond += '<i class="fa-solid fa-diamond ow-theme3-txt "></i></span>';
			$('#' + months[currentMonth + 1]).after(Diamond);
		}
		if( startYear == currentYear) {
			var mon = 0;
			for( var mon = 0; mon < startMonth; mon++){
				$('#' + months[mon]).remove();
			}
			for( var mon = (currentMonth + 1); mon < 12; mon++){
				console.log('Month number: ' + months[mon]);
				$('#' + months[mon]).remove();
			}
		}
    });

    //	Select the initial month based on session storage
	var Store = JSON.parse(sessionStorage.getItem(owStore));
	var month = Store.Records.Monthly;
	$('table').addClass('ow-hide');
	if( month === null || month=='') {
		//	Nothing stored so get the first available month
		$.ajax( {
			url: '/api/tags/process.txt',
			dataType: 'json',
			type: 'POST',
			data: '{"month": "<#recordsbegandate format=\"MMM\">"}'
		})
		.done(function (result) {
			//	Select first available month
			month = result.month;
			$('#month-' + month).removeClass('ow-hide');
			$('#' + month).addClass('ow-disabled');
		});
	} else {
		//	Select month stored in session storage
		$('#month-' + month).removeClass('ow-hide');
		$('#' + month).trigger('click');
	};
})
