// Last modified: 2024/10/29 10:30:14

let accessMode;
let csvChar;


$(document).ready(function () {
    $('#intvlform').alpaca({
        dataSource: '/api/settings/customlogsintvl.json',
        optionsSource: '/json/CustomLogsIntvlOptions.json',
        schemaSource: '/json/CustomLogsIntvlSchema.json',
        ui: 'bootstrap',
        view: 'bootstrap-edit',
        options: {
            form: {
                buttons: {
                    // don't use the Submit button because that is disabled on validation errors
                    validate: {
                        title: 'Save Settings',
                        click: function() {
                            this.refreshValidationState(true);
                            if (this.isValid(true)) {
                                let json = this.getValue();

                                $.ajax({
                                    type: 'POST',
                                    url: '/api/setsettings/updatecustomlogsintvl.json',
                                    data: {json: JSON.stringify(json)},
                                    dataType: 'text'
                                })
                                .done(function () {
                                    alert('Settings updated');
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
                        styles: 'alpaca-form-button-submit'
                    }
                }
            },
            fields: {
                interval: {
                    items: {
                        fields: {
                            content: {
                                placeholder: 'eg. <#temp>' + csvChar +'<#hum>' + csvChar + '<#SoilTemp1>'
                            }
                        }
                    }
                }
            }
        },
        postRender: function (form) {
            // Change in accessibility is enabled
            let accessObj = form.childrenByPropertyId['accessible'];
            onAccessChange(null, accessObj.getValue());
            accessMode = accessObj.getValue();

            if (!accessMode) {
                setCollapsed();  // sets the class and aria attribute missing on first load by Alpaca
            }

            // Trigger changes is the accessibility mode is changed
            //accessObj.on('change', function() {onAccessChange(this)});
        }
    });

    $('#dailyform').alpaca({
        dataSource: '/api/settings/customlogsdaily.json',
        optionsSource: '/json/CustomLogsDailyOptions.json',
        schemaSource: '/json/CustomLogsDailySchema.json',
        ui: 'bootstrap',
        view: 'bootstrap-edit',
        options: {
            form: {
                buttons: {
                    // don't use the Submit button because that is disabled on validation errors
                    validate: {
                        title: 'Save Settings',
                        click: function() {
                            this.refreshValidationState(true);
                            if (this.isValid(true)) {
                                let json = this.getValue();

                                $.ajax({
                                    type: 'POST',
                                    url: '/api/setsettings/updatecustomlogsdaily.json',
                                    data: {json: JSON.stringify(json)},
                                    dataType: 'text'
                                })
                                .done(function () {
                                    alert('Settings updated');
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
                        styles: 'alpaca-form-button-submit'
                    }
                }
            },
            fields: {
                daily: {
                    items: {
                        fields: {
                            content: {
                                placeholder: 'eg. <#temp>' + csvChar +'<#hum>' + csvChar + '<#SoilTemp1>'
                            }
                        }
                    }
                }
            }
        },
        postRender: function (form) {
            // Change in accessibility is enabled
            let accessObj = form.childrenByPropertyId['accessible'];
            onAccessChange(null, accessObj.getValue());
            accessMode = accessObj.getValue();

            if (!accessMode) {
                setCollapsed();  // sets the class and aria attribute missing on first load by Alpaca
            }

            // Trigger changes is the accessibility mode is changed
            //accessObj.on('change', function() {onAccessChange(this)});
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