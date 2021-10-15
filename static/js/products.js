$(document).ready(function() {
    var table = $('#product_table');

    /* Fixed header extension: http://datatables.net/extensions/keytable/ */

    var oTable = table.dataTable({
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
        "pageLength": 10, // set the initial value,

        "order": [
            [0, "asc"]
        ], "paging" : true, 'searching' : false
    });
    $('#product_table_length').hide()

    var nRow;
    var product_id;

    var oTableColReorder = new $.fn.dataTable.ColReorder( oTable );

    $('#btn_new').click(function() {
        form_reset();
        $('#NewModal').modal('show');
    });

    var product_form = $('#product_form');
    product_form.validate({
        errorElement: 'span', //default input error message container
        errorClass: 'help-block help-block-error', // default input error message class
        focusInvalid: false, // do not focus the last invalid input
        ignore: "",  // validate all fields including form hidden input
        // Specify validation rules
        rules: {
          // The key name on the left side is the name attribute
          // of an input field. Validation rules are defined
          // on the right side
          product_name: "required",
          category: "required",
          price : 'required',
          stock : 'required',
          description : 'required'
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
    
    var form_reset = function() {
        $('#product_name').val('');
        $('#category').val('');
        $('#stock').val('');
        $('#price').val('');
        $('#description').val('');
    }

    $('#btn_save').click(function() {
        if(product_form.valid()) {
            $('#NewModal').modal('hide');
            $('#overlay').fadeIn(300);
            product_form.submit();
        }
    });

    table.on('click', '.btn_edit', function() {
        product_id = $(this).attr('product_id');
        nRow = $(this).parents('tr')[0];
        $('#product_id').val(product_id);
        $.ajax({
            url : '/admin/product/get',
            method : 'post',
            data : {
                product_id : product_id
            },
            success : function(data) {
                var product = data.product;
                console.log(product)
                $('#product_name').val(product.name);
                $('#category').val(product.category);
                $('#stock').val(product.stock);
                $('#price').val(product.price);
                $('#description').val(product.description);
                $('#NewModal').modal('show');
            },
            error : function() {
                toastr['error']('Error happens on getting product!');
            }
        });
    });

    table.on('click', '.btn_delete', function (e) {
        e.preventDefault();
        product_id = $(this).attr('product_id');
        var nRow = $(this).parents('tr')[0];
        bootbox.dialog({
            message: "Are you sure to remove this product?",
            title: "Product remove",
            buttons: {
              danger: {
                label: "Remove",
                className: "btn-danger",
                callback: function() {
                    $('#overlay').fadeIn(300);
                    $.ajax({
                        url : '/admin/product/delete',
                        method : 'post',
                        data : {
                            product_id : product_id
                        },
                        success : function(data) {
                            oTable.fnDeleteRow(nRow);
                            $('#overlay').fadeOut(300);
                        },
                        error : function() {
                            toastr['error']('Error happens on delete product!');
                        }
                    });
                }
              },
              main: {
                label: "Cancel",
                className: "btn-default",
                callback: function() {

                }
              }
            }
        });
    });


})