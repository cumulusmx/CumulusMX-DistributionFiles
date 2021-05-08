// Last modified: 2021/05/08 17:56:26

let accessMode;

$(document).ready(function() {

    let setDefaultWebSite = function () {
        let form = $("#form").alpaca("get");
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

    let updateFtpDisabledOption = function  (objArray, newVal) {
        objArray.forEach(function (child) {
            child.childrenByPropertyId["ftp"].options.disabled = newVal;
            child.childrenByPropertyId["ftp"].refresh();
        });
    };

    let updateFtpOption = function updateFtpOption (objArray, newVal) {
        objArray.forEach(function (child) {
            child.childrenByPropertyId["ftp"].setValue(newVal);
            child.childrenByPropertyId["ftp"].refresh();
        });
    };

    let updateCreateDisabledOption = function (objArray, newVal) {
        objArray.forEach(function (child) {
            child.childrenByPropertyId["create"].options.disabled = newVal;
            child.childrenByPropertyId["create"].refresh();
        });
    };

    let updateCreateOption = function (objArray, newVal) {
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
            // Change in accessibility is enabled
            let accessObj = form.childrenByPropertyId["accessible"];
            onAccessChange(null, accessObj.getValue());
            accessMode = accessObj.getValue();

            if (!accessMode) {
                setCollapsed();  // sets the class and aria attribute missing on first load by Alpaca
            }

            // Trigger changes is the accessibility mode is changed
            //accessObj.on("change", function() {onAccessChange(this)});

            let ftpmodeObj = form.childrenByPropertyId["website"].childrenByPropertyId["sslftp"];
            let ftpmode = ftpmodeObj.getValue();
            form.childrenByPropertyId["website"].childrenByPropertyId["advanced"].childrenByPropertyId["ftpmode"].setValue(ftpmode);

            // Trigger updates based on FTP protocol changes
            ftpmodeObj.on("change", function () {
                let form = $("#form").alpaca("get");
                let ftpmode = this.getValue();
                // Set the hidden advanced options protocol field to match
                form.childrenByPropertyId["website"].childrenByPropertyId["advanced"].childrenByPropertyId["ftpmode"].setValue(ftpmode);
                // Set the default port to match
                let newPort = ftpmode == 0 ? 21 : (ftpmode == 1 ? 990 : 22);
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
                let val = !this.getValue();
                updateFtpDisabledOption(form.childrenByPropertyId["websettings"].childrenByPropertyId["realtime"].childrenByPropertyId["files"].children, val);
            });

            // enable/disable interval std files FTP option
            let autoupdate = form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["autoupdate"].getValue();
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
                let val = !this.getValue();
                updateFtpDisabledOption(form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["stdfiles"].childrenByPropertyId["files"].children, val);
                updateFtpDisabledOption(form.childrenByPropertyId["websettings"].childrenByPropertyId["interval"].childrenByPropertyId["graphfiles"].childrenByPropertyId["files"].children, val);
            });

            form.childrenByPropertyId["websettings"].childrenByPropertyId["realtime"].childrenByPropertyId["enablerealtimeftp"].on("change", function () {
                let val = !this.getValue();
                updateFtpDisabledOption(form.childrenByPropertyId["websettings"].childrenByPropertyId["realtime"].childrenByPropertyId["files"].children, val);
            });


            $("#save-button").click(function () {
                if (form.isValid(true)) {
                    let json = form.getValue();

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

function addButtons() {
    $('#form legend').each(function () {
        let span = $('span:first',this);
        if (span.length === 0)
            return;

            let butt = $('<button type="button" data-toggle="collapse" data-target="' +
            $(span).attr('data-target') +
            '" role="treeitem" aria-expanded="false" class="collapsed">' +
            $(span).text() +
            '</button>');
        $(span).remove();
        $(this).prepend(butt);
    });
}

function removeButtons() {
    $('#form legend').each(function () {
        let butt = $('button:first',this);
        if (butt.length === 0)
            return;

            let span = $('<span data-toggle="collapse" data-target="' +
            $(butt).attr('data-target') +
            '" role="treeitem" aria-expanded="false" class="collapsed">' +
            $(butt).text() +
            '</span>');
        $(butt).remove();
        $(this).prepend(span);
    });
}

function setCollapsed() {
    $('#form div.alpaca-container.collapse').each(function () {
        let span = $(this).siblings('legend:first').children('span:first');
        if ($(this).hasClass('in')) {
            span.attr('role', 'treeitem');
            span.attr('aria-expanded', true);
        } else {
            span.attr('role', 'treeitem');
            span.attr('aria-expanded', false);
            span.addClass('collapsed')
        }
    });
}

function getCSSRule(search) {
    for (let x = 0; x < document.styleSheets.length; x++) {
        let rules = document.styleSheets[x].rules || document.styleSheets[x].cssRules;
        for (let i = 0; i < rules.length; i++) {
            if (rules[i].selectorText && rules[i].selectorText.lastIndexOf(search) === 0  && search.length === rules[i].selectorText.length) {
                return rules[i];
            }
        }
    }
    return null;
}

function onAccessChange(that, val) {
    let mode = val == null ? that.getValue() : val;
    if (mode == accessMode) {
        return;
    }

    let expandable = getCSSRule('.alpaca-field > legend > .collapsed::before');
    let expanded = getCSSRule('.alpaca-field > legend > span::before');

    accessMode = mode;
    if (mode) {
        expandable.style.setProperty('display','none');
        expanded.style.setProperty('display','none');
        addButtons();
    } else {
        expandable.style.removeProperty('display');
        expanded.style.removeProperty('display');
        removeButtons();
    }
}