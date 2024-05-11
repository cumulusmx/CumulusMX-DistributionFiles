// Last modified: 2023/04/03 16:16:14

var myTable;
var currMonth;
$(document).ready(function () {
/*    $.ajax({url: "/api/settings/version.json", dataType:"json", success: function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    }});
*/
    $.fn.dataTable.ext.errMode = 'none';

    var fromDate, toDate;
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
                autoclose: true,
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
                autoclose: true,
            }).val(formatUserDateStr(now))
            .on('change', function() {
                var date = fromDate.datepicker('getDate');
                if (toDate.datepicker('getDate') < date) {
                    toDate.datepicker('setDate', date);
                }
                toDate.datepicker('option', { minDate: date });
            });

        
        toDate.datepicker('setDate', now);
        fromDate.datepicker('setDate', now);
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
            console.log("");
            toDate.datepicker('option', 'dateFormat', format);
            fromDate.datepicker('option', 'dateFormat', format);
        }
    });

    var columnDefs = [
        {
            title: "Line No.",
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
        {title:"Temp X", className:"tempUnits"},
        {title:"Temp 2", className:"tempUnits"},
        {title:"Temp 3", className:"tempUnits"},
        {title:"Temp 4", className:"tempUnits"},
        {title:"Temp 5", className:"tempUnits"},
        {title:"Temp 6", className:"tempUnits"},
        {title:"Temp 7", className:"tempUnits"},
        {title:"Temp 8", className:"tempUnits"},
        {title:"Temp 9", className:"tempUnits"},
        {title:"Temp 10", className:"tempUnits"},
        {title:"Hum 1", className:"percent"},
        {title:"Hum 2", className:"percent"},
        {title:"Hum 3", className:"percent"},
        {title:"Hum 4", className:"percent"},
        {title:"Hum 5", className:"percent"},
        {title:"Hum 6", className:"percent"},
        {title:"Hum 7", className:"percent"},
        {title:"Hum 8", className:"percent"},
        {title:"Hum 9", className:"percent"},
        {title:"Hum 10", className:"percent"},
        {title:"Dew point 1", className:"tempUnits"},
        {title:"Dew point 2", className:"tempUnits"},
        {title:"Dew point 3", className:"tempUnits"},
        {title:"Dew point 4", className:"tempUnits"},
        {title:"Dew point 5", className:"tempUnits"},
        {title:"Dew point 6", className:"tempUnits"},
        {title:"Dew point 7", className:"tempUnits"},
        {title:"Dew point 8", className:"tempUnits"},
        {title:"Dew point 9", className:"tempUnits"},
        {title:"Dew point 10", className:"tempUnits"},
        {title:"Soil Temp 1", className:"tempUnits"},
        {title:"Soil Temp 2", className:"tempUnits"},
        {title:"Soil Temp 3", className:"tempUnits"},
        {title:"Soil Temp 4", className:"tempUnits"},
        {title:"Soil Moist 1", className:"soilMUnits"},
        {title:"Soil Moist 2", className:"soilMUnits"},
        {title:"Soil Moist 3", className:"soilMUnits"},
        {title:"Soil Moist 4", className:"soilMUnits"},
        {title:"Leaf Temp 1", className:"tempUnits"},
        {title:"Leaf Temp 2", className:"tempUnits"},
        {title:"Leaf Wetness 1", className:"leafWUnits"},
        {title:"Leaf Wetness 2", className:"leafWUnits"},
        {title:"Soil Temp 5", className:"tempUnits"},
        {title:"Soil Temp 6", className:"tempUnits"},
        {title:"Soil Temp 7", className:"tempUnits"},
        {title:"Soil Temp 8", className:"tempUnits"},
        {title:"Soil Temp 9", className:"tempUnits"},
        {title:"Soil Temp 10", className:"tempUnits"},
        {title:"Soil Temp 11", className:"tempUnits"},
        {title:"Soil Temp 12", className:"tempUnits"},
        {title:"Soil Temp 13", className:"tempUnits"},
        {title:"Soil Temp 14", className:"tempUnits"},
        {title:"Soil Temp 15", className:"tempUnits"},
        {title:"Soil Temp 16", className:"tempUnits"},
        {title:"Soil Moist 5", className:"soilMUnits"},
        {title:"Soil Moist 6", className:"soilMUnits"},
        {title:"Soil Moist 7", className:"soilMUnits"},
        {title:"Soil Moist 8", className:"soilMUnits"},
        {title:"Soil Moist 9", className:"soilMUnits"},
        {title:"Soil Moist 10", className:"soilMUnits"},
        {title:"Soil Moist 11", className:"soilMUnits"},
        {title:"Soil Moist 12", className:"soilMUnits"},
        {title:"Soil Moist 13", className:"soilMUnits"},
        {title:"Soil Moist 14", className:"soilMUnits"},
        {title:"Soil Moist 15", className:"soilMUnits"},
        {title:"Soil Moist 16", className:"soilMUnits"},
        {title:"Air Quality 1", className:"airQual1Units"},
        {title:"Air Quality 2", className:"airQual2Units"},
        {title:"Air Quality 3", className:"airQual3Units"},
        {title:"Air Quality 4", className:"airQual4Units"},
        {title:"Air Qual Avg 1", className:"airQual1Units"},
        {title:"Air Qual Avg 2", className:"airQual2Units"},
        {title:"Air Qual Avg 3", className:"airQual3Units"},
        {title:"Air Qual Avg 4", className:"airQual4Units"},
        {title:"User Temp 1", className:"tempUnits"},
        {title:"User Temp 2", className:"tempUnits"},
        {title:"User Temp 3", className:"tempUnits"},
        {title:"User Temp 4", className:"tempUnits"},
        {title:"User Temp 5", className:"tempUnits"},
        {title:"User Temp 6", className:"tempUnits"},
        {title:"User Temp 7", className:"tempUnits"},
        {title:"User Temp 8", className:"tempUnits"},
        {title:"CO<sub>2</sub>", className:"CO2Units"},
        {title:"CO<sub>2</sub> Avg", className:"CO2Units"},
        {title:"CO<sub>2</sub> PM2.5", className:"CO22_5Units"},
        {title:"CO<sub>2</sub> PM2.5 Avg", className:"CO22_5Units"},
        {title:"CO<sub>2</sub> PM10", className:"CO2_10Units"},
        {title:"CO<sub>2</sub> PM10 Avg", className:"CO2_10Units"},
        {title:"CO<sub>2</sub> Temp", className:"tempUnits"},
        {title:"CO<sub>2</sub> Hum", className:"percent"},
    ];

    myTable = $('#datalog').dataTable({
        pagingType: "input",
        processing: true,
        serverSide: true,
        searching: true,
        searchDelay: 750,
        ordering: false,
        pageLength: 10,
        fixedColumns: { left: 3 },
        lengthMenu: [10,20,50,100],
        ajax: {
            url: "/api/data/extralogfile?from="+formatDateStr(now)+"&to="+formatDateStr(now),
            data: function (data) {
                delete data.columns;
            }
        },
        deferLoading: 0,
        columns: columnDefs,
        dom: '<"top"Bfip<"clear">>rt<"bottom"fip<"clear">>',
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

        response = '{"action":"' + action + '","lines":[' + rowdata[0] + '],"extra":"true","data": ' + data + '}';
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

        response = '{"action":"' + action + '","lines":' + lines + ',"extra":"true","data": ' + data + '}';
        return response;
    }

    //  Done by Neil
    $.ajax({
        //  Check if extrat sensors have been configured
        url: '/api/graphdata/availabledata.json',
		dataType: 'json',
		success: function(result){
            if(result.ExtraTemp || result.ExtraHum || result.ExtraDew || result.ExtraDewPoint || result.SoilMoist || result.Temp || result.LeafWetness || result.UserTemp || result.CO2) {
				console.log("Other sensors available");
                //  Load the extra sensor log file.
                var today = new Date();
                myTable.api().ajax.url('/api/data/extralogfile'+'?from='+formatDateStr(today)+'&to='+formatDateStr(today)).load();
			} else {
                //  Disable 'Load' button
				console.log("Other sensors not available");
                $('#loadBtn').addClass('w3-disabled');
			}
        }
    })
    
    var today = new Date();
    //  If you have extra log files you can uncomment the following line.
    //myTable.api().ajax.url('/api/data/extralogfile'+'?from='+formatDateStr(today)+'&to='+formatDateStr(today)).load();
});

function load() {
    var startDate = $("#dateFrom").datepicker('getDate');
    var endDate = $("#dateTo").datepicker('getDate');
    myTable.api().ajax.url('/api/data/extralogfile'+'?from='+formatDateStr(startDate)+'&to='+formatDateStr(endDate)).load();
    
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
