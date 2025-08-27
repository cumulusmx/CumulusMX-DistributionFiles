// Last modified: 2025/08/11 16:58:02

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
            title: '{{LINE_#}}',
            readonly: true
        },
        {
            title: '{{DATE_DDMMYY}}',
            readonly: true
        },
        {title: '{{HIGH_GUST}}', type: 'number', min: 0, step: windGustStep},
        {title: '{{HIGH_GUST_BEARING}}', type: 'number', min: 0, max: 360},
        {title: '{{HIGH_GUST_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{LOW_TEMP}}', type: 'number', step: tempStep},
        {title: '{{LOW_TEMP_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{HIGH_TEMP}}', type: 'number', step: tempStep},
        {title: '{{HIGH_TEMP_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{LOW_PRESS}}', type: 'number', min: pressMin, max: pressMax, step: pressStep},
        {title: '{{LOW_PRESS_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{HIGH_PRESS}}', type: 'number', min: pressMin, max: pressMax, step: pressStep},
        {title: '{{HIGH_PRESS_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{HIGH_RAIN_RATE}}', type: 'number', step: rainStep},
        {title: '{{HIGH_RAIN_RATE_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{DAILY_RAIN}}', type: 'number', step: rainStep},
        {title: '{{TEMP_AVG}}', type: 'number', step: tempStep},
        {title: '{{WIND_RUN}}', type: 'number', min: 0, step: 0.001},
        {title: '{{HIGH_WIND_SPEED}}', type: 'number', min: 0, step: windAvgStep},
        {title: '{{HIGH_WIND_SPEED_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{LOW_HUMIDITY}}', type: 'number', min: 0, max: 100},
        {title: '{{LOW_HUMIDITY_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{HIGH_HUMIDITY}}', type: 'number', min: 0, max: 100},
        {title: '{{HIGH_HUMIDITY_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{EVAPOTRANSPIRATION_SHORT}}', type: 'number', min: 0, step: etStep},
        {title: '{{SUNSHINE_HOURS}}', type: 'number', min: 0, step: 0.01},
        {title: '{{HIGH_HEAT_INDEX}}', type: 'number', step: tempStep},
        {title: '{{HIGH_HEAT_INDEX_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{HIGH_APPARENT_TEMP}}', type: 'number', step: tempStep},
        {title: '{{HIGH_APPARENT_TEMP_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{LOW_APPARENT_TEMP}}', type: 'number', step: tempStep},
        {title: '{{LOW_APPARENT_TEMP_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{HIGH_RAINFALL_1HR}}', type: 'number', step: rainStep},
        {title: '{{HIGH_RAINFALL_1HR_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{LOW_WIND_CHILL}}', type: 'number', step: tempStep},
        {title: '{{LOW_WIND_CHILL_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{HIGH_DEW_POINT}}', type: 'number', step: tempStep},
        {title: '{{HIGH_DEW_POINT_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{LOW_DEW_POINT}}', type: 'number', step: tempStep},
        {title: '{{LOW_DEW_POINT_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{DOMINANT_DIRECTION}}', type: 'number', min: 0, max: 360},
        {title: '{{HEATING_DEGREE_DAYS}}', type: 'number', step: tempStep},
        {title: '{{COOLING_DEGREE_DAYS}}', type: 'number', step: tempStep},
        {title: '{{HIGH_SOLAR_RAD}}', type: 'number', min: 0, max: 1200},
        {title: '{{HIGH_SOLAR_RAD_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{HIGH_UV_INDEX}}', type: 'number', min: 0, max: 16, step: 0.1},
        {title: '{{HIGH_UV_INDEX_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{HIGH_FEELS_LIKE}}', type: 'number', step: tempStep},
        {title: '{{HIGH_FEELS_LIKE_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{LOW_FEELS_LIKE}}', type: 'number', step: tempStep},
        {title: '{{LOW_FEELS_LIKE_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{HIGH_HUMIDEX}}', type: 'number', step: tempStep},
        {title: '{{HIGH_HUMIDEX_TIME}}', type:'text', pattern: timeRegex},
        {title: '{{CHILL_HOURS}}', type: 'number', min: 0, step: tempStep},
        {title: '{{HIGH_RAINFALL_24HR}}', type: 'number', step: rainStep},
        {title: '{{HIGH_RAINFALL_24HR_TIME}}', type:'text', pattern: timeRegex}
        ];

        var myTable = $('#dayfile').DataTable({
            processing: true,
            serverSide: true,
            searching: true,
            searchDelay: 750,
            ordering: false,
            pageLength: 10,
            lengthMenu: [10,20,50,100],
            fixedHeader: true,
            fixedColumns: {
                left: 2
            },
            scrollY: '70vh',
            scrollX: '100%',
            scrollCollapse: true,
            ajax: {
                url: '/api/data/dayfile',
                data: function (data) {
                    delete data.columns;
                }
            },
            columns: columnDefs,
            layout: {
                top: 'inputPaging',
                topStart: 'buttons',
                topEnd: 'search',
                bottomStart: 'inputPaging',
                bottomEnd: 'info'
            },
            select: 'os',
            responsive: false,
            altEditor: true,     // Enable altEditor
            buttons: [
                {
                    extend: 'selected', // Bind to Selected row
                    text: '{{EDIT}}',
                    name: 'edit'        // do not change name
                },
                {
                    extend: 'selected', // Bind to Selected row
                    text: '{{DELETE}}',
                    name: 'delete'      // do not change name
                },
                {
                    text: '{{REFRESH}}',
                    name: 'refresh'      // do not change name
                },
                'pageLength'
            ],
            language: {
                altEditor: {
                    modalClose: '{{Close}}',
                    edit: {
                        title: '{{EDIT_RECORD}}',
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

