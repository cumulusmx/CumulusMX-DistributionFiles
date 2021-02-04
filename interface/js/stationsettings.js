$(document).ready(function () {
    $("#form").alpaca({
        "dataSource": "./api/settings/stationdata.json",
        "optionsSource": "./api/settings/stationoptions.json",
        "schemaSource": "./api/settings/stationschema.json",
        //"view": "bootstrap-edit",
        "ui": "bootstrap",
        "options": {
            "fields": {
                "general": {
                    "fields": {
                        "stationtype": {
                            "events": {
                                "change": function () {
                                    var form = $("#form").alpaca("get");
                                    var stationid = this.getValue();
                                    form.childrenByPropertyId["stationid"].setValue(stationid);
                                    form.childrenByPropertyId["Options"].childrenByPropertyId["stationid"].setValue(stationid);
                                }
                            }
                        }
                    }
                }
            }
        },
        "postRender": function (form) {
            var stationid = form.childrenByPropertyId["stationid"].getValue();
            form.childrenByPropertyId["Options"].childrenByPropertyId["stationid"].setValue(stationid);

            $("#save-button").click(function () {
                if (form.isValid(true)) {
                    var json = form.getValue();
                    $.ajax({
                        type: "POST",
                        url: "../api/setsettings/updatestationconfig.json",
                        data: {json: JSON.stringify(json)},
                        dataType: "text",
                        success: function (msg) {
                            alert("Settings updated");
                        },
                        error: function (error) {
                            alert("error " + error);
                        }
                    });
                } else {
                    alert("Invalid value on form");
                    this.focus();
                    return;
                }
            });
        }
    });
});
