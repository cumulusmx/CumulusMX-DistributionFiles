// Last modified: 2024/10/29 11:21:33

$(document).ready(function() {

    $.ajax({url: '/api/edit/raintodayeditdata.json', dataType:'json', success: function (result) {
        $('#inputCurrentCounter').val(result.raincounter);
        $('#inputStartCounter').val(result.startofdayrain);
        $('#inputRainMultiplier').val(result.rainmult);
        $('#inputRainToday').val(result.raintoday);

        $('#inputRainToday').attr('step',result.step);
    }});

    $('#rainform').submit(function(event){
        event.preventDefault();

        $.post( '/api/edit/raintoday', $( '#rainform' ).serialize(), function() {
               location.href='raintodayeditor.html';
           });
    });
});