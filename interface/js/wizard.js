// Last modified: 2023/10/08 17:25:32

$(document).ready(function () {
    let stationNameValidated = false;
    let stationTypeValidated = false;

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
                    "location": 1,
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
                    "description": "Enable interval actions"
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
        "options": {
            "fields": {
                "location": {
                    "fields": {
                        "sitename": {
                            "validator": function (callback) {
                                let value = this.getValue();
                                if (value == "" && stationNameValidated) {
                                    callback({
                                        "status": false,
                                        "message": "Please enter a station name"
                                    });
                                } else if (stationNameValidated == false) {
                                    stationNameValidated = true;
                                    callback({
                                        "status": true
                                    });
                                    this.focus();
                                } else {
                                    callback({
                                        "status": true
                                    });
                                }
                            }
                        },
                        "latitude": {
                            "validator": function (callback) {
                                // allow comma decimals
                                let value = this.getValue().replace(',', '.');
                                let newVal = parseFloat(value);
                                if (isNaN(newVal)) {
                                    callback({
                                        "status": false,
                                        "message": "Please enter a valid decimal value"
                                    });
                                } else {
                                    if (newVal > -90 && newVal < 90) {
                                        this.setValue(newVal);
                                        callback({
                                            "status": true
                                        });
                                    } else {
                                        callback({
                                            "status": false,
                                            "message": "Please enter a value between -90.0 and +90.0 degrees"
                                        });
                                    }
                                }
                            }
                        },
                        "longitude": {
                            "validator": function (callback) {
                                // allow comma decimals
                                let value = this.getValue().replace(',', '.');
                                let newVal = parseFloat(value);
                                if (isNaN(newVal)) {
                                    callback({
                                        "status": false,
                                        "message": "Please enter a valid decimal value"
                                    });
                                } else {
                                    if (newVal >= -180 && newVal <= 180) {
                                        this.setValue(newVal);
                                        callback({
                                            "status": true
                                        });
                                    } else {
                                        callback({
                                            "status": false,
                                            "message": "Please enter a value between -180.0 and +180.0 degrees"
                                        });
                                    }
                                }
                            }
                        }
                    }
                },
                "station": {
                    "fields": {
                        "stationtype": {
                            "validator": function (callback) {
                                let value = this.getValue();
                                if (value == "-1" && stationTypeValidated) {
                                    callback({
                                        "status": false,
                                        "message": "Please select a station type"
                                    });
                                } else {
                                    stationTypeValidated = true;
                                    callback({
                                        "status": true
                                    });
                                }
                            }
                        },
                        "gw1000": {
                            "fields": {
                                "macaddress": {
                                    "validator": function(callback) {
                                        let value = this.getValue();
                                        if (value && !/^[a-fA-F0-9]{2}(:[a-fA-F0-9]{2}){5}$/.test(value)) {
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
                                }
                            }
                        },
                        "ecowittapi": {
                            "fields":{
                                "mac": {
                                    "validator": function(callback) {
                                        let value = this.getValue();
                                        if (!/^[a-fA-F0-9]{2}(:[a-fA-F0-9]{2}){5}$/.test(value)) {
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
                                        if (!/^[A-F0-9]{30,35}$/.test(value)) {
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
                                        if (!/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/.test(value)) {
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
                },
                "internet": {
                    "fields": {
                        "copy": {
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
                                }
                            }
                        }
                    }
                }
            }
        },
        "postRender": function (form) {
            let stationIdObj = form.getControlByPath("station/stationtype");

            let webEnabled = form.getControlByPath("internet/ftp/enabled");
            let webState = webEnabled.getValue();
            let copyEnabled = form.getControlByPath("internet/copy/localcopy");
            let copyState = copyEnabled.getValue();

            let siteIntEnabled = form.getControlByPath("website/interval/enabled");
            let siteRtEnabled = form.getControlByPath("website/realtime/enabled");

            let siteIntFtp = form.getControlByPath("website/interval/enableintervalftp");
            let siteRtFtp = form.getControlByPath("website/realtime/enablerealtimeftp");

            // get the initial states - in case we are re-running the wizard
            let intState = siteIntEnabled.getValue();
            let rtmState = siteRtEnabled.getValue();

            siteIntFtp.setValue(webState);
            siteIntFtp.options.disabled = !webState;
            siteIntFtp.options.hidden = !webState;
            siteIntFtp.refresh();

            siteRtFtp.setValue(webState);
            siteRtFtp.options.hidden = !webState;
            siteRtFtp.options.disabled = !webState;
            siteRtFtp.refresh();

            siteIntEnabled.setValue(intState || webState || copyState);
            siteIntEnabled.triggerUpdate();

            siteRtEnabled.setValue(rtmState || webState || copyState);
            siteRtEnabled.triggerUpdate();

            // hide the username & password fields if sslftp is set the SFTP and sshAuth is set PSK file only
            form.getControlByPath("internet/ftp/sslftp").on("change", function () {
                let form = $("form").alpaca("get");
                let proto = this.getValue();
                let usernameFld = form.getControlByPath("internet/ftp/username");
                let passwdFld = form.getControlByPath("internet/ftp/password");

                // Set the default port to match protocol
                let newPort = proto == 0 ? 21 : (proto == 1 ? 990 : 22);
                form.getControlByPath("internet/ftp/ftpport").setValue(newPort);

                if (proto == "2") {
                    let authVal = form.getControlByPath("internet/ftp/sshAuth").getValue();
                    usernameFld.options.hidden = authVal == "psk";
                    passwdFld.options.hidden = authVal == "psk";

                } else {
                    usernameFld.options.hidden = false;
                    passwdFld.options.hidden = false;
                }
                usernameFld.refresh();
                passwdFld.refresh();
            });

            // hide the username & password fields if sshAuth is set PSK file only
            form.getControlByPath("internet/ftp/sshAuth").on("change", function () {
                let form = $("form").alpaca("get");
                let authVal = this.getValue();
                let usernameFld = form.getControlByPath("internet/ftp/username");
                let passwdFld = form.getControlByPath("internet/ftp/password");

                usernameFld.options.hidden = authVal == "psk";
                passwdFld.options.hidden = authVal == "psk";
                usernameFld.refresh();
                passwdFld.refresh();
            });

            // On changing the station type, propagate down to sub-sections
            stationIdObj.on("change", function () {
                let form = $("form").alpaca("get");
                let stationid = this.getValue();
                form.getControlByPath("station/stationmodel").setValue(this.selectOptions.reduce((a, o) => (o.value == stationid && a.push(o.text), a), []));
                form.getControlByPath("station/daviswll/stationtype").setValue(stationid);
                // set the settings name for WLL/Davis cloud
                setDavisStationTitle(form.getControlByPath("station/daviswll"), stationid);
            });

            // Set the initial title of Davis WLL/Cloud
            var stationid = stationIdObj.getValue();
            form.getControlByPath("station/daviswll/stationtype").setValue(stationid);
            setDavisStationTitle(form.getControlByPath("station/daviswll"), stationIdObj.getValue());

            // On changing the web uploads enabled, disable/enable the other FTP options
            webEnabled.on("change", function () {
                let form = $("form").alpaca("get");
                let webState = this.getValue();
                let copyState = form.getControlByPath("internet/copy/localcopy").getValue();
                let siteIntEnabled = form.getControlByPath("website/interval/enabled");
                let siteRtEnabled = form.getControlByPath("website/realtime/enabled");
                let siteIntFtp = form.getControlByPath("website/interval/enableintervalftp");
                let siteRtFtp = form.getControlByPath("website/realtime/enablerealtimeftp");

                siteIntFtp.setValue(webState);
                siteIntFtp.options.disabled = !webState;
                siteIntFtp.options.hidden = !webState;
                siteIntFtp.refresh();

                siteRtFtp.setValue(webState);
                siteRtFtp.options.hidden = !webState;
                siteRtFtp.options.disabled = !webState;
                siteRtFtp.refresh();

                siteIntEnabled.setValue(intState || webState || copyState);
                siteIntEnabled.triggerUpdate();

                siteRtEnabled.setValue(rtmState || webState || copyState);
                siteRtEnabled.triggerUpdate();
            });

            // On changing the copy enabled, disable/enable the other FTP options
            copyEnabled.on("change", function () {
                let form = $("form").alpaca("get");
                let copyState = this.getValue();
                let webState = form.getControlByPath("internet/ftp/enabled").getValue();
                let siteIntEnabled = form.getControlByPath("website/interval/enabled");
                let siteRtEnabled = form.getControlByPath("website/realtime/enabled");

                siteIntEnabled.setValue(intState || webState || copyState);
                siteIntEnabled.triggerUpdate();

                siteRtEnabled.setValue(rtmState || webState || copyState);
                siteRtEnabled.triggerUpdate();
            });
        }
    });
});

function setDavisStationTitle(that, val) {
    if (val == 11) { // WLL
        that.field[0].firstElementChild.innerText = " Davis WeatherLink Live";
        //that.refresh();
    } else if (val == 19) { // Davis cloud WLL
        that.field[0].firstElementChild.innerText = " Davis WeatherLink Cloud (WLL/WLC)";
        //that.refresh();
    } else if (val == 20) { // Davis cloud VP2
        that.field[0].firstElementChild.innerText = " Davis WeatherLink Cloud (VP2)";
        //that.refresh();
    }
}