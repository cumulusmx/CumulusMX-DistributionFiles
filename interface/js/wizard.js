// Last modified: 2021/06/08 10:40:50

$(document).ready(function () {
    $("form").alpaca({
        "dataSource": "./api/settings/wizard.json",
        "optionsSource": "./json/WizardOptions.json",
        "schemaSource": "./json/WizardSchema.json",
        "view": {
            "parent": "bootstrap-edit-horizontal",
            "wizard": {
                "title": "Welcome to the Wizard",
                "description": "Please fill things in as you wish",
                "bindings": {
                    "locaton": 1,
                    "units": 2,
                    "station": 3,
                    "logs": 4,
                    "internet": 5,
                    "website": 6
                },
                "steps": [{
                    "title": "Location",
                    "description": "Geographic Information"
                }, {
                    "title": "Units",
                    "description": "Temperature Wind etc"
                }, {
                    "title": "Station",
                    "description": "Setup your PWS"
                }, {
                    "title": "Logging",
                    "description": "Logging intervals"
                }, {
                    "title": "Internet",
                    "description": "Configure web hosting"
                }, {
                    "title": "Actions",
                    "description": "Interval actions to enable"
                }],
                "showSteps": true,
                "showProgressBar": false,
                "validation": true,
                "buttons": {
                    "submit": {
                        "title": "All Done!",
                        "validate": function(callback) {
                            console.log("Submit validate()");
                            callback(true);
                        },
                        "styles": "alpaca-form-button-submit",
                        "click": function() {
                            this.refreshValidationState(true);
                            if (this.isValid(true)) {
                                let json = this.getValue();

                                $.ajax({
                                    type: "POST",
                                    url: "../api/setsettings/wizard.json",
                                    data: {json: JSON.stringify(json)},
                                    dataType: "text"
                                })
                                .done(function () {
                                    alert("Settings saved. You can now restart Cumulus MX");
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
                        "id": "mySubmit",
                        "attributes": {
                            "data-test": "123"
                        }
                    }
                }
            }
        },
        "postRender": function (form) {
            let webEnabled = form.getControlByPath("internet/enabled");
            let state = !webEnabled.getValue();

            form.getControlByPath("website/interval/autoupdate").options.disabled = state;
            form.getControlByPath("website/realtime/enablerealtimeftp").options.disabled = state;
            form.getControlByPath("website/interval/autoupdate").refresh();
            form.getControlByPath("website/realtime/enablerealtimeftp").refresh();

            // On changing the web uploads enabled, disable/enable the other FTP options
            webEnabled.on("change", function () {
                let form = $("form").alpaca("get");
                let state = !this.getValue();
                form.getControlByPath("website/interval/autoupdate").options.disabled = state;
                form.getControlByPath("website/realtime/enablerealtimeftp").options.disabled = state;
                form.getControlByPath("website/interval/autoupdate").refresh();
                form.getControlByPath("website/realtime/enablerealtimeftp").refresh();
            });
        }
    });
});
