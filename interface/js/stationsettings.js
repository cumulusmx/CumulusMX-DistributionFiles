var StashedStationId;
$(document).ready(function () {
    var layout1 = '<table class="table table-hover"><tr><td id="left"></td><td id="right"></td></tr></table>';
    $("#form").alpaca({
        "dataSource": "./api/settings/stationdata.json",
        "optionsSource": "./api/settings/stationoptions.json",
        "schemaSource": "./api/settings/stationschema.json",
        "ui": "bootstrap",
        "view": "bootstrap-edit-horizontal",
        "postRender": function (form) {
            var stationIdObj = form.childrenByPropertyId["general"].childrenByPropertyId["stationtype"];

            stationIdObj.on("change", function () {
                var form = $("#form").alpaca("get");
                var stationid = this.getValue();
                form.childrenByPropertyId["stationid"].setValue(stationid);
                form.childrenByPropertyId["Options"].childrenByPropertyId["stationid"].setValue(stationid);
            });

            var stationid = form.childrenByPropertyId["stationid"].getValue();
            form.childrenByPropertyId["Options"].childrenByPropertyId["stationid"].setValue(stationid);
            StashedStationId = stationid;

            $("#save-button").click(function () {
                if (form.isValid(true)) {
                    var stationIdObj = form.childrenByPropertyId["general"].childrenByPropertyId["stationtype"];
                    var stationId = stationIdObj.getValue();

                    if (stationId == -1) {
                        alert("You have not selected a station type");
                        return;
                    }
                    if (stationId != StashedStationId) {
                        alert("You have changed the Station type, you must restart Cumulus MX");
                        StashedStationId = stationId;
                    }

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
                    alert("Invalid value somewhere on the form!");
                    this.focus();
                    return;
                }
            });
        }
    });
});
