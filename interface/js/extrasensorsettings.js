// Last modified: 2024/09/27 10:20:56

let accessMode;
let stashedAirLinkIn, stashedAirLinkOut, stashedExtra;

$(document).ready(function () {

    $("form").alpaca({
        "dataSource": "./api/settings/extrasensordata.json",
        "optionsSource": "./json/ExtraSensorOptions.json",
        "schemaSource": "./json/ExtraSensorSchema.json",
        "view": "bootstrap-edit-horizontal",
        "ui": "bootstrap",
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
                                let form = $("form").alpaca("get");
                                let airLinkIn = form.getControlByPath('airLink/indoor/enabled').getValue();
                                let airLinkOut = form.getControlByPath('airLink/outdoor/enabled').getValue();
                                let extra = form.getControlByPath('httpSensors/extraStation').getValue();


                                if (airLinkIn != stashedAirLinkIn || airLinkOut != stashedAirLinkOut || extra != stashedExtra) {
                                    alert("You have changed the Extra Sensor settings, you must restart Cumulus MX for this to take effect");
                                    stashedAirLinkIn = airLinkIn;
                                    stashedAirLinkOut = airLinkOut;
                                    stashedExtra = extra;
                                }

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
                "httpSensors": {
                    "fields": {
                        "ecowittapi": {
                            "fields":{
                                "mac": {
                                    "validator": function(callback) {
                                        let value = this.getValue();
                                        if (value != "" && !/^[a-fA-F0-9]{2}(:[a-fA-F0-9]{2}){5}$/.test(value)) {
                                            callback({
                                                "status": false,
                                                "message": "That is not a valid MAC address!"
                                            });
                                            return;
                                        }
                                        callback({
                                            "status": true
                                        });
                                    }
                                },
                                "applicationkey": {
                                    "validator": function(callback) {
                                        let value = this.getValue();
                                        if (value != "" && !/^[A-F0-9]{30,35}$/.test(value)) {
                                            callback({
                                                "status": false,
                                                "message": "That is not a valid Application Key!"
                                            });
                                            return;
                                        }
                                        callback({
                                            "status": true
                                        });
                                    }
                                },
                                "userkey": {
                                    "validator": function(callback) {
                                        let value = this.getValue();
                                        if (value != "" && !/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/.test(value)) {
                                            callback({
                                                "status": false,
                                                "message": "That is not a valid API Key!"
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

            // Get the extra sensor station type
            let stationIdObj = form.getControlByPath("httpSensors/extraStation");

            // Set the inital value in the ecowitt subsection
            form.getControlByPath("httpSensors/ecowitt/stationid").setValue(stationIdObj.getValue());

            // On changing the station type, propagate down to sub-sections
            stationIdObj.on("change", function () {
                let form = $("form").alpaca("get");
                let stationid = this.getValue();
                form.getControlByPath("httpSensors/ecowitt/stationid").setValue(stationid);
            });

            // Keep a record of the last value
            stashedAirLinkIn = form.getControlByPath('airLink/indoor/enabled').getValue();
            stashedAirLinkOut = form.getControlByPath('airLink/outdoor/enabled').getValue();
            stashedExtra = form.getControlByPath('httpSensors/extraStation').getValue();
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
    for (let sheet of document.styleSheets) {
        let rules = sheet.cssRules || sheet.rules;
        for (let rule of rules) {
            if (rule.selectorText && rule.selectorText.lastIndexOf(search) === 0) {
                return rule;
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