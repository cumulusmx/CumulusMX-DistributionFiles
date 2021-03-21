// Last modified: 2021/03/19 09:15:55


$.getJSON("websitedata.json", function (json) {
    console.log( "success" );
    var cmx_data = json;

    $(document).prop('title', cmx_data['cmx-location'] + ' weather');
    $('meta[name=description]').attr('content', cmx_data['cmx-location'] + ' weather data');
    $('meta[name=keywords]').attr('content', $('meta[name=keywords]').attr('content') + ', ' + cmx_data['cmx-location'] + ' weather data');

    $.getJSON("alltimerecdata.json", function (json) {
        console.log( "success" );
        Object.keys(json).forEach(key => {
            cmx_data[key] = json[key];
        });

        // Update all spans with id beginning "cmx-"
        $('span[id^=cmx-]').each(function () {
            this.innerHTML = cmx_data[this.id];
        });
        // Update all spans with class beginning "cmx-"
        $('span[class^=cmx-]').each(function () {
            this.innerHTML = cmx_data[this.className];
        });
    })
    .fail(function (jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        console.log("Request Failed: " + err);
    });


})
.fail(function (jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
});

$(document).ready(function() {
});