// Last modified: 2021/02/15 22:36:08

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
        {title: "Humidex"}
    ];

    myTable = $('#datalog').dataTable({
        pagingType: "input",
        processing: true,
        serverSide: true,
        searching: false,
        ordering: false,
        pageLength: 10,
        lengthMenu: [10,20,50,100],
        ajax: {
            url: "api/data/logfile",
            data: function (data) {
                delete data.columns;
            }
        },
        deferLoading: 10,
        columns: columnDefs,
        dom: '<"top"Bfrtip<"clear">>rt<"bottom"frtip<"clear">>',
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
        // remove trailing comma
        response = response.slice(0, -1);
        response += ']}';
        return response;
    }
});

function load() {
    currMonth = $("#datepicker").val();
    myTable.api().ajax.url('api/data/logfile'+'?month='+currMonth).load();
}
