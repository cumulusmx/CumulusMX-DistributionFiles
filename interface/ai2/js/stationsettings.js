/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Script: stationsettings.js      Ver: aiX-1.0
    Author: M Crossley & N Thomas
    Last Edit (MC): 2025/05/24 17:19
    Last Edit (NT): 2025/03/21
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Role:   Data for stationsettings.html
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

let StashedStationId;
let accessMode;

$(document).ready(function () {
    //let layout1 = '<table class="table table-hover"><tr><td id="left"></td><td id="right"></td></tr></table>';
    $("form").alpaca({
        "dataSource": "/api/settings/stationdata.json",
        "optionsSource": "/json/StationOptions.json",
        "schemaSource": "/json/StationSchema.json",
        "ui": "bootstrap",
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
                                let form = $("form").alpaca("get");
                                let stationIdObj = form.getControlByPath("general/stationtype");
                                let stationId = stationIdObj.getValue();

                                if (stationId == -1) {
                                    alert("You have not selected a station type");
                                    return;
                                }
                                if (stationId != StashedStationId) {
                                    alert("You have changed the Station type, you must restart Cumulus MX");
                                    StashedStationId = stationId;
                                }

                                let json = this.getValue();

                                $.ajax({
                                    type: "POST",
                                    url: "/api/setsettings/updatestationconfig.json",
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
                "gw1000": {
                    "fields": {
                        "macaddress": {
                            "validator": function(callback) {
                                let value = this.getValue();
                                // check for MAC address format
                                if (value != "" && !/^[a-fA-F0-9]{2}(:[a-fA-F0-9]{2}){5}$/.test(value)) {
                                    callback({
                                        "status": false,
                                        "message": "That is not a valid MAC address!"
                                    });
                                    return;
                                }
                                // all OK
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
                                let value = this.getValue().trim();

                                if (value != "")
                                {
                                    // check for IMEI format - 15 or 16 digits
                                    var val = Number.parseInt(value)
                                    if (!isNaN(val) && val > 2550) {
                                        if (value.length == 15 || value.length == 16) {
                                            callback({
                                                "status": true
                                            });
                                        } else {
                                            callback({
                                                "status": false,
                                                "message": "That is not a valid IMEI!"
                                            });
                                        }
                                        return;
                                    }
                                    // check for MAC address format
                                    if (!/^[a-fA-F0-9]{2}(:[a-fA-F0-9]{2}){5}$/.test(value)) {
                                        callback({
                                            "status": false,
                                            "message": "That is not a valid MAC address!"
                                        });
                                        return;
                                    }
                                }
                                // all OK
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
        },
        "postRender": function (form) {
            // Change in accessibility is enabled
            let accessObj = form.childrenByPropertyId["accessible"];
            onAccessChange(null, accessObj.getValue());
            accessMode = accessObj.getValue();

            if (!accessMode) {
                setCollapsed();  // sets the class and aria attribute missing on first load by Alpaca
            }

            // Set password fields to 'reveal' when they have focus
            $(':password')
                .focusout(function() {
                    $(this).attr('type', 'password');
                })
                .focusin(function() {
                    $(this).attr('type', 'text');
                });

            // Trigger changes is the accessibility mode is changed
            accessObj.on("change", function() {onAccessChange(this)});

            let manufacturerObj = form.getControlByPath("general/manufacturer");

            // On changing the manufacturer, repopulate the station type list
            manufacturerObj.on("change", function () {
                let form = $("form").alpaca("get");
                let stationIdObj = form.getControlByPath("general/stationtype")
                stationIdObj.refresh();
                if (stationIdObj.selectOptions.length == 1) {
                    stationIdObj.setValue(stationIdObj.selectOptions[0].value);
                } else {
                    stationIdObj.setValue(-1);
                }
            });

            let stationIdObj = form.getControlByPath("general/stationtype");

            let currId = stationIdObj.getValue();
            stationIdObj.options.dataSource = setStationOptions;
            stationIdObj.refresh();
            stationIdObj.setValue(+currId);

            // On changing the station type, propagate down to sub-sections
            stationIdObj.on("change", function () {
                let form = $("form").alpaca("get");
                let manuObj = $('#' + form.getControlByPath("general/manufacturer").id);
                let manu = manuObj[0].options[manuObj[0].selectedIndex].innerText;
                let stationid = this.getValue();
                form.childrenByPropertyId["stationid"].setValue(stationid);
                form.getControlByPath("Options/stationid").setValue(stationid);
                form.getControlByPath("daviswll/stationid").setValue(stationid);
                form.getControlByPath("daviswll/advanced/stationid").setValue(stationid);
                form.getControlByPath("ecowittapi/stationid").setValue(stationid);
                form.getControlByPath("general/stationmodel").setValue(this.selectOptions.reduce((a, o) => (o.value == stationid && a.push(manu + " " + o.text), a), []));
                // set the settings name for WLL/Davis cloud
                setDavisStationTitle(form.getControlByPath("daviswll"), stationid);
            });

            // On changing the Davis VP connection type, propagate down to advanced settings
            form.getControlByPath("davisvp2/davisconn/conntype").on("change", function () {
                let form = $("form").alpaca("get");
                let conntype = this.getValue();
                form.getControlByPath("davisvp2/advanced/conntype").setValue(conntype);
                form.getControlByPath("davisvp2/advanced/conntype").refresh();
            });

            // Set the initial value of the sub-section  station ids
            let stationid = form.childrenByPropertyId["stationid"].getValue();
            form.getControlByPath("Options/stationid").setValue(stationid);
            form.getControlByPath("daviswll/stationid").setValue(stationid);
            form.getControlByPath("ecowittapi/stationid").setValue(stationid);
            form.getControlByPath("daviswll/advanced/stationid").setValue(stationid);

            // Keep a record of the last value
            StashedStationId = stationid;

            // On changing the JSON Station connection type, propgate to advanced settings
            let connType = form.getControlByPath("jsonstation/conntype");
            connType.on("change", function () {
                let form = $("form").alpaca("get");
                let type = this.getValue();
                form.getControlByPath("jsonstation/advanced/conntype").setValue(+type);
                form.getControlByPath("jsonstation/advanced/conntype").refresh();
            });
            // Set the initial value of JSON Station connection type in advanced settings
            form.getControlByPath("jsonstation/advanced/conntype").setValue(+form.getControlByPath("jsonstation/conntype").getValue());


            // Set the initial title of Davis WLL/Cloud
            setDavisStationTitle(form.getControlByPath("daviswll"), stationid);
            // Set the initial value of Davis advanced conntype
            let conntype = form.getControlByPath("davisvp2/davisconn/conntype").getValue();
            form.getControlByPath("davisvp2/advanced/conntype").setValue(+conntype);
        }
    });
});


function setStationOptions(callback) {
    let form = $('form').alpaca('get');

    if (form === null) {
        //return '{}';
        callback({'Select Station Type...': -1});
    }
    let manufacturer = parseInt(form.getControlByPath('general/manufacturer').getValue(), 10);
    if (isNaN(manufacturer)) {
        manufacturer = -1;
    }
    switch (manufacturer) {
        case 0:
            callback(davisStations);
            break;
        case 1:
            callback(oregonStations);
            break;
        case 2:
            callback(ewStations);
            break;
        case 3:
            callback(lacrosseStations);
            break;
        case 4:
            callback(oregonUsbStations);
            break;
        case 5:
            callback(instrometStations);
            break;
        case 6:
            callback(ecowittStations);
            break;
        case 7:
            callback(httpStations);
            break;
        case 8:
            callback(ambientStations);
            break;
        case 9:
            callback(weatherflowStations);
            break;
        case 10:
            callback(simStations);
            break;
        case 11:
            callback(jsonStations);
            break;
        default:
            callback({'Select Station Type...': -1});
            break;
    }

    let cnt = form.getControlByPath('general/stationtype');
    cnt.setValue(-1);
}

function addButtons() {
    $('form legend').each(function () {
        let span = $('span:first',this);
        if (span.length === 0)
            return;

        let butt = $('<button type="button" data-toggle="collapse" data-target="' +
            $(span).attr('data-target') +
            '" role="treeitem" aria-expanded="false" class="w3-btn ax-btn-gradient-up collapsed" style="flex: none">' +
            $(span).text() +
            '</button>');
        $(span).remove();
        $(this).addClass('ax-btnBar');
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
        $(this).removeClass('ax-btnBar');
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
        if (sheet.href != null && sheet.href.includes('alpaca')) {
            let rules = sheet.cssRules || sheet.rules;
            for (let rule of rules) {
                if (rule.selectorText && rule.selectorText.lastIndexOf(search) >= 0) {
                    return rule;
                }
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

function setDavisStationTitle(that, val) {
    if (val == 11) { // WLL
        that.field[0].firstElementChild.firstElementChild.innerText = " Davis WeatherLink Live";
        //that.refresh();
    } else if (val == 19) { // Davis cloud WLL
        that.field[0].firstElementChild.firstElementChild.innerText = " Davis WeatherLink Cloud (WLL/WLC)";
        //that.refresh();
    } else if (val == 20) { // Davis cloud VP2
        that.field[0].firstElementChild.firstElementChild.innerText = " Davis WeatherLink Cloud (VP2)";
        //that.refresh();
    }
}

let allStations = {
    'Select Station Type': -1,
    'PWS Simulator': 17,
    'Vantage Pro': 0,
    'Vantage Pro2/Vue': 1,
    'WeatherLink Live': 11,
    'WeatherLink Cloud (WLL/WLC)': 19,
    'WeatherLink Cloud (VP2)': 20,
    'Binary Local API (Legacy)': 12,
    'Cloud': 18,
    'HTTP Sender': 14,
    'HTTP (Wunderground)': 13,
    'HTTP (Ambient)': 15,
    'Tempest': 16,
    'JSON Data Input': 21,
    'Fine Offset': 5,
    'Fine Offset with Solar Sensor': 7,
    'EasyWeather': 4,
    'Instromet': 10,
    'LaCrosse WS2300': 6,
    'WMR100': 8,
    'WMR200': 9,
    'WM-918': 3,
    'WMR-928': 2
};


let davisStations = {'Select Station Type...': -1 , 'Vantage Pro': 0, 'Vantage Pro 2': 1, 'WeatherLink Live': 11, 'WeatherLink Cloud (WLL/WLC)': 19,'WeatherLink Cloud (VP2/Vue)': 20};
let ewStations = {'Select Station Type...': -1 , 'FineOffset': 5 , 'FineOffset with Solar Sensor': 7 , 'EasyWeather File': 4};
let oregonStations = {'Select Station Type...': -1 , 'WMR-928': 2, 'WMR-918': 3};
let lacrosseStations = {'WS2300': 6};
let oregonUsbStations = {'Select Station Type...': -1 , 'WMR200': 9, 'WMR100': 8};
let instrometStations = {'Instromet': 10};
let ecowittStations = {'Select Station Type...': -1, 'HTTP Local API': 22, 'Binary Local API (Legacy)': 12, 'HTTP Custom Sender': 14, 'Ecowitt.net Cloud': 18};
let httpStations = {'HTTP Sender (WUnderground format)': 13};
let ambientStations = {'HTTP Sender (Ambient format)': 15};
let weatherflowStations = {'Tempest': 16};
let simStations = {'Simulated Station': 17};
let jsonStations = {'JSON data input Station': 21};
