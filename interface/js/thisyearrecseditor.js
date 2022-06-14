// Last modified: 2022/06/14 09:51:34

var updateUrl = 'api/edit/thisyear';
var editFieldName;
var editFieldValue;

$(document).ready(function() {

    // initialise the popups
    $('#recUpdater').popup();
    $('#updaterError').popup();
    $.fn.popup.defaults.pagecontainer = '#page'

    $('.loading-overlay').show();
    $('.loading-overlay-image-container').show();

    $.ajax({
        url: "api/edit/thisyearrecords.json",
        dataType:"json",
        success: function (result) {
            $.each(result, function(key, value) {
                // set the value and add some accessibility
                $('#' + key)
                    .text(value)
                    .attr('aria-haspopup', true)
                    .addClass('pointer');
            });
        }
    });

    $.ajax({
        url: "api/edit/thisyearrecordsdayfile.json",
        dataType:"json",
        success: function (result) {
            $.each(result, function(key, value) {
                $('#' + key).text(value);

                if (value != '-' && value != '') {
                    $('#' + key)
                        .attr({
                            'onclick': 'update(this)',
                            'aria-haspopup': true
                        })
                        .addClass('pointer');
                }
        });
        }
    });

    $.ajax({
        url: "api/settings/version.json",
        dataType: "json",
        success: function (result) {
            $('#Version').text(result.Version);
            $('#Build').text(result.Build);
        }
    });

    $(document).ajaxStop(function() {
        //$.fn.editable.defaults.mode = 'inline';
        $.fn.editable.defaults.url= updateUrl;
        $.fn.editable.defaults.clear = false;
        $.fn.editable.defaults.send = 'always';
        $.fn.editable.defaults.type = 'text';
        // add some accessibility to the default buttons
        $.fn.editableform.buttons = '<button type="submit" class="btn btn-primary btn-sm editable-submit" aria-label="Save"><i class="glyphicon glyphicon-ok"></i></button><button type="button" class="btn btn-default btn-sm editable-cancel" aria-label="Cancel"><i class="glyphicon glyphicon-remove"></i></button>';

        $('#highTempVal').editable();
        $('#highTempTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#lowTempVal').editable();
        $('#lowTempTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#highDewPointVal').editable();
        $('#highDewPointTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#lowDewPointVal').editable();
        $('#lowDewPointTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#highApparentTempVal').editable();
        $('#highApparentTempTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#lowApparentTempVal').editable();
        $('#lowApparentTempTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#highFeelsLikeVal').editable();
        $('#highFeelsLikeTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#lowFeelsLikeVal').editable();
        $('#lowFeelsLikeTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#highHumidexVal').editable();
        $('#highHumidexTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#lowWindChillVal').editable();
        $('#lowWindChillTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#highHeatIndexVal').editable();
        $('#highHeatIndexTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#highMinTempVal').editable();
        $('#highMinTempTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#lowMaxTempVal').editable();
        $('#lowMaxTempTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#highDailyTempRangeVal').editable();
        $('#highDailyTempRangeTime').editable({format:"dd/mm/yyyy"});
        $('#lowDailyTempRangeVal').editable();
        $('#lowDailyTempRangeTime').editable({format:"dd/mm/yyyy"});
        $('#highHumidityVal').editable();
        $('#highHumidityTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#lowHumidityVal').editable();
        $('#lowHumidityTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#highBarometerVal').editable();
        $('#highBarometerTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#lowBarometerVal').editable();
        $('#lowBarometerTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#highGustVal').editable();
        $('#highGustTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#highWindVal').editable();
        $('#highWindTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#highWindRunVal').editable();
        $('#highWindRunTime').editable({format:"dd/mm/yyyy"});
        $('#highRainRateVal').editable();
        $('#highRainRateTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#highHourlyRainVal').editable();
        $('#highHourlyRainTime').editable({format:"dd/mm/yyyy hh:ii"});
        $('#highDailyRainVal').editable();
        $('#highDailyRainTime').editable({format:"dd/mm/yyyy"});
        $('#highMonthlyRainVal').editable();
        $('#highMonthlyRainTime').editable({format:"yyyy/mm"});
        $('#longestDryPeriodVal').editable();
        $('#longestDryPeriodTime').editable({format:"dd/mm/yyyy"});
        $('#longestWetPeriodVal').editable();
        $('#longestWetPeriodTime').editable({format:"dd/mm/yyyy"});
        $('.loading-overlay').hide();
        $('.loading-overlay-image-container').hide();
    });
});

function getMonthlyLogs() {
    $('.loading-overlay').show();
    $('.loading-overlay-image-container').show();
    $.ajax({
        url: "api/edit/thisyearrecordslogfile.json",
        dataType:"json",
        success: function (result) {
            $.each(result, function(key, value) {
                $('#' + key).text(value);

                if (value != '-' && value != '') {
                    $('#' + key)
                        .attr({
                            'onclick': 'update(this)',
                            'aria-haspopup': true
                        })
                        .addClass('pointer');
                }
            });
        },
        complete: function () {
            $('.loading-overlay').hide();
            $('.loading-overlay-image-container').hide();
        }
    });
}

function update(field) {
    var type = field.id.includes('Time') ? 2 : 1;
    editFieldValue = field.innerText;

    if (editFieldValue == '') {
        $('#errorContent').text('This field is blank, cannot set the record to this!');
        $('#updaterError').popup('show');
        return;
    }
    editFieldName = $('#' + field.id).siblings()[type].childNodes[0].id;
    var oldVal = $('#' + field.id).siblings()[type].childNodes[0].innerText;
    var name = $('#' + field.id).siblings()[0].innerText;

    if (editFieldValue == oldVal) {
        $('#errorContent').text('The record is already set to this value!');
        $('#updaterError').popup('show');
        return;
    }
    $('#editName').text(name);
    $('#editType').text((type == 1 ? 'value' : 'timestamp'));
    $('#editOldVal').text(oldVal);
    $('#editNewVal').text(editFieldValue);
    $('#recUpdater').popup('show');

}

function updateRec() {
    $.ajax({
        url: updateUrl,
        type: 'POST',
        data: encodeURIComponent('name=' + editFieldName + '&value=' + editFieldValue),
        success: function (result) {

        },
        complete: function () {
            $('#recUpdater').popup('hide');
        }
    });
    $('#' + editFieldName).editable('setValue', editFieldValue, false);
}
