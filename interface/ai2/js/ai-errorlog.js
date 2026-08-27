/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: errorlog.js       	|   Ver: 1.0
    Author: M Crossley & N Thomas
    Last Edit (MC): Never - new script
    Last Edit (NT): 2026-08-11 09:54:31
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Process latest errors for the 
            errorslog & utilities page.
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


$().ready( function() {
    $( function () {

        loadlog();

        setInterval(loadlog, 20000);

        function loadlog() {
            $.ajax({
                url: "/api/data/errorlog.json",
                dataType: "json",
                success: function (result) {
                    $('#logcontent').empty();
                    result.forEach(element => {
                        $('#logcontent').append('<div>' + element + '</div>');
                    });
                }
            });
        }
    });
})

function selectText() {
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById("logcontent"));
        range.select();
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(document.getElementById("logcontent"));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }
    document.execCommand("copy");
}

function clearLog() {
    $.ajax({
        url: "/api/data/errorlog.json",
        dataType: "json",
        success: function (result) {
            $.ajax({
                url: "/api/utils/clearerrorlog.json",
                type: "POST",
                data: JSON.stringify([]),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (result) {
                    $('#logcontent').empty();
                    result.forEach(element => {
                        $('#logcontent').append(element + "\n");
                    });
                }
            });
        }
    });
}

