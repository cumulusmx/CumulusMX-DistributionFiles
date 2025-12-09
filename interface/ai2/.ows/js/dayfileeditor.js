/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: dayfileeditor.js       	Ver: aiX-1.0
    Author: M Crossley & N Thomas
    Last Edit (MC): 2025/02/12 15:25:50
    Last Edit (NT): 2025/03/21
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Data for dayfileeditor.html
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

// Last modified: 2025/02/12 15:25:50

var decimalToStep = [0, 0.1, 0.01, 0.001, 0.0001];

$.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
    console.log(message);
};

$(document).ready(function() {

    //Added by Neil
    var styles = "<style>\n";
    var data = '{"TempUnit": "<#tempunitnodeg>", "PressUnit": "<#pressunit>", "WindUnit": "<#windunit>", "RainUnit": "<#rainunit>", "WindRunUnit":"<#windrununit>"}';
    $.ajax({ 
        url:  '/api/tags/process.txt',
        dataType: 'json',
        type: 'POST',
        data: data
    })
    .done( function( result ) {
        console.log('Processing units' + JSON.stringify(result));
        styles = "<style>\n";
        styles += "#datalog tbody .tempUnits:after { content:\"°" + result.TempUnit + "\";}\n";
        styles += "#datalog tbody .windUnits:after { content:\"" + result.WindUnit + "\";}\n";
        styles += "#datalog tbody .windRunUnits:after { content: \"" + result.WindRunUnit + "\";}\n";
        styles += "#datalog tbody .rainUnits:after { content:\"" + result.RainUnit + "\";}\n";
        styles += "#datalog tbody .rainRateUnits:after { content:\"" + result.RainUnit + "/hr\";}\n";
        styles += '#datalog tbody .pressUnits:after { content:\"' + result.PressUnit + "\";}\n";
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
        {title: 'Max gust', type: 'number', min: 0, step: windGustStep,className:"windUnits"},
        {title: 'Max gust bearing', type: 'number', min: 0, max: 360, className:'bearing'},
        {title: 'Max gust time', type:'text', pattern: timeRegex, className:'hours'},
        {title: 'Min temp', type: 'number', step: tempStep, className:"tempUnits"},
        {title: 'Min temp time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'Max temp', type: 'number', step: tempStep, className:"tempUnits"},
        {title: 'Max temp time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'Min pressure', type: 'number', min: pressMin, max: pressMax, step: pressStep, className:'pressUnits'},
        {title: 'Min pressure time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'Max pressure', type: 'number', min: pressMin, max: pressMax, step: pressStep, className:'pressUnits'},
        {title: 'Max pressure time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'Max rainfall rate', type: 'number', step: rainStep, className:'rainRateUnits'},
        {title: 'Max rainfall rate time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'Total rainfall', type: 'number', step: rainStep, className:'rainUnits'},
        {title: 'Avg temp', type: 'number', step: tempStep, className:"tempUnits"},
        {title: 'Total wind run', type: 'number', min: 0, step: 0.001, className:'windRunUnits'},
        {title: 'High avg wind speed', type: 'number', min: 0, step: windAvgStep, className:'windUnits'},
        {title: 'High avg wind speed time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'Low humidity', type: 'number', min: 0, max: 100, className:'percent'},
        {title: 'Low humidity time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'High humidity', type: 'number', min: 0, max: 100, className:'percent'},
        {title: 'High humidity time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'Total ET', type: 'number', min: 0, step: etStep},
        {title: 'Total hours of sunshine', type: 'number', min: 0, step: 0.01, className:'hours'},
        {title: 'High heat index', type: 'number', step: tempStep, className:"tempUnits"},
        {title: 'High heat index time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'High apparent temp', type: 'number', step: tempStep, className:"tempUnits"},
        {title: 'High apparent temp time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'Low apparent temp', type: 'number', step: tempStep, className:"tempUnits"},
        {title: 'Low apparent temp time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'High hourly rain', type: 'number', step: rainStep, className:'rainUnits'},
        {title: 'High hourly rain time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'Low wind chill', type: 'number', step: tempStep, className:"tempUnits"},
        {title: 'Low wind chill time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'High dew point', type: 'number', step: tempStep, className:"tempUnits"},
        {title: 'High dew point time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'Low dew point', type: 'number', step: tempStep, className:"tempUnits"},
        {title: 'Low dew point time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'Dominant wind bearing', type: 'number', min: 0, max: 360, className:'bearing'},
        {title: 'Heating degree days', type: 'number', step: tempStep, className:"tempUnits"},
        {title: 'Cooling degree days', type: 'number', step: tempStep, className:"tempUnits"},
        {title: 'High solar rad', type: 'number', min: 0, max: 1200, className:'solarUnits'},
        {title: 'High solar rad time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'High UV-I', type: 'number', min: 0, max: 16, step: 0.1},
        {title: 'High UV-I time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'High feels like', type: 'number', step: tempStep, className:"tempUnits"},
        {title: 'High feels like time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'Low feels like', type: 'number', step: tempStep, className:"tempUnits"},
        {title: 'Low feels like time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'High humidex', type: 'number', step: tempStep},
        {title: 'High humidex time', type:'text', pattern: timeRegex, className:"hours"},
        {title: 'Chill hours', type: 'number', min: 0, step: tempStep, className:"tempUnits"},
        {title: 'High 24 hour rain', type: 'number', step: rainStep, className:'rainUnits'},
        {title: 'High 24 hour rain time', type:'text', pattern: timeRegex, className:"hours"}
        ];

        var myTable = $('#datalog').DataTable({
            //pagingType: 'input',
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
