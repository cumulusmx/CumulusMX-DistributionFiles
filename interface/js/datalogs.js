var myTable;
var currMonth;
$(document).ready(function () {
    $.ajax({url: "api/settings/version.json", dataType:"json", success: function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    }});

    $.fn.dataTable.ext.errMode = 'none';

    var now = new Date();
    // subtract 1 day
    now.setTime(now.getTime()-(1*24*3600000));
    var mon = now.getMonth() + 1;
    mon = mon < 10 ? '0' + mon : mon;
    var dateStr = mon + '-' + now.getFullYear();

    $('#datepicker').datepicker({
        format: "mm-yyyy",
        viewMode: "months",
        minViewMode: "months"
    }).val(dateStr);

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
    ];

    myTable = $('#datalog').dataTable({
        sPaginationType: "full_numbers",
        processing: true,
        serverSide: true,
        searching: false,
        ordering: false,
        ajax: {
            url: "api/data/logfile",
            data: function (data) {
                delete data.columns;
            }
        },
        deferLoading: 10,
        columns: columnDefs,
	    dom: 'Bfrtip',        // Needs button container
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
            }
        ],
        onEditRow: function(datatable, rowdata, success, error) {
            $.ajax({
                url: "api/edit/datalogs",
                type: 'POST',
                data: formatResponse("Edit", rowdata),
                success: success,
                error: error
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
        response = '{"action":"' + action + '","line":' + rowdata[0] + ',"month":"' + currMonth + '","extra":"false","data": [';
        for (var key in rowdata) {
            if (!isNaN(key) && key > 0) {
                response += '"' + rowdata[key] + '",';
            }
        }
        response += ']}';
        return response;
    }
});

function load() {
    currMonth = $("#datepicker").val();
    myTable.api().ajax.url('api/data/logfile'+'?month='+currMonth).load();
}
