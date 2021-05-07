// Last modified: 2021/04/26 14:54:52

$(document).ready(function() {
    $.ajax({
        url: "api/settings/alarms.json",
        dataType:"json",
        success: function (result) {
            $.each(result.data, function(key, value) {
                if (key.indexOf('Enabled') === -1 && key.indexOf('Latches') === -1 && key.indexOf('Notify') === -1 && key.indexOf('Email') === -1) {
                    $('#' + key).val(value);
                } else {
                    $('#' + key).prop('checked', value);
                }
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
                tempBelowEnabled     : $('#tempBelowEnabled').prop('checked'),
                tempBelowVal         : parseFloat($('#tempBelowVal').val()),
                tempBelowSoundEnabled: $('#tempBelowSoundEnabled').prop('checked'),
                tempBelowSound       : $('#tempBelowSound').val(),
                tempBelowNotify      : $('#tempBelowNotify').prop('checked'),
                tempBelowEmail       : $('#tempBelowEmail').prop('checked'),
                tempBelowLatches     : $('#tempBelowLatches').prop('checked'),
                tempBelowLatchHrs    : $('#tempBelowLatchHrs').val(),

                tempAboveEnabled     : $('#tempAboveEnabled').prop('checked'),
                tempAboveVal         : parseFloat($('#tempAboveVal').val()),
                tempAboveSoundEnabled: $('#tempAboveSoundEnabled').prop('checked'),
                tempAboveSound       : $('#tempAboveSound').val(),
                tempAboveNotify      : $('#tempAboveNotify').prop('checked'),
                tempAboveEmail       : $('#tempAboveEmail').prop('checked'),
                tempAboveLatches     : $('#tempAboveLatches').prop('checked'),
                tempAboveLatchHrs    : $('#tempAboveLatchHrs').val(),

                tempChangeEnabled     : $('#tempChangeEnabled').prop('checked'),
                tempChangeVal         : parseFloat($('#tempChangeVal').val()),
                tempChangeSoundEnabled: $('#tempChangeSoundEnabled').prop('checked'),
                tempChangeSound       : $('#tempChangeSound').val(),
                tempChangeNotify      : $('#tempChangeNotify').prop('checked'),
                tempChangeEmail       : $('#tempChangeEmail').prop('checked'),
                tempChangeLatches     : $('#tempChangeLatches').prop('checked'),
                tempChangeLatchHrs    : $('#tempChangeLatchHrs').val(),

                pressBelowEnabled     : $('#pressBelowEnabled').prop('checked'),
                pressBelowVal         : parseFloat($('#pressBelowVal').val()),
                pressBelowSoundEnabled: $('#pressBelowSoundEnabled').prop('checked'),
                pressBelowSound       : $('#pressBelowSound').val(),
                pressBelowNotify      : $('#pressBelowNotify').prop('checked'),
                pressBelowEmail       : $('#pressBelowEmail').prop('checked'),
                pressBelowLatches     : $('#pressBelowLatches').prop('checked'),
                pressBelowLatchHrs    : $('#pressBelowLatchHrs').val(),

                pressAboveEnabled     : $('#pressAboveEnabled').prop('checked'),
                pressAboveVal         : parseFloat($('#pressAboveVal').val()),
                pressAboveSoundEnabled: $('#pressAboveSoundEnabled').prop('checked'),
                pressAboveSound       : $('#pressAboveSound').val(),
                pressAboveNotify      : $('#pressAboveNotify').prop('checked'),
                pressAboveEmail       : $('#pressAboveEmail').prop('checked'),
                pressAboveLatches     : $('#pressAboveLatches').prop('checked'),
                pressAboveLatchHrs    : $('#pressAboveLatchHrs').val(),

                pressChangeEnabled     : $('#pressChangeEnabled').prop('checked'),
                pressChangeVal         : parseFloat($('#pressChangeVal').val()),
                pressChangeSoundEnabled: $('#pressChangeSoundEnabled').prop('checked'),
                pressChangeSound       : $('#pressChangeSound').val(),
                pressChangeNotify      : $('#pressChangeNotify').prop('checked'),
                pressChangeEmail       : $('#pressChangeEmail').prop('checked'),
                pressChangeLatches     : $('#pressChangeLatches').prop('checked'),
                pressChangeLatchHrs    : $('#pressChangeLatchHrs').val(),

                rainAboveEnabled     : $('#rainAboveEnabled').prop('checked'),
                rainAboveVal         : parseFloat($('#rainAboveVal').val()),
                rainAboveSoundEnabled: $('#rainAboveSoundEnabled').prop('checked'),
                rainAboveSound       : $('#rainAboveSound').val(),
                rainAboveNotify      : $('#rainAboveNotify').prop('checked'),
                rainAboveEmail       : $('#rainAboveEmail').prop('checked'),
                rainAboveLatches     : $('#rainAboveLatches').prop('checked'),
                rainAboveLatchHrs    : $('#rainAboveLatchHrs').val(),

                rainRateAboveEnabled     : $('#rainRateAboveEnabled').prop('checked'),
                rainRateAboveVal         : parseFloat($('#rainRateAboveVal').val()),
                rainRateAboveSoundEnabled: $('#rainRateAboveSoundEnabled').prop('checked'),
                rainRateAboveSound       : $('#rainRateAboveSound').val(),
                rainRateAboveNotify      : $('#rainRateAboveNotify').prop('checked'),
                rainRateAboveEmail       : $('#rainRateAboveEmail').prop('checked'),
                rainRateAboveLatches     : $('#rainRateAboveLatches').prop('checked'),
                rainRateAboveLatchHrs    : $('#rainRateAboveLatchHrs').val(),

                gustAboveEnabled     : $('#gustAboveEnabled').prop('checked'),
                gustAboveVal         : parseFloat($('#gustAboveVal').val()),
                gustAboveSoundEnabled: $('#gustAboveSoundEnabled').prop('checked'),
                gustAboveSound       : $('#gustAboveSound').val(),
                gustAboveNotify      : $('#gustAboveNotify').prop('checked'),
                gustAboveEmail       : $('#gustAboveEmail').prop('checked'),
                gustAboveLatches     : $('#gustAboveLatches').prop('checked'),
                gustAboveLatchHrs    : $('#gustAboveLatchHrs').val(),

                windAboveEnabled     : $('#windAboveEnabled').prop('checked'),
                windAboveVal         : parseFloat($('#windAboveVal').val()),
                windAboveSoundEnabled: $('#windAboveSoundEnabled').prop('checked'),
                windAboveSound       : $('#windAboveSound').val(),
                windAboveNotify      : $('#windAboveNotify').prop('checked'),
                windAboveEmail       : $('#windAboveEmail').prop('checked'),
                windAboveLatches     : $('#windAboveLatches').prop('checked'),
                windAboveLatchHrs    : $('#windAboveLatchHrs').val(),

                contactLostEnabled     : $('#contactLostEnabled').prop('checked'),
                contactLostSoundEnabled: $('#contactLostSoundEnabled').prop('checked'),
                contactLostSound       : $('#contactLostSound').val(),
                contactLostNotify      : $('#contactLostNotify').prop('checked'),
                contactLostEmail       : $('#contactLostEmail').prop('checked'),
                contactLostLatches     : $('#contactLostLatches').prop('checked'),
                contactLostLatchHrs    : $('#contactLostLatchHrs').val(),

                dataStoppedEnabled     : $('#dataStoppedEnabled').prop('checked'),
                dataStoppedSoundEnabled: $('#dataStoppedSoundEnabled').prop('checked'),
                dataStoppedSound       : $('#dataStoppedSound').val(),
                dataStoppedNotify      : $('#dataStoppedNotify').prop('checked'),
                dataStoppedEmail       : $('#dataStoppedEmail').prop('checked'),
                dataStoppedLatches     : $('#dataStoppedLatches').prop('checked'),
                dataStoppedLatchHrs    : $('#dataStoppedLatchHrs').val(),

                batteryLowEnabled     : $('#batteryLowEnabled').prop('checked'),
                batteryLowSoundEnabled: $('#batteryLowSoundEnabled').prop('checked'),
                batteryLowSound       : $('#batteryLowSound').val(),
                batteryLowNotify      : $('#batteryLowNotify').prop('checked'),
                batteryLowEmail       : $('#batteryLowEmail').prop('checked'),
                batteryLowLatches     : $('#batteryLowLatches').prop('checked'),
                batteryLowLatchHrs    : $('#batteryLowLatchHrs').val(),

                spikeEnabled     : $('#spikeEnabled').prop('checked'),
                spikeSoundEnabled: $('#spikeSoundEnabled').prop('checked'),
                spikeSound       : $('#spikeSound').val(),
                spikeNotify      : $('#spikeNotify').prop('checked'),
                spikeEmail       : $('#spikeEmail').prop('checked'),
                spikeLatches     : $('#spikeLatches').prop('checked'),
                spikeLatchHrs    : $('#spikeLatchHrs').val(),

                upgradeEnabled     : $('#upgradeEnabled').prop('checked'),
                upgradeSoundEnabled: $('#upgradeSoundEnabled').prop('checked'),
                upgradeSound       : $('#upgradeSound').val(),
                upgradeNotify      : $('#upgradeNotify').prop('checked'),
                upgradeEmail       : $('#upgradeEmail').prop('checked'),
                upgradeLatches     : $('#upgradeLatches').prop('checked'),
                upgradeLatchHrs    : $('#upgradeLatchHrs').val()
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
