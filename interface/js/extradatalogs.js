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
        {title:"User Temp 8"}
    ];

    myTable = $('#datalog').dataTable({
        sPaginationType: "full_numbers",
        processing: true,
        serverSide: true,
        searching: false,
        ordering: false,
        ajax: {
            url: "api/data/extralogfile",
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
        language: {
            altEditor: {
                modalClose: 'Cancel',
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
        response = '{"action":"' + action + '","line":' + rowdata[0] + ',"month":"' + currMonth + '","extra":"true","data": [';
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
    myTable.api().ajax.url('api/data/extralogfile'+'?month='+currMonth).load();
}
