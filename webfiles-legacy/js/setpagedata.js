// Created: 2021/02/09 10:51:54
// Last modified: 2021/03/04 15:28:18

var cmx_data;

$.getJSON("websitedata.json", function (json) {
    console.log( "Data success" );
    cmx_data = json;

    $(document).prop('title', cmx_data['location'] + ' weather');
    $('meta[name=description]').attr('content', cmx_data['location'] + ' weather data');
    $('meta[name=keywords]').attr('content', $('meta[name=keywords]').attr('content') + ', ' + cmx_data['location'] + ' weather data');

    // Update all spans with id beginning "cmx-"
    $('span[id^=cmx-]').each(function () {
        this.innerHTML = cmx_data[this.id.split('-')[1]];
    });
    // Update all spans with class beginning "cmx-"
    $('span[class^=cmx-]').each(function () {
        this.innerHTML = cmx_data[this.className.split('-')[1]];
    });

    // Use this to trigger other scripts on the page
    $('#cmx-location').trigger("change")
})
.fail(function (jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log( "Data Request Failed: " + err );
});
