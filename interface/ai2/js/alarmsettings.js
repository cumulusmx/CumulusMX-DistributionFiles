// Last modified: 2025/08/11 11:50:53

$(document).ready(function() {
    $.ajax({
        url: '/api/settings/alarms.json',
        dataType:'json',
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
                $('.' + key).text(value);
            });
            $('#fromEmail').val(result.email.fromEmail)
            $('#destEmail').val(result.email.destEmail)
            if (result.email.useHtml) {
                $('#useHtml').prop('checked', true);
            }
            if (result.email.useBcc) {
                $('#useBcc').prop('checked', true);
            }
        }
    });
});


function updateAlarms() {
    $.ajax({
        url: '/api/setsettings/updatealarmconfig.json',
        type: 'POST',
        contentType:'application/json',
        dataType: 'text',
        data: JSON.stringify({
            data: {
                tempBelow: {
                    Enabled     : $('#tempBelowEnabled').prop('checked'),
                    Val         : parseFloat($('#tempBelowVal').val()),
                    SoundEnabled: $('#tempBelowSoundEnabled').prop('checked'),
                    Sound       : $('#tempBelowSound').val(),
                    Action      : $('#tempBelowAction').val(),
                    ActionParams: $('#tempBelowActionParams').val(),
                    Bsky        : $('#tempBelowBsky').val(),
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
                    Action      : $('#tempAboveAction').val(),
                    ActionParams: $('#tempAboveActionParams').val(),
                    Bsky        : $('#tempAboveBsky').val(),
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
                    Action      : $('#tempChangeAction').val(),
                    ActionParams: $('#tempChangeActionParams').val(),
                    Bsky        : $('#tempChangeBsky').val(),
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
                    Action      : $('#pressBelowAction').val(),
                    ActionParams: $('#pressBelowActionParams').val(),
                    Bsky        : $('#pressBelowBsky').val(),
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
                    Action      : $('#pressAboveAction').val(),
                    ActionParams: $('#pressAboveActionParams').val(),
                    Bsky        : $('#pressAboveBsky').val(),
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
                    Action      : $('#pressChangeAction').val(),
                    ActionParams: $('#pressChangeActionParams').val(),
                    Bsky        : $('#pressChangeBsky').val(),
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
                    Action      : $('#rainAboveAction').val(),
                    ActionParams: $('#rainAboveActionParams').val(),
                    Bsky        : $('#rainAboveBsky').val(),
                    Notify      : $('#rainAboveNotify').prop('checked'),
                    Email       : $('#rainAboveEmail').prop('checked'),
                    Latches     : $('#rainAboveLatches').prop('checked'),
                    LatchHrs    : $('#rainAboveLatchHrs').val()
                },
                rainRateAbove: {
                    Enabled     : $('#rainRateAboveEnabled').prop('checked'),
                    Val         : parseFloat($('#rainRateAboveVal').val()),
                    SoundEnabled: $('#rainRateAboveSoundEnabled').prop('checked'),
                    Sound       : $('#rainRateAboveSound').val(),
                    Action      : $('#rainRateAboveAction').val(),
                    ActionParams: $('#rainRateAboveActionParams').val(),
                    Bsky        : $('#rainRateAboveBsky').val(),
                    Notify      : $('#rainRateAboveNotify').prop('checked'),
                    Email       : $('#rainRateAboveEmail').prop('checked'),
                    Latches     : $('#rainRateAboveLatches').prop('checked'),
                    LatchHrs    : $('#rainRateAboveLatchHrs').val(),
                    Action      : $('#rainRateAboveAction').val()
                },
                isRaining: {
                    Enabled     : $('#isRainingEnabled').prop('checked'),
                    SoundEnabled: $('#isRainingSoundEnabled').prop('checked'),
                    Sound       : $('#isRainingSound').val(),
                    Action      : $('#isRainingAction').val(),
                    ActionParams: $('#isRainingActionParams').val(),
                    Bsky        : $('#isRainingBsky').val(),
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
                    Action      : $('#gustAboveAction').val(),
                    ActionParams: $('#gustAboveActionParams').val(),
                    Bsky      : $('#gustAboveBsky').val(),
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
                    Action      : $('#windAboveAction').val(),
                    ActionParams: $('#windAboveActionParams').val(),
                    Bsky        : $('#windAboveBsky').val(),
                    Notify      : $('#windAboveNotify').prop('checked'),
                    Email       : $('#windAboveEmail').prop('checked'),
                    Latches     : $('#windAboveLatches').prop('checked'),
                    LatchHrs    : $('#windAboveLatchHrs').val()
                },
                newRecord: {
                    Enabled     : $('#newRecordEnabled').prop('checked'),
                    SoundEnabled: $('#newRecordSoundEnabled').prop('checked'),
                    Sound       : $('#newRecordSound').val(),
                    Action      : $('#newRecordAction').val(),
                    ActionParams: $('#newRecordActionParams').val(),
                    Bsky        : $('#newRecordBsky').val(),
                    Notify      : $('#newRecordNotify').prop('checked'),
                    Email       : $('#newRecordEmail').prop('checked'),
                    Latches     : $('#newRecordLatches').prop('checked'),
                    LatchHrs    : $('#newRecordLatchHrs').val(),
                    Threshold   : $('#newRecordThreshold').val()
                },
                contactLost: {
                    Enabled     : $('#contactLostEnabled').prop('checked'),
                    SoundEnabled: $('#contactLostSoundEnabled').prop('checked'),
                    Sound       : $('#contactLostSound').val(),
                    Action      : $('#contactLostAction').val(),
                    ActionParams: $('#contactLostActionParams').val(),
                    Bsky        : $('#contactLostBsky').val(),
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
                    Action      : $('#dataStoppedAction').val(),
                    ActionParams: $('#dataStoppedActionParams').val(),
                    Bsky        : $('#dataStoppedBsky').val(),
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
                    Action      : $('#batteryLowAction').val(),
                    ActionParams: $('#batteryLowActionParams').val(),
                    Bsky        : $('#batteryLowBsky').val(),
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
                    Action      : $('#spikeAction').val(),
                    ActionParams: $('#spikeActionParams').val(),
                    Bsky        : $('#spikeBsky').val(),
                    Notify      : $('#spikeNotify').prop('checked'),
                    Email       : $('#spikeEmail').prop('checked'),
                    Latches     : $('#spikeLatches').prop('checked'),
                    LatchHrs    : $('#spikeLatchHrs').val(),
                    Threshold   : $('#spikeThreshold').val(),
                },
                ftpUpload: {
                    Enabled     : $('#ftpUploadEnabled').prop('checked'),
                    SoundEnabled: $('#ftpUploadSoundEnabled').prop('checked'),
                    Sound       : $('#ftpUploadSound').val(),
                    Action      : $('#ftpUploadAction').val(),
                    ActionParams: $('#ftpUploadActionParams').val(),
                    Bsky        : $('#ftpUploadBsky').val(),
                    Notify      : $('#ftpUploadNotify').prop('checked'),
                    Email       : $('#ftpUploadEmail').prop('checked'),
                    Latches     : $('#ftpUploadLatches').prop('checked'),
                    LatchHrs    : $('#ftpUploadLatchHrs').val(),
                    Threshold   : $('#ftpUploadThreshold').val()
                },
                httpUpload: {
                    Enabled     : $('#httpUploadEnabled').prop('checked'),
                    SoundEnabled: $('#httpUploadSoundEnabled').prop('checked'),
                    Sound       : $('#httpUploadSound').val(),
                    Action      : $('#httpUploadAction').val(),
                    ActionParams: $('#httpUploadActionParams').val(),
                    Bsky        : $('#httpUploadBsky').val(),
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
                    Action      : $('#mySqlUploadAction').val(),
                    ActionParams: $('#mySqlUploadActionParams').val(),
                    Bsky        : $('#mySqlUploadBsky').val(),
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
                    Action      : $('#upgradeAction').val(),
                    ActionParams: $('#upgradeActionParams').val(),
                    Bsky        : $('#upgradeBsky').val(),
                    Notify      : $('#upgradeNotify').prop('checked'),
                    Email       : $('#upgradeEmail').prop('checked'),
                    Latches     : $('#upgradeLatches').prop('checked'),
                    LatchHrs    : $('#upgradeLatchHrs').val()
                },
                firmware: {
                    Enabled     : $('#firmwareEnabled').prop('checked'),
                    SoundEnabled: $('#firmwareSoundEnabled').prop('checked'),
                    Sound       : $('#firmwareSound').val(),
                    Action      : $('#firmwareAction').val(),
                    ActionParams: $('#firmwareActionParams').val(),
                    Bsky        : $('#firmwareBsky').val(),
                    Notify      : $('#firmwareNotify').prop('checked'),
                    Email       : $('#firmwareEmail').prop('checked'),
                    Latches     : $('#firmwareLatches').prop('checked'),
                    LatchHrs    : $('#firmwareLatchHrs').val()
                },
                genError: {
                    Enabled     : $('#genErrorEnabled').prop('checked'),
                    SoundEnabled: $('#genErrorSoundEnabled').prop('checked'),
                    Sound       : $('#genErrorSound').val(),
                    Action      : $('#genErrorAction').val(),
                    ActionParams: $('#genErrorActionParams').val(),
                    Bsky        : $('#genErrorBsky').val(),
                    Notify      : $('#genErrorNotify').prop('checked'),
                    Email       : $('#genErrorEmail').prop('checked')
                }
            },
            email: {
                fromEmail: $('#fromEmail').val(),
                destEmail: $('#destEmail').val(),
                useHtml  : $('#useHtml').prop('checked'),
                useBcc   : $('#useBcc').prop('checked')
            }
        })
    }).done(function () {
        alert('{{SETTINGS_UPDATED}}');
    }).fail(function (jqXHR, textStatus) {
        alert('Error: ' + jqXHR.status + '(' + textStatus + ') - ' + jqXHR.responseText);
    });
}

function testEmail() {
    $.ajax({
        url: '/api/setsettings/testemail.json',
        type: 'POST',
        contentType:'application/json',
        dataType: 'text',
        data: JSON.stringify({
            fromEmail: $('#fromEmail').val(),
            destEmail: $('#destEmail').val(),
            useHtml  : $('#useHtml').prop('checked'),
            useBcc   : $('#useBcc').prop('checked')
        })
    }).done(function (result) {
        alert('Test email sent');
    }).fail(function (jqXHR, textStatus) {
        alert('Test email failed: ' + jqXHR.responseText);
    });
}
