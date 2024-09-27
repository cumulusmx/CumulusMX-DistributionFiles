// Last modified: 2024/09/27 10:20:51

let accessMode;

$(document).ready(function () {
    $("form").alpaca({
        "dataSource": "./api/settings/displayoptions.json",
        "optionsSource": "./json/DisplayOptions.json",
        "schemaSource": "./json/DisplaySchema.json",
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

                                $.ajax({
                                    type: "POST",
                                    url: "../api/setsettings/updatedisplay.json",
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
            }
        },
        "postRender": function (form) {
            // Change if accessibility is enabled
            let accessObj = form.childrenByPropertyId["accessible"];
            onAccessChange(null, accessObj.getValue());
            accessMode = accessObj.getValue();

            if (!accessMode) {
                setCollapsed();  // sets the class and aria attribute missing on first load by Alpaca
            }

            // messy, but cannot find another way of setting the rightLabels of array checkboxes
            setSensorLabels(form, "DataVisibility/extratemp/sensors");
            setSensorLabels(form, "DataVisibility/extrahum/sensors");
            setSensorLabels(form, "DataVisibility/extradew/sensors");
            setSensorLabels(form, "DataVisibility/soiltemp/sensors");
            setSensorLabels(form, "DataVisibility/soilmoist/sensors");
            setSensorLabels(form, "DataVisibility/leafwet/sensors");
            setSensorLabels(form, "DataVisibility/usertemp/sensors");
            setSensorLabels(form, "DataVisibility/aq/sensors");

            setSensorLabels(form, "Graphs/colour/extratemp/sensors");
            setSensorLabels(form, "Graphs/colour/extrahum/sensors");
            setSensorLabels(form, "Graphs/colour/extradew/sensors");
            setSensorLabels(form, "Graphs/colour/soiltemp/sensors");
            setSensorLabels(form, "Graphs/colour/soilmoist/sensors");
            setSensorLabels(form, "Graphs/colour/usertemp/sensors");
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

function setSensorLabels(form, path) {
    let i = 1;
    form.getControlByPath(path)
        .children
        .forEach(sensor => {
            sensor.options.label = 'Sensor ' + i++;
            sensor.refresh()
        });
}

