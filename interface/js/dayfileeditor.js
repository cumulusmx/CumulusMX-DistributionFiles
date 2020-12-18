
$(document).ready(function() {

    $.ajax({url: "api/settings/version.json", dataType:"json", success: function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    }});

    var columnDefs = [
    {
        title: "Line No.",
        readonly: true
    },
    {
        title: "Date (dd/mm/yy)",
        readonly: true
    },
    {title: "Max gust"},
    {title: "Max gust bearing"},
    {title: "Max gust time"},
    {title: "Min temp"},
    {title: "Min temp time"},
    {title: "Max temp"},
    {title: "Max temp time"},
    {title: "Min pressure"},
    {title: "Min pressure time"},
    {title: "Max pressure"},
    {title: "Max pressure time"},
    {title: "Max rainfall rate"},
    {title: "Max rainfall rate time"},
    {title: "Total rainfall"},
    {title: "Avg temp"},
    {title: "Total wind run"},
    {title: "High avg wind speed"},
    {title: "High avg wind speed time"},
    {title: "Low humidity"},
    {title: "Low humidity time"},
    {title: "High humidity"},
    {title: "High humidity time"},
    {title: "Total ET"},
    {title: "Total hours of sunshine"},
    {title: "High heat index"},
    {title: "High heat index time"},
    {title: "High apparent temp"},
    {title: "High apparent temp time"},
    {title: "Low apparent temp"},
    {title: "Low apparent temp time"},
    {title: "High hourly rain"},
    {title: "High hourly rain time"},
    {title: "Low wind chill"},
    {title: "Low wind chill time"},
    {title: "High dew point"},
    {title: "High dew point time"},
    {title: "Low dew point"},
    {title: "Low dew point time"},
    {title: "Dominant wind bearing"},
    {title: "Heating degree days"},
    {title: "Cooling degree days"},
    {title: "High solar rad"},
    {title: "High solar rad time"},
    {title: "High UV-I"},
    {title: "High UV-I time"},
    {title: "High feels like"},
    {title: "High feels like time"},
    {title: "Low feels like"},
    {title: "Low feels like time"},
    {title: "High humidex"},
    {title: "High humidex time"}
    ];

    var myTable = $('#dayfile').DataTable({
        sPaginationType: "full_numbers",
        processing: true,
        serverSide: true,
        searching: false,
        ordering: false,
        ajax: {
            url: "api/data/dayfile",
            data: function (data) {
                delete data.columns;
            }
        },
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
                modalClose: 'Close',
                edit: {
                    title: 'Edit record',
                    button: 'Save'
                }
            }
        },
        onEditRow: function(datatable, rowdata, success, error) {
            $.ajax({
                url: "api/edit/dayfile",
                type: 'POST',
                data: formatResponse("Edit", rowdata),
                success: success,
                error: error
            });
        },
        onDeleteRow: function(datatable, rowdata, success, error) {
            $.ajax({
                url: "api/edit/dayfile",
                type: 'POST',
                data: formatResponse("Delete", rowdata),
                success: success,
                error: error
            });
        }
    });

    function formatResponse(action, rowdata) {
        response = '{"action":"' + action + '","line":' + rowdata[0] + ',"data": [';
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
