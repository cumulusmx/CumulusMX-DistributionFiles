// Last modified: 2024/12/05 17:46:24

var decimalToStep = [0, 0.1, 0.01, 0.001, 0.0001];

$.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
    console.log(message);
};

$(document).ready(function() {

    $.ajax({
        url: '/api/info/version.json',
        dataType:'json',
        success: function (result) {
            $('#Version').text(result.Version);
            $('#Build').text(result.Build);
    }});

    $.ajax({
        url: '/api/graphdata/graphconfig.json',
        dataType: 'json'
    })
    .done(function(result) {

        var tempStep = decimalToStep[result.temp.decimals];
        var windAvgStep = decimalToStep[result.wind.avgdecimals];
        var windGustStep = decimalToStep[result.wind.gustdecimals];
        var pressStep = decimalToStep[result.press.decimals];
        var rainStep = decimalToStep[result.rain.decimals];
        var etStep = decimalToStep[result.rain.decimals + 1];
        var pressMin = pressUnitsMin(result.press.units);
        var pressMax = pressUnitsMax(result.press.units);

        var timeRegex = '^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$';

        var columnDefs = [
        {
            title: 'Line #',
            readonly: true
        },
        {
            title: 'Date (dd/mm/yy)',
            readonly: true
        },
        {title: 'Max gust', type: 'number', min: 0, step: windGustStep},
        {title: 'Max gust bearing', type: 'number', min: 0, max: 360},
        {title: 'Max gust time', type:'text', pattern: timeRegex},
        {title: 'Min temp', type: 'number', step: tempStep},
        {title: 'Min temp time', type:'text', pattern: timeRegex},
        {title: 'Max temp', type: 'number', step: tempStep},
        {title: 'Max temp time', type:'text', pattern: timeRegex},
        {title: 'Min pressure', type: 'number', min: pressMin, max: pressMax, step: pressStep},
        {title: 'Min pressure time', type:'text', pattern: timeRegex},
        {title: 'Max pressure', type: 'number', min: pressMin, max: pressMax, step: pressStep},
        {title: 'Max pressure time', type:'text', pattern: timeRegex},
        {title: 'Max rainfall rate', type: 'number', step: rainStep},
        {title: 'Max rainfall rate time', type:'text', pattern: timeRegex},
        {title: 'Total rainfall', type: 'number', step: rainStep},
        {title: 'Avg temp', type: 'number', step: tempStep},
        {title: 'Total wind run', type: 'number', min: 0, step: 0.001},
        {title: 'High avg wind speed', type: 'number', min: 0, step: windAvgStep},
        {title: 'High avg wind speed time', type:'text', pattern: timeRegex},
        {title: 'Low humidity', type: 'number', min: 0, max: 100},
        {title: 'Low humidity time', type:'text', pattern: timeRegex},
        {title: 'High humidity', type: 'number', min: 0, max: 100},
        {title: 'High humidity time', type:'text', pattern: timeRegex},
        {title: 'Total ET', type: 'number', min: 0, step: etStep},
        {title: 'Total hours of sunshine', type: 'number', min: 0, step: 0.01},
        {title: 'High heat index', type: 'number', step: tempStep},
        {title: 'High heat index time', type:'text', pattern: timeRegex},
        {title: 'High apparent temp', type: 'number', step: tempStep},
        {title: 'High apparent temp time', type:'text', pattern: timeRegex},
        {title: 'Low apparent temp', type: 'number', step: tempStep},
        {title: 'Low apparent temp time', type:'text', pattern: timeRegex},
        {title: 'High hourly rain', type: 'number', step: rainStep},
        {title: 'High hourly rain time', type:'text', pattern: timeRegex},
        {title: 'Low wind chill', type: 'number', step: tempStep},
        {title: 'Low wind chill time', type:'text', pattern: timeRegex},
        {title: 'High dew point', type: 'number', step: tempStep},
        {title: 'High dew point time', type:'text', pattern: timeRegex},
        {title: 'Low dew point', type: 'number', step: tempStep},
        {title: 'Low dew point time', type:'text', pattern: timeRegex},
        {title: 'Dominant wind bearing', type: 'number', min: 0, max: 360},
        {title: 'Heating degree days', type: 'number', step: tempStep},
        {title: 'Cooling degree days', type: 'number', step: tempStep},
        {title: 'High solar rad', type: 'number', min: 0, max: 1200},
        {title: 'High solar rad time', type:'text', pattern: timeRegex},
        {title: 'High UV-I', type: 'number', min: 0, max: 16, step: 0.1},
        {title: 'High UV-I time', type:'text', pattern: timeRegex},
        {title: 'High feels like', type: 'number', step: tempStep},
        {title: 'High feels like time', type:'text', pattern: timeRegex},
        {title: 'Low feels like', type: 'number', step: tempStep},
        {title: 'Low feels like time', type:'text', pattern: timeRegex},
        {title: 'High humidex', type: 'number', step: tempStep},
        {title: 'High humidex time', type:'text', pattern: timeRegex},
        {title: 'Chill hours', type: 'number', min: 0, step: tempStep},
        {title: 'High 24 hour rain', type: 'number', step: rainStep},
        {title: 'High 24 hour rain time', type:'text', pattern: timeRegex}
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
                url: '/api/data/dayfile',
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
                    url: '/api/edit/dayfile',
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
                    url: '/api/edit/dayfile',
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

    function pressUnitsMin(unit) {
        switch (unit) {
            case 'hPa':
            case 'mb':
                return 870;
            case 'inHg':
                return 25.70;
            case 'kPa':
                return 87;
        }
    }

    function pressUnitsMax(unit) {
        switch (unit) {
            case 'hPa':
            case 'mb':
                return 1080;
            case 'inHg':
                return 31.90;
            case 'kPa':
                return 108;
        }
    }

});

