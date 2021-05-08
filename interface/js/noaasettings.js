// Last modified: 2021/05/08 18:28:46

let accessMode;

$(document).ready(function() {

    $("#form").alpaca({
        "dataSource": "../api/settings/noaadata.json",
        "optionsSource": "../api/settings/noaaoptions.json",
        "schemaSource": "../api/settings/noaaschema.json",
        "ui": "bootstrap",
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

            $("#save-button").click(function () {
                if (form.isValid(true)) {
                    let json = form.getValue();

                    $.ajax({
                        type: "POST",
                        url: "../api/setsettings/updatenoaaconfig.json",
                        data: {json: JSON.stringify(json)},
                        dataType: "text"
                    })
                    .done(function () {
                        alert("Settings updated");
                    })
                    .fail(function (jqXHR, textStatus) {
                        alert("Error: " + jqXHR.status + "(" + textStatus + ") - " + jqXHR.responseText);
                    });
                }
            });
        }
    });
});

function addButtons() {
    $('#form legend').each(function () {
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
    $('#form legend').each(function () {
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
    $('#form div.alpaca-container.collapse').each(function () {
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