// Last modified: 2024/10/29 11:05:23

var updateUrl = '/api/edit/monthly';
var editFieldName;
var newValue, newTime;
var oldValue, oldTime;

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
        url: '/api/edit/monthlyrecords.json',
        dataType: 'json',
        success: function (result) {
            $.each(result, function(key, value) {
                // set the value and add some accessibility
                //$('#' + key).text(value).on('shown', function(e, editable) {editable.input.$input.attr('aria-label', editable.options.title)});
                $('#' + key)
                    .text(value)
                    .attr('aria-haspopup', true)
                    .addClass('pointer');
            });
        }
    });

    $.ajax({
        url: '/api/edit/monthlyrecordsdayfile.json',
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

    $('#recUpdater').keypress(function(e) {
        if (e.key == 'y' || e.key == 'Y') {
            updateRec();
        } else if (e.key == 'n' || e.key == 'N') {
            $('#recUpdater').popup('hide');
        }
    });

    $.ajax({
        url: '/api/info/version.json',
        dataType: 'json',
        success: function (result) {
            $('#Version').text(result.Version);
            $('#Build').text(result.Build);
        }
    });

    $(document).ajaxStop(function() {
        //$.fn.editable.defaults.mode = 'inline';
        //$.fn.editable.defaults.url = updateUrl;
        $.fn.editable.defaults.clear = false;
        $.fn.editable.defaults.send = 'always';
        $.fn.editable.defaults.type = 'text';
        $.fn.editable.defaults.emptytext = '-';
        $.fn.editable.defaults.step = 'any';
        $.fn.editable.defaults.unsavedclass = null;
        // add some accessibility to the default buttons
        $.fn.editableform.buttons = '<button type="submit" class="btn btn-primary btn-sm editable-submit" aria-label="Save"><i class="glyphicon glyphicon-ok"></i></button><button type="button" class="btn btn-default btn-sm editable-cancel" aria-label="Cancel"><i class="glyphicon glyphicon-remove"></i></button>';
        $.fn.editable.defaults.success = function(response, newValue) {
            updateDirect(this, newValue);
        };

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
        url: '/api/edit/monthlyrecordslogfile.json',
        dataType:'json',
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
    var type = field.id.includes('Time') ? 4 : 3;

    // use the id and strip everything after and including the type
    editFieldName = field.id.split(type == 4 ? 'Time': 'Val')[0];

    if (type == 3) {
        // value
        newValue = field.innerText;
        newTime = field.nextElementSibling.innerText;
    } else {
        // timestamp
        newTime = field.innerText;
        newValue = field.previousElementSibling.innerText;
    }

    if (newValue == '' || newValue == '-' || newTime == '') {
        $('#errorContent').text('This field is blank, cannot set the record to this!');
        $('#updaterError').popup('show');
        return;
    }

    var dataName = field.parentElement.children[0].innerText;
    var row = field.parentElement;
    oldVal = row.children[1].innerText;
    oldTime = row.children[2].innerText;

    if (newValue == oldVal && newTime == oldTime) {
        $('#errorContent').text('The record is already set to this value!');
        $('#updaterError').popup('show');
        return;
    }
    $('#editName').text(dataName);
    $('#editOldVal').text(oldVal);
    $('#editOldTime').text(oldTime);
    $('#editNewVal').text(newValue);
    $('#editNewTime').text(newTime);
    $('#recUpdater').popup('show');
}

function updateDirect(field, directVal) {
    var type = field.id.includes('Time') ? 4 : 3;

    editFieldName = field.id.slice(0, -type);

    if (type == 3) {
        // value
        newValue = directVal;
        newTime = field.parentNode.nextElementSibling.innerText
    } else {
        // timestamp
        newTime = directVal;
        newValue = field.parentNode.previousElementSibling.innerText;
    }

    // we are called from the div inside the td, so we need to go up two levels
    var row = field.parentNode.parentNode;
    oldVal = row.children[1].childNodes[0].innerText;
    oldTime = row.children[2].childNodes[0].innerText;

    if (newValue == '' || newValue == '-' || newTime == '') {
        $('#errorContent').text('This field is blank, cannot set the record to this!');
        $('#updaterError').popup('show');
        return;
    }

    updateRec();
}

function updateRec() {
    $.ajax({
        url: updateUrl,
        type: 'POST',
        data: encodeURIComponent('name=' + editFieldName + '&value=' + newValue + '&time=' + newTime),
        success: function (result) {
            $('#' + editFieldName + 'Val').editable('setValue', newValue, false);
            $('#' + editFieldName + 'Time').editable('setValue', newTime, false);
        },
        error: function (result) {
            $('#' + editFieldName + 'Val').editable('setValue', oldValue, false);
            $('#' + editFieldName + 'Time').editable('setValue', oldTime, false);

            $('#errorContent').text('Error from MX: ' + result.responseText);
            $('#updaterError').popup('show');
        },
        complete: function () {
            $('#recUpdater').popup('hide');
        }
    });
}
