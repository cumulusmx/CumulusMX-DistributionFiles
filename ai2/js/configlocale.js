// Last modified: 2023/12/14 11:49:24

let accessMode;

$(document).ready(function () {
    $("form").alpaca({
        "dataSource": "/api/settings/langdata.json",
        "optionsSource": "/json/LanguageOptions.json",
        "schemaSource": "/json/LanguageSchema.json",
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
                                    url: "/api/setsettings/updatelanguage.json",
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

            setCompassLabels(form);
            setSensorLabels(form, 'extraTemp')
            setSensorLabels(form, 'extraHum')
            setSensorLabels(form, 'extraDP')
            setSensorLabels(form, 'userTemp')
            setSensorLabels(form, 'soilTemp')
            setSensorLabels(form, 'soilMoist')
            setSensorLabels(form, 'leafWet')
            setSensorLabels(form, 'airQuality/sensor')
            setAvgSensorLabels(form, 'airQuality/sensorAvg')
        }
    });
});


function addButtons() {
	$('form legend').each(function () {
		let span = $('span:first',this);
		if (span.length === 0)
			return;

		let butt = $('<button type="button" data-toggle="collapse" data-target="' + $(span).attr('data-target') +
			'" role="treeitem" aria-expanded="false" class="w3-btn ow-theme-add3 ow-theme-hvr collapsed" style="flex: none">' +
            $(span).text() +'</button>');
		$(span).remove();
        $(this).addClass('ow-btnBar');
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
        $(this).removeClass('ow-btnBar');
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
		if (sheet.href == null) {
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

function setCompassLabels(form) {
    let i = 0;
    let pnts = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];

    form.getControlByPath("compass")
        .children
        .forEach(sensor => {
            sensor.options.label = pnts[i++];
            sensor.refresh()
        });
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

function setAvgSensorLabels(form, path) {
    let i = 1;
    form.getControlByPath(path)
        .children
        .forEach(sensor => {
            sensor.options.label = 'Sensor Avg ' + i++;
            sensor.refresh()
        });
}

