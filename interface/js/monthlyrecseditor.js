$(document).ready(function() {
    $('.loading-overlay').show();
    $('.loading-overlay-image-container').show();

    $.ajax({url: "api/edit/monthlyrecords.json", dataType:"json", success: function (result) {
        $.each(result, function(key, value) {
            $('#' + key).text(value);
        });
    }});

    $.ajax({url: "api/edit/monthlyrecordsdayfile.json", dataType:"json", success: function (result) {
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
        for (var m = 1; m <= 12; m++) {
            $('#' + m + '-highTempVal').editable();
            $('#' + m + '-highTempTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-lowTempVal').editable();
            $('#' + m + '-lowTempTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-highDewPointVal').editable();
            $('#' + m + '-highDewPointTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-lowDewPointVal').editable();
            $('#' + m + '-lowDewPointTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-highApparentTempVal').editable();
            $('#' + m + '-highApparentTempTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-lowApparentTempVal').editable();
            $('#' + m + '-lowApparentTempTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-highFeelsLikeVal').editable();
            $('#' + m + '-highFeelsLikeTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-lowFeelsLikeVal').editable();
            $('#' + m + '-lowFeelsLikeTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-highHumidexVal').editable();
            $('#' + m + '-highHumidexTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-highHeatIndexVal').editable();
            $('#' + m + '-highHeatIndexTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-lowWindChillVal').editable();
            $('#' + m + '-lowWindChillTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-highMinTempVal').editable();
            $('#' + m + '-highMinTempTime').editable({format:"dd/mm/yy"});
            $('#' + m + '-lowMaxTempVal').editable();
            $('#' + m + '-lowMaxTempTime').editable({format:"dd/mm/yy"});
            $('#' + m + '-highDailyTempRangeVal').editable();
            $('#' + m + '-highDailyTempRangeTime').editable({format:"dd/mm/yy"});
            $('#' + m + '-lowDailyTempRangeVal').editable();
            $('#' + m + '-lowDailyTempRangeTime').editable({format:"dd/mm/yy"});
            $('#' + m + '-highHumidityVal').editable();
            $('#' + m + '-highHumidityTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-lowHumidityVal').editable();
            $('#' + m + '-lowHumidityTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-highBarometerVal').editable();
            $('#' + m + '-highBarometerTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-lowBarometerVal').editable();
            $('#' + m + '-lowBarometerTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-highGustVal').editable();
            $('#' + m + '-highGustTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-highWindVal').editable();
            $('#' + m + '-highWindTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-highWindRunVal').editable();
            $('#' + m + '-highWindRunTime').editable({format:"dd/mm/yy"});
            $('#' + m + '-highRainRateVal').editable();
            $('#' + m + '-highRainRateTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-highHourlyRainVal').editable();
            $('#' + m + '-highHourlyRainTime').editable({format:"dd/mm/yy hh:ii"});
            $('#' + m + '-highDailyRainVal').editable();
            $('#' + m + '-highDailyRainTime').editable({format:"dd/mm/yy"});
            $('#' + m + '-highMonthlyRainVal').editable();
            $('#' + m + '-highMonthlyRainTime').editable({format:"yyyy/mm"});
            $('#' + m + '-longestDryPeriodVal').editable();
            $('#' + m + '-longestDryPeriodTime').editable({format:"dd/mm/yy"});
            $('#' + m + '-longestWetPeriodVal').editable();
            $('#' + m + '-longestWetPeriodTime').editable({format:"dd/mm/yy"});

            $('.loading-overlay').hide();
            $('.loading-overlay-image-container').hide();
        }
    });
});

function getMonthlyLogs() {
    $('.loading-overlay').show();
    $('.loading-overlay-image-container').show();
    $.ajax({url: "api/edit/monthlyrecordslogfile.json", dataType:"json", success: function (result) {
        $.each(result, function(key, value) {
            $('#' + key).text(value);
        });
        $('.loading-overlay').hide();
        $('.loading-overlay-image-container').hide();
    }});
}
