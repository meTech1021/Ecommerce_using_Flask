$(document).ready(function() {
    var TableEditable = function () {

        var handleTable = function () {
    
            function restoreRow(oTable, nRow) {
                var aData = oTable.fnGetData(nRow);
                var jqTds = $('>td', nRow);
    
                for (var i = 0, iLen = jqTds.length; i < iLen; i++) {
                    oTable.fnUpdate(aData[i], nRow, i, false);
                }
    
                oTable.fnDraw();
            }
    
            function editRow(oTable, nRow, cat_id) {
                var aData = oTable.fnGetData(nRow);
                var jqTds = $('>td', nRow);
                jqTds[0].innerHTML = `<form action="/admin/category/save" method="POST" id="category_form"><input type="hidden" name="cat_id" id="cat_id" value="${cat_id}"><div class="form-group"><input type="text" class="form-control input-small" id="category_name" name="category_name" value="${aData[0]}"></div></form>`;
                jqTds[1].innerHTML = '<a class="btn_edit btn btn-xs btn-success" flag="save" href="" title="Edit"><i class="fa fa-save"></i> Save</a>&nbsp;<a class="btn_cancel btn btn-xs c-btn-purple-1" href="" title="Cancel"><i class="fa fa-times"></i> Cancel</a>';
            }
    
            function saveRow(oTable, nRow, category) {
                var jqInputs = $('input', nRow);
                
                oTable.fnUpdate(jqInputs[0].value, nRow, 0, false);
                oTable.fnUpdate(`<a class="btn_edit btn btn-xs btn-primary" flag="edit" href="" title="Edit"><i class="fa fa-pencil"></i> Edit</a>&nbsp;<a class="btn_delete btn btn-xs btn-danger" href="" title="Remove"><i class="fa fa-trash"></i> Remove</a>`, nRow, 1, false);
                oTable.fnDraw();
                
            }
    
            function cancelEditRow(oTable, nRow) {
                var jqInputs = $('input', nRow);
                oTable.fnUpdate(jqInputs[0].value, nRow, 0, false);
                oTable.fnUpdate('<a class="btn_edit btn btn-xs btn-primary" flag="edit" href="" title="Edit"><i class="fa fa-pencil"></i> Edit</a>', nRow, 1, false);
                oTable.fnDraw();
            }
    
            var table = $('#category_table');
    
            var oTable = table.dataTable({
    
                // Uncomment below line("dom" parameter) to fix the dropdown overflow issue in the datatable cells. The default datatable layout
                // setup uses scrollable div(table-scrollable) with overflow:auto to enable vertical scroll(see: assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.js). 
                // So when dropdowns used the scrollable div should be removed. 
                //"dom": "<'row'<'col-md-6 col-sm-12'l><'col-md-6 col-sm-12'f>r>t<'row'<'col-md-5 col-sm-12'i><'col-md-7 col-sm-12'p>>",
    
                "lengthMenu": [
                    [5, 15, 20, -1],
                    [5, 15, 20, "All"] // change per page values here
                ],
    
                // Or you can use remote translation file
                //"language": {
                //   url: '//cdn.datatables.net/plug-ins/3cfcc339e89/i18n/Portuguese.json'
                //},
    
                // set the initial value
                "pageLength": 10,
    
                "language": {
                    "lengthMenu": " _MENU_ records"
                },
                "columnDefs": [{ // set default column settings
                    'orderable': true,
                    'targets': [0]
                }, {
                    "searchable": true,
                    "targets": [0]
                }],
                "order": [
                    [0, "asc"]
                ], // set first column as a default sort by asc
                "searching" : false
            });
    
            var tableWrapper = $("#category_table_wrapper");
    
            $('#category_table_length').hide()
    
            var nEditing = null;
            var nNew = false;
    
            $('#btn_new').click(function (e) {
                e.preventDefault();
    
                if (nNew && nEditing) {
                    if (confirm("Previose row not saved. Do you want to save it ?")) {
                        saveRow(oTable, nEditing); // save
                        $(nEditing).find("td:first").html("Untitled");
                        nEditing = null;
                        nNew = false;
    
                    } else {
                        oTable.fnDeleteRow(nEditing); // cancel
                        nEditing = null;
                        nNew = false;
                        
                        return;
                    }
                }
    
                var aiNew = oTable.fnAddData(['', '']);
                var nRow = oTable.fnGetNodes(aiNew[0]);
                editRow(oTable, nRow);
                nEditing = nRow;
                nNew = true;
            });
    
            table.on('click', '.btn_delete', function (e) {
                e.preventDefault();
                var category_id = $(this).attr('category_id');
                var nRow = $(this).parents('tr')[0];
                bootbox.dialog({
                    message: "Are you sure to remove this category?",
                    title: "Category remove",
                    buttons: {
                      danger: {
                        label: "Remove",
                        className: "btn-danger",
                        callback: function() {
                            $('#overlay').fadeIn(300);
                            $.ajax({
                                url : '/admin/category/delete',
                                method : 'post',
                                data : {
                                    category_id : category_id
                                },
                                success : function(data) {
                                    oTable.fnDeleteRow(nRow);
                                    $('#overlay').fadeOut(300);
                                },
                                error : function() {
                                    toastr['error']('Error happens on delete category!');
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
    
            table.on('click', '.btn_cancel', function (e) {
                e.preventDefault();
                if (nNew) {
                    oTable.fnDeleteRow(nEditing);
                    nEditing = null;
                    nNew = false;
                } else {
                    restoreRow(oTable, nEditing);
                    nEditing = null;
                }
            });
    
            table.on('click', '.btn_edit', function (e) {
                e.preventDefault();
    
                /* Get the row as a parent of the link that was clicked on */
                var nRow = $(this).parents('tr')[0];
    
                if (nEditing !== null && nEditing != nRow) {
                    console.log('ddd')
                    /* Currently editing - but not this row - restore the old before continuing to edit mode */
                    restoreRow(oTable, nEditing);
                    editRow(oTable, nRow, );
                    nEditing = nRow;
                } else if (nEditing == nRow && $(this).attr('flag') == "save") {
                    /* Editing this row and want to save it */
                    if($('#category_name').val() === '') {
                        toastr['warning']('Please enter category name!');
                        $('#category_name').closest('.form-group').addClass('has-error'); 
                    } else {
                        $('#overlay').fadeIn(300);
                        $('#category_form').submit();
                    }
                } else {
                    /* No edit in progress - let's start one */
                    console.log($(this).attr('category_id'))
                    editRow(oTable, nRow, $(this).attr('category_id'));
                    nEditing = nRow;
                }
            });

            
        }
    
        return {
    
            //main function to initiate the module
            init: function () {
                handleTable();
            }
    
        };
    
    }();

    TableEditable.init();
})