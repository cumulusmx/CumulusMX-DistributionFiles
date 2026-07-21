// Last modified: 2026/07/21 22:30:21

$(document).ready(function() {

    $.ajax({url: '/api/edit/raintodayeditdata.json', dataType:'json', success: function (result) {
        $('#inputCurrentCounter').val(result.raincounter);
        $('#inputStartCounter').val(result.startofdayrain);
        $('#inputMidnightCounter').val(result.midnightcounter);
        $('#inputRainMultiplier').val(result.rainmult);
        $('#inputRainToday').val(result.raintoday);
        $('#inputMidnightRain').val(result.midnightrain);

        $('#inputRainToday').attr('step',result.step);
    }});

    $('#rainform').submit(function(event){
        event.preventDefault();

        $.post( '/api/edit/raintoday', $( '#rainform' ).serialize(), function() {
               location.href='raintodayeditor.html';
           });
    });
});