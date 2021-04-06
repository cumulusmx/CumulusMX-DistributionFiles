// Last modified: 2021/03/25 11:28:48

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

            // On changing the station type, propogate down to sub-sections
            stationIdObj.on("change", function () {
                var form = $("#form").alpaca("get");
                var stationid = this.getValue();
                form.childrenByPropertyId["stationid"].setValue(stationid);
                form.childrenByPropertyId["Options"].childrenByPropertyId["stationid"].setValue(stationid);
                form.childrenByPropertyId["general"].childrenByPropertyId["stationmodel"].setValue(this.getOptionLabels()[1 * stationid + 1]);
                //form.childrenByPropertyId["general"].childrenByPropertyId["stationmodel"].refresh();
            });

            // On changing the Davis VP connection type, propogate down to advanced settings
            form.childrenByPropertyId["davisvp2"].childrenByPropertyId["davisconn"].childrenByPropertyId["conntype"].on("change", function () {
                var form = $("#form").alpaca("get");
                var conntype = this.getValue();
                form.childrenByPropertyId["davisvp2"].childrenByPropertyId["advanced"].childrenByPropertyId["conntype"].setValue(conntype);
                form.childrenByPropertyId["davisvp2"].childrenByPropertyId["advanced"].childrenByPropertyId["conntype"].refresh();
            });

            // Set the initial value of the sub-section  station ids
            var stationid = form.childrenByPropertyId["stationid"].getValue();
            form.childrenByPropertyId["Options"].childrenByPropertyId["stationid"].setValue(stationid);
            // Keep a record of the last value
            StashedStationId = stationid;

            // Set the inital value of Davis advanced conntype
            var conntype = form.childrenByPropertyId["davisvp2"].childrenByPropertyId["davisconn"].childrenByPropertyId["conntype"].getValue();
            form.childrenByPropertyId["davisvp2"].childrenByPropertyId["advanced"].childrenByPropertyId["conntype"].setValue(+conntype);

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
