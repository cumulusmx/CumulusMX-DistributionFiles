// Last modified: 2025/10/16 16:24:58

var myTable;
var currMonth;
var decimalToStep = [0, 0.1, 0.01, 0.001, 0.0001];

$(document).ready(function () {
    $.ajax({url: '/api/info/version.json', dataType:'json', success: function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    }});

    $.fn.dataTable.ext.errMode = 'none';

    var fromDate, toDate;
    var now = new Date();
    now.setHours(0,0,0,0);

    function ajaxRollover() {
        return $.ajax({
            url: '/api/tags/process.json?rollovertime',
            dataType:'json'
        });
    }

    function ajaxRecsbegan() {
        return $.ajax({
            url: '/api/tags/process.txt',
            dataType: 'text',
            method: 'POST',
            data: '<#recordsbegandate format="yyyy-MM-dd">',
            contentType: 'text/plain'
        });
    }

    function ajaxDateFormat() {
        return $.ajax({
            url: '/api/info/dateformat.txt',
            dataType: 'text'
        });
    }

    function ajaxConfig() {
        return $.ajax({
            url: '/api/graphdata/graphconfig.json',
            dataType: 'json'
        });
    }

    $.when(ajaxRollover(), ajaxRecsbegan(), ajaxDateFormat(), ajaxConfig())
    .done(function (a1, a2, a3, a4) {
        // a1
        switch (a1[0].rollovertime) {
        case 'midnight':
            // do nothing
            break;
        case '9 am':
            if (now.getHours() < 9) {
                now.setDate(now.getDate() - 1);
            }
            break;
        case '10 am':
            if (now.getHours() < 10) {
                now.setDate(now.getDate() - 1);
            }
            break;
        default:
            // do nothing
        }

        // a2
        let start = new Date(a2[0]);

        fromDate = $('#dateFrom').datepicker({
                dateFormat: 'dd-mm-yy',
                minDate: start,
                maxDate: '0d',
                yearRange: start.getFullYear() + ':' + now.getFullYear(),
                firstDay: 1,
                changeMonth: true,
                changeYear: true,
            })
            .val(formatUserDateStr(now))
            .on('change', function() {
                var date = fromDate.datepicker('getDate');
                if (toDate.datepicker('getDate') < date) {
                    toDate.datepicker('setDate', date);
                }
                toDate.datepicker('option', { minDate: date });
            });

        toDate = $('#dateTo').datepicker({
                dateFormat: 'dd-mm-yy',
                minDate: start,
                maxDate: '0d',
                yearRange: start.getFullYear() + ':' + now.getFullYear(),
                firstDay: 1,
                changeMonth: true,
                changeYear: true,
            })
            .val(formatUserDateStr(now))
            .on('change', function() {
                var date = fromDate.datepicker('getDate');
                if (toDate.datepicker('getDate') < date) {
                    toDate.datepicker('setDate', date);
                }
                toDate.datepicker('option', { minDate: date });
            });

        fromDate.datepicker('setDate', now);
        toDate.datepicker('setDate', now);

        // a3
        // we want all lower case and yy for the year not yyyy
        var format = a3[0].toLowerCase().replace('yyyy','yy');
        fromDate.datepicker('option', 'dateFormat', format);
        toDate.datepicker('option', 'dateFormat', format);

        // a4
        var tempStep = decimalToStep[a4[0].temp.decimals];
        var windAvgStep = decimalToStep[a4[0].wind.avgdecimals];
        var windGustStep = decimalToStep[a4[0].wind.gustdecimals];
        var pressStep = decimalToStep[a4[0].press.decimals];
        var rainStep = decimalToStep[a4[0].rain.decimals];
        var etStep = decimalToStep[a4[0].rain.decimals + 1];


        var columnDefs = [
            {
                title: '{{LINE_NO}}',
                readonly: true
            },
            {
                title: '{{DATE_DDMMYYHHMM}}',
                readonly: true,
                width: '100px'
            },
            {
                title: '{{TIMESTAMP}}',
                readonly: true
            },
            {title: '{{TEMPERATURE_SHORT}}', type: 'number', step: tempStep},
            {title: '{{HUMIDITY_SHORT}}', type: 'number', min: 0, max: 100},
            {title: '{{DEW_POINT}}', type: 'number', step: tempStep},
            {title: '{{WIND_SPEED}}', type: 'number', min: 0, step: windAvgStep},
            {title: '{{RECENT_HIGH_GUST}}', type: 'number', min: 0, step: windGustStep},
            {title: '{{AVERAGE_BEARING}}', type: 'number', min: 0, max: 360},
            {title: '{{RAINFALL_RATE}}', type: 'number', min: 0, step: rainStep},
            {title: '{{RAINFALL_SO_FAR}}', type: 'number', min: 0, step: rainStep},
            {title: '{{SEA_LEVEL_PRESSURE}}', type: 'number', min: 0, step: pressStep},
            {title: '{{RAINFALL_COUNTER}}', type: 'number', min: 0, step: rainStep},
            {title: '{{INDOOR_TEMP}}', type: 'number', step: tempStep},
            {title: '{{INDOOR_HUMIDITY}}', type: 'number', min: 0, max: 100},
            {title: '{{CURRENT_GUST}}', type: 'number', min: 0, step: windGustStep},
            {title: '{{WIND_CHILL}}', type: 'number', step: tempStep},
            {title: '{{HEAT_INDEX}}', type: 'number', step: tempStep},
            {title: '{{UV_INDEX}}', type: 'number', min: 0, max: 16, step: 0.1},
            {title: '{{SOLAR_RAD}}', type: 'number', min: 0, max: 1200},
            {title: '{{EVAPOTRANSPIRATION_SHORT}}', type: 'number', min: 0, step: etStep},
            {title: '{{ANNUAL_ET}}', type: 'number', min: 0, step: etStep},
            {title: '{{APPARENT_TEMP}}', type: 'number', step: tempStep},
            {title: '{{HIGH_SOLAR_RAD}}', type: 'number'},
            {title: '{{SUN_HOURS}}', type: 'number', step: 0.01},
            {title: 'Wind bearing', type: 'number', min: 0, max: 360},
            {title: '{{RAIN_RG11}}', type: 'number', min: 0, step: rainStep},
            {title: '{{RAIN_SINCE_MIDNIGHT}}', type: 'number', min: 0, step: rainStep},
            {title: '{{FEELS_LIKE}}', type: 'number', step: tempStep},
            {title: '{{HUMIDEX}}', type: 'number', step: tempStep}
        ];

        myTable = $('#datalog').dataTable({
            processing: true,
            serverSide: true,
            searching: true,
            searchDelay: 750,
            ordering: false,
            pageLength: 10,
            lengthMenu: [10,20,50,100],
            fixedHeader: true,
            fixedColumns: {
                left: 3
            },
            scrollY: '70vh',
            scrollX: '100%',
            scrollCollapse: true,
            ajax: {
                url: '/api/data/logfile?from='+formatDateStr(now)+'&to='+formatDateStr(now),
                data: function (data) {
                    delete data.columns;
                }
            },
            deferLoading: 0,
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
                    url: '/api/edit/datalogs',
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
                    url: '/api/edit/datalogs',
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
                            // We have updated the file data, so update the form
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

            response = '{"action":"' + action + '","lines":[' + rowdata[0] + '],"extra":false,"data": ' + data + '}';
            return response;
        }

        function formatRequestMulti(action, rowdata) {
            var lines = '[';
            data = '[';
            for (var i = 0; i < rowdata[0].length; i++) {
                lines +=  rowdata.rows(rowdata[0][i]).data()[0][0] + ',';

                // don't include the first element = line number
                data += '["' + rowdata.rows(rowdata[0][i]).data()[0].slice(1).join('","') + '"],';
            }
            // remove trailing commas
            lines = lines.slice(0, -1);
            data = data.slice(0, -1);
            lines += ']';
            data += ']';

            response = '{"action":"' + action + '","lines":' + lines + ',"extra":false,"data": ' + data + '}';
            return response;
        }
    });
});

function load() {
    var startDate = $('#dateFrom').datepicker('getDate');
    var endDate = $('#dateTo').datepicker('getDate');
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
