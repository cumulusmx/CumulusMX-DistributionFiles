// Last modified: 2024/10/30 10:52:28

let accessMode;

$(document).ready(function() {
    var now = new Date();
    now.setHours(0, 0, 0, 0);

    $.ajax({
        url: '/api/info/version.json',
        dataType:'json'
    })
    .done(function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    });

    // Create the form

    $('form').alpaca({
        optionsSource: '/json/QueryDayFileOptions.json',
        schemaSource: '/json/QueryDayFileSchema.json',
        view: 'bootstrap-edit-horizontal',
        options: {
            form: {
                buttons: {
                    // don't use the Submit button because that is disabled on validation errors
                    validate: {
                        title: 'Update',
                        click: function() {
                            this.refreshValidationState(true);
                            if (this.isValid(true)) {
                                let form = $('form').alpaca('get');
                                let startSel = form.getControlByPath('startsel')
                                let json = this.getValue();

                                if (startSel.getValue() == 'SpecificDay') {
                                    let mon = form.getControlByPath('month').getValue();
                                    let day = form.getControlByPath('day').getValue();
                                    json.startsel = 'Day' + addLeadingZeros(mon) + addLeadingZeros(day);
                                }

                                $.ajax({
                                    type: 'POST',
                                    url: '/api/records/query/dayfile.json',
                                    data: {json: JSON.stringify(json)},
                                    dataType: 'text'
                                })
                                .done(function (result) {
                                    let res = JSON.parse(result);
                                    if (res.value.length == undefined) {
                                        $('#resultValue').text(res.value.toFixed(2));
                                    } else {
                                        $('#resultValue').text(res.value);
                                    }
                                    $('#resultTime').text(res.time);
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
                where: {
                    validator: function(callback) {
                        let form = $('form').alpaca('get');

                        let value = this.getValue();
                        let startSel = form.getControlByPath('startsel').getValue();
                        let func = form.getControlByPath('function').getValue();

                        if (value.length == 0 && func == 'count') {
                            callback({
                                status: false,
                                message: 'You must use a "where" condition when using the Count function'
                            });
                            return;
                        }
                        // all OK
                        callback({
                            status: true
                        });
                    }
                },
                countfunction: {
                    validator: function(callback) {
                        /*
                        let form = $('form').alpaca('get');

                        let value = this.getValue();
                        let startSel = form.getControlByPath('startsel').getValue();
                        let func = form.getControlByPath('function').getValue();

                        if (value.length == 0 && func == 'count' && (startSel.startsWith('Month') || startSel =='Yearly')) {
                            callback({
                                status: false,
                                message: 'You must use a count function when using the Count function with a recurring period (month/year)'
                            });
                            return;
                        }
                        */
                        // all OK
                        callback({
                            status: true
                        });
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

            now.setDate(now.getDate() - 1);
            //var start = new Date(result.began)

            // set initial values
            form.getControlByPath('day').setValue(1);
            form.getControlByPath('day').schema.maximum = 31;

            form.getControlByPath('month').on('change', function () {
                let mon = form.getControlByPath('month').getValue();
                let dayObj = form.getControlByPath('day');
                let day = dayObj.getValue();

                dayObj.schema.maximum = monthDays[mon];
                dayObj.refresh();
                dayObj.refreshValidationState();
            });

            // force a non-required field to have a default value
            form.getControlByPath('countfunction').setValue('max');

            $.ajax({
                url: '/api/tags/process.txt',
                dataType: 'text',
                method: 'POST',
                data: '<#recordsbegandate format="yyyy-MM-dd">',
                contentType: 'text/plain'
            })
            .done(function (startDate) {
                let start = new Date(startDate);

                fromDate = $('#startDate').datepicker({
                    dateFormat: 'yy-mm-dd',
                    minDate: start,
                    maxDate: '0d',
                    firstDay: 1,
                    yearRange: start.getFullYear() + ':' + now.getFullYear(),
                    changeMonth: true,
                    changeYear: true,
                })
                .val(formatUserDateStr(now))
                .on('change', function () {
                    var date = fromDate.datepicker('getDate');
                    if (toDate.datepicker('getDate') < date) {
                        toDate.datepicker('setDate', date);
                    }
                    toDate.datepicker('option', { minDate: date });
                });

                toDate = $('#endDate').datepicker({
                    dateFormat: 'yy-mm-dd',
                    minDate: start,
                    maxDate: '0d',
                    firstDay: 1,
                    yearRange: start.getFullYear() + ':' + now.getFullYear(),
                    changeMonth: true,
                    changeYear: true,
                })
                .val(formatUserDateStr(now))
                .on('change', function () {
                    var date = fromDate.datepicker('getDate');
                    if (toDate.datepicker('getDate') < date) {
                        toDate.datepicker('setDate', date);
                    }
                    toDate.datepicker('option', { minDate: date });
                });

                fromDate.datepicker('setDate', now);
                toDate.datepicker('setDate', now);
            });
        }
    });
});



function formatUserDateStr(inDate) {
    return addLeadingZeros(inDate.getDate()) + '-' + addLeadingZeros(inDate.getMonth() + 1) + '-' + inDate.getFullYear();
}

function addLeadingZeros(n) {
    return n <= 9 ? '0' + n : n;
}


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

let  monthDays = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
