// Last modified: 2025/02/18 11:18:22

$(document).ready(function() {

	$("#purgeMySQL").click(function(event) {
		$('#purgeStatus').text('');
		$.ajax({
			url: "/api/utils/purgemysql",
			dataType: 'text'
		})
		.done(function (response) {
			$('#purgeStatus').text(response);
			$('#sqlcache').DataTable().ajax.reload();
			timeOut( 'purgeStatus' );
		})
		.fail(function (jqXHR, response) {
			$('#purgeStatus').text(response);
			$('#sqlcache').DataTable().ajax.reload();
		});
	});

	var columnDefs = [{
		title: "Key",
		readonly: true
	}, {
		title: 'MySQL Statement',
		type: 'textarea'
	}];

	var myTable = $('#sqlcache').DataTable({
		//pagingType: 'input',
		processing: true,
		serverSide: true,
		searching: true,
		searchDelay: 750,
		ordering: false,
		pageLength: 10,
		lengthMenu: [10,20,50,100],
		autoWidth: false,
		rowId: 'key',
		ajax: {
			url: '/api/data/mysqlcache.json',
			data: function (data) {
				delete data.columns;
				//console.log("Data: " + data['Key']['MySQLStatement']);
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
					title: 'Edit MySQL statement',
					button: 'Save'
				}
			}
		},
		onEditRow: function(datatable, rowdata, success, error) {
			var selector = datatable.modal_selector;
			$(selector + ' .modal-body .alert').remove();

			$.ajax({
				url: '/api/edit/mysqlcache',
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
			$.ajax({
				url: '/api/edit/mysqlcache',
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
						// We have updated the file data, so update the form
						datatable.s.dt.reload();
					}
				}
			});
		}
	});

	function formatRequestSingle(action, rowdata) {
		var data = '[';
		// don't include the first element = line number
		for (key in rowdata) {
			if (!isNaN(key) && key > 0) {
				data += '"' + rowdata[key] + '",';
			}
		}
		// remove trailing comma
		data = data.slice(0, -1);
		data += ']';

		response = '{"action":"' + action + '","keys":[' + rowdata[0] + '],"statements": ' + data + '}';
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

		response = '{"action":"' + action + '","keys":' + lines + ',"statements": ' + data + '}';
		return response;
	}

});

