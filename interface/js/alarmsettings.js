// Last modified: 2022/07/12 16:31:17

$(document).ready(function() {
    $.ajax({
        url: "api/settings/alarms.json",
        dataType:"json",
        success: function (result) {
            $.each(result.data, function(alarm, data) {
                $.each(data, function(prop, value) {
                    if (prop =='Enabled' || prop == 'Latches' || prop == 'Notify' || prop == 'Email' || prop == 'SoundEnabled') {
                        $('#' + alarm + prop).prop('checked', value);
                    } else {
                        $('#' + alarm + prop).val(value);
                    }
                });
            });
            $.each(result.units, function(key, value) {
                $("." + key).text(value);
            });
            $('#fromEmail').val(result.email.fromEmail)
            $('#destEmail').val(result.email.destEmail)
            if (result.email.useHtml) {
                $('#useHtml').prop('checked', true);
            }
        }
    });
});


function updateAlarms() {
    $.ajax({
        url: "api/setsettings/updatealarmconfig.json",
        type: 'POST',
        contentType:"application/json",
        dataType: 'text',
        data: JSON.stringify({
            data: {
                tempBelow: {
                    Enabled     : $('#tempBelowEnabled').prop('checked'),
                    Val         : parseFloat($('#tempBelowVal').val()),
                    SoundEnabled: $('#tempBelowSoundEnabled').prop('checked'),
                    Sound       : $('#tempBelowSound').val(),
                    Notify      : $('#tempBelowNotify').prop('checked'),
                    Email       : $('#tempBelowEmail').prop('checked'),
                    Latches     : $('#tempBelowLatches').prop('checked'),
                    LatchHrs    : $('#tempBelowLatchHrs').val()
                },
                tempAbove: {
                    Enabled     : $('#tempAboveEnabled').prop('checked'),
                    Val         : parseFloat($('#tempAboveVal').val()),
                    SoundEnabled: $('#tempAboveSoundEnabled').prop('checked'),
                    Sound       : $('#tempAboveSound').val(),
                    Notify      : $('#tempAboveNotify').prop('checked'),
                    Email       : $('#tempAboveEmail').prop('checked'),
                    Latches     : $('#tempAboveLatches').prop('checked'),
                    LatchHrs    : $('#tempAboveLatchHrs').val()
                },
                tempChange: {
                    Enabled     : $('#tempChangeEnabled').prop('checked'),
                    Val         : parseFloat($('#tempChangeVal').val()),
                    SoundEnabled: $('#tempChangeSoundEnabled').prop('checked'),
                    Sound       : $('#tempChangeSound').val(),
                    Notify      : $('#tempChangeNotify').prop('checked'),
                    Email       : $('#tempChangeEmail').prop('checked'),
                    Latches     : $('#tempChangeLatches').prop('checked'),
                    LatchHrs    : $('#tempChangeLatchHrs').val()
                },
                pressBelow: {
                    Enabled     : $('#pressBelowEnabled').prop('checked'),
                    Val         : parseFloat($('#pressBelowVal').val()),
                    SoundEnabled: $('#pressBelowSoundEnabled').prop('checked'),
                    Sound       : $('#pressBelowSound').val(),
                    Notify      : $('#pressBelowNotify').prop('checked'),
                    Email       : $('#pressBelowEmail').prop('checked'),
                    Latches     : $('#pressBelowLatches').prop('checked'),
                    LatchHrs    : $('#pressBelowLatchHrs').val()
                },
                pressAbove: {
                    Enabled     : $('#pressAboveEnabled').prop('checked'),
                    Val         : parseFloat($('#pressAboveVal').val()),
                    SoundEnabled: $('#pressAboveSoundEnabled').prop('checked'),
                    Sound       : $('#pressAboveSound').val(),
                    Notify      : $('#pressAboveNotify').prop('checked'),
                    Email       : $('#pressAboveEmail').prop('checked'),
                    Latches     : $('#pressAboveLatches').prop('checked'),
                    LatchHrs    : $('#pressAboveLatchHrs').val()
                },
                pressChange: {
                    Enabled     : $('#pressChangeEnabled').prop('checked'),
                    Val         : parseFloat($('#pressChangeVal').val()),
                    SoundEnabled: $('#pressChangeSoundEnabled').prop('checked'),
                    Sound       : $('#pressChangeSound').val(),
                    Notify      : $('#pressChangeNotify').prop('checked'),
                    Email       : $('#pressChangeEmail').prop('checked'),
                    Latches     : $('#pressChangeLatches').prop('checked'),
                    LatchHrs    : $('#pressChangeLatchHrs').val()
                },
                rainAbove: {
                    Enabled     : $('#rainAboveEnabled').prop('checked'),
                    Val         : parseFloat($('#rainAboveVal').val()),
                    SoundEnabled: $('#rainAboveSoundEnabled').prop('checked'),
                    Sound       : $('#rainAboveSound').val(),
                    Notify      : $('#rainAboveNotify').prop('checked'),
                    Email       : $('#rainAboveEmail').prop('checked'),
                    Latches     : $('#rainAboveLatches').prop('checked'),
                    LatchHrs    : $('#rainAboveLatchHrs').val(),
                },
                rainRateAbove: {
                    Enabled     : $('#rainRateAboveEnabled').prop('checked'),
                    Val         : parseFloat($('#rainRateAboveVal').val()),
                    SoundEnabled: $('#rainRateAboveSoundEnabled').prop('checked'),
                    Sound       : $('#rainRateAboveSound').val(),
                    Notify      : $('#rainRateAboveNotify').prop('checked'),
                    Email       : $('#rainRateAboveEmail').prop('checked'),
                    Latches     : $('#rainRateAboveLatches').prop('checked'),
                    LatchHrs    : $('#rainRateAboveLatchHrs').val()
                },
                isRaining: {
                    Enabled     : $('#isRainingEnabled').prop('checked'),
                    SoundEnabled: $('#isRainingSoundEnabled').prop('checked'),
                    Sound       : $('#isRainingSound').val(),
                    Notify      : $('#isRainingNotify').prop('checked'),
                    Email       : $('#isRainingEmail').prop('checked'),
                    Latches     : $('#isRainingLatches').prop('checked'),
                    LatchHrs    : $('#isRainingLatchHrs').val()
                },
                gustAbove: {
                    Enabled     : $('#gustAboveEnabled').prop('checked'),
                    Val         : parseFloat($('#gustAboveVal').val()),
                    SoundEnabled: $('#gustAboveSoundEnabled').prop('checked'),
                    Sound       : $('#gustAboveSound').val(),
                    Notify      : $('#gustAboveNotify').prop('checked'),
                    Email       : $('#gustAboveEmail').prop('checked'),
                    Latches     : $('#gustAboveLatches').prop('checked'),
                    LatchHrs    : $('#gustAboveLatchHrs').val()
                },
                windAbove: {
                    Enabled     : $('#windAboveEnabled').prop('checked'),
                    Val         : parseFloat($('#windAboveVal').val()),
                    SoundEnabled: $('#windAboveSoundEnabled').prop('checked'),
                    Sound       : $('#windAboveSound').val(),
                    Notify      : $('#windAboveNotify').prop('checked'),
                    Email       : $('#windAboveEmail').prop('checked'),
                    Latches     : $('#windAboveLatches').prop('checked'),
                    LatchHrs    : $('#windAboveLatchHrs').val()
                },
                contactLost: {
                    Enabled     : $('#contactLostEnabled').prop('checked'),
                    SoundEnabled: $('#contactLostSoundEnabled').prop('checked'),
                    Sound       : $('#contactLostSound').val(),
                    Notify      : $('#contactLostNotify').prop('checked'),
                    Email       : $('#contactLostEmail').prop('checked'),
                    Latches     : $('#contactLostLatches').prop('checked'),
                    LatchHrs    : $('#contactLostLatchHrs').val(),
                    Threshold   : $('#contactLostThreshold').val()
                },
                dataStopped: {
                    Enabled     : $('#dataStoppedEnabled').prop('checked'),
                    SoundEnabled: $('#dataStoppedSoundEnabled').prop('checked'),
                    Sound       : $('#dataStoppedSound').val(),
                    Notify      : $('#dataStoppedNotify').prop('checked'),
                    Email       : $('#dataStoppedEmail').prop('checked'),
                    Latches     : $('#dataStoppedLatches').prop('checked'),
                    LatchHrs    : $('#dataStoppedLatchHrs').val(),
                    Threshold   : $('#dataStoppedThreshold').val()
                },
                batteryLow: {
                    Enabled     : $('#batteryLowEnabled').prop('checked'),
                    SoundEnabled: $('#batteryLowSoundEnabled').prop('checked'),
                    Sound       : $('#batteryLowSound').val(),
                    Notify      : $('#batteryLowNotify').prop('checked'),
                    Email       : $('#batteryLowEmail').prop('checked'),
                    Latches     : $('#batteryLowLatches').prop('checked'),
                    LatchHrs    : $('#batteryLowLatchHrs').val(),
                    Threshold   : $('#batteryLowThreshold').val()
                },
                spike: {
                    Enabled     : $('#spikeEnabled').prop('checked'),
                    SoundEnabled: $('#spikeSoundEnabled').prop('checked'),
                    Sound       : $('#spikeSound').val(),
                    Notify      : $('#spikeNotify').prop('checked'),
                    Email       : $('#spikeEmail').prop('checked'),
                    Latches     : $('#spikeLatches').prop('checked'),
                    LatchHrs    : $('#spikeLatchHrs').val(),
                    Threshold   : $('#spikeThreshold').val(),
                },
                httpUpload: {
                    Enabled     : $('#httpUploadEnabled').prop('checked'),
                    SoundEnabled: $('#httpUploadSoundEnabled').prop('checked'),
                    Sound       : $('#httpUploadSound').val(),
                    Notify      : $('#httpUploadNotify').prop('checked'),
                    Email       : $('#httpUploadEmail').prop('checked'),
                    Latches     : $('#httpUploadLatches').prop('checked'),
                    LatchHrs    : $('#httpUploadLatchHrs').val(),
                    Threshold   : $('#httpUploadThreshold').val()
                },
                mySqlUpload: {
                    Enabled     : $('#mySqlUploadEnabled').prop('checked'),
                    SoundEnabled: $('#mySqlUploadSoundEnabled').prop('checked'),
                    Sound       : $('#mySqlUploadSound').val(),
                    Notify      : $('#mySqlUploadNotify').prop('checked'),
                    Email       : $('#mySqlUploadEmail').prop('checked'),
                    Latches     : $('#mySqlUploadLatches').prop('checked'),
                    LatchHrs    : $('#mySqlUploadLatchHrs').val(),
                    Threshold   : $('#mySqlUploadThreshold').val()
                },
                upgrade: {
                    Enabled     : $('#upgradeEnabled').prop('checked'),
                    SoundEnabled: $('#upgradeSoundEnabled').prop('checked'),
                    Sound       : $('#upgradeSound').val(),
                    Notify      : $('#upgradeNotify').prop('checked'),
                    Email       : $('#upgradeEmail').prop('checked'),
                    Latches     : $('#upgradeLatches').prop('checked'),
                    LatchHrs    : $('#upgradeLatchHrs').val()
                }
            },
            email: {
                fromEmail: $('#fromEmail').val(),
                destEmail: $('#destEmail').val(),
                useHtml  : $('#useHtml').prop('checked')
            }
        })
    }).done(function () {
        alert("Settings updated");
    }).fail(function (jqXHR, textStatus) {
        alert("Error: " + jqXHR.status + "(" + textStatus + ") - " + jqXHR.responseText);
    });
}

function testEmail() {
    $.ajax({
        url: "api/setsettings/testemail.json",
        type: 'POST',
        contentType:"application/json",
        dataType: 'text',
        data: JSON.stringify({
            fromEmail: $('#fromEmail').val(),
            destEmail: $('#destEmail').val(),
            useHtml  : $('#useHtml').prop('checked')
        })
    }).done(function (result) {
        alert("Test email sent");
    }).fail(function (jqXHR, textStatus) {
        alert("Test email failed: " + jqXHR.responseText);
    });
}
