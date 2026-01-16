// Last modified: 2025/11/27 15:12:57

var decimalToStep = [0, 0.1, 0.01, 0.001, 0.0001];
var myTable;

$.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
    console.log(message);
};

$().ready(function() {

/*    $.ajax({
        url: '/api/info/version.json',
        dataType:'json',
        success: function (result) {
            $('#Version').text(result.Version);
            $('#Build').text(result.Build);
    }});
*/
    var data = '{"TempUnit": "<#tempunitnodeg>", "PressUnit": "<#pressunit>", "WindUnit": "<#windunit>", "RainUnit": "<#rainunit>", "WindRunUnit":"<#windrununit>"}';
    $.ajax({ 
        url:  '/api/tags/process.txt',
        dataType: 'json',
        type: 'POST',
        data: data
    })
    .done( function( result ) {
        //console.log('Processing units' + JSON.stringify(result));
        styles = "<style>\n";
        styles += "#recent tbody .tempUnits:after { content:\"°" + result.TempUnit + "\";}\n";
        styles += "#recent tbody .windUnits:after { content:\"" + result.WindUnit + "\";}\n";
        styles += "#recent tbody .windRunUnits:after { content: \"" + result.WindRunUnit + "\";}\n";
        styles += "#recent tbody .rainUnits:after { content:\"" + result.RainUnit + "\";}\n";
        styles += "#recent tbody .rainRateUnits:after { content:\"" + result.RainUnit + "/hr\";}\n";
        styles += '#recent tbody .pressUnits:after { content:\"' + result.PressUnit + "\";}\n";
        styles == "</styles>\n";
        $('head').append( styles );
    })
    .fail( function() {
        console.log('Failed to load units');
    });

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
        var pressMin = pressUnitsMin(result.press.units);
        var pressMax = pressUnitsMax(result.press.units);

        var columnDefs = [
            {
                title: '{{DATE_DDMMYYHHMM}}',
                width: '8em',
                readonly: true
            },
            {
                title: '{{TIMESTAMP}}',
                readonly: true
            },
            {title: '{{WIND_SPEED}}', type: 'number', min: 0, step: windAvgStep, className: 'windUnits'},
            {title: '{{RECENT_HIGH_GUST}}', type: 'number', min: 0, step: windGustStep,className: 'windUnits'},
            {title: '{{WIND_LATEST}}', type: 'number', min: 0, step: windGustStep, className: 'windUnits'},
            {title: '{{WIND_BEARING}}', type: 'number', min: 0, max: 360, className: 'bearing'},
            {title: '{{AVERAGE_BEARING}}', type: 'number', min: 0, max: 360, className: 'bearing'},
            {title: '{{TEMPERATURE_SHORT}}', type: 'number', step: tempStep, className: 'tempUnits'},
            {title: '{{WIND_CHILL}}', type: 'number', step: tempStep, className: 'tempUnits'},
            {title: '{{DEW_POINT}}', type: 'number', step: tempStep, className: 'tempUnits'},
            {title: '{{HEAT_INDEX}}', type: 'number', step: tempStep},
            {title: '{{FEELS_LIKE}}', type: 'number', step: tempStep, className: 'tempUnits'},
            {title: '{{HUMIDEX}}', type: 'number', step: tempStep},
            {title: '{{APPARENT_TEMP}}', type: 'number', step: tempStep, className: 'tempUnits'},
            {title: '{{HUMIDITY_SHORT}}', type: 'number', min: 0, max: 100, className: 'percent'},
            {title: '{{SEA_LEVEL_PRESSURE}}', type: 'number', min: pressMin, max: pressMax, step: pressStep, className: 'pressUnits'},
            {title: '{{RAINFALL_SO_FAR}}', type: 'number', min: 0, step: rainStep, className: 'rainUnits'},
            {title: '{{RAINFALL_RATE}}', type: 'number', min: 0, step: rainStep, className: 'rainRateUnits'},
            {title: '{{RAINFALL_COUNTER}}', type: 'number', min: 0, step: rainStep},
            {title: '{{SOLAR_RAD}}', type: 'number', min: 0, max: 1200, className: 'solarUnits'},
            {title: '{{SOLAR_MAX}}', type: 'number', min: 0, max: 1200, className: 'windUnits'},
            {title: '{{UV_INDEX}}', type: 'number', min: 0, max: 16, step: 0.1},
            {title: '{{INDOOR_TEMP}}', type: 'number', step: tempStep, className: 'tempUnits'},
            {title: '{{INDOOR_HUMIDITY}}', type: 'number', min: 0, max: 100, className: 'windUnits'},
            {title: "AQ pm2.5", type: 'number', min: 0, step: 0.1, className: 'aq2-5Units'},
            {title: "AQ pm10", type: 'number', min: 0, step: 0.1, className: 'aq10Units'}
        ];

        myTable = $('#recent').DataTable({
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
                url: '/api/data/recentdata',
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
                    modalClose: '{{CLOSE}}',
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
                    url: '/api/edit/recentdata',
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
                    }
                });
            },
            onDeleteRow: function(datatable, rowdata, success, error) {
                var selector = datatable.modal_selector;
                $(selector + ' .modal-body .alert').remove();

                $.ajax({
                    url: '/api/edit/recentdata',
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
                    }
                });
            }
        });
    });

    function formatRequestSingle(action, rowdata) {
        var data = '[[';
        // don't include the first element = date/time
        for (key in rowdata) {
            if (!isNaN(key) && key > 0) {
                data += '"' + rowdata[key] + '",';
            }
        }
        // remove trailing comma
        data = data.slice(0, -1);
        data += ']]';

        response = '{"action":"' + action + '","data":' + data + '}';
        return response;
    }

    function formatRequestMulti(action, rowdata) {
        data = '[';
        for (var i = 0; i < rowdata[0].length; i++) {
            // don't include the first element = date/time
                data += '["' + rowdata.rows(rowdata[0][i]).data()[0].slice(1).join('","') + '"],';
        }
        // remove trailing commas
        data = data.slice(0, -1);
        data += ']';

        response = '{"action":"' + action + '","data": ' + data + '}';
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

