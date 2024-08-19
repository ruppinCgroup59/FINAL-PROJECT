$(document).ready(function () {
    var userType = localStorage.getItem('userType');

    // If user is not logged in, redirect to login page
    if (!userType) {
        window.location.href = "login.html";
        return;
    }


    var fromInput = document.getElementById('from');
    var toInput = document.getElementById('to');

    $('#serviceRequestForm').on('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting the default way
        ServiceRequest();
    });
});




// Define a function to initialize Autocomplete after the Google Maps API is loaded
function initializeAutocomplete() {
    var fromInput = document.getElementById('from');
    var toInput = document.getElementById('to');
    var autocompleteFrom = new google.maps.places.Autocomplete(fromInput);
    var autocompleteTo = new google.maps.places.Autocomplete(toInput);
}

// Function to handle Google Maps API loading errors
function handleApiError(error) {
    console.error('Google Maps API failed to load:', error);
}





// פתיחת שירות
function ServiceRequest() {
    if (validate()) {
        let u = {
            "service_Id": 0,
            "customer_Name": "To be defined from database",
            "supplier_Name": "To be defined from database",
            "customer_Id": localStorage.getItem('customerId'),
            "supplier_Id": localStorage.getItem('supplierId'),
            "service_Name": $("#serviceType").val(),
            "from": $("#from").val(),
            "to": $("#to").val(),
            "description": $("#description").val(),
            "price": 0,
            "confirmed": 0,
            "date": localStorage.getItem('date'),
            "isActive": false
        }
        api = server + "/api/Services";
        ajaxCall("POST", api, JSON.stringify(u), postSCB, postECB);
    }
    return false;
}


function validate() { 
    return true;
}


function postECB(xhr) {
    var response = JSON.parse(xhr.responseText);
    showAlert(response.message);
}


function postSCB(res) {
    window.location.href = "SupplierProfileByCustomer.html";
}





