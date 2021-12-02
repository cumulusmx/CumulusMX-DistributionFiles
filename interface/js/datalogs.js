// Last modified: 2021/11/26 15:23:20

var myTable;
var currMonth;
$(document).ready(function () {
    $.ajax({url: "api/settings/version.json", dataType:"json", success: function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    }});

    $.fn.dataTable.ext.errMode = 'none';

    var now = new Date();

    var fromDate = $('#dateFrom').datepicker({
            format: "dd-mm-yyyy",
        }).val(formatUserDateStr(now))
        .on('change', function() {
            var date = fromDate.datepicker('getDate');
            if (toDate.datepicker('getDate') < date) {
                toDate.datepicker('setDate', date);
            }
            toDate.datepicker('option', { minDate: date });
        });

    var toDate = $('#dateTo').datepicker({
            format: "dd-mm-yyyy",
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
        {title: "Temp"},
        {title: "Hum"},
        {title: "Dew point"},
        {title: "Wind speed"},
        {title: "Recent high gust"},
        {title: "Average wind bearing"},
        {title: "Rainfall rate"},
        {title: "Rainfall so far"},
        {title: "Sea level pressure"},
        {title: "Rainfall counter"},
        {title: "Inside temp"},
        {title: "Inside hum"},
        {title: "Current gust"},
        {title: "Wind chill"},
        {title: "Heat Index"},
        {title: "UV Index"},
        {title: "Solar Rad"},
        {title: "ET"},
        {title: "Annual ET"},
        {title: "Apparent temp"},
        {title: "Max Solar rad"},
        {title: "Sun hours"},
        {title: "Wind bearing"},
        {title: "RG-11 Rain"},
        {title: "Rain Since Midnight"},
        {title: "Feels like"},
        {title: "Humidex"}
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
            url: "api/data/logfile?from="+formatDateStr(now)+"&to="+formatDateStr(now),
            data: function (data) {
                delete data.columns;
            }
        },
        deferLoading: 0,
        columns: columnDefs,
        dom: '<"top"Bfip<"clear">>t<"bottom"fip<"clear">>',
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
            var selector = datatable.modal_selector;
            $(selector + ' .modal-body .alert').remove();

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
        response = '{"action":"' + action + '","line":' + rowdata[0] + ',"date":"' + rowdata[1] + '","extra":"false","data": [';
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
    myTable.api().ajax.url('api/data/logfile'+'?from='+formatDateStr(startDate)+'&to='+formatDateStr(endDate)).load();
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
