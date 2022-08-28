// Last modified: 2022/08/23 09:33:19

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

    // add listeners to the <li> tabs to set attributes
    $('.nav-tabs').children('li').click(function() {
        $('.nav-tabs').children('li').attr('aria-selected', false);
        $(this).attr('aria-selected', true);
    });

    $.ajax({
        url: 'api/edit/monthlyrecords.json',
        dataType: 'json',
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
        url: 'api/edit/monthlyrecordsdayfile.json',
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
        dataType: "json",
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

        for (var m = 1; m <= 12; m++) {
            $('#' + m + '-highTempVal').editable();
            $('#' + m + '-highTempTime').editable();
            $('#' + m + '-lowTempVal').editable();
            $('#' + m + '-lowTempTime').editable();
            $('#' + m + '-highDewPointVal').editable();
            $('#' + m + '-highDewPointTime').editable();
            $('#' + m + '-lowDewPointVal').editable();
            $('#' + m + '-lowDewPointTime').editable();
            $('#' + m + '-highApparentTempVal').editable();
            $('#' + m + '-highApparentTempTime').editable();
            $('#' + m + '-lowApparentTempVal').editable();
            $('#' + m + '-lowApparentTempTime').editable();
            $('#' + m + '-highFeelsLikeVal').editable();
            $('#' + m + '-highFeelsLikeTime').editable();
            $('#' + m + '-lowFeelsLikeVal').editable();
            $('#' + m + '-lowFeelsLikeTime').editable();
            $('#' + m + '-highHumidexVal').editable();
            $('#' + m + '-highHumidexTime').editable();
            $('#' + m + '-highHeatIndexVal').editable();
            $('#' + m + '-highHeatIndexTime').editable();
            $('#' + m + '-lowWindChillVal').editable();
            $('#' + m + '-lowWindChillTime').editable();
            $('#' + m + '-highMinTempVal').editable();
            $('#' + m + '-highMinTempTime').editable();
            $('#' + m + '-lowMaxTempVal').editable();
            $('#' + m + '-lowMaxTempTime').editable();
            $('#' + m + '-highDailyTempRangeVal').editable();
            $('#' + m + '-highDailyTempRangeTime').editable();
            $('#' + m + '-lowDailyTempRangeVal').editable();
            $('#' + m + '-lowDailyTempRangeTime').editable();
            $('#' + m + '-highHumidityVal').editable();
            $('#' + m + '-highHumidityTime').editable();
            $('#' + m + '-lowHumidityVal').editable();
            $('#' + m + '-lowHumidityTime').editable();
            $('#' + m + '-highBarometerVal').editable();
            $('#' + m + '-highBarometerTime').editable();
            $('#' + m + '-lowBarometerVal').editable();
            $('#' + m + '-lowBarometerTime').editable();
            $('#' + m + '-highGustVal').editable();
            $('#' + m + '-highGustTime').editable();
            $('#' + m + '-highWindVal').editable();
            $('#' + m + '-highWindTime').editable();
            $('#' + m + '-highWindRunVal').editable();
            $('#' + m + '-highWindRunTime').editable();
            $('#' + m + '-highRainRateVal').editable();
            $('#' + m + '-highRainRateTime').editable();
            $('#' + m + '-highHourlyRainVal').editable();
            $('#' + m + '-highHourlyRainTime').editable();
            $('#' + m + '-highDailyRainVal').editable();
            $('#' + m + '-highDailyRainTime').editable();
            $('#' + m + '-highRain24hVal').editable();
            $('#' + m + '-highRain24hTime').editable();
            $('#' + m + '-highMonthlyRainVal').editable();
            $('#' + m + '-highMonthlyRainTime').editable();
            $('#' + m + '-longestDryPeriodVal').editable();
            $('#' + m + '-longestDryPeriodTime').editable();
            $('#' + m + '-longestWetPeriodVal').editable();
            $('#' + m + '-longestWetPeriodTime').editable();

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
