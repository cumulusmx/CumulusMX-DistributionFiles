// Last modified: 2021/04/26 15:00:31

$(document).ready(function() {

    $("#form").alpaca({
        "dataSource": "../api/settings/noaadata.json",
        "optionsSource": "../api/settings/noaaoptions.json",
        "schemaSource": "../api/settings/noaaschema.json",
        "ui": "bootstrap",
        "postRender": function (form) {
            $("#save-button").click(function () {
                if (form.isValid(true)) {
                    var json = form.getValue();

                    $.ajax({
                        type: "POST",
                        url: "../api/setsettings/updatenoaaconfig.json",
                        data: {json: JSON.stringify(json)},
                        dataType: "text"
                    })
                    .done(function () {
                        alert("Settings updated");
                    })
                    .fail(function (jqXHR, textStatus) {
                        alert("Error: " + jqXHR.status + "(" + textStatus + ") - " + jqXHR.responseText);
                    });
                }
            });
        }
    });
});