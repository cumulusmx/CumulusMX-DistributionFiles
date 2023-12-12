// Last modified: 2023/04/03 16:14:00

var myTable;
var currMonth;
var fromDate, toDate;

$(document).ready(function () {
 
    $.fn.dataTable.ext.errMode = 'none';

//    var fromDate, toDate;
    var now = new Date();
    now.setHours(0,0,0,0);

    $.ajax({url: '/api/tags/process.json?rollovertime', dataType:'json', success: function (result) {
        switch (result.rollovertime) {
        case 'midnight':
            // do nothing
            break;
        case '9 am':
            if (now.getHours() < 9) {
                now.setDate(now.getDate() - 1);
            }
            break;
        case '10 am':
            if (now.getHours() < 10) {
                now.setDate(now.getDate() - 1);
            }
            break;
        default:
            // do nothing
        }

        fromDate = $('#dateFrom').datepicker({
                dateFormat: 'dd-mm-yy',
                maxDate: '0d',
                firstDay: 1,
                changeMonth: true,
                changeYear: true,
            }).val(formatUserDateStr(now))
            .on('change', function() {
                var date = fromDate.datepicker('getDate');
                if (toDate.datepicker('getDate') < date) {
                    toDate.datepicker('setDate', date);
                }
                toDate.datepicker('option', { minDate: date });
            });

        toDate = $('#dateTo').datepicker({
                dateFormat: "dd-mm-yy",
                maxDate: '0d',
                firstDay: 1,
                changeMonth: true,
                changeYear: true,
            }).val(formatUserDateStr(now))
            .on('change', function() {
                var date = fromDate.datepicker('getDate');
                if (toDate.datepicker('getDate') < date) {
                    toDate.datepicker('setDate', date);
                }
                toDate.datepicker('option', { minDate: date });
            });

        fromDate.datepicker('setDate', now);
        toDate.datepicker('setDate', now);
    }});

	//	Added by Neil
	var styles = "<style>\n";
	var data = '{"TempUnit": "<#tempunitnodeg>", "PressUnit": "<#pressunit>", "WindUnit": "<#windunit>", "RainUnit": "<#rainunit>"}';
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
		styles += "#datalog tbody .rainUnits:after { content:\"" + result.RainUnit + "\";}\n";
		styles += "#datalog tbody .rainRateUnits:after { content:\"" + result.RainUnit + "/hr\";}\n";
		styles += '#datalog tbody .pressUnits:after { content:\"' + result.PressUnit + "\";}\n";
		styles == "</styles>\n";
		$('head').append( styles );
	})
	.fail( function() {
		console.log('Failed to load units');
	});

    $.ajax({
        url: '/api/info/dateformat.txt',
        dataType: 'text',
        success: function (result) {
            // we want all lower case and yy for the year not yyyy
            var format = result.toLowerCase().replace('yyyy','yy');
            fromDate.datepicker('option', 'dateFormat', format);
            toDate.datepicker('option', 'dateFormat', format);
        }
    });

    var columnDefs = [
        {
            title: "Line #",
            readonly: true
        },
        {
            title: "Date (dd/mm/yy)",
            readonly: true
        },
        {
            title: "Time",
            readonly: true
        },
        {title: "Temp",				className: 'tempUnits'},
        {title: "Hum",				className: 'percent'},
        {title: "Dew point",		className: 'tempUnits'},
        {title: "Wind speed",		className: 'windUnits'},
        {title: "Recent high gust",	className: 'windUnits'},
        {title: "Average wind bearing", className: 'bearing'},
        {title: "Rainfall rate",	className: 'rainRateUnits'},
        {title: "Rainfall so far",	className: 'rainUnits'},
        {title: "Sea level pressure", className: 'pressUnits'},
        {title: "Rainfall counter"},
        {title: "Inside temp",		className: 'tempUnits'},
        {title: "Inside hum",		className: 'percent'},
        {title: "Current gust",		className: 'windUnits'},
        {title: "Wind chill",		className: 'tempUnits'},
        {title: "Heat Index"},
        {title: "UV Index"},
        {title: "Solar Rad",		className: 'solarUnits'},
        {title: "ET"},
        {title: "Annual ET"},
        {title: "Apparent temp",	className: 'tempUnits'},
        {title: "Max Solar rad",	className: 'solarUnits'},
        {title: "Sun hours",		className: 'hours'},
        {title: "Wind bearing",		className: 'bearing'},
        {title: "RG-11 Rain",		className: 'rainUnits'},
        {title: "Rain Since Midnight", className: 'rainUnits'},
        {title: "Feels like",		className: 'tempUnits'},
        {title: "Humidex",			className: 'tempUnits'}
    ];

    myTable = $('#datalog').dataTable({
        pagingType: "input",
        processing: true,
        serverSide: true,
        searching: true,
        searchDelay: 750,
        ordering: false,
        fixedColumns: { left: 3},
        pageLength: 10,
        lengthMenu: [10,20,50,100],
        ajax: {
            url: "/api/data/logfile?from="+formatDateStr(now)+"&to="+formatDateStr(now),
            data: function (data) {
                delete data.columns;
            }
        },
        deferLoading: 0,
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
                url: "/api/edit/datalogs",
                type: 'POST',
                data: formatRequestSingle("Edit", rowdata),
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
                url: "/api/edit/datalogs",
                type: 'POST',
                data: formatRequestMulti("Delete", rowdata),
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

        response = '{"action":"' + action + '","lines":[' + rowdata[0] + '],"extra":"false","data": ' + data + '}';
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

        response = '{"action":"' + action + '","lines":' + lines + ',"extra":"false","data": ' + data + '}';
        return response;
    }
});

function load() {
    var startDate = $("#dateFrom").datepicker('getDate');
    var endDate = $("#dateTo").datepicker('getDate');
    myTable.api().ajax.url('/api/data/logfile'+'?from='+formatDateStr(startDate)+'&to='+formatDateStr(endDate)).load();
}

function formatDateStr(inDate) {
    return '' + inDate.getFullYear() + '-' + (inDate.getMonth() + 1) + '-' + (inDate.getDate());
}

function formatUserDateStr(inDate) {
    return  addLeadingZeros(inDate.getDate()) + '-' + addLeadingZeros(inDate.getMonth() + 1) + '-' + inDate.getFullYear();
}

function addLeadingZeros(n) {
    return n <= 9 ? '0' + n : n;
}
