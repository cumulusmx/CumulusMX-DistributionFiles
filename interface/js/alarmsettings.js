$(document).ready(function() {

    $.ajax({
        url: "api/settings/alarms.json",
        dataType:"json",
        success: function (result) {
            $.each(result.data, function(key, value) {
                if (key.indexOf('Enabled') === -1) {
                    $('#' + key).val(value);
                } else {
                    $('#' + key).prop('checked', value);
                }
            });
            $.each(result.units, function(key, value) {
                $("." + key).text(value);
            });
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
            tempBelowEnabled     : $('#tempBelowEnabled').prop('checked'),
            tempBelowVal         : parseFloat($('#tempBelowVal').val()),
            tempBelowSoundEnabled: $('#tempBelowSoundEnabled').prop('checked'),
            tempBelowSound       : $('#tempBelowSound').val(),

            tempAboveEnabled     : $('#tempAboveEnabled').prop('checked'),
            tempAboveVal         : parseFloat($('#tempAboveVal').val()),
            tempAboveSoundEnabled: $('#tempAboveSoundEnabled').prop('checked'),
            tempAboveSound       : $('#tempAboveSound').val(),

            tempChangeEnabled     : $('#tempChangeEnabled').prop('checked'),
            tempChangeVal         : parseFloat($('#tempChangeVal').val()),
            tempChangeSoundEnabled: $('#tempChangeSoundEnabled').prop('checked'),
            tempChangeSound       : $('#tempChangeSound').val(),

            pressBelowEnabled     : $('#pressBelowEnabled').prop('checked'),
            pressBelowVal         : parseFloat($('#pressBelowVal').val()),
            pressBelowSoundEnabled: $('#pressBelowSoundEnabled').prop('checked'),
            pressBelowSound       : $('#pressBelowSound').val(),

            pressAboveEnabled     : $('#pressAboveEnabled').prop('checked'),
            pressAboveVal         : parseFloat($('#pressAboveVal').val()),
            pressAboveSoundEnabled: $('#pressAboveSoundEnabled').prop('checked'),
            pressAboveSound       : $('#pressAboveSound').val(),

            pressChangeEnabled     : $('#pressChangeEnabled').prop('checked'),
            pressChangeVal         : parseFloat($('#pressChangeVal').val()),
            pressChangeSoundEnabled: $('#pressChangeSoundEnabled').prop('checked'),
            pressChangeSound       : $('#pressChangeSound').val(),

            rainAboveEnabled     : $('#rainAboveEnabled').prop('checked'),
            rainAboveVal         : parseFloat($('#rainAboveVal').val()),
            rainAboveSoundEnabled: $('#rainAboveSoundEnabled').prop('checked'),
            rainAboveSound       : $('#rainAboveSound').val(),

            rainRateAboveEnabled     : $('#rainRateAboveEnabled').prop('checked'),
            rainRateAboveVal         : parseFloat($('#rainRateAboveVal').val()),
            rainRateAboveSoundEnabled: $('#rainRateAboveSoundEnabled').prop('checked'),
            rainRateAboveSound       : $('#rainRateAboveSound').val(),

            gustAboveEnabled     : $('#gustAboveEnabled').prop('checked'),
            gustAboveVal         : parseFloat($('#gustAboveVal').val()),
            gustAboveSoundEnabled: $('#gustAboveSoundEnabled').prop('checked'),
            gustAboveSound       : $('#gustAboveSound').val(),

            windAboveEnabled     : $('#windAboveEnabled').prop('checked'),
            windAboveVal         : parseFloat($('#windAboveVal').val()),
            windAboveSoundEnabled: $('#windAboveSoundEnabled').prop('checked'),
            windAboveSound       : $('#windAboveSound').val(),

            contactLostEnabled     : $('#contactLostEnabled').prop('checked'),
            contactLostSoundEnabled: $('#contactLostSoundEnabled').prop('checked'),
            contactLostSound       : $('#contactLostSound').val(),

            dataStoppedEnabled     : $('#dataStoppedEnabled').prop('checked'),
            dataStoppedSoundEnabled: $('#dataStoppedSoundEnabled').prop('checked'),
            dataStoppedSound       : $('#dataStoppedSound').val(),

            batteryLowEnabled     : $('#batteryLowEnabled').prop('checked'),
            batteryLowSoundEnabled: $('#batteryLowSoundEnabled').prop('checked'),
            batteryLowSound       : $('#batteryLowSound').val(),

            spikeEnabled     : $('#spikeEnabled').prop('checked'),
            spikeSoundEnabled: $('#spikeSoundEnabled').prop('checked'),
            spikeSound       : $('#spikeSound').val(),
        })
    }).done(function (result) {
        alert("Settings updated");
    }).fail(function (jqXHR, textStatus) {
        alert("Update failed: " + textStatus);
    });
}
