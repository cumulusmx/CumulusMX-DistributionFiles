// Last modified: 2023/10/30 15:20:22

$.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
    console.log(message);
};

$(document).ready(function() {

    $.ajax({
        url: 'api/info/version.json',
        dataType:'json',
        success: function (result) {
            $('#Version').text(result.Version);
            $('#Build').text(result.Build);
    }});

    var columnDefs = [
    {
        title: 'Line #',
        readonly: true
    },
    {
        title: 'Date (dd/mm/yy)',
        readonly: true
    },
    {title: 'Max gust'},
    {title: 'Max gust bearing'},
    {title: 'Max gust time'},
    {title: 'Min temp'},
    {title: 'Min temp time'},
    {title: 'Max temp'},
    {title: 'Max temp time'},
    {title: 'Min pressure'},
    {title: 'Min pressure time'},
    {title: 'Max pressure'},
    {title: 'Max pressure time'},
    {title: 'Max rainfall rate'},
    {title: 'Max rainfall rate time'},
    {title: 'Total rainfall'},
    {title: 'Avg temp'},
    {title: 'Total wind run'},
    {title: 'High avg wind speed'},
    {title: 'High avg wind speed time'},
    {title: 'Low humidity'},
    {title: 'Low humidity time'},
    {title: 'High humidity'},
    {title: 'High humidity time'},
    {title: 'Total ET'},
    {title: 'Total hours of sunshine'},
    {title: 'High heat index'},
    {title: 'High heat index time'},
    {title: 'High apparent temp'},
    {title: 'High apparent temp time'},
    {title: 'Low apparent temp'},
    {title: 'Low apparent temp time'},
    {title: 'High hourly rain'},
    {title: 'High hourly rain time'},
    {title: 'Low wind chill'},
    {title: 'Low wind chill time'},
    {title: 'High dew point'},
    {title: 'High dew point time'},
    {title: 'Low dew point'},
    {title: 'Low dew point time'},
    {title: 'Dominant wind bearing'},
    {title: 'Heating degree days'},
    {title: 'Cooling degree days'},
    {title: 'High solar rad'},
    {title: 'High solar rad time'},
    {title: 'High UV-I'},
    {title: 'High UV-I time'},
    {title: 'High feels like'},
    {title: 'High feels like time'},
    {title: 'Low feels like'},
    {title: 'Low feels like time'},
    {title: 'High humidex'},
    {title: 'High humidex time'},
    {title: 'Chill hours'},
    {title: 'High 24 hour rain'},
    {title: 'High 24 hour rain time'}
    ];

    var myTable = $('#dayfile').DataTable({
        pagingType: 'input',
        processing: true,
        serverSide: true,
        searching: true,
        searchDelay: 750,
        ordering: false,
        pageLength: 10,
        lengthMenu: [10,20,50,100],
        ajax: {
            url: 'api/data/dayfile',
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
                url: 'api/edit/dayfile',
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
                url: 'api/edit/dayfile',
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

