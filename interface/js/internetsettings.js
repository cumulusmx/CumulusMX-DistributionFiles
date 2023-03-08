// Last modified: 2023/02/13 17:29:12

let accessMode;

$(document).ready(function() {

    let setDefaultWebSite = function (defaultSet) {
        let form = $("form").alpaca("get");
        if (!form.getControlByPath("websettings/stdwebsite").getValue()) {
            return;
        }

        // Are we using FTP or Copy - or both!
        let ftpEnabled = form.getControlByPath("website/enabled").getValue();
        let copyEnabled = form.getControlByPath("website/localcopy").getValue();

        // Interval
        form.getControlByPath("websettings/interval/enabled").setValue(true);
        form.getControlByPath("websettings/interval/enabled").triggerUpdate();
        form.getControlByPath("websettings/interval/enableintervalftp").setValue(ftpEnabled);
        form.getControlByPath("websettings/interval/enableintervalftp").triggerUpdate();

        // Interval std files
        form.getControlByPath("websettings/interval/stdfiles/files").children[0].childrenByPropertyId["create"].setValue(false);
        form.getControlByPath("websettings/interval/stdfiles/files").children[0].childrenByPropertyId["ftp"].setValue(ftpEnabled);
        form.getControlByPath("websettings/interval/stdfiles/files").children[0].childrenByPropertyId["copy"].setValue(copyEnabled);

        //Interval graph files
        updateFtpDisabledOption(
            form.getControlByPath("websettings/interval/graphfiles/files").children,
            !ftpEnabled
        );
        updateCreateOption(
            form.getControlByPath("websettings/interval/graphfiles/files").children,
            false
        );
        updateFtpOption(
            form.getControlByPath("websettings/interval/graphfiles/files").children,
            ftpEnabled
        );
        updateCopyOption(
            form.getControlByPath("websettings/interval/graphfiles/files").children,
            copyEnabled
        );

        //Daily graph files
        updateFtpDisabledOption(
            form.getControlByPath("websettings/interval/graphfileseod/files").children,
            !ftpEnabled
        );
        updateCreateOption(
            form.getControlByPath("websettings/interval/graphfileseod/files").children,
            false
        );
        updateFtpOption(
            form.getControlByPath("websettings/interval/graphfileseod/files").children,
            ftpEnabled
        );
        updateCopyOption(
            form.getControlByPath("websettings/interval/graphfileseod/files").children,
            copyEnabled
        );

        //Realtime
        form.getControlByPath("websettings/realtime/enabled").setValue(true);
        form.getControlByPath("websettings/realtime/enabled").triggerUpdate();
        form.getControlByPath("websettings/realtime/enablerealtimeftp").setValue(ftpEnabled);
        form.getControlByPath("websettings/realtime/enablerealtimeftp").triggerUpdate();
        //Realtime files
        updateFtpDisabledOption(
            form.getControlByPath("websettings/realtime/files").children,
            !ftpEnabled
        );
        updateFtpOption(
            form.getControlByPath("websettings/realtime/files").children,
            ftpEnabled
        );
        updateCopyOption(
            form.getControlByPath("websettings/realtime/files").children,
            copyEnabled
        );

        updateCreateOption(
            form.getControlByPath("websettings/realtime/files").children,
            false
        );


        //Moon Image
        form.getControlByPath("moonimage/enabled").setValue(true);
        form.getControlByPath("moonimage/enabled").triggerUpdate();
        form.getControlByPath("moonimage/size").setValue(100);
        form.getControlByPath("moonimage/includemoonimage").setValue(ftpEnabled);
        form.getControlByPath("moonimage/includemoonimage").triggerUpdate();
        if (defaultSet) {
            form.getControlByPath("moonimage/ftpdest").setValue("images/moon.png");
            form.getControlByPath("moonimage/ftpdest").triggerUpdate();
        }
        form.getControlByPath("moonimage/copyimage").setValue(copyEnabled);
        form.getControlByPath("moonimage/copyimage").triggerUpdate();
        if (defaultSet) {
            let copyDest = form.getControlByPath("website/localcopyfolder").getValue();
            form.getControlByPath("moonimage/copydest").setValue(copyDest + "images/moon.png");
            form.getControlByPath("moonimage/copydest").triggerUpdate();
        }
    };

    // Helper Functions

    let updateFtpDisabledOption = function  (objArray, newVal) {
        objArray.forEach(function (child) {
            child.childrenByPropertyId["ftp"].options.disabled = newVal;
            child.childrenByPropertyId["ftp"].refresh();
        });
    };

    let updateCopyDisabledOption = function  (objArray, newVal) {
        objArray.forEach(function (child) {
            child.childrenByPropertyId["copy"].options.disabled = newVal;
            child.childrenByPropertyId["copy"].refresh();
        });
    };

    let updateFtpOption = function (objArray, newVal) {
        objArray.forEach(function (child) {
            child.childrenByPropertyId["ftp"].setValue(newVal);
            child.childrenByPropertyId["ftp"].refresh();
        });
    };

    let updateCopyOption = function (objArray, newVal) {
        objArray.forEach(function (child) {
            child.childrenByPropertyId["copy"].setValue(newVal);
            child.childrenByPropertyId["copy"].refresh();
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

    $("form").alpaca({
        "dataSource": "./api/settings/internetdata.json",
        "optionsSource": "./json/InternetOptions.json",
        "schemaSource": "./json/InternetSchema.json",
        "view": "bootstrap-edit-horizontal",
        "options": {
            "form": {
                "buttons": {
                    // don't use the Submit button because that is disabled on validation errors
                    "validate": {
                        "title": "Save Settings",
                        "click": function() {
                            this.refreshValidationState(true);
                            if (this.isValid(true)) {
                                let json = this.getValue();

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
                            } else {
                                let firstErr = $('form').find(".has-error:first")
                                let path = $(firstErr).attr('data-alpaca-field-path');
                                let msg = $(firstErr).children('.alpaca-message').text();
                                alert("Invalid value in the form: " + path + msg);
                                if ($(firstErr).is(":visible")) {
                                    let entry = $(firstErr).focus();
                                    $(window).scrollTop($(entry).position().top);
                                }
                            }
                        },
                        "styles": "alpaca-form-button-submit"
                    }
                }
            },
            "fields": {
                "website": {
                    "fields": {
                        "localcopyfolder": {
                            "validator": function(callback) {
                                let value = this.getValue();
                                if (!/^.*[\/\\\\\\\\]{1}$/.test(value)) {
                                    callback({
                                        "status": false,
                                        "message": "The path must end with a path delimiter [\\ or /]"
                                    });
                                    return;
                                }
                                callback({
                                    "status": true
                                });
                            }
                        },
                        "phpurl": {
                            "validator": function(callback) {
                                let value = this.getValue();
                                if (!/^(http(s?)\:\/\/)/i.test(value)) {
                                    callback({
                                        "status": false,
                                        "message": "The url must start with http:// or https://"
                                    });
                                    return;
                                }
                                callback({
                                    "status": true
                                });
                            }
                        }
                    }
                }
            }
        },
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

            // Set PHP key/secret fields to "reveal" when they have focus
            $('#phpsecret')
                .focusout(function() {
                    $(this).attr('type', 'password');
                })
                .focusin(function() {
                    $(this).attr('type', 'text');
                });


            let ftpmodeObj = form.getControlByPath("website/sslftp");
            let ftpmode = ftpmodeObj.getValue();
            form.getControlByPath("website/general/ftpmode").setValue(ftpmode);
            form.getControlByPath("website/advanced/ftpmode").setValue(ftpmode);

            // Trigger updates based on FTP protocol changes
            ftpmodeObj.on("change", function () {
                let form = $("form").alpaca("get");
                let ftpmode = this.getValue();
                // Set the hidden general/advanced options protocol field to match
                form.getControlByPath("website/general/ftpmode").setValue(ftpmode);
                form.getControlByPath("website/advanced/ftpmode").setValue(ftpmode);
                // Set the default port to match
                let newPort = ftpmode == 2 ? 22 : 21;
                form.getControlByPath("website/ftpport").setValue(newPort);
                // advanced options
                /*
                let enable = ftpmode < 2 ? true : false;
                if (enable) {
                    form.getControlByPath("website/general/ftprename").field.show();
                    form.getControlByPath("website/general/ftpdelete").field.show();
                } else {
                    form.getControlByPath("website/general/ftprename").field.hide();
                    form.getControlByPath("website/general/ftpdelete").field.hide();
                }
                */
            });

            // Trigger updates on "Use standard web site being enabled"
            form.getControlByPath("websettings/stdwebsite").on("change", function () {
                setDefaultWebSite(this.getValue());
            });

            // When FTP is globally disabled, disable the option in Interval and Realtime
            form.getControlByPath("website/enabled").on("change", function () {
                let state = this.getValue();
                let intState = form.getControlByPath("websettings/interval/enabled").getValue() && state;
                let rtState = form.getControlByPath("websettings/realtime/enabled").getValue() && state;

                form.getControlByPath("websettings/interval/enableintervalftp").options.disabled = !state;
                form.getControlByPath("websettings/interval/enableintervalftp").refresh();
                if (form.getControlByPath("websettings/interval/enabled").getValue()) {
                    form.getControlByPath("websettings/interval/enableintervalftp").show();
                } else {
                    form.getControlByPath("websettings/interval/enableintervalftp").hide();
                }

                form.getControlByPath("websettings/realtime/enablerealtimeftp").options.disabled = !state;
                form.getControlByPath("websettings/realtime/enablerealtimeftp").refresh();
                if (form.getControlByPath("websettings/realtime/enabled").getValue()) {
                    form.getControlByPath("websettings/realtime/enablerealtimeftp").show();
                } else {
                    form.getControlByPath("websettings/realtime/enablerealtimeftp").hide();
                }

                updateFtpDisabledOption(form.getControlByPath("websettings/interval/stdfiles/files").children, !intState);
                updateFtpDisabledOption(form.getControlByPath("websettings/interval/graphfiles/files").children, !intState);
                updateFtpDisabledOption(form.getControlByPath("websettings/interval/graphfileseod/files").children, !intState);
                updateFtpDisabledOption(form.getControlByPath("websettings/realtime/files").children, !rtState);
            });

            // Do it on page load as well
            let ftpState = form.getControlByPath("website/enabled").getValue();
            let intState = form.getControlByPath("websettings/interval/enabled").getValue() && ftpState;
            let rtState = form.getControlByPath("websettings/realtime/enabled").getValue() && ftpState;

            form.getControlByPath("websettings/interval/enableintervalftp").options.disabled = !ftpState;
            form.getControlByPath("websettings/interval/enableintervalftp").refresh();
            if (form.getControlByPath("websettings/interval/enabled").getValue()) {
                form.getControlByPath("websettings/interval/enableintervalftp").show();
            } else {
                form.getControlByPath("websettings/interval/enableintervalftp").hide();
            }

            updateFtpDisabledOption(form.getControlByPath("websettings/interval/stdfiles/files").children, !intState);
            updateFtpDisabledOption(form.getControlByPath("websettings/interval/graphfiles/files").children, !intState);
            updateFtpDisabledOption(form.getControlByPath("websettings/interval/graphfileseod/files").children, !intState);
            updateFtpDisabledOption(form.getControlByPath("websettings/realtime/files").children, !rtState);



            // When Local Copy is globally disabled, disable the option in Interval and Realtime
            form.getControlByPath("website/localcopy").on("change", function () {
                let lcState = this.getValue();
                updateCopyDisabledOption(form.getControlByPath("websettings/interval/stdfiles/files").children, !lcState);
                updateCopyDisabledOption(form.getControlByPath("websettings/interval/graphfiles/files").children, !lcState);
                updateCopyDisabledOption(form.getControlByPath("websettings/interval/graphfileseod/files").children, !lcState);
                updateCopyDisabledOption(form.getControlByPath("websettings/realtime/files").children, !lcState);
            });

            // Do it on page load as well
            let lcState = form.getControlByPath("website/localcopy").getValue();
            updateCopyDisabledOption(form.getControlByPath("websettings/interval/stdfiles/files").children, !lcState);
            updateCopyDisabledOption(form.getControlByPath("websettings/interval/graphfiles/files").children, !lcState);
            updateCopyDisabledOption(form.getControlByPath("websettings/interval/graphfileseod/files").children, !lcState);
            updateCopyDisabledOption(form.getControlByPath("websettings/realtime/files").children, !lcState);




            // When the realtime is enabled/disabled, set the realtime FTP option
            form.getControlByPath("websettings/realtime/enabled").on("change", function () {
                let state = this.getValue();
                let ftpState = form.getControlByPath("website/enabled").getValue() && state;

                form.getControlByPath("websettings/realtime/enablerealtimeftp").options.disabled = !ftpState;
                form.getControlByPath("websettings/realtime/enablerealtimeftp").refresh();
                if (state) {
                    form.getControlByPath("websettings/realtime/enablerealtimeftp").show();
                } else {
                    form.getControlByPath("websettings/realtime/enablerealtimeftp").hide();
                }

                updateFtpDisabledOption(form.getControlByPath("websettings/realtime/files").children, !ftpState);
            });

            //When the realtime ftp is enabled/disabled
            form.getControlByPath("websettings/realtime/enablerealtimeftp").on("change", function () {
                let ftpState = form.getControlByPath("website/enabled").getValue();
                let val = this.getValue() && ftpState;
                updateFtpDisabledOption(form.getControlByPath("websettings/realtime/files").children, !val);
            });



            // When the interval enabled/disabled
            form.getControlByPath("websettings/interval/enabled").on("change", function () {
                let state = this.getValue();
                let ftpState = form.getControlByPath("website/enabled").getValue() && state;

                form.getControlByPath("websettings/interval/enableintervalftp").options.disabled = !ftpState;
                form.getControlByPath("websettings/interval/enableintervalftp").refresh();
                if (state) {
                    form.getControlByPath("websettings/interval/enableintervalftp").show();
                } else {
                    form.getControlByPath("websettings/interval/enableintervalftp").hide();
                }

                updateFtpDisabledOption(form.getControlByPath("websettings/interval/stdfiles/files").children, !ftpState);
                updateFtpDisabledOption(form.getControlByPath("websettings/interval/graphfiles/files").children, !ftpState);
                updateFtpDisabledOption(form.getControlByPath("websettings/interval/graphfileseod/files").children, !ftpState);
            });

            // When the interval FTP is enabled/disbaled
            form.getControlByPath("websettings/interval/enableintervalftp").on("change", function () {
                let ftpState = form.getControlByPath("website/enabled").getValue();
                let val = this.getValue() && ftpState;
                updateFtpDisabledOption(form.getControlByPath("websettings/interval/stdfiles/files").children, !val);
                updateFtpDisabledOption(form.getControlByPath("websettings/interval/graphfiles/files").children, !val);
                updateFtpDisabledOption(form.getControlByPath("websettings/interval/graphfileseod/files").children, !val);
            });



            // Set Aria attributes on table checkboxes
            $('table input:checkbox').each(function () {
                let text = $(this).closest('.form-group').find('label').html();
                let file = $(this).closest('tr').find('input').val();
                $(this).attr('aria-label', text + ' file ' + file);
            });
        }
    });
});

function addButtons() {
    $('form legend').each(function () {
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
    $('form legend').each(function () {
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
    $('form div.alpaca-container.collapse').each(function () {
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