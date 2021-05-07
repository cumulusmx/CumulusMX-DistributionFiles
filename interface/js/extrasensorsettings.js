// Last modified: 2021/04/26 14:57:34

$(document).ready(function () {

    $("#form").alpaca({
        "dataSource": "./api/settings/extrasensordata.json",
        "optionsSource": "./api/settings/extrasensoroptions.json",
        "schemaSource": "./api/settings/extrasensorschema.json",
        //"view": "bootstrap-edit",
        "ui": "bootstrap",
        "postRender": function (form) {
            $("#save-button").click(function () {
                if (form.isValid(true)) {
                    var json = form.getValue();

                    $.ajax({
                        type: "POST",
                        url: "../api/setsettings/updateextrasensorconfig.json",
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
