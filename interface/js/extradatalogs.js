// Last modified: 2025/06/11 19:26:52

var myTable;
var currMonth;
var decimalToStep = [0, 0.1, 0.01, 0.001, 0.0001];

$(document).ready(function () {
    $.ajax({url: "/api/info/version.json", dataType:"json", success: function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    }});

    $.fn.dataTable.ext.errMode = 'none';

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

    var fromDate, toDate;
    var now = new Date();
    now.setHours(0,0,0,0);

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
        var laserStep = decimalToStep[a4[0].laser.decimals];
        var snowStep = decimalToStep[a4[0].snow.decimals];


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
            {title:"Temp 1", type: 'number', step: tempStep},
            {title:"Temp 2", type: 'number', step: tempStep},
            {title:"Temp 3", type: 'number', step: tempStep},
            {title:"Temp 4", type: 'number', step: tempStep},
            {title:"Temp 5", type: 'number', step: tempStep},
            {title:"Temp 6", type: 'number', step: tempStep},
            {title:"Temp 7", type: 'number', step: tempStep},
            {title:"Temp 8", type: 'number', step: tempStep},
            {title:"Temp 9", type: 'number', step: tempStep},
            {title:"Temp 10", type: 'number', step: tempStep},
            {title:"Hum 1", type: 'number', min: 0, max: 100},
            {title:"Hum 2", type: 'number', min: 0, max: 100},
            {title:"Hum 3", type: 'number', min: 0, max: 100},
            {title:"Hum 4", type: 'number', min: 0, max: 100},
            {title:"Hum 5", type: 'number', min: 0, max: 100},
            {title:"Hum 6", type: 'number', min: 0, max: 100},
            {title:"Hum 7", type: 'number', min: 0, max: 100},
            {title:"Hum 8", type: 'number', min: 0, max: 100},
            {title:"Hum 9", type: 'number', min: 0, max: 100},
            {title:"Hum 10", type: 'number', min: 0, max: 100},
            {title:"Dew point 1", type: 'number', step: tempStep},
            {title:"Dew point 2", type: 'number', step: tempStep},
            {title:"Dew point 3", type: 'number', step: tempStep},
            {title:"Dew point 4", type: 'number', step: tempStep},
            {title:"Dew point 5", type: 'number', step: tempStep},
            {title:"Dew point 6", type: 'number', step: tempStep},
            {title:"Dew point 7", type: 'number', step: tempStep},
            {title:"Dew point 8", type: 'number', step: tempStep},
            {title:"Dew point 9", type: 'number', step: tempStep},
            {title:"Dew point 10", type: 'number', step: tempStep},
            {title:"Soil Temp 1", type: 'number', step: tempStep},
            {title:"Soil Temp 2", type: 'number', step: tempStep},
            {title:"Soil Temp 3", type: 'number', step: tempStep},
            {title:"Soil Temp 4", type: 'number', step: tempStep},
            {title:"Soil Moist 1", type: 'number', min: 0, max: 100},
            {title:"Soil Moist 2", type: 'number', min: 0, max: 100},
            {title:"Soil Moist 3", type: 'number', min: 0, max: 100},
            {title:"Soil Moist 4", type: 'number', min: 0, max: 100},
            {title:"Leaf Temp 1", type: 'number', step: tempStep},
            {title:"Leaf Temp 2", type: 'number', step: tempStep},
            {title:"Leaf Wetness 1", type: 'number', min: 0, max: 100},
            {title:"Leaf Wetness 2", type: 'number', min: 0, max: 100},
            {title:"Soil Temp 5", type: 'number', step: tempStep},
            {title:"Soil Temp 6", type: 'number', step: tempStep},
            {title:"Soil Temp 7", type: 'number', step: tempStep},
            {title:"Soil Temp 8", type: 'number', step: tempStep},
            {title:"Soil Temp 9", type: 'number', step: tempStep},
            {title:"Soil Temp 10", type: 'number', step: tempStep},
            {title:"Soil Temp 11", type: 'number', step: tempStep},
            {title:"Soil Temp 12", type: 'number', step: tempStep},
            {title:"Soil Temp 13", type: 'number', step: tempStep},
            {title:"Soil Temp 14", type: 'number', step: tempStep},
            {title:"Soil Temp 15", type: 'number', step: tempStep},
            {title:"Soil Temp 16", type: 'number', step: tempStep},
            {title:"Soil Moist 5", type: 'number', min: 0, max: 100},
            {title:"Soil Moist 6", type: 'number', min: 0, max: 100},
            {title:"Soil Moist 7", type: 'number', min: 0, max: 100},
            {title:"Soil Moist 8", type: 'number', min: 0, max: 100},
            {title:"Soil Moist 9", type: 'number', min: 0, max: 100},
            {title:"Soil Moist 10", type: 'number', min: 0, max: 100},
            {title:"Soil Moist 11", type: 'number', min: 0, max: 100},
            {title:"Soil Moist 12", type: 'number', min: 0, max: 100},
            {title:"Soil Moist 13", type: 'number', min: 0, max: 100},
            {title:"Soil Moist 14", type: 'number', min: 0, max: 100},
            {title:"Soil Moist 15", type: 'number', min: 0, max: 100},
            {title:"Soil Moist 16", type: 'number', min: 0, max: 100},
            {title:"AQ pm2.5 1", type: 'number', min: 0, step: 0.1},
            {title:"AQ pm2.5 2", type: 'number', min: 0, step: 0.1},
            {title:"AQ pm2.5 3", type: 'number', min: 0, step: 0.1},
            {title:"AQ pm2.5 4", type: 'number', min: 0, step: 0.1},
            {title:"AQ pm2.5 Avg 1", type: 'number', min: 0, step: 0.1},
            {title:"AQ pm2.5 Avg 2", type: 'number', min: 0, step: 0.1},
            {title:"AQ pm2.5 Avg 3", type: 'number', min: 0, step: 0.1},
            {title:"AQ pm2.5 Avg 4", type: 'number', min: 0, step: 0.1},
            {title:"User Temp 1", type: 'number', step: tempStep},
            {title:"User Temp 2", type: 'number', step: tempStep},
            {title:"User Temp 3", type: 'number', step: tempStep},
            {title:"User Temp 4", type: 'number', step: tempStep},
            {title:"User Temp 5", type: 'number', step: tempStep},
            {title:"User Temp 6", type: 'number', step: tempStep},
            {title:"User Temp 7", type: 'number', step: tempStep},
            {title:"User Temp 8", type: 'number', step: tempStep},
            {title:"CO₂", type: 'number', min: 300, step: 0.1},
            {title:"CO₂ Avg", type: 'number', min: 300, step: 0.1},
            {title:"CO₂ PM2.5", type: 'number', min: 0, step: 0.1},
            {title:"CO₂ PM2.5 Avg", type: 'number', min: 0, step: 0.1},
            {title:"CO₂ PM10", type: 'number', min: 0, step: 0.1},
            {title:"CO₂ PM10 Avg", type: 'number', min: 0, step: 0.1},
            {title:"CO₂ Temp", type: 'number', step: tempStep},
            {title:"CO₂ Hum", type: 'number', min: 0, max: 100},
            {title:"Laser Dist 1", type: 'number', min: 0, step: laserStep},
            {title:"Laser Dist 2", type: 'number', min: 0, step: laserStep},
            {title:"Laser Dist 3", type: 'number', min: 0, step: laserStep},
            {title:"Laser Dist 4", type: 'number', min: 0, step: laserStep},
            {title:"Laser Depth 1", type: 'number', step: laserStep},
            {title:"Laser Depth 2", type: 'number', step: laserStep},
            {title:"Laser Depth 3", type: 'number', step: laserStep},
            {title:"Laser Depth 4", type: 'number', step: laserStep},
            {title:"Snow 24h", type: 'number', min: 0, step: snowStep},
            {title:"Temp 11", type: 'number', step: tempStep},
            {title:"Temp 12", type: 'number', step: tempStep},
            {title:"Temp 13", type: 'number', step: tempStep},
            {title:"Temp 14", type: 'number', step: tempStep},
            {title:"Temp 15", type: 'number', step: tempStep},
            {title:"Temp 16", type: 'number', step: tempStep},
            {title:"Hum 11", type: 'number', min: 0, max: 100},
            {title:"Hum 12", type: 'number', min: 0, max: 100},
            {title:"Hum 13", type: 'number', min: 0, max: 100},
            {title:"Hum 14", type: 'number', min: 0, max: 100},
            {title:"Hum 15", type: 'number', min: 0, max: 100},
            {title:"Hum 16", type: 'number', min: 0, max: 100},
            {title:"Dew point 11", type: 'number', step: tempStep},
            {title:"Dew point 12", type: 'number', step: tempStep},
            {title:"Dew point 13", type: 'number', step: tempStep},
            {title:"Dew point 14", type: 'number', step: tempStep},
            {title:"Dew point 15", type: 'number', step: tempStep},
            {title:"Dew point 16", type: 'number', step: tempStep},
            {title:"AQ pm10 1", type: 'number', min: 0, step: 0.1},
            {title:"AQ pm10 2", type: 'number', min: 0, step: 0.1},
            {title:"AQ pm10 3", type: 'number', min: 0, step: 0.1},
            {title:"AQ pm10 4", type: 'number', min: 0, step: 0.1},
            {title:"AQ pm10 Avg 1", type: 'number', min: 0, step: 0.1},
            {title:"AQ pm10 Avg 2", type: 'number', min: 0, step: 0.1},
            {title:"AQ pm10 Avg 3", type: 'number', min: 0, step: 0.1},
            {title:"AQ pm10 Avg 4", type: 'number', min: 0, step: 0.1},
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
                url: "/api/data/extralogfile?from="+formatDateStr(now)+"&to="+formatDateStr(now),
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
                    url: "/api/edit/datalogs",
                    type: 'POST',
                    data: formatRequestSingle("Edit", rowdata),
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
                    url: "/api/edit/datalogs",
                    type: 'POST',
                    data: formatRequestMulti("Delete", rowdata),
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

            response = '{"action":"' + action + '","lines":[' + rowdata[0] + '],"extra":"true","data": ' + data + '}';
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

            response = '{"action":"' + action + '","lines":' + lines + ',"extra":"true","data": ' + data + '}';
            return response;
        }
    });
});

function load() {
    var startDate = $("#dateFrom").datepicker('getDate');
    var endDate = $("#dateTo").datepicker('getDate');
    myTable.api().ajax.url('/api/data/extralogfile'+'?from='+formatDateStr(startDate)+'&to='+formatDateStr(endDate)).load();
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
