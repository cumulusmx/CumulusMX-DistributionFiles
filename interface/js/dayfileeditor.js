/* ======================================================================================================================================================
    This is the JavaScript that is called from "CumulusMX/interface/dayfileviewer.html"
    (see https://github.com/cumulusmx/CumulusMX-DistributionFiles/blob/master/interface/datalogs.html)
   ======================================================================================================================================================
    This script is taken from "https://github.com/cumulusmx/CumulusMX-DistributionFiles/blob/master/interface/js/dayfileeditor.js"
Original file "CumulusMX/interface/js/dayfileeditor.js" created for version 3.4.5 by Mark Crossley.
    First edit 4 May 2020 at version 3.6.0 build 3076 (when 4 Feels Like fields were added to the column list in this log file)
    Small edit 18 May 2020 version 3.6.1 build 3077 (when adjusted to use "Cancel" and "Save" buttons)
    Small edit 1 June 2020 version 3.6.6 build 3082 (when adjusted to use "Close" not "Cancel" button)
   ======================================================================================================================================================
    Medium edit by sfws June 2020 for build 3084: adding validation of input.
   The main part of earlier script version that has been modified for validation is this Array.
    The modifications ensure better content achieved in saved rows, as there is no validation in MX engine ("DataEditor.cs")
    Note: all additions are from where a code line starts with comma ",pattern" so are easy to spot		*/
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

        /* all MX versions */
        {
            title: "Date (dd/mm/yy)",
            readonly: true
        },
        {
            title: "Max gust"
            ,pattern: "^[0-9]{1,3}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: up to 3 digits, optional single decimal place; Explanation: ",
            editorOnChange: function(e, altEditor)
            {
                $('.modal-body').append('<span class="text-left bg-info"><sup>#</sup> Indicates a field derived from temperature measurements.</span><br>'
                    + '<br><span class="text-left bg-warning">'
                    + 'If you edit temperature field, consider if a "Derived Field" should also be edited<br>'
                    +'Each "Derived Field" has to be calculated from concurrent measurements, it cannot be re-calculated from daily high and low fields.</span>');
            }
        },
        {
            title: "Max gust bearing"
            ,pattern: "^[0-9]{1,3}$",
            hoverMsg: "Format: up to 3 digits; Explanation: bearing in degrees"
        },
        {
            title: "Max gust time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "Min temp",
            pattern: "(-|)[0-9]{1,3}(,|\\.)?[0-9]?[0-9]?$",
            hoverMsg: "Format: up to 3 digits, optional two decimal places; Explanation: reporting the air temperature"
        },
        {
            title: "Min temp time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "Max temp"
            ,pattern: "(-|)[0-9]{1,3}(,|\\.)?[0-9]?[0-9]?$",
            hoverMsg: "Format: up to 3 digits, optional two decimal places; Explanation: reporting the air temperature"
        },
        {
            title: "Max temp time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "Min pressure"
            ,pattern: "^[0-9]{1,4}(,|\\.)?[0-9]?[0-9]?$",
            hoverMsg: "Format: up to 4 digits, optional two decimal places; Explanation: calculated from the station measured pressure corrected for altitude above sea level"
        },
        {
            title: "Min pressure time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "Max pressure"
            ,pattern: "^[0-9]{1,4}(,|\\.)?[0-9]?[0-9]?$",
            hoverMsg: "Format: up to 4 digits, plus optional two decimal places; Explanation: calculated from the station measured pressure corrected for altitude above sea level"
        },
        {
            title: "Max pressure time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "Max rainfall rate"
            ,pattern: "^[0-9]{1,3}(,|\\.)?[0-9]?[0-9]?$",
            hoverMsg: "Format: up to 3 digits, optional two decimal places; Explanation: calculated from the amount of rain falling in previous five minutes"
        },
        {
            title: "Max rainfall rate time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "Total rainfall"
            ,pattern: "^[0-9]{1,4}(,|\\.)?[0-9]?[0-9]?$",
           hoverMsg: "Format:  up to 3 digits, optional two decimal places; Explanation: representing rainfall that has fallen since start of day"
        },
        {
            title: "Avg temp"
            ,pattern: "(-|)[0-9]{1,4}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: up to 4 digits, plus optional two decimal places; Explanation: reporting the average calculated from every temperature reading in day"
        },
        {
            title: "Total wind run"
            ,pattern: "^[0-9]{1,4}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: up to 4 digits, optional one decimal place; Explanation: this is a distance calculated from the average wind speed (distance divided by time) by multiplying by the time (24 hours)"
        },
        {
            title: "High avg wind speed"
            ,pattern: "[0-9]{1,3}(,|\\.)?[0-9]?",
            hoverMsg: "Format: 1 to 3 digits plus optional single decimal place; Explanation: representing the wind speed averaged over a fixed period that defaults to ten minutes"
        },
        {
            title: "High avg wind speed time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "Low humidity"
            ,pattern: "^[0-9]{1,3}$",
            hoverMsg: "Format: 1 to 3 digits; Explanation: representing relative humidity as percentage"
        },
        {
            title: "Low humidity time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "High humidity"
            ,pattern: "^[0-9]{1,3}$",
            hoverMsg: "Format: 1 to 3 digits; Explanation: representing relative humidity as percentage"
        },
        {
            title: "High humidity time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "Total ET"
            ,pattern: "[0-9]{1,3}(,|\\.)?[0-9]?[0-9]?$",
            hovermsg: "Evapotranspiration: The number representing the process by which water is transferred from the land to the atmosphere by evaporation from the soil"
            + " and other surfaces and by transpiration from plants. Derived from what is reported (if anything) from your weather station, definitely not exact, figure!"
        },
        {
            title: "Total hours of sunshine"
            ,pattern: "[0-9]{1,2}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: up to 2 digits, optional one decimal place; Explanation: counting the number of hours when the solar sensor detects solar radiation above the threshold set"
        },
        {
            title: "High heat index #"
            ,pattern: "(-|)[0-9]{1,3}(,|\\.)?[0-9]?[0-9]?$",
            hoverMsg: "Format: up to 3 digits, optional two decimal places; Explanation: reporting the temperature where your station console is"
        },
        {
            title: "High heat index time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "High apparent temp #"
            ,pattern: "(-|)[0-9]{1,3}(,|\\.)?[0-9]?[0-9]?$",
            hoverMsg: "Format: up to 3 digits, optional two decimal places; Explanation: reporting the temperature where your station console is"
        },
        {
            title: "High apparent temp time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "Low apparent temp #",
            pattern: "(-|)[0-9]{1,3}(,|\\.)?[0-9]?[0-9]?$",
            hoverMsg: "Format: up to 3 digits, optional two decimal places; Explanation: reporting the temperature where your station console is"
        },
        {
            title: "Low apparent temp time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "High hourly rain"
            ,pattern: "^[0-9]{1,3}(,|\\.)?[0-9]?[0-9]?$",
            hoverMsg: "Format: up to 3 digits, optional two decimal places; Explanation: calculated from the amount of rain falling in 60 minutes"
        },
        {
            title: "High hourly rain time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "Low wind chill #"
            ,pattern: "(-|)[0-9]{1,3}(,|\\.)?[0-9]?[0-9]?$",
            hoverMsg: "Format: up to 3 digits, optional two decimal places; Explanation: adjusted temperature after allowing for average wind speed in last ten minutes"
        },
        {
            title: "Low wind chill time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "High dew point #"
            ,pattern: "(-|)[0-9]{1,3}(,|\\.)?[0-9]?[0-9]?$",
            hoverMsg: "Format: up to 3 digits, optional two decimal places; Explanation: representing the lowest temperature that will still hold all the current water content as a vapour"
        },
        {
            title: "High dew point time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "Low dew point #"
            ,pattern: "(-|)[0-9]{1,3}(,|\\.)?[0-9]?[0-9]?$",
            hoverMsg: "Format: up to 3 digits, optional two decimal places; Explanation: representing the lowest temperature that will still hold all the current water content as a vapour"
        },
        {
            title: "Low dew point time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "Dominant wind bearing"
            ,pattern: "^[0-9]{1,3}$",
            hoverMsg: "Format: up to 3 digits; Explanation: bearing in degrees"
        },
        {
            title: "Heating degree days #"
            ,pattern: "[0-9]{1,4}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: up to 4 digits, plus optional one decimal place; Explanation: accumulates temperature deviation from threshold integrated for time and representing how much heating might be needed"
        },
        {
            title: "Cooling degree days #"
            ,pattern: "[0-9]{1,4}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: up to 4 digits, plus optional one decimal place; Explanation: accumulates temperature deviation from threshold integrated for time and representing how much air cooling might be needed"
        },
        {
            title: "High solar rad",
           pattern: "[0-9]{1,4}(,|\\.)?[0-9]?$",
           hoverMsg: "Format: up to 4 integer digits, plus optional one decimal place (default zero); Explanation: calculated from a solar measurement from your station using the formula you have chosen"
        },
        {
            title: "High solar rad time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "High UV-I",
            pattern: "[0-9]{1,2}(,|\\.)?[0-9]?$",
            hoverMsg: "Format: up to 2 integer digits, plus optional single decimal place (default zero); Explanation: International scale runs from zero to eleven"
        },
        {
            title: "High UV-I time"
            ,pattern: "^[0-9][0-9]:[0-9][0-9]$",
            hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },

        /* from version 3.6.0 */
        {
            title: "High feels like #"
            ,hoverMsg: "Format: optional - sign, up to 3 digits, optional single decimal place; Explanation: based on wind chill at low temperatures and based on apparent temperature at high temperatures, this recognises"
            + " effect of wind and humidity on skin is different at high and low temperatures"
        },
        {
            title: "High feels like time"
            ,hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        },
        {
            title: "Low feels like #"
            ,hoverMsg: "Format: optional - sign, up to 3 digits, optional single decimal place; Explanation: based on wind chill at low temperatures and based on apparent temperature at high temperatures, this recognises"
            + " effect of wind and humidity on skin is different at high and low temperatures"
        },
        {
            title: "Low feels like time"
            ,hoverMsg: "Format: 24 hour time, 2 digits for hour, colon, 2 digits for minutes; Explanation: time associated with previous field"
        }
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
        response += ']}';
        return response;
    }
});
