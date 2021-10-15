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
        "pageLength": 20, // set the initial value,

        "order": [
            [0, "asc"]
        ], "paging" : true, 'searching' : false
    });
    $('#product_table_length').hide()

    var nRow;
    var product_id, stock, product_name, price, category;

    var oTableColReorder = new $.fn.dataTable.ColReorder( oTable );

    var get_products = function(category, product_name, from_price, to_price, words) {
        $.ajax({
            url : '/shop/get_product',
            method : 'post',
            success : function(data) {
                products = data.products;
                if(from_price == '') {
                    from_price = 0;
                } 
                if(to_price == '') {
                    to_price = 10000;
                }
                if(products.lenth == 0) {

                } else {
                    oTable.fnClearTable()
                    var i = 0;
                    products.forEach(product => {
                        if(product.category.toLowerCase().match(category.toLowerCase()+'.*') && product.name.toLowerCase().match(product_name.toLowerCase()+'.*') && product.description.toLowerCase().match(words.toLowerCase()+'.*') && Number(product.price) >= Number(from_price) && Number(product.price) <= Number(to_price)) {
                            i++;
                            console.log(i)
                            var action = `<button type="button" class="btn btn-xs btn-success btn_cart" title="Add Cart" category="${product.category}" price="${product.price}" stock="${product.stock}" product_name="${product.name}" product_id="${product.id}"><i class="fa fa-shopping-cart"></i> Add Cart</button>`
                            oTable.fnAddData([`<b>${product.name}</b>`, product.category, product.description, `<label class="text-primary">${product.price}</label> <i class="fa fa-euro text-danger"></i>`, action]);
                        }
                    });
                }
                
                $('#overlay').fadeOut(300);
            },
            error : function() {
                toastr['error']('Error happens on filter products!');
            }
        });
    }

    $('#category').change(function() {
        $('#overlay').fadeIn(300);
        var category = $(this).val();
        var product_name = $('#product_name').val();
        var from_price = $('#price_from').val();
        var to_price = $('#price_to').val();
        var words = $('#description').val();
        get_products(category, product_name, from_price, to_price, words);
    });

    $('#product_name').keyup(function() {
        $('#overlay').fadeIn(300);
        var category = $('#category').val();
        var product_name = $(this).val();
        var from_price = $('#price_from').val();
        var to_price = $('#price_to').val();
        var words = $('#description').val();
        get_products(category, product_name, from_price, to_price, words);
    });
    $('#price_from').keyup(function() {
        $('#overlay').fadeIn(300);
        var category = $('#category').val();
        var product_name = $('#product_name').val();
        var from_price = $(this).val();
        var to_price = $('#price_to').val();
        var words = $('#description').val();
        get_products(category, product_name, from_price, to_price, words);
    });
    $('#price_to').keyup(function() {
        $('#overlay').fadeIn(300);
        var category = $('#category').val();
        var product_name = $('#product_name').val();
        var from_price = $('#price_from').val();
        var to_price = $(this).val();
        var words = $('#description').val();
        get_products(category, product_name, from_price, to_price, words);
    });
    $('#description').keyup(function() {
        $('#overlay').fadeIn(300);
        var category = $('#category').val();
        var product_name = $('#product_name').val();
        var from_price = $('#price_from').val();
        var to_price = $('#price_to').val();
        var words = $(this).val();
        get_products(category, product_name, from_price, to_price, words);
    });

    $('.btn_cart').click(function() {
        product_id = $(this).attr('product_id');
        console.log(product_id)
    });

    table.on('click', '.btn_cart', function() {
        $('#stock').val(1)
        product_id = $(this).attr('product_id');
        stock = $(this).attr('stock');
        price = $(this).attr('price');
        product_name = $(this).attr('product_name');
        category = $(this).attr('category');
        $('#product_title').text(product_name);
        $('#price').text(price);
        $('#CartModal').modal('show');
    });

    $('#stock').keyup(function(e) {
        console.log($(this).val())
        if(Number($('#stock').val()) >= Number(stock)) {
            toastr['warning'](`${product_name}'s stock is ${stock}.`);
            $('#btn_up').attr('disabled', 'disabled');
        } else {
            $('#btn_up').removeAttr('disabled', 'disabled');
        }
    });

    $('.btn_control').click(function() {
        console.log($('#stock').val())
        if(Number($('#stock').val()) >= Number(stock)) {
            toastr['warning'](`${product_name}'s stock is ${stock}.`);
            $('#btn_up').attr('disabled', 'disabled');
        } else {
            $('#btn_up').removeAttr('disabled', 'disabled');
        }
    });

    $('#btn_save').click(function() {
        $.ajax({
            url : '/add_cart',
            method : 'post',
            data : {
                product_id : product_id,
                product_name : product_name,
                price : price,
                category : category,
                amount : $('#stock').val()
            },
            success : function(data) {
                toastr['success']('This product is successfully added to your cart.', 'Congratulations.');
                var my_cart = data.shopping_cart;
                var cart_cnt = my_cart.length;
                var total_price = 0;
                my_cart.forEach(item => {
                    total_price += item.price * item.amount;
                });
                $('.cart_cnt').text(cart_cnt)
                $('#total_price').text(total_price)
                $('#my_total_price').text(total_price)
                $('#CartModal').modal('hide');
            },
            error : function() {
                toastr['error']('Error happens on add to cart.');
            }
        })
    });

    
});