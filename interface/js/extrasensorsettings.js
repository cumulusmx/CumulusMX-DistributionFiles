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
                        dataType: "text",
                        success: function (msg) {
                            alert("Settings updated");
                        },
                        error: function (error) {
                            alert("error " + error);
                        }

                    });
                }
            });
        }
    });

});
