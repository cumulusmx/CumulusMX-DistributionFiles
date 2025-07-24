// Last modified: 2025/06/22 22:31:32

$(document).ready(function () {
    let stationNameValidated = false;
    let stationTypeValidated = false;
    let StashedDavisStationId = -1; // used to store the last selected Davis station id
    let StashedDavisUuid = ''; // used to store the last selected Davis station uuid


    $('form').alpaca({
        dataSource: '/api/settings/wizard.json',
        optionsSource: '/json/WizardOptions.json',
        schemaSource: '/json/WizardSchema.json',
        view: {
            parent: 'bootstrap-edit-horizontal',
            wizard: {
                title: 'Welcome to the Wizard',
                description: 'Please fill things in as you wish',
                bindings: {
                    location: 1,
                    units: 2,
                    station: 3,
                    logs: 4,
                    internet: 5,
                    website: 6
                },
                steps: [{
                    title: 'Location',
                    description: 'Geographic Information'
                }, {
                    title: 'Units',
                    description: 'Temperature Wind etc'
                }, {
                    title: 'Station',
                    description: 'Setup your PWS'
                }, {
                    title: 'Logging',
                    description: 'Logging intervals'
                }, {
                    title: 'Internet',
                    description: 'Configure web hosting'
                }, {
                    title: 'Actions',
                    description: 'Enable interval actions'
                }],
                showSteps: true,
                showProgressBar: false,
                validation: true,
                buttons: {
                    submit: {
                        title: 'All Done!',
                        validate: function(callback) {
                            console.log('Submit validate()');
                            callback(true);
                        },
                        styles: 'alpaca-form-button-submit',
                        click: function() {
                            this.refreshValidationState(true);
                            if (this.isValid(true)) {
                                // If the station is Davis WLL or Cloud, check the station id and uuid
                                let stationId = this.getControlByPath('station/stationid').getValue();
                                if (stationId == 11 || stationId == 19 || stationId == 20) {
                                    let davisObj;

                                    if (stationId == 11) {
                                        davisObj = this.getControlByPath('station/daviswll');
                                    } else {
                                        davisObj = this.getControlByPath('station/daviscloud');
                                    }

                                    let apiStationId = davisObj.getControlByPath('api/apiStationId').getValue();
                                    let apiStationUuid = davisObj.getControlByPath('api/apiStationUuid').getValue();

                                    if (apiStationId != StashedDavisStationId && apiStationUuid == StashedDavisUuid && StashedDavisUuid != '') {
                                        // If the station id has changed, but the uuid is the same, blank the uuid
                                        davisObj.getControlByPath('api/apiStationUuid').setValue('');
                                        StashedDavisStationId = apiStationId;
                                        alert('You have changed the Davis station id, but not the uuid. The uuid has been cleared.');
                                    }
                                    if (apiStationId == StashedDavisStationId && apiStationUuid != StashedDavisUuid && StashedDavisStationId != -1) {
                                        // If the station id is the same, but the uuid has changed, blank the station id
                                        davisObj.getControlByPath('api/apiStationId').setValue(-1);
                                        StashedDavisUuid = apiStationUuid;
                                        alert('You have changed the Davis station uuid, but not the station id. The station id has been cleared.');
                                    }
                                }

                                let json = this.getValue();

                                $.ajax({
                                    type: 'POST',
                                    url: '/api/setsettings/wizard.json',
                                    data: {json: JSON.stringify(json)},
                                    dataType: 'text'
                                })
                                .done(function () {
                                    alert('Settings saved. You can now restart Cumulus MX');
                                })
                                .fail(function (jqXHR, textStatus) {
                                    alert('Error: ' + jqXHR.status + '(' + textStatus + ') - ' + jqXHR.responseText);
                                });
                            } else {
                                let firstErr = $('form').find('.has-error:first')
                                let path = $(firstErr).attr('data-alpaca-field-path');
                                let msg = $(firstErr).children('.alpaca-message').text();
                                alert('Invalid value in the form: ' + path + msg);
                                if ($(firstErr).is(':visible')) {
                                    let entry = $(firstErr).focus();
                                    $(window).scrollTop($(entry).position().top);
                                }
                            }
                        },
                        id: 'mySubmit',
                        attributes: {
                            'data-test': '123'
                        }
                    }
                }
            }
        },
        options: {
            fields: {
                location: {
                    fields: {
                        sitename: {
                            validator: function (callback) {
                                let value = this.getValue();
                                if (value == '' && stationNameValidated) {
                                    callback({
                                        status: false,
                                        message: 'Please enter a station name'
                                    });
                                } else if (stationNameValidated == false) {
                                    stationNameValidated = true;
                                    callback({
                                        status: true
                                    });
                                    this.focus();
                                } else {
                                    callback({
                                        status: true
                                    });
                                }
                            }
                        },
                        latitude: {
                            validator: function (callback) {
                                // allow comma decimals
                                let value = this.getValue().replace(',', '.');
                                let newVal = parseFloat(value);
                                if (isNaN(newVal)) {
                                    callback({
                                        status: false,
                                        message: 'Please enter a valid decimal value'
                                    });
                                } else {
                                    if (newVal > -90 && newVal < 90) {
                                        this.setValue(newVal);
                                        callback({
                                            status: true
                                        });
                                    } else {
                                        callback({
                                            status: false,
                                            message: 'Please enter a value between -90.0 and +90.0 degrees'
                                        });
                                    }
                                }
                            }
                        },
                        longitude: {
                            validator: function (callback) {
                                // allow comma decimals
                                let value = this.getValue().replace(',', '.');
                                let newVal = parseFloat(value);
                                if (isNaN(newVal)) {
                                    callback({
                                        status: false,
                                        message: 'Please enter a valid decimal value'
                                    });
                                } else {
                                    if (newVal >= -180 && newVal <= 180) {
                                        this.setValue(newVal);
                                        callback({
                                            status: true
                                        });
                                    } else {
                                        callback({
                                            status: false,
                                            message: 'Please enter a value between -180.0 and +180.0 degrees'
                                        });
                                    }
                                }
                            }
                        }
                    }
                },
                station: {
                    fields: {
                        stationtype: {
                            validator: function (callback) {
                                let value = this.getValue();
                                if (value == '-1' && stationTypeValidated) {
                                    callback({
                                        status: false,
                                        message: 'Please select a station type'
                                    });
                                } else {
                                    stationTypeValidated = true;
                                    callback({
                                        status: true
                                    });
                                }
                            }
                        },
                        gw1000: {
                            fields: {
                                macaddress: {
                                    validator: function(callback) {
                                        let value = this.getValue();
                                        if (value && !/^[a-fA-F0-9]{2}(:[a-fA-F0-9]{2}){5}$/.test(value)) {
                                            callback({
                                                status: false,
                                                message: 'That is not a valid MAC address!'
                                            });
                                            return;
                                        }
                                        callback({
                                            status: true
                                        });
                                    }
                                }
                            }
                        },
                        ecowittapi: {
                            fields:{
                                mac: {
                                    validator: function(callback) {
                                        let value = this.getValue().trim();
                                        if (value != '') {
                                            // check for IMEI format - 15 or 16 digits
                                            var val = Number.parseInt(value)
                                            if (!isNaN(val) && val > 2550)
                                            {
                                                if (value.length == 15 || value.length == 16) {
                                                    callback({
                                                        status: true
                                                    });
                                                } else {
                                                    callback({
                                                        status: false,
                                                        message: 'That is not a valid IMEI!'
                                                    });
                                                }
                                                return;
                                            }
                                            // check for MAC address format
                                            if (!/^[a-fA-F0-9]{2}(:[a-fA-F0-9]{2}){5}$/.test(value)) {
                                                callback({
                                                    status: false,
                                                    message: 'That is not a valid MAC address!'
                                                });
                                                return;
                                            }
                                        }
                                        callback({
                                            status: true
                                        });
                                    }
                                },
                                applicationkey: {
                                    validator: function(callback) {
                                        let value = this.getValue();
                                        if (value != '') {
                                            if (!/^[A-F0-9]{30,35}$/.test(value)) {
                                                callback({
                                                    status: false,
                                                    message: 'That is not a valid Application Key!'
                                                });
                                                return;
                                            }
                                        }
                                        callback({
                                            status: true
                                        });
                                    }
                                },
                                userkey: {
                                    validator: function(callback) {
                                        let value = this.getValue();
                                        if (value != '') {
                                            if (!/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/.test(value)) {
                                                callback({
                                                    status: false,
                                                    message: 'That is not a valid API Key!'
                                                });
                                                return;
                                            }
                                        }
                                        callback({
                                            status: true
                                        });
                                    }
                                }
                            }
                        }
                    }
                },
                internet: {
                    fields: {
                        copy: {
                            fields: {
                                localcopyfolder: {
                                    validator: function(callback) {
                                        let value = this.getValue();
                                        if (!/^.*[\/\\\\\\\\]{1}$/.test(value)) {
                                            callback({
                                                status: false,
                                                message: 'The path must end with a path delimiter [\\ or /]'
                                            });
                                            return;
                                        }
                                        callback({
                                            status: true
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        postRender: function (form) {
            let stationIdObj = form.getControlByPath('station/stationid');
            let stationTypeObj = form.getControlByPath('station/stationtype');
            let manufacturerObj = form.getControlByPath('station/manufacturer');

            let webEnabled = form.getControlByPath('internet/ftp/enabled');
            let webState = webEnabled.getValue();
            let copyEnabled = form.getControlByPath('internet/copy/localcopy');
            let copyState = copyEnabled.getValue();

            let siteIntEnabled = form.getControlByPath('website/interval/enabled');
            let siteRtEnabled = form.getControlByPath('website/realtime/enabled');

            let siteIntFtp = form.getControlByPath('website/interval/enableintervalftp');
            let siteRtFtp = form.getControlByPath('website/realtime/enablerealtimeftp');

            // get the initial states - in case we are re-running the wizard
            let intState = siteIntEnabled.getValue();
            let rtmState = siteRtEnabled.getValue();

            StashedDavisStationId = form.getControlByPath('station/daviswll/api/apiStationId').getValue();
            StashedDavisUuid = form.getControlByPath('station/daviswll/api/apiStationUuid').getValue();

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

            // Set password fields to 'reveal' when they have focus
            $(':password')
                .focusout(function() {
                    $(this).attr('type', 'password');
                })
                .focusin(function() {
                    $(this).attr('type', 'text');
                });

            // hide the username & password fields if sslftp is set the SFTP and sshAuth is set PSK file only
            form.getControlByPath('internet/ftp/sslftp').on('change', function () {
                let form = $('form').alpaca('get');
                let proto = this.getValue();
                let usernameFld = form.getControlByPath('internet/ftp/username');
                let passwdFld = form.getControlByPath('internet/ftp/password');

                // Set the default port to match protocol
                let newPort = proto == 0 ? 21 : (proto == 1 ? 990 : 22);
                form.getControlByPath('internet/ftp/ftpport').setValue(newPort);

                if (proto == '2') {
                    let authVal = form.getControlByPath('internet/ftp/sshAuth').getValue();
                    usernameFld.options.hidden = authVal == 'psk';
                    passwdFld.options.hidden = authVal == 'psk';

                } else {
                    usernameFld.options.hidden = false;
                    passwdFld.options.hidden = false;
                }
                usernameFld.refresh();
                passwdFld.refresh();
            });

            // hide the username & password fields if sshAuth is set PSK file only
            form.getControlByPath('internet/ftp/sshAuth').on('change', function () {
                let form = $('form').alpaca('get');
                let authVal = this.getValue();
                let usernameFld = form.getControlByPath('internet/ftp/username');
                let passwdFld = form.getControlByPath('internet/ftp/password');

                usernameFld.options.hidden = authVal == 'psk';
                passwdFld.options.hidden = authVal == 'psk';
                usernameFld.refresh();
                passwdFld.refresh();
            });

            // On changing the manufacturer, repopulate the station type list
            manufacturerObj.on('change', function () {
                let form = $('form').alpaca('get');
                let stationTypeObj = form.getControlByPath('station/stationtype')
                stationTypeObj.refresh();
                var station = stationTypeObj.selectOptions[0].value;
                if (stationTypeObj.selectOptions.length == 1) {
                    stationTypeObj.setValue(station);
                    stationIdObj.setValue(station);
                } else {
                    stationTypeObj.setValue(-1);
                    stationIdObj.setValue(-1);
                }
            });

            let currId = stationTypeObj.getValue();
            stationTypeObj.options.dataSource = setStationOptions;
            stationTypeObj.refresh();
            stationTypeObj.setValue(+currId);
            stationIdObj.setValue(+currId);

            // On changing the station type, propagate down to sub-sections
            stationTypeObj.on('change', function () {
                let form = $('form').alpaca('get');
                let manuObj = $('#' + form.getControlByPath('station/manufacturer').id);
                let manu = manuObj[0].options[manuObj[0].selectedIndex].innerText;
                let stationid = this.getValue();
                stationIdObj.setValue(+stationid);
                form.getControlByPath('station/stationmodel').setValue(this.selectOptions.reduce((a, o) => (o.value == stationid && a.push(manu + ' ' + o.text), a), []));
                form.getControlByPath('station/daviscloud/stationtype').setValue(+stationid);
                form.getControlByPath('station/ecowittapi/stationid').setValue(+stationid);
            });

            // Set the initial stationid for Davis Cloud
            form.getControlByPath('station/daviscloud/stationtype').setValue(+currId);
            form.getControlByPath('station/ecowittapi/stationid').setValue(+currId);

            // Some ecowitt api control
            let ecowittapi = form.getControlByPath('station/ecowittapi');
            let sdcard = form.getControlByPath('station/ecowitthttpapi/usesdcard');

            // Set the initial value of the ecowitt api
            if (currId == 22 && sdcard.getValue()) {
                ecowittapi.hide();
            }
            // set the ecowitt api to listen to the ecowitt http local api SD card setting
            ecowittapi.subscribe(sdcard, function(val) {
                if (val) {
                    this.hide();
                } else {
                    this.show();
                }
            });
            ecowittapi.subscribe(currId, function(val) {
                if (val != 22) {
                    this.show();
                } else {
                    let form = $('form').alpaca('get');
                    let sdcard = form.getControlByPath('station/ecowitthttpapi/usesdcard').getValue();
                    if (sdcard) {
                        this.hide();
                    } else {
                        this.show();
                    }
                }
            });

            // On changing the web uploads enabled, disable/enable the other FTP options
            webEnabled.on('change', function () {
                let form = $('form').alpaca('get');
                let webState = this.getValue();
                let copyState = form.getControlByPath('internet/copy/localcopy').getValue();
                let siteIntEnabled = form.getControlByPath('website/interval/enabled');
                let siteRtEnabled = form.getControlByPath('website/realtime/enabled');
                let siteIntFtp = form.getControlByPath('website/interval/enableintervalftp');
                let siteRtFtp = form.getControlByPath('website/realtime/enablerealtimeftp');

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
            copyEnabled.on('change', function () {
                let form = $('form').alpaca('get');
                let copyState = this.getValue();
                let webState = form.getControlByPath('internet/ftp/enabled').getValue();
                let siteIntEnabled = form.getControlByPath('website/interval/enabled');
                let siteRtEnabled = form.getControlByPath('website/realtime/enabled');

                siteIntEnabled.setValue(intState || webState || copyState);
                siteIntEnabled.triggerUpdate();

                siteRtEnabled.setValue(rtmState || webState || copyState);
                siteRtEnabled.triggerUpdate();
            });
        }
    });
});

function setStationOptions(callback) {
    let form = $('form').alpaca('get');

    if (form === null) {
        //return '{}';
        callback({'Select Station Type...': -1});
    }
    let manufacturer = parseInt(form.getControlByPath('station/manufacturer').getValue(), 10);
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

    let cnt = form.getControlByPath('station/stationtype');
    cnt.setValue(-1);
}


function setDavisStationTitle(that, val) {
    if (val == 11) { // WLL
        that.field[0].firstElementChild.innerText = ' Davis WeatherLink Live';
        //that.refresh();
    } else if (val == 19) { // Davis cloud WLL
        that.field[0].firstElementChild.innerText = ' Davis WeatherLink Cloud (WLL/WLC)';
        //that.refresh();
    } else if (val == 20) { // Davis cloud VP2
        that.field[0].firstElementChild.innerText = ' Davis WeatherLink Cloud (VP2)';
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
let ewStations = {'Select Station Type...': -1, 'FineOffset': 5, 'FineOffset with Solar Sensor': 7, 'EasyWeather File': 4};
let oregonStations = {'Select Station Type...': -1, 'WMR-928': 2, 'WMR-918': 3};
let lacrosseStations = {'WS2300': 6};
let oregonUsbStations = {'Select Station Type...': -1, 'WMR200': 9, 'WMR100': 8};
let instrometStations = {'Instromet': 10};
let ecowittStations = {'Select Station Type...': -1, 'HTTP Local API': 22, 'Binary Local API (Legacy)': 12, 'HTTP Custom Sender': 14, 'Ecowitt.net Cloud': 18};
let httpStations = {'HTTP Sender (WUnderground format)': 13};
let ambientStations = {'HTTP Sender (Ambient format)': 15};
let weatherflowStations = {'Tempest': 16};
let simStations = {'Simulated Station': 17};
let jsonStations = {'JSON data input Station': 21};
