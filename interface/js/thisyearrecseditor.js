// Last modified: 2021/02/15 22:37:09

$(document).ready(function() {

    $('.loading-overlay').show();
    $('.loading-overlay-image-container').show();

    $.ajax({url: "api/edit/thisyearrecords.json", dataType:"json", success: function (result) {
        $.each(result, function(key, value) {
            $('#' + key).text(value);
        });
    }});

    $.ajax({url: "api/edit/thisyearrecordsdayfile.json", dataType:"json", success: function (result) {
        $.each(result, function(key, value) {
            $('#' + key).text(value);
        });
    }});

    $.ajax({url: "api/edit/thisyearrecordslogfile.json", dataType:"json", success: function (result) {
        $.each(result, function(key, value) {
            $('#' + key).text(value);
        });
    }});

    $.ajax({url: "api/settings/version.json", dataType: "json", success: function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    }});

    $(document).ajaxStop(function() {
        $.fn.editable.defaults.mode = 'inline';
        $('#highTempVal').editable();
        $('#highTempTime').editable({format:"dd/mm/yy hh:ii"});
        $('#lowTempVal').editable();
        $('#lowTempTime').editable({format:"dd/mm/yy hh:ii"});
        $('#highDewPointVal').editable();
        $('#highDewPointTime').editable({format:"dd/mm/yy hh:ii"});
        $('#lowDewPointVal').editable();
        $('#lowDewPointTime').editable({format:"dd/mm/yy hh:ii"});
        $('#highApparentTempVal').editable();
        $('#highApparentTempTime').editable({format:"dd/mm/yy hh:ii"});
        $('#lowApparentTempVal').editable();
        $('#lowApparentTempTime').editable({format:"dd/mm/yy hh:ii"});
        $('#highFeelsLikeVal').editable();
        $('#highFeelsLikeTime').editable({format:"dd/mm/yy hh:ii"});
        $('#lowFeelsLikeVal').editable();
        $('#lowFeelsLikeTime').editable({format:"dd/mm/yy hh:ii"});
        $('#highHumidexVal').editable();
        $('#highHumidexTime').editable({format:"dd/mm/yy hh:ii"});
        $('#lowWindChillVal').editable();
        $('#lowWindChillTime').editable({format:"dd/mm/yy hh:ii"});
        $('#highHeatIndexVal').editable();
        $('#highHeatIndexTime').editable({format:"dd/mm/yy hh:ii"});
        $('#highMinTempVal').editable();
        $('#highMinTempTime').editable({format:"dd/mm/yy hh:ii"});
        $('#lowMaxTempVal').editable();
        $('#lowMaxTempTime').editable({format:"dd/mm/yy hh:ii"});
        $('#highDailyTempRangeVal').editable();
        $('#highDailyTempRangeTime').editable({format:"dd/mm/yy"});
        $('#lowDailyTempRangeVal').editable();
        $('#lowDailyTempRangeTime').editable({format:"dd/mm/yy"});
        $('#highHumidityVal').editable();
        $('#highHumidityTime').editable({format:"dd/mm/yy hh:ii"});
        $('#lowHumidityVal').editable();
        $('#lowHumidityTime').editable({format:"dd/mm/yy hh:ii"});
        $('#highBarometerVal').editable();
        $('#highBarometerTime').editable({format:"dd/mm/yy hh:ii"});
        $('#lowBarometerVal').editable();
        $('#lowBarometerTime').editable({format:"dd/mm/yy hh:ii"});
        $('#highGustVal').editable();
        $('#highGustTime').editable({format:"dd/mm/yy hh:ii"});
        $('#highWindVal').editable();
        $('#highWindTime').editable({format:"dd/mm/yy hh:ii"});
        $('#highWindRunVal').editable();
        $('#highWindRunTime').editable({format:"dd/mm/yy"});
        $('#highRainRateVal').editable();
        $('#highRainRateTime').editable({format:"dd/mm/yy hh:ii"});
        $('#highHourlyRainVal').editable();
        $('#highHourlyRainTime').editable({format:"dd/mm/yy hh:ii"});
        $('#highDailyRainVal').editable();
        $('#highDailyRainTime').editable({format:"dd/mm/yy"});
        $('#highMonthlyRainVal').editable();
        $('#highMonthlyRainTime').editable({format:"yyyy/mm"});
        $('#longestDryPeriodVal').editable();
        $('#longestDryPeriodTime').editable({format:"dd/mm/yy"});
        $('#longestWetPeriodVal').editable();
        $('#longestWetPeriodTime').editable({format:"dd/mm/yy"});
        $('.loading-overlay').hide();
        $('.loading-overlay-image-container').hide();
    });
});
