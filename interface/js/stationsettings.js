// Last modified: 2021/05/08 17:46:45

let StashedStationId;
let accessMode;

$(document).ready(function () {
    //let layout1 = '<table class="table table-hover"><tr><td id="left"></td><td id="right"></td></tr></table>';
    $("#form").alpaca({
        "dataSource": "./api/settings/stationdata.json",
        "optionsSource": "./api/settings/stationoptions.json",
        "schemaSource": "./api/settings/stationschema.json",
        "ui": "bootstrap",
        "view": "bootstrap-edit-horizontal",
        "postRender": function (form) {
            // Change in accessibility is enabled
            let accessObj = form.childrenByPropertyId["accessible"];
            onAccessChange(null, accessObj.getValue());
            accessMode = accessObj.getValue();

            if (!accessMode) {
                setCollapsed();  // sets the class and aria attribute missing on first load by Alpaca
            }

            // Trigger changes is the accessibility mode is changed
            accessObj.on("change", function() {onAccessChange(this)});

            let stationIdObj = form.childrenByPropertyId["general"].childrenByPropertyId["stationtype"];

            // On changing the station type, propogate down to sub-sections
            stationIdObj.on("change", function () {
                let form = $("#form").alpaca("get");
                let stationid = this.getValue();
                form.childrenByPropertyId["stationid"].setValue(stationid);
                form.childrenByPropertyId["Options"].childrenByPropertyId["stationid"].setValue(stationid);
                form.childrenByPropertyId["general"].childrenByPropertyId["stationmodel"].setValue(this.getOptionLabels()[1 * stationid + 1]);
            });

            // On changing the Davis VP connection type, propogate down to advanced settings
            form.childrenByPropertyId["davisvp2"].childrenByPropertyId["davisconn"].childrenByPropertyId["conntype"].on("change", function () {
                let form = $("#form").alpaca("get");
                let conntype = this.getValue();
                form.childrenByPropertyId["davisvp2"].childrenByPropertyId["advanced"].childrenByPropertyId["conntype"].setValue(conntype);
                form.childrenByPropertyId["davisvp2"].childrenByPropertyId["advanced"].childrenByPropertyId["conntype"].refresh();
            });

            // Set the initial value of the sub-section  station ids
            let stationid = form.childrenByPropertyId["stationid"].getValue();
            form.childrenByPropertyId["Options"].childrenByPropertyId["stationid"].setValue(stationid);
            // Keep a record of the last value
            StashedStationId = stationid;

            // Set the inital value of Davis advanced conntype
            let conntype = form.childrenByPropertyId["davisvp2"].childrenByPropertyId["davisconn"].childrenByPropertyId["conntype"].getValue();
            form.childrenByPropertyId["davisvp2"].childrenByPropertyId["advanced"].childrenByPropertyId["conntype"].setValue(+conntype);

            $("#save-button").click(function () {
                if (form.isValid(true)) {
                    let stationIdObj = form.childrenByPropertyId["general"].childrenByPropertyId["stationtype"];
                    let stationId = stationIdObj.getValue();

                    if (stationId == -1) {
                        alert("You have not selected a station type");
                        return;
                    }
                    if (stationId != StashedStationId) {
                        alert("You have changed the Station type, you must restart Cumulus MX");
                        StashedStationId = stationId;
                    }

                    let json = form.getValue();

                    $.ajax({
                        type: "POST",
                        url: "../api/setsettings/updatestationconfig.json",
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
                    alert("Invalid value somewhere on the form!");
                    this.focus();
                    return;
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