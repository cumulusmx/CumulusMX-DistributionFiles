// Last modified: 2021/12/09 11:07:10

var myTable;
var currMonth;
$(document).ready(function () {
    $.ajax({url: "api/settings/version.json", dataType:"json", success: function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    }});

    $.fn.dataTable.ext.errMode = 'none';

    var now = new Date();
    now.setHours(0,0,0,0);

    var fromDate = $('#dateFrom').datepicker({
            format: "dd-mm-yyyy",
            endDate: now,
            autoclose: true,
        }).val(formatUserDateStr(now))
        .on('change', function() {
            var date = fromDate.datepicker('getDate');
            if (toDate.datepicker('getDate') < date) {
                toDate.datepicker('setDate', date);
            }
            toDate.datepicker('option', { min: date });
        });

    var toDate = $('#dateTo').datepicker({
            format: "dd-mm-yyyy",
            endDate: now,
            autoclose: true,
        }).val(formatUserDateStr(now))
        .on('change', function() {
            var date = fromDate.datepicker('getDate');
            if (toDate.datepicker('getDate') < date) {
                toDate.datepicker('setDate', date);
            }
            toDate.datepicker('option', { min: date });
        });

    fromDate.datepicker('setDate', now);
    toDate.datepicker('setDate', now);

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
        {title:"Temp 1"},
        {title:"Temp 2"},
        {title:"Temp 3"},
        {title:"Temp 4"},
        {title:"Temp 5"},
        {title:"Temp 6"},
        {title:"Temp 7"},
        {title:"Temp 8"},
        {title:"Temp 9"},
        {title:"Temp 10"},
        {title:"Hum 1"},
        {title:"Hum 2"},
        {title:"Hum 3"},
        {title:"Hum 4"},
        {title:"Hum 5"},
        {title:"Hum 6"},
        {title:"Hum 7"},
        {title:"Hum 8"},
        {title:"Hum 9"},
        {title:"Hum 10"},
        {title:"Dew point 1"},
        {title:"Dew point 2"},
        {title:"Dew point 3"},
        {title:"Dew point 4"},
        {title:"Dew point 5"},
        {title:"Dew point 6"},
        {title:"Dew point 7"},
        {title:"Dew point 8"},
        {title:"Dew point 9"},
        {title:"Dew point 10"},
        {title:"Soil Temp 1"},
        {title:"Soil Temp 2"},
        {title:"Soil Temp 3"},
        {title:"Soil Temp 4"},
        {title:"Soil Moist 1"},
        {title:"Soil Moist 2"},
        {title:"Soil Moist 3"},
        {title:"Soil Moist 4"},
        {title:"Leaf Temp 1"},
        {title:"Leaf Temp 2"},
        {title:"Leaf Wetness 1"},
        {title:"Leaf Wetness 2"},
        {title:"Soil Temp 5"},
        {title:"Soil Temp 6"},
        {title:"Soil Temp 7"},
        {title:"Soil Temp 8"},
        {title:"Soil Temp 9"},
        {title:"Soil Temp 10"},
        {title:"Soil Temp 11"},
        {title:"Soil Temp 12"},
        {title:"Soil Temp 13"},
        {title:"Soil Temp 14"},
        {title:"Soil Temp 15"},
        {title:"Soil Temp 16"},
        {title:"Soil Moist 5"},
        {title:"Soil Moist 6"},
        {title:"Soil Moist 7"},
        {title:"Soil Moist 8"},
        {title:"Soil Moist 9"},
        {title:"Soil Moist 10"},
        {title:"Soil Moist 11"},
        {title:"Soil Moist 12"},
        {title:"Soil Moist 13"},
        {title:"Soil Moist 14"},
        {title:"Soil Moist 15"},
        {title:"Soil Moist 16"},
        {title:"Air Quality 1"},
        {title:"Air Quality 2"},
        {title:"Air Quality 3"},
        {title:"Air Quality 4"},
        {title:"Air Qual Avg 1"},
        {title:"Air Qual Avg 2"},
        {title:"Air Qual Avg 3"},
        {title:"Air Qual Avg 4"},
        {title:"User Temp 1"},
        {title:"User Temp 2"},
        {title:"User Temp 3"},
        {title:"User Temp 4"},
        {title:"User Temp 5"},
        {title:"User Temp 6"},
        {title:"User Temp 7"},
        {title:"User Temp 8"},
        {title:"CO<sub>2</sub>"},
        {title:"CO<sub>2</sub> Avg"},
        {title:"CO<sub>2</sub> PM2.5"},
        {title:"CO<sub>2</sub> PM2.5 Avg"},
        {title:"CO<sub>2</sub> PM10"},
        {title:"CO<sub>2</sub> PM10 Avg"},
        {title:"CO<sub>2</sub> Temp"},
        {title:"CO<sub>2</sub> Hum"},
    ];

    myTable = $('#datalog').dataTable({
        pagingType: "input",
        processing: true,
        serverSide: true,
        searching: true,
        searchDelay: 750,
        ordering: false,
        pageLength: 10,
        lengthMenu: [10,20,50,100],
        ajax: {
            url: "api/data/extralogfile?from="+formatDateStr(now)+"&to="+formatDateStr(now),
            data: function (data) {
                delete data.columns;
            }
        },
        deferLoading: 0,
        columns: columnDefs,
        dom: '<"top"Bfip<"clear">>rt<"bottom"fip<"clear">>',
        select: 'single',
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
            $.ajax({
                url: "api/edit/datalogs",
                type: 'POST',
                data: formatResponse("Edit", rowdata),
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
                url: "api/edit/datalogs",
                type: 'POST',
                data: formatResponse("Delete", rowdata),
                success: success,
                error: error
            });
        }
    });

    function formatResponse(action, rowdata) {
        response = '{"action":"' + action + '","line":' + rowdata[0] + ',"date":"' + rowdata[1] + '","extra":"true","data": [';
        for (var key in rowdata) {
            if (!isNaN(key) && key > 0) {
                response += '"' + rowdata[key] + '",';
            }
        }
        // remove trailing comma
        response = response.slice(0, -1);
        response += ']}';
        return response;
    }
});

function load() {
    var startDate = $("#dateFrom").datepicker('getDate');
    var endDate = $("#dateTo").datepicker('getDate');
    myTable.api().ajax.url('api/data/extralogfile'+'?from='+formatDateStr(startDate)+'&to='+formatDateStr(endDate)).load();
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
