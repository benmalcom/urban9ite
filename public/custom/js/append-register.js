/**
 * Created by Malcom on 11/4/2016.
 */

$(function () {
    var mobileField = $('input[name="mobile"]');
    mobileField.intlTelInput({
        // allowDropdown: false,
        // autoHideDialCode: false,
        // autoPlaceholder: "off",
        // dropdownContainer: "body",
        // excludeCountries: ["us"],
         geoIpLookup: function(callback) {
           $.get("http://ipinfo.io", function() {}, "jsonp").always(function(resp) {
             var countryCode = (resp && resp.country) ? resp.country : "";
             callback(countryCode);
           });
         },
         initialCountry: "auto",
        // nationalMode: false,
        // numberType: "MOBILE",
        // onlyCountries: ['us', 'gb', 'ch', 'ca', 'do'],
        // preferredCountries: ['cn', 'jp'],
        // separateDialCode: true,
        utilsScript: "/custom/bower_components/intl-tel-input/build/js/utils.js"
    });
    $('.user-type').change(function (e) {
            var accessCode =  $('.access-code');
            if($(this).val().length && $('.user-types:selected').text().toLowerCase() !="administrator")
                accessCode.removeClass('hidden').show();
            else
                accessCode.addClass('hidden').hide();
    });
    
    $('#reg-form').submit(function () {
        $('#register-submit-btn').addClass('disabled');
        mobileField.val(mobileField.intlTelInput("getNumber"));
    });
}());
