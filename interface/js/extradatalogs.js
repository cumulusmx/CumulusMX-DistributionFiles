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
        title:"Click Month",
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
        {title:"Temp 1",
            editorOnChange: function(e, altEditor) {
                $('.modal-body').append('<span class="text-info">Edit any field, where appropriate, but you do not need to edit any field you do not use.</span><br>'
                + '<p class="bg-info">When done click '
                + " <span class='bg-info text-primary'>Save edit,</span><span class='bg-secondary text-secondary'> Close dialog</span></p>");
            },
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing a Davis temperature sensor"
        },
        {title:"Temp 2",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing a Davis temperature sensor"
        },
        {title:"Temp 3",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing a Davis temperature sensor"
        },
        {title:"Temp 4",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing a Davis temperature sensor"
        },
        {title:"Temp 5",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing a Davis temperature sensor"
        },
        {title:"Temp 6",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing a Davis temperature sensor"
        },
        {title:"Temp 7",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing a Davis temperature sensor"
        },
        {title:"Temp 8",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing a Davis temperature sensor"
        },
        {title:"Temp 9",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing a Davis temperature sensor"
        },
        {title:"Temp 10",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing a Davis temperature sensor"
        },
        {title:"Hum 1",
            pattern: "[|0|1[0-9]{1,2}(,|\\.)?[0-9]?",
            hoverMsg: "Format: 1 to 3 digits plus optional single decimal place (default zero); Explanation:  representing a Davis relative humidity as percentage (up to 100)"
        },
        {title:"Hum 2",
            pattern: "[|0|1[0-9]{1,2}(,|\\.)?[0-9]?",
            hoverMsg: "Format: 1 to 3 digits plus optional single decimal place (default zero); Explanation:  representing a Davis relative humidity as percentage (up to 100)"
        },
        {title:"Hum 3",
            pattern: "[|0|1[0-9]{1,2}(,|\\.)?[0-9]?",
            hoverMsg: "Format: 1 to 3 digits plus optional single decimal place (default zero); Explanation:  representing a Davis relative humidity as percentage (up to 100)"
        },
        {title:"Hum 4",
            pattern: "[|0|1[0-9]{1,2}(,|\\.)?[0-9]?",
            hoverMsg: "Format: 1 to 3 digits plus optional single decimal place (default zero); Explanation:  representing a Davis relative humidity as percentage (up to 100)"
        },
        {title:"Hum 5",
            pattern: "[|0|1[0-9]{1,2}(,|\\.)?[0-9]?",
            hoverMsg: "Format: 1 to 3 digits plus optional single decimal place (default zero); Explanation:  representing a Davis relative humidity as percentage (up to 100)"
        },
        {title:"Hum 6",
            pattern: "[|0|1[0-9]{1,2}(,|\\.)?[0-9]?",
            hoverMsg: "Format: 1 to 3 digits plus optional single decimal place (default zero); Explanation:  representing a Davis relative humidity as percentage (up to 100)"
        },
        {title:"Hum 7",
            pattern: "[|0|1[0-9]{1,2}(,|\\.)?[0-9]?",
            hoverMsg: "Format: 1 to 3 digits plus optional single decimal place (default zero); Explanation:  representing a Davis relative humidity as percentage (up to 100)"
        },
        {title:"Hum 8",
            pattern: "[|0|1[0-9]{1,2}(,|\\.)?[0-9]?",
            hoverMsg: "Format: 1 to 3 digits plus optional single decimal place (default zero); Explanation:  representing a Davis relative humidity as percentage (up to 100)"
        },
        {title:"Hum 9",
            pattern: "[|0|1[0-9]{1,2}(,|\\.)?[0-9]?",
            hoverMsg: "Format: 1 to 3 digits plus optional single decimal place (default zero); Explanation:  representing a Davis relative humidity as percentage (up to 100)"
        },
        {title:"Hum 10",
            pattern: "[|0|1[0-9]{1,2}(,|\\.)?[0-9]?",
            hoverMsg: "Format: 1 to 3 digits plus optional single decimal place (default zero); Explanation:  representing a Davis relative humidity as percentage (up to 100)"
        },
        {title:"Dew point 1",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing the lowest temperature that will still hold all the current water content as a vapour"
        },
        {title:"Dew point 2",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing the lowest temperature that will still hold all the current water content as a vapour"
        },
        {title:"Dew point 3",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing the lowest temperature that will still hold all the current water content as a vapour"
        },
        {title:"Dew point 4",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing the lowest temperature that will still hold all the current water content as a vapour"
        },
        {title:"Dew point 5",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing the lowest temperature that will still hold all the current water content as a vapour"
        },
        {title:"Dew point 6",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing the lowest temperature that will still hold all the current water content as a vapour"
        },
        {title:"Dew point 7",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing the lowest temperature that will still hold all the current water content as a vapour"
        },
        {title:"Dew point 8",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing the lowest temperature that will still hold all the current water content as a vapour"
        },
        {title:"Dew point 9",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing the lowest temperature that will still hold all the current water content as a vapour"
        },
        {title:"Dew point 10",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing the lowest temperature that will still hold all the current water content as a vapour"
        },
        {title:"Soil Temp 1",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing a temperature"
        },
        {title:"Soil Temp 2",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing a temperature"
        },
        {title:"Soil Temp 3",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing a temperature"
        },
        {title:"Soil Temp 4",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing a temperature"
        },
        {title:"Soil Moist 1",
            pattern: "[0-3]?[0-9]{1,2}",
            hoverMsg: "Format: 1 to 3 digits; Explanation: One formula compares, either mass, or volume, of moisture (water) with total mass, or volume, it runs 0 to 100. Another scale compares mass or volume of moisture with mass or volume of soil and it runs 0 to 300."
        },
        {title:"Soil Moist 2",
            pattern: "[0-3]?[0-9]{1,2}",
            hoverMsg: "Format: 1 to 3 digits; Explanation: One formula compares, either mass, or volume, of moisture (water) with total mass, or volume, it runs 0 to 100. Another scale compares mass or volume of moisture with mass or volume of soil and it runs 0 to 300."
        },
        {title:"Soil Moist 3",
            pattern: "[0-3]?[0-9]{1,2}",
            hoverMsg: "Format: 1 to 3 digits; Explanation: One formula compares, either mass, or volume, of moisture (water) with total mass, or volume, it runs 0 to 100. Another scale compares mass or volume of moisture with mass or volume of soil and it runs 0 to 300."
        },
        {title:"Soil Moist 4",
            pattern: "[0-3]?[0-9]{1,2}",
            hoverMsg: "Format: 1 to 3 digits; Explanation: One formula compares, either mass, or volume, of moisture (water) with total mass, or volume, it runs 0 to 100. Another scale compares mass or volume of moisture with mass or volume of soil and it runs 0 to 300."
        },
        {title:"Leaf Temp 1",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing a temperature"
        },
        {title:"Leaf Temp 2",
            pattern: "^(-|)[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default zero); Explanation: representing a temperature"
        },
        {title:"Leaf Wetness 1",
            pattern: "[0-3]?[0-9]{1,2}",
            hoverMsg: "Format: 1 to 3 digits; Explanation: "
        },
        {title:"Leaf Wetness 2",
            pattern: "[0-3]?[0-9]{1,2}",
            hoverMsg: "Format: 1 to 3 digits; Explanation: "
        },
        {title:"Soil Temp 5",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default empty); Explanation: for Ecowitt GW1000: representing a temperature"
        },
        {title:"Soil Temp 6",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation: for Ecowitt GW1000: representing a temperature"
        },
        {title:"Soil Temp 7",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation: for Ecowitt GW1000: representing a temperature"
        },
        {title:"Soil Temp 8",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation: for Ecowitt GW1000: representing a temperature"
        },
        {title:"Soil Temp 9",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation: for Ecowitt GW1000: representing a temperature"
        },
        {title:"Soil Temp 10",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation: for Ecowitt GW1000: representing a temperature"
        },
        {title:"Soil Temp 11",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation: for Ecowitt GW1000: representing a temperature"
        },
        {title:"Soil Temp 12",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation: for Ecowitt GW1000: representing a temperature"
        },
        {title:"Soil Temp 13",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation: for Ecowitt GW1000: representing a temperature"
        },
        {title:"Soil Temp 14",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation: for Ecowitt GW1000: representing a temperature"
        },
        {title:"Soil Temp 15",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation: for Ecowitt GW1000: representing a temperature"
        },
        {title:"Soil Temp 16",
            hoverMsg: "Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation: for Ecowitt GW1000: representing a temperature"
        },
        {title:"Soil Moist 5",
            pattern: "[0-3]?[0-9]{1,2}",
            hoverMsg: "Format: 1 to 3 digits; Explanation: for Ecowitt GW1000: One formula compares, either mass, or volume, of moisture (water) with total mass, or volume, it runs 0 to 100. Another scale compares mass or volume of moisture with mass or volume of soil and it runs 0 to 300."
        },
        {title:"Soil Moist 6",
            pattern: "[0-3]?[0-9]{1,2}",
            hoverMsg: "Format: 1 to 3 digits; Explanation: for Ecowitt GW1000: One formula compares, either mass, or volume, of moisture (water) with total mass, or volume, it runs 0 to 100. Another scale compares mass or volume of moisture with mass or volume of soil and it runs 0 to 300."
        },
        {title:"Soil Moist 7",
            pattern: "[0-3]?[0-9]{1,2}",
            hoverMsg: "Format: 1 to 3 digits; Explanation: for Ecowitt GW1000: One formula compares, either mass, or volume, of moisture (water) with total mass, or volume, it runs 0 to 100. Another scale compares mass or volume of moisture with mass or volume of soil and it runs 0 to 300."
        },
        {title:"Soil Moist 8",
            pattern: "[0-3]?[0-9]{1,2}",
            hoverMsg: "Format: 1 to 3 digits; Explanation: for Ecowitt GW1000: One formula compares, either mass, or volume, of moisture (water) with total mass, or volume, it runs 0 to 100. Another scale compares mass or volume of moisture with mass or volume of soil and it runs 0 to 300."
        },
        {title:"Soil Moist 9",
            pattern: "[0-3]?[0-9]{1,2}",
            hoverMsg: "Format: 1 to 3 digits; Explanation: for Ecowitt GW1000: One formula compares, either mass, or volume, of moisture (water) with total mass, or volume, it runs 0 to 100. Another scale compares mass or volume of moisture with mass or volume of soil and it runs 0 to 300."
        },
        {title:"Soil Moist 10",
            pattern: "[0-3]?[0-9]{1,2}",
            hoverMsg: "Format: 1 to 3 digits; Explanation: for Ecowitt GW1000: One formula compares, either mass, or volume, of moisture (water) with total mass, or volume, it runs 0 to 100. Another scale compares mass or volume of moisture with mass or volume of soil and it runs 0 to 300."
        },
        {title:"Soil Moist 11",
            pattern: "[0-3]?[0-9]{1,2}",
            hoverMsg: "Format: 1 to 3 digits; Explanation: for Ecowitt GW1000: One formula compares, either mass, or volume, of moisture (water) with total mass, or volume, it runs 0 to 100. Another scale compares mass or volume of moisture with mass or volume of soil and it runs 0 to 300."
        },
        {title:"Soil Moist 12",
            hoverMsg: "Format: 1 to 3 digits; Explanation: for Ecowitt GW1000: One formula compares, either mass, or volume, of moisture (water) with total mass, or volume, it runs 0 to 100. Another scale compares mass or volume of moisture with mass or volume of soil and it runs 0 to 300."
        },
        {title:"Soil Moist 13",
            pattern: "[0-3]?[0-9]{1,2}",
            hoverMsg: "Format: 1 to 3 digits; Explanation: for Ecowitt GW1000: One formula compares, either mass, or volume, of moisture (water) with total mass, or volume, it runs 0 to 100. Another scale compares mass or volume of moisture with mass or volume of soil and it runs 0 to 300."
        },
        {title:"Soil Moist 14",
            pattern: "[0-3]?[0-9]{1,2}",
            hoverMsg: "Format: 1 to 3 digits; Explanation: for Ecowitt GW1000: One formula compares, either mass, or volume, of moisture (water) with total mass, or volume, it runs 0 to 100. Another scale compares mass or volume of moisture with mass or volume of soil and it runs 0 to 300."
        },
        {title:"Soil Moist 15",
            pattern: "[0-3]?[0-9]{1,2}",
            hoverMsg: "Format: 1 to 3 digits; Explanation: for Ecowitt GW1000: One formula compares, either mass, or volume, of moisture (water) with total mass, or volume, it runs 0 to 100. Another scale compares mass or volume of moisture with mass or volume of soil and it runs 0 to 300."
        },
        {title:"Soil Moist 16",
            pattern: "[0-3]?[0-9]{1,2}",
            hoverMsg: "Format: 1 to 3 digits; Explanation: for Ecowitt GW1000: One formula compares, either mass, or volume, of moisture (water) with total mass, or volume, it runs 0 to 100. Another scale compares mass or volume of moisture with mass or volume of soil and it runs 0 to 300."
        },
        {title:"Air Quality 1"
            ,pattern: "^[0-9]{1,4}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: up to 4 digits, optional one decimal place; Explanation: this is a measure of pollution output by "
        },
        {title:"Air Quality 2"
            ,pattern: "^[0-9]{1,4}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: up to 4 digits, optional one decimal place; Explanation: this is a measure of pollution"
        },
        {title:"Air Quality 3"
            ,pattern: "^[0-9]{1,4}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: up to 4 digits, optional one decimal place; Explanation: this is a measure of pollution"
        },
        {title:"Air Quality 4"
            ,pattern: "^[0-9]{1,4}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: up to 4 digits, optional one decimal place; Explanation: this is a measure of pollution"
        },
        {title:"Air Qual Avg 1"
            ,pattern: "^[0-9]{1,4}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: up to 4 digits, optional one decimal place; Explanation: this is a measure of pollution"
        },
        {title:"Air Qual Avg 2"
            ,pattern: "^[0-9]{1,4}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: up to 4 digits, optional one decimal place; Explanation: this is a measure of pollution"
        },
        {title:"Air Qual Avg 3"
            ,pattern: "^[0-9]{1,4}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: up to 4 digits, optional one decimal place; Explanation: this is a measure of pollution"
        },
        {title:"Air Qual Avg 4"
            ,pattern: "^[0-9]{1,4}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: up to 4 digits, optional one decimal place; Explanation: this is a measure of pollution"
        },
        {title:"User Temp 1",
            hoverMsg: 'Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation:  Ecowitt GW1000 WH34 8 channel "User" (soil and water) temperature sensors;'
        },
        {title:"User Temp 2",
            hoverMsg: 'Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation:  Ecowitt GW1000 WH34 8 channel "User" (soil and water) temperature sensors;'
        },
        {title:"User Temp 3",
            hoverMsg: 'Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation:  Ecowitt GW1000 WH34 8 channel "User" (soil and water) temperature sensors;'
        },
        {title:"User Temp 4",
            hoverMsg: 'Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation:  Ecowitt GW1000 WH34 8 channel "User" (soil and water) temperature sensors;'
        },
        {title:"User Temp 5",
            hoverMsg: 'Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation:  Ecowitt GW1000 WH34 8 channel "User" (soil and water) temperature sensors;'
        },
        {title:"User Temp 6",
            hoverMsg: 'Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation:  Ecowitt GW1000 WH34 8 channel "User" (soil and water) temperature sensors;'
        },
        {title:"User Temp 7",
            hoverMsg: 'Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation:  Ecowitt GW1000 WH34 8 channel "User" (soil and water) temperature sensors;'
        },
        {title:"User Temp 8",
            hoverMsg: 'Format: optional - sign, up to 3 integer digits, plus optional single decimal place (default space); Explanation:  Ecowitt GW1000 WH34 8 channel "User" (soil and water) temperature sensors;'
        }
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
                text: 'Edit a line',
                name: 'edit'        // do not change name
            },
            {
                extend: 'selected', // Bind to Selected row
                text: 'Delete a line',
                name: 'delete'      // do not change name
            },
            {
                text: 'Refresh',
                name: 'refresh'      // do not change name
            }
        ],
        language: {
            altEditor: {
                modalClose: 'Close dialog',
                edit: {
                    title: 'Edit selected log line',
                    button: 'Save edit'
                },
                delete: { title: 'Delete selected log line'}
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
