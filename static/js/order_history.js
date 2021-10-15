$(document).ready(function() {
    var htable = $('#history_table');

    /* Fixed header extension: http://datatables.net/extensions/keytable/ */

    var hTable = htable.dataTable({
        // Internationalisation. For more info refer to http://datatables.net/manual/i18n
        "language": {
            "aria": {
                "sortAscending": ": activate to sort column ascending",
                "sortDescending": ": activate to sort column descending"
            },
            "emptyTable": "No data available in table",
            "info": "Showing _START_ to _END_ of _TOTAL_ entries",
            "infoEmpty": "No entries found",
            "infoFiltered": "(filtered1 from _MAX_ total entries)",
            "lengthMenu": "Show _MENU_ entries",
            "search": "Search:",
            "zeroRecords": "No matching records found"
        },
        "lengthMenu": [
            [5, 15, 20, -1],
            [5, 15, 20, "All"] // change per page values here
        ],
        "pageLength": -1, // set the initial value,

        "order": [
            [0, "asc"]
        ], "paging" : false, 'searching' : false, info : false
    });
    $('#history_table_length').hide();

    var dtable = $('#detail_table');

    /* Fixed header extension: http://datatables.net/extensions/keytable/ */

    var dTable = dtable.dataTable({
        // Internationalisation. For more info refer to http://datatables.net/manual/i18n
        "language": {
            "aria": {
                "sortAscending": ": activate to sort column ascending",
                "sortDescending": ": activate to sort column descending"
            },
            "emptyTable": "No data available in table",
            "info": "Showing _START_ to _END_ of _TOTAL_ entries",
            "infoEmpty": "No entries found",
            "infoFiltered": "(filtered1 from _MAX_ total entries)",
            "lengthMenu": "Show _MENU_ entries",
            "search": "Search:",
            "zeroRecords": "No matching records found"
        },
        "lengthMenu": [
            [5, 15, 20, -1],
            [5, 15, 20, "All"] // change per page values here
        ],
        "pageLength": -1, // set the initial value,

        "order": [
            [0, "asc"]
        ], "paging" : false, 'searching' : false, info : false
    });
    $('#detail_table_length').hide();

    htable.on('click', '.btn_view', function() {
        var order_id = $(this).attr('order_id');
        var date = $(this).attr('date');
        $.ajax({
            url : '/order_detail',
            method : 'get',
            data : {
                order_id : order_id
            },
            success : function(data) {
                var total_amount = 0;
                var order = data.order;
                dTable.fnClearTable();
                order.forEach(item => {
                    dTable.fnAddData([`<b>${item.product_name}</b>`, item.category, `<label class="text-primary">${item.price}</label> <i class="fa fa-euro text-danger"></i>`, item.amount]);
                    
                    total_amount += Number(item.price) * Number(item.amount);
                });
                $('#date').text(date);
                $('#history_order_price').text(total_amount);
                $('#OrderModal').modal('show');
            }
        })
    })
})