// Last modified: 2021/04/26 14:56:34

$(document).ready(function() {
    $("#form").alpaca({
        "dataSource": "../api/settings/calibrationdata.json",
        "optionsSource": "../api/settings/calibrationoptions.json",
        "schemaSource": "../api/settings/calibrationschema.json",
        "ui": "bootstrap",
        "view": "bootstrap-edit-horizontal",
        "postRender": function (form) {
            $("#save-button").click(function () {
                if (form.isValid(true)) {
                    var json = form.getValue();

                    $.ajax({
                        type: "POST",
                        url: "../api/setsettings/updatecalibrationconfig.json",
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