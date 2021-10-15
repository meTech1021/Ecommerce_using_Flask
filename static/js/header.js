$(document).ready(function() {

    var ctable = $('#cart_table');

    /* Fixed header extension: http://datatables.net/extensions/keytable/ */

    var cTable = ctable.dataTable({
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
    $('#cart_table_length').hide()

    var otable = $('#order_table');

    /* Fixed header extension: http://datatables.net/extensions/keytable/ */

    var OTable = otable.dataTable({
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
    $('#order_table_length').hide()

    var nRow;
    var product_id, stock, product_name, price, category, carts, social_is_require = '';

    var oTableColReorder = new $.fn.dataTable.ColReorder( cTable );

    $('#btn_view_cart').click(function() {
        console.log('ddddd')
        $.ajax({
            url : '/my_cart',
            method : 'get',
            success : function(data) {
                cTable.fnClearTable()
                carts = data.my_cart;
                var i = 0;
                var total_amount = 0;
                carts.forEach(item => {
                    var action = `<button type="button" class="btn btn-xs btn-danger btn_cancel" cart_id="${i}"><i class="fa fa-trash"></i></button>`;
                    cTable.fnAddData([`<b>${item.product_name}</b>`, item.category, `<label class="text-primary">${item.price}</label> <i class="fa fa-euro text-danger"></i>`, item.amount, action]);
                    i++;
                    total_amount += Number(item.price) * Number(item.amount);
                });
                $('#my_total_price').text(total_amount)
                $('#MyCartModal').modal('show');
            },
            error : function() {
                toastr['error']('Error happens on get your shopping cart.');
            }
        });
    });

    ctable.on('click', '.btn_cancel', function() {
        nRow = $(this).parents('tr')[0];
        var cart_id = $(this).attr('cart_id');
        
        $.ajax({
            url : '/cart_cancel',
            method : 'post',
            data : {
                cart_id : cart_id
            },
            success : function(data) {
                cart_price = data.cart_price;
                total_price = Number($('#my_total_price').text());
                total_price = total_price - cart_price;
                cart_cnt = Number($('#cart_cnt').text());
                cart_cnt = cart_cnt - 1;
                console.log(cart_cnt)
                $('.cart_cnt').text(cart_cnt);
                $('#my_total_price').text(total_price);
                carts.splice(cart_id, 1);
                cTable.fnDeleteRow(nRow);
            },
            error : function() {
                toastr['error']('Error happens on cancel product.')
            }
        })
    });

    $('#purchase_footer').hide();
    $('#purchase_content').hide();
    $('#social_div').hide();

    $('#btn_purchase').click(function() {
        is_ban = false;
        carts.forEach(item => {
            if(item.category === 'Antibiotics' || item.category === 'Analgesics' || item.category === 'Antiseptics') {
                is_ban = true;
                social_is_require = 'required';
                return;
            }
        });

        $('#cart_footer').hide(500);
        $('#purchase_footer').show(500);
        $('#purchase_content').show(500);
        if(is_ban == true) {
            $('#social_div').show(500);
        } else {
            $('#social_div').hide();
        }
    });

    $('#btn_cancel').click(function() {
        $('#purchase_footer').hide(500);
        $('#purchase_content').hide(500);
        $('#cart_footer').show(500);
    });

    var purchase_form = $('#purchase_form');
    purchase_form.validate({
        errorElement: 'span', //default input error message container
        errorClass: 'help-block help-block-error', // default input error message class
        focusInvalid: false, // do not focus the last invalid input
        ignore: "",  // validate all fields including form hidden input
        // Specify validation rules
        rules: {
          // The key name on the left side is the name attribute
          // of an input field. Validation rules are defined
          // on the right side
          card_number: "required",
        },

        highlight: function (element) { // hightlight error inputs
            $(element)
                .closest('.form-group').addClass('has-error'); // set error class to the control group
        },

        unhighlight: function (element) { // revert the change done by hightlight
            $(element)
                .closest('.form-group').removeClass('has-error'); // set error class to the control group
        },

        success: function (label) {
            label
                .closest('.form-group').removeClass('has-error'); // set success class to the control group
        },
        // Make sure the form is submitted to the destination defined
        // in the "action" attribute of the form when valid
        submitHandler: function(form) {
          form.submit();
        }
    });

    $('#btn_pay').click(function() {
        if(purchase_form.valid()) {
            $.ajax({
                url : '/buy',
                method : 'post',
                success : function(data) {
                    var i = 0;
                    var total_amount = 0;
                    carts.forEach(item => {
                        
                        OTable.fnAddData([`<b>${item.product_name}</b>`, item.category, `<label class="text-primary">${item.price}</label> <i class="fa fa-euro text-danger"></i>`, item.amount]);
                        i++;
                        total_amount += Number(item.price) * Number(item.amount);
                    });
                    $('#my_order_price').text(total_amount)
                    $('#MyCartModal').modal('hide');
                    $('#purchase_footer').hide(500);
                    $('#purchase_content').hide(500);
                    $('#cart_footer').show(500);
                    $('#ProofModal').modal('show');
                    toastr['success']('Your cart is successfully buyed.');
                },
                error : function() {
                    toastr['error']('Error happens on buy.');
                }
            })
        }
    });
})