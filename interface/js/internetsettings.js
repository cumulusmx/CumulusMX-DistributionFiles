// Last modified: 2021/04/26 14:58:14

$(document).ready(function() {

    var setDefaultWebSite = function () {
        var form = $("#form").alpaca("get");
        if (!form.childrenByPropertyId["websettings"].childrenByPropertyId["stdwebsite"].getValue()) {
            return;
        }
        // Interval
        form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["enabled"].setValue(true);
        form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["enabled"].triggerUpdate();
        form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["autoupdate"].setValue(true);
        form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["autoupdate"].triggerUpdate();

        // Interval std files
        form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["stdfiles"].childrenByPropertyId["files"].children[0].childrenByPropertyId["create"].setValue(true);
        form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["stdfiles"].childrenByPropertyId["files"].children[0].childrenByPropertyId["ftp"].setValue(true);

        //Interval graph files
        updateFtpDisabledOption(
            form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["graphfiles"].childrenByPropertyId["files"].children,
            false
        );
        updateCreateOption(
            form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["graphfiles"].childrenByPropertyId["files"].children,
            true
        );
        updateFtpOption(
            form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["graphfiles"].childrenByPropertyId["files"].children,
            true
        );

        //Daily graph files
        updateFtpDisabledOption(
            form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["graphfileseod"].childrenByPropertyId["files"].children,
            false
        );
        updateCreateOption(
            form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["graphfileseod"].childrenByPropertyId["files"].children,
            true
        );
        updateFtpOption(
            form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["graphfileseod"].childrenByPropertyId["files"].children,
            true
        );

        //Realtime
        form.childrenByPropertyId["websettings"].childrenByPropertyId["realtime"].childrenByPropertyId["enabled"].setValue(true);
        form.childrenByPropertyId["websettings"].childrenByPropertyId["realtime"].childrenByPropertyId["enabled"].triggerUpdate();
        form.childrenByPropertyId["websettings"].childrenByPropertyId["realtime"].childrenByPropertyId["enablerealtimeftp"].setValue(true);
        form.childrenByPropertyId["websettings"].childrenByPropertyId["realtime"].childrenByPropertyId["enablerealtimeftp"].triggerUpdate();
        //Realtime files
        updateFtpDisabledOption(
            form.childrenByPropertyId["websettings"].childrenByPropertyId["realtime"].childrenByPropertyId["files"].children,
            false
        );
        updateFtpOption(
            form.childrenByPropertyId["websettings"].childrenByPropertyId["realtime"].childrenByPropertyId["files"].children,
            true
        );
        updateCreateOption(
            form.childrenByPropertyId["websettings"].childrenByPropertyId["realtime"].childrenByPropertyId["files"].children,
            true
        );

        //Moon Image
        form.childrenByPropertyId["moonimage"].childrenByPropertyId["enble"].setValue(true);
        form.childrenByPropertyId["moonimage"].childrenByPropertyId["enable"].triggerUpdate();
        form.childrenByPropertyId["moonimage"].childrenByPropertyId["includemoonimage"].setValue(true);
        form.childrenByPropertyId["moonimage"].childrenByPropertyId["includemoonimage"].triggerUpdate();
        form.childrenByPropertyId["moonimage"].childrenByPropertyId["size"].setValue(100);
        form.childrenByPropertyId["moonimage"].childrenByPropertyId["ftpdest"].setValue("images/moon.png");
        form.childrenByPropertyId["moonimage"].childrenByPropertyId["ftpdest"].triggerUpdate();
    };

    // Helper Functions

    var updateFtpDisabledOption = function  (objArray, newVal) {
        objArray.forEach(function (child) {
            child.childrenByPropertyId["ftp"].options.disabled = newVal;
            child.childrenByPropertyId["ftp"].refresh();
        });
    };

    var updateFtpOption = function updateFtpOption (objArray, newVal) {
        objArray.forEach(function (child) {
            child.childrenByPropertyId["ftp"].setValue(newVal);
            child.childrenByPropertyId["ftp"].refresh();
        });
    };

    var updateCreateDisabledOption = function (objArray, newVal) {
        objArray.forEach(function (child) {
            child.childrenByPropertyId["create"].options.disabled = newVal;
            child.childrenByPropertyId["create"].refresh();
        });
    };

    var updateCreateOption = function (objArray, newVal) {
        objArray.forEach(function (child) {
            child.childrenByPropertyId["create"].setValue(newVal);
            child.childrenByPropertyId["create"].refresh();
        });
    };


    // Create the form

    $("#form").alpaca({
        "dataSource": "../api/settings/internetdata.json",
        "optionsSource": "../api/settings/internetoptions.json",
        "schemaSource": "../api/settings/internetschema.json",
        "view": "bootstrap-edit-horizontal",
        "postRender": function (form) {
            var ftpmodeObj = form.childrenByPropertyId["website"].childrenByPropertyId["sslftp"];
            var ftpmode = ftpmodeObj.getValue();
            form.childrenByPropertyId["website"].childrenByPropertyId["advanced"].childrenByPropertyId["ftpmode"].setValue(ftpmode);

            // Trigger updates based on FTP protocol changes
            ftpmodeObj.on("change", function () {
                var form = $("#form").alpaca("get");
                var ftpmode = this.getValue();
                // Set the hidden advanced options protocol field to match
                form.childrenByPropertyId["website"].childrenByPropertyId["advanced"].childrenByPropertyId["ftpmode"].setValue(ftpmode);
                // Set the default port to match
                var newPort = ftpmode == 0 ? 21 : (ftpmode == 1 ? 990 : 22);
                form.childrenByPropertyId["website"].childrenByPropertyId["ftpport"].setValue(newPort);
            });

            // Trigger updates on "Use standard web site being enabled"
            form.childrenByPropertyId["websettings"].childrenByPropertyId["stdwebsite"].on("change", function () {
                setDefaultWebSite();
            });


            // enable/disable realtime files FTP option
            updateFtpDisabledOption(
                form.childrenByPropertyId["websettings"].childrenByPropertyId["realtime"].childrenByPropertyId["files"].children,
                !form.childrenByPropertyId["websettings"].childrenByPropertyId["realtime"].childrenByPropertyId["enablerealtimeftp"].getValue()
            );

            form.childrenByPropertyId["websettings"].childrenByPropertyId["realtime"].childrenByPropertyId["enablerealtimeftp"].on("change", function () {
                var val = !this.getValue();
                updateFtpDisabledOption(form.childrenByPropertyId["websettings"].childrenByPropertyId["realtime"].childrenByPropertyId["files"].children, val);
            });

            // enable/disable interval std files FTP option
            var autoupdate = form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["autoupdate"].getValue();
            updateFtpDisabledOption(
                form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["stdfiles"].childrenByPropertyId["files"].children,
                !autoupdate
            );

            // enable/disable interval graph files FTP option
            updateFtpDisabledOption(
                form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["graphfiles"].childrenByPropertyId["files"].children,
                !autoupdate
            );

            form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["autoupdate"].on("change", function () {
                var val = !this.getValue();
                updateFtpDisabledOption(form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["stdfiles"].childrenByPropertyId["files"].children, val);
                updateFtpDisabledOption(form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["graphfiles"].childrenByPropertyId["files"].children, val);
            });

            form.childrenByPropertyId["websettings"].childrenByPropertyId["realtime"].childrenByPropertyId["enablerealtimeftp"].on("change", function () {
                var val = !this.getValue();
                updateFtpDisabledOption(form.childrenByPropertyId["websettings"].childrenByPropertyId["realtime"].childrenByPropertyId["files"].children, val);
            });


            $("#save-button").click(function () {
                if (form.isValid(true)) {
                    var json = form.getValue();

                    $.ajax({
                        type: "POST",
                        url: "../api/setsettings/updateinternetconfig.json",
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