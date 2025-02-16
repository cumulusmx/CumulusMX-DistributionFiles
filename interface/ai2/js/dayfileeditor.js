// Last modified: 2025/02/15 19:30:44

$(document).ready(function() {

	//	Added by Neil
	var styles = "<style>\n";
	var data = '{"TempUnit": "<#tempunitnodeg>", "PressUnit": "<#pressunit>", "WindUnit": "<#windunit>", "RainUnit": "<#rainunit>", "WindRunUnit":"<#windrununit>"}';
	$.ajax({
		url:  '/api/tags/process.txt',
        dataType: 'json',
        type: 'POST',
        data: data
	})
	.done( function( result ) {
		console.log('Processing units');
		styles = "<style>\n";
		styles += "#datalog tbody .tempUnits:after { content:\"°" + result.TempUnit + "\";}\n";
		styles += "#datalog tbody .windUnits:after { content:\"" + result.WindUnit + "\";}\n";
		styles += "#datalog tbody .windRunUnits:after { content: \"" + result.WindRunUnit + "\";}\n";
		styles += "#datalog tbody .rainUnits:after { content:\"" + result.RainUnit + "\";}\n";
		styles += "#datalog tbody .rainRateUnits:after { content:\"" + result.RainUnit + "/hr\";}\n";
		styles += '#datalog tbody .pressUnits:after { content:\"' + result.PressUnit + "\";}\n";
		styles == "</styles>\n";
		$('head').append( styles );
	})
	.fail( function() {
		console.log('Failed to load units');
	});

	var columnDefs = [
	{
		title: 'Line #',
		readonly: true
	},
	{
		title: 'Date (dd/mm/yy)',
		readonly: true
	},
	{title: 'Max gust', 			className:"windUnits"},
	{title: 'Max gust bearing', 	className:"bearing"},
	{title: 'Max gust time'},
	{title: 'Min temp', 			className:"tempUnits"},
	{title: 'Min temp time'},
	{title: 'Max temp', 			className:"tempUnits"},
	{title: 'Max temp time'},
	{title: 'Min pressure', 		className:"pressUnits"},
	{title: 'Min pressure time'},
	{title: 'Max pressure', 		className:"pressUnits"},
	{title: 'Max pressure time'},
	{title: 'Max rainfall rate', 	className:"rainRateUnits"},
	{title: 'Max rainfall rate time'},
	{title: 'Total rainfall', 		className:"rainUnits"},
	{title: 'Avg temp', 			className:"tempUnits"},
	{title: 'Total wind run', 		className:"windRunUnits"},
	{title: 'High avg wind speed', 	className:"windUnits"},
	{title: 'High avg wind speed time'},
	{title: 'Low humidity', 		className:"percent"},
	{title: 'Low humidity time'},
	{title: 'High humidity', 		className:"percent"},
	{title: 'High humidity time'},
	{title: 'Total ET',				className: 'rainUnits'},
	{title: 'Total hours of sunshine', className:"hours"},
	{title: 'High heat index', 		className:"tempUnits"},
	{title: 'High heat index time'},
	{title: 'High apparent temp', 	className:"tempUnits"},
	{title: 'High apparent temp time'},
	{title: 'Low apparent temp', 	className:"tempUnits"},
	{title: 'Low apparent temp time'},
	{title: 'High hourly rain', 	className:"rainRateUnits"},
	{title: 'High hourly rain time'},
	{title: 'Low wind chill', 		className:"tempUnits"},
	{title: 'Low wind chill time'},
	{title: 'High dew point', 		className:"tempUnits"},
	{title: 'High dew point time'},
	{title: 'Low dew point', 		className:"tempUnits"},
	{title: 'Low dew point time'},
	{title: 'Dominant wind bearing', className:"bearing"},
	{title: 'Heating degree days'},
	{title: 'Cooling degree days'},
	{title: 'High solar rad', 		className:"solarUnits"},
	{title: 'High solar rad time'},
	{title: 'High UV-I'},
	{title: 'High UV-I time'},
	{title: 'High feels like', 		className:"tempUnits"},
	{title: 'High feels like time'},
	{title: 'Low feels like', 		className:"tempUnits"},
	{title: 'Low feels like time'},
	{title: 'High humidex', 		className:"tempUnits"},
	{title: 'High humidex time'},
	{title: 'Chill hours', 			className:"hours"},
	{title: 'High 24 hour rain', 	className:"rainUnits"},
	{title: 'High 24 hour rain time'}
	];

	var myTable = $('#datalog').DataTable({
		//pagingType: 'input',
		processing: true,
		serverSide: true,
		searching: true,
		searchDelay: 750,
		ordering: false,
		pageLength: 10,
		lengthMenu: [10,20,50,100],
		fixedHeader: true,
        fixedColumns: {
            left: 2
        },
        scrollY: '70vh',
        scrollX: '100%',
        scrollCollapse: true,
		ajax: {
			url: '/api/data/dayfile',
			data: function (data) {
				delete data.columns;
			}
		},
		columns: columnDefs,
		dom: '<"top"Bfip<"clear">>t<"bottom"fip<"clear">>',
		select: 'os',
		responsive: false,
		altEditor: true,     // Enable altEditor
		buttons: [
			{
				extend: 'selected', // Bind to Selected row
				text: 'Edit',
				name: 'edit'        // do not change name
			},
			{
				extend: 'selected', // Bind to Selected row
				text: 'Delete',
				name: 'delete'      // do not change name
			},
			{
				text: 'Refresh',
				name: 'refresh'      // do not change name
			},
			'pageLength'
		],
		language: {
			altEditor: {
				modalClose: 'Close',
				edit: {
					title: 'Edit record',
					button: 'Save'
				}
			}
		},
		onEditRow: function(datatable, rowdata, success, error) {
			var selector = datatable.modal_selector;
			$(selector + ' .modal-body .alert').remove();

			$.ajax({
				url: '/api/edit/dayfile',
				type: 'POST',
				data: formatRequestSingle('Edit', rowdata),
				success: success,
				error: function(response, status, more) {
					// Output the error message
					var selector = datatable.modal_selector;
					$(selector + ' .modal-body .alert').remove();
					var message = '<div class="alert alert-danger" role="alert">' +
					'<strong>' + datatable.language.error.label + '</strong> ';
					for (var key in response.responseJSON.errors) {
						message += response.responseJSON.errors[key][0];
					}
					message +='</div>';
					$(selector + ' .modal-body').append(message);

					// error 501 means MySQL failed but file update was OK
					if (response.status == 501) {
						// We have updated the dayfile data, so update the form
						datatable.s.dt.row(response.responseJSON.data[0]).data(response.responseJSON.data);
						datatable.s.dt.draw('page');
					}
				}
			});
		},
		onDeleteRow: function(datatable, rowdata, success, error) {
			var selector = datatable.modal_selector;
			$(selector + ' .modal-body .alert').remove();

			$.ajax({
				url: '/api/edit/dayfile',
				type: 'POST',
				data: formatRequestMulti('Delete', rowdata),
				success: success,
				error: function(response, status, more) {
					// Output the error message
					var selector = datatable.modal_selector;
					$(selector + ' .modal-body .alert').remove();
					var message = '<div class="alert alert-danger" role="alert">' +
					'<strong>' + datatable.language.error.label + '</strong> ';
					respJson = JSON.parse(response.responseText);
					for (var key in respJson.errors) {
						message += respJson.errors[key][0];
					}
					message +='</div>';
					$(selector + ' .modal-body').append(message);

					// error 501 means MySQL failed but file update was OK
					if (response.status == 501) {
						// We have updated the dayfile data, so update the form
						datatable.s.dt.reload();
					}
				}
			});
		}
	});

	function formatRequestSingle(action, rowdata) {
		var data = '[[';
		// don't include the first element = line number
		for (key in rowdata) {
			if (!isNaN(key) && key > 0) {
				data += '"' + rowdata[key] + '",';
			}
		}
		// remove trailing comma
		data = data.slice(0, -1);
		data += ']]';

		response = '{"action":"' + action + '","lines":[' + rowdata[0] + '],"data":' + data + '}';
		return response;
	}

	function formatRequestMulti(action, rowdata) {
		var lines = '[';
		data = '[';
		for (var i = 0; i < rowdata[0].length; i++) {
			lines +=  rowdata.rows(rowdata[0][i]).data()[0][0] + ',';

			// don't include the first element = line number
			data += '"' + rowdata.rows(rowdata[0][i]).data()[0].slice(1).join(',') + '",';
		}
		// remove trailing commas
		lines = lines.slice(0, -1);
		data = data.slice(0, -1);
		lines += ']';
		data += ']';

		response = '{"action":"' + action + '","lines":' + lines + ',"data": ' + data + '}';
		return response;
	}
});

