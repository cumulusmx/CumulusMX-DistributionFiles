// Last modified: 2022/06/14 09:44:42

var updateUrl = 'api/edit/monthly';
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
        url: "api/edit/monthlyrecords.json",
        dataType:"json",
        success: function (result) {
            $.each(result, function(key, value) {
                // set the value and add some accessibility
                //$('#' + key).text(value).on('shown', function(e, editable) {editable.input.$input.attr("aria-label", editable.options.title)});
                $('#' + key)
                    .text(value)
                    .attr('aria-haspopup', true)
                    .addClass('pointer');
            });
        }
    });

    $.ajax({
        url: "api/edit/monthlyrecordsdayfile.json",
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

        for (var m = 1; m <= 12; m++) {
            $('#' + m + '-highTempVal').editable();
            $('#' + m + '-highTempTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-lowTempVal').editable();
            $('#' + m + '-lowTempTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-highDewPointVal').editable();
            $('#' + m + '-highDewPointTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-lowDewPointVal').editable();
            $('#' + m + '-lowDewPointTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-highApparentTempVal').editable();
            $('#' + m + '-highApparentTempTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-lowApparentTempVal').editable();
            $('#' + m + '-lowApparentTempTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-highFeelsLikeVal').editable();
            $('#' + m + '-highFeelsLikeTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-lowFeelsLikeVal').editable();
            $('#' + m + '-lowFeelsLikeTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-highHumidexVal').editable();
            $('#' + m + '-highHumidexTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-highHeatIndexVal').editable();
            $('#' + m + '-highHeatIndexTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-lowWindChillVal').editable();
            $('#' + m + '-lowWindChillTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-highMinTempVal').editable();
            $('#' + m + '-highMinTempTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-lowMaxTempVal').editable();
            $('#' + m + '-lowMaxTempTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-highDailyTempRangeVal').editable();
            $('#' + m + '-highDailyTempRangeTime').editable({format:"dd/mm/yyyy"});
            $('#' + m + '-lowDailyTempRangeVal').editable();
            $('#' + m + '-lowDailyTempRangeTime').editable({format:"dd/mm/yyyy"});
            $('#' + m + '-highHumidityVal').editable();
            $('#' + m + '-highHumidityTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-lowHumidityVal').editable();
            $('#' + m + '-lowHumidityTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-highBarometerVal').editable();
            $('#' + m + '-highBarometerTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-lowBarometerVal').editable();
            $('#' + m + '-lowBarometerTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-highGustVal').editable();
            $('#' + m + '-highGustTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-highWindVal').editable();
            $('#' + m + '-highWindTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-highWindRunVal').editable();
            $('#' + m + '-highWindRunTime').editable({format:"dd/mm/yyyy"});
            $('#' + m + '-highRainRateVal').editable();
            $('#' + m + '-highRainRateTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-highHourlyRainVal').editable();
            $('#' + m + '-highHourlyRainTime').editable({format:"dd/mm/yyyy hh:ii"});
            $('#' + m + '-highDailyRainVal').editable();
            $('#' + m + '-highDailyRainTime').editable({format:"dd/mm/yyyy"});
            $('#' + m + '-highMonthlyRainVal').editable();
            $('#' + m + '-highMonthlyRainTime').editable({format:"yyyy/mm"});
            $('#' + m + '-longestDryPeriodVal').editable();
            $('#' + m + '-longestDryPeriodTime').editable({format:"dd/mm/yyyy"});
            $('#' + m + '-longestWetPeriodVal').editable();
            $('#' + m + '-longestWetPeriodTime').editable({format:"dd/mm/yyyy"});

            $('.loading-overlay').hide();
            $('.loading-overlay-image-container').hide();
        }
    });
});

function getMonthlyLogs() {
    $('.loading-overlay').show();
    $('.loading-overlay-image-container').show();
    $.ajax({
        url: "api/edit/monthlyrecordslogfile.json",
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
        complete: function() {
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
