$(document).ready(function() {
    var login_form = $('#login_form');
    login_form.validate({
        errorElement: 'span', //default input error message container
        errorClass: 'help-block help-block-error', // default input error message class
        focusInvalid: false, // do not focus the last invalid input
        ignore: "",  // validate all fields including form hidden input
        // Specify validation rules
        rules: {
          // The key name on the left side is the name attribute
          // of an input field. Validation rules are defined
          // on the right side
          name: "required",
          password: "required",
        },
        // Specify validation error messages
        messages: {
          name: "Please enter your Username",
          password : "Please enter your password"
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

    var register_form = $('#register_form');
    register_form.validate({
        errorElement: 'span', //default input error message container
        errorClass: 'help-block help-block-error', // default input error message class
        focusInvalid: false, // do not focus the last invalid input
        ignore: "",  // validate all fields including form hidden input
        // Specify validation rules
        rules: {
            // The key name on the left side is the name attribute
            // of an input field. Validation rules are defined
            // on the right side
            r_email: {
                required: true,
                email: true
            },
            r_name: {
                required: true
            },
            r_password: {
                required: true
            },
            confirm_password: {
                required : true,
                equalTo: "#r_password"
            },
            ssn : {
                required : true
            }
        },
        // Specify validation error messages
        messages: {
            r_name: "Please enter your Username",
            r_email: "Please enter your Email",
            r_password : "Please enter your password",
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
    var is_ssn = false;

    $('#ssn').keyup(function(){
        var ssn = $(this).val();
        var hh = Number(ssn[0]+''+ssn[1]);
        var mm = Number(ssn[2]+''+ssn[3]);
        if(hh > 31) {
            $(this).closest('.form-group').addClass('has-error');
            $('#ssn_span').removeClass('hidden');
            $('#ssn_span').text('HH must be less more than 31.');
        } else if(mm > 12) {
            $(this).closest('.form-group').addClass('has-error');
            $('#ssn_span').removeClass('hidden');
            $('#ssn_span').text('MM must be less more than 12.');
        } else if(ssn.length < 11 ){
            $(this).closest('.form-group').addClass('has-error');
            $('#ssn_span').removeClass('hidden');
            $('#ssn_span').text('SSN must include more than 11 numbers.');
        } else {
            $(this).closest('.form-group').removeClass('has-error');
            $('#ssn_span').addClass('hidden');
            is_ssn = true;
        }
    });

    $('#btn_register').click(function() {
        console.log('click')
        if(register_form.valid() && is_ssn){
            register_form.submit();
        }
    });

    $('#btn_login').click(function() {
        if(login_form.valid()) {
            login_form.submit();
        }
    });
});