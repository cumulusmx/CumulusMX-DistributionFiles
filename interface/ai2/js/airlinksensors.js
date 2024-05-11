// Last modified: 2021/05/16 20:53:09

$(document).ready(function () {
/*
    $.ajax({url: "/api/settings/version.json", dataType:"json", success: function (result) {
        $('#Version').text(result.Version);
        $('#Build').text(result.Build);
    }});
*/
    var countsOutTable = $('#CountsOutTable').DataTable({
        "paging": false,
        "searching": false,
        "info": false,
        "ordering": false,
        "columnDefs": [
            {"className": "left", "targets": [0]},
            {"className": "w3-right-align", "targets": [1,2,3,4,5]}
        ],
        "ajax": '/api/extra/airLinkCountsOut.json'
    });

    var aqiOutTable = $('#AqiOutTable').DataTable({
        "paging": false,
        "searching": false,
        "info": false,
        "ordering": false,
        "columnDefs": [
            {"className": "left", "targets": [0]},
            {"className": "w3-right-align", "targets": [1,2,3,4,5]}
        ],
        "ajax": '/api/extra/airLinkAqiOut.json'
    });

    var pctOutTable = $('#PctOutTable').DataTable({
        "paging": false,
        "searching": false,
        "info": false,
        "ordering": false,
        "columnDefs": [
            {"className": "left", "targets": [0]},
            {"className": "w3-right-align", "targets": [1,2,3,4,5]}
        ],
        "ajax": '/api/extra/airLinkPctOut.json'
    });

    var countsInTable = $('#CountsInTable').DataTable({
        "paging": false,
        "searching": false,
        "info": false,
        "ordering": false,
        "columnDefs": [
            {"className": "left", "targets": [0]},
            {"className": "w3-right-align", "targets": [1,2,3,4,5]}
        ],
        "ajax": '/api/extra/airLinkCountsIn.json'
    });

    var aqiInTable = $('#AqiInTable').DataTable({
        "paging": false,
        "searching": false,
        "info": false,
        "ordering": false,
        "columnDefs": [
            {"className": "left", "targets": [0]},
            {"className": "w3-right-align", "targets": [1,2,3,4,5]}
        ],
        "ajax": '/api/extra/airLinkAqiIn.json'
    });

    var pctInTable = $('#PctInTable').DataTable({
        "paging": false,
        "searching": false,
        "info": false,
        "ordering": false,
        "columnDefs": [
            {"className": "left", "targets": [0]},
            {"className": "w3-right-align", "targets": [1,2,3,4,5]}
        ],
        "ajax": '/api/extra/airLinkPctIn.json'
    });


    setInterval(function () {
        countsOutTable.ajax.url('/api/extra/airLinkCountsOut.json').load();
        aqiOutTable.ajax.url('/api/extra/airLinkAqiOut.json').load();
        pctOutTable.ajax.url('/api/extra/airLinkPctOut.json').load();
        countsInTable.ajax.url('/api/extra/airLinkCountsIn.json').load();
        aqiInTable.ajax.url('/api/extra/airLinkAqiIn.json').load();
        pctInTable.ajax.url('/api/extra/airLinkPctIn.json').load();
    }, 10000);

});
