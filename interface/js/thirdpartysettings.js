// Last modified: 2021/04/26 15:01:34

$(document).ready(function() {
    // Create the form

    $("#form").alpaca({
        "dataSource": "../api/settings/thirdpartydata.json",
        "optionsSource": "../api/settings/thirdpartyoptions.json",
        "schemaSource": "../api/settings/thirdpartyschema.json",
        "view": "bootstrap-edit-horizontal",
        "postRender": function (form) {
            $("#save-button").click(function () {
                if (form.isValid(true)) {
                    var json = form.getValue();
                    $.ajax({
                        type: "POST",
                        url: "../api/setsettings/updatethirdpartyconfig.json",
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