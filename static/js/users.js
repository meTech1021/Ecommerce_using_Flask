$(document).ready(function() {
    var table = $('#user_table');

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
            [3, "asc"]
        ], "paging" : true, 'searching' : false
    });
    $('#user_table_length').hide()

    var nRow;
    var user_id;
    var oTableColReorder = new $.fn.dataTable.ColReorder( oTable );

    var change_permission = function(user_id, state, nRow) {
        $('#overlay').fadeIn(300);
        $.ajax({
            url : '/admin/user/change_permission',
            method : 'post',
            data : {
                user_id : user_id,
                state : state
            },
            success : function(data) {
                toastr['success']('User permisssion is successfully changed!');
                if(state === 'user') {
                    role = `<span class="label label-primary c-font-slim c-font-uppercase c-font-bold">${state}</span>`;
                    change_button = `<button class="btn btn-xs btn-info user_to_admin" type="button" user_id="${user_id}">User <i class="fa fa-angle-double-right"></i> Admin</button>&nbsp;<button type="button" class="btn btn-xs btn-danger btn_delete" title="Remove" user_id="${user_id}"><i class="fa fa-trash"></i> Remove</button>`;
                } else {
                    role = `<span class="label label-success c-font-slim c-font-uppercase c-font-bold">${state}</span>`;
                    change_button = `<button class="btn btn-xs c-btn-purple-1 admin_to_user" type="button" user_id="${user_id}">Admin <i class="fa fa-angle-double-right"></i> User</button>&nbsp;<button type="button" class="btn btn-xs btn-danger btn_delete" title="Remove" user_id="${user_id}"><i class="fa fa-trash"></i> Remove</button>`;
                }
                oTable.fnUpdate(role, nRow, 3, false);
                oTable.fnUpdate(change_button, nRow, 4, false);
                $('#overlay').fadeOut(300);
            },
            error : function() {
                toastr['error']('Error happens on change user permission!');
            }
        })
    }

    table.on('click', '.admin_to_user', function() {
        user_id = $(this).attr('user_id');
        nRow = $(this).parents('tr')[0];
        change_permission(user_id, 'user', nRow);
    });

    table.on('click', '.user_to_admin', function() {
        user_id = $(this).attr('user_id');
        nRow = $(this).parents('tr')[0];
        change_permission(user_id, 'administrator', nRow);
    });

    table.on('click', '.btn_delete', function (e) {
        e.preventDefault();
        user_id = $(this).attr('user_id');
        var nRow = $(this).parents('tr')[0];
        bootbox.dialog({
            message: "Are you sure to remove this user?",
            title: "User remove",
            buttons: {
              danger: {
                label: "Remove",
                className: "btn-danger",
                callback: function() {
                    $('#overlay').fadeIn(300);
                    $.ajax({
                        url : '/admin/user/delete',
                        method : 'post',
                        data : {
                            user_id : user_id
                        },
                        success : function(data) {
                            oTable.fnDeleteRow(nRow);
                            $('#overlay').fadeOut(300);
                        },
                        error : function() {
                            toastr['error']('Error happens on delete user!');
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