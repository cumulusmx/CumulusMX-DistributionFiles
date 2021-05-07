// Last modified: 2021/04/26 15:01:01

$(document).ready(function () {

    $("#form").alpaca({
        "dataSource": "./api/settings/programdata.json",
        "optionsSource": "./api/settings/programoptions.json",
        "schemaSource": "./api/settings/programschema.json",
        //"view": "bootstrap-edit",
        "ui": "bootstrap",
        "postRender": function (form) {
            $("#save-button").click(function () {
                if (form.isValid(true)) {
                    var json = form.getValue();

                    $.ajax({
                        type: "POST",
                        url: "../api/setsettings/updateprogramconfig.json",
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
