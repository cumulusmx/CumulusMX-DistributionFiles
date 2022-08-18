// Last modified: 2022/07/27 17:55:41

var updateUrl = 'api/edit/thismonth';
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
        url: 'api/edit/thismonthrecords.json',
        dataType: 'json',
        success: function (result) {
            // set the value and add some accessibility
            $.each(result, function(key, value) {
                $('#' + key)
                    .text(value)
                    .attr('aria-haspopup', true)
                    .addClass('pointer');
            });
        }
    });

    $.ajax({
        url: 'api/edit/thismonthrecordsdayfile.json',
        dataType: 'json',
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
        url: 'api/edit/thismonthrecordslogfile.json',
        dataType: 'json',
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
        url: 'api/settings/version.json',
        dataType: 'json',
        success: function (result) {
            $('#Version').text(result.Version);
            $('#Build').text(result.Build);
        }
    });

    $(document).ajaxStop(function() {
        //$.fn.editable.defaults.mode = 'inline';
        $.fn.editable.defaults.url = updateUrl;
        $.fn.editable.defaults.clear = false;
        $.fn.editable.defaults.send = 'always';
        $.fn.editable.defaults.type = 'text';
        $.fn.editable.defaults.emptytext = '-';
        $.fn.editable.defaults.step = 'any';
        // add some accessibility to the default buttons
        $.fn.editableform.buttons = '<button type="submit" class="btn btn-primary btn-sm editable-submit" aria-label="Save"><i class="glyphicon glyphicon-ok"></i></button><button type="button" class="btn btn-default btn-sm editable-cancel" aria-label="Cancel"><i class="glyphicon glyphicon-remove"></i></button>';

        $('#highTempVal').editable();
        $('#highTempTime').editable();
        $('#lowTempVal').editable();
        $('#lowTempTime').editable();
        $('#highDewPointVal').editable();
        $('#highDewPointTime').editable();
        $('#lowDewPointVal').editable();
        $('#lowDewPointTime').editable();
        $('#highApparentTempVal').editable();
        $('#highApparentTempTime').editable();
        $('#lowApparentTempVal').editable();
        $('#lowApparentTempTime').editable();
        $('#highFeelsLikeVal').editable();
        $('#highFeelsLikeTime').editable();
        $('#lowFeelsLikeVal').editable();
        $('#lowFeelsLikeTime').editable();
        $('#highHumidexVal').editable();
        $('#highHumidexTime').editable();
        $('#lowWindChillVal').editable();
        $('#lowWindChillTime').editable();
        $('#highHeatIndexVal').editable();
        $('#highHeatIndexTime').editable();
        $('#highMinTempVal').editable();
        $('#highMinTempTime').editable();
        $('#lowMaxTempVal').editable();
        $('#lowMaxTempTime').editable();
        $('#highDailyTempRangeVal').editable();
        $('#highDailyTempRangeTime').editable();
        $('#lowDailyTempRangeVal').editable();
        $('#lowDailyTempRangeTime').editable();
        $('#highHumidityVal').editable();
        $('#highHumidityTime').editable();
        $('#lowHumidityVal').editable();
        $('#lowHumidityTime').editable();
        $('#highBarometerVal').editable();
        $('#highBarometerTime').editable();
        $('#lowBarometerVal').editable();
        $('#lowBarometerTime').editable();
        $('#highGustVal').editable();
        $('#highGustTime').editable();
        $('#highWindVal').editable();
        $('#highWindTime').editable();
        $('#highWindRunVal').editable();
        $('#highWindRunTime').editable();
        $('#highRainRateVal').editable();
        $('#highRainRateTime').editable();
        $('#highHourlyRainVal').editable();
        $('#highHourlyRainTime').editable();
        $('#highDailyRainVal').editable();
        $('#highDailyRainTime').editable();
        $('#highRain24hVal').editable();
        $('#highRain24hTime').editable();
        $('#highMonthlyRainVal').editable();
        $('#highMonthlyRainTime').editable();
        $('#longestDryPeriodVal').editable();
        $('#longestDryPeriodTime').editable();
        $('#longestWetPeriodVal').editable();
        $('#longestWetPeriodTime').editable();
        $('.loading-overlay').hide();
        $('.loading-overlay-image-container').hide();
    });
});

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
