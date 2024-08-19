$(document).ready(function () {
    $("#RegisterBTN").click(registerCustomer);
})




// רישום לקוח למערכת
function registerCustomer() {
    if (validateUserForm()) {
        let u = {
            "id": $("#id").val(),
            "username": $("#userName").val(),
            "password": $("#password").val(),
            "first_name": $("#firstName").val(),
            "last_name": $("#lastName").val(),
            "email": $("#email").val(),
            "phone_number": $("#phoneNumber").val(),
            "address": $("#address").val(),
            "registration_Date": "2000-01-01T00:00:00.892Z",
            "status": ""
        }
        api = server + "/api/Customers/register";
        ajaxCall("POST", api, JSON.stringify(u), postSCB, postECB);
    }
    return false;
}


function postECB(xhr) {
    var response = JSON.parse(xhr.responseText);
    showAlert(response.message);
}


function postSCB(res) {
    window.location.href = "Login.html"
}





// וולידציה של הנתונים
function validateUserForm() {
    const confirmPassword = $("#confirmPassword").val();
    const password = $("#password").val();
    const idInput = $("#id")[0];
    const emailInput = $("#email")[0];
    const phoneInput = $("#phoneNumber")[0];
    const usernameInput = $("#userName").val();


    // בדיקת שם משתמש
    if (!usernameInput || usernameInput.trim() === "") {
        showAlert("בחר שם משתמש");
        return false;
    }



    // בדיקת אימות סיסמא
    if (password !== confirmPassword) {
        showAlert("אישור הסיסמא אינו תקין");
        return false;
    }


    // בדיקת סיסמא
    if (password === "") {
        showAlert("בחר סיסמא");
        return false;
    }


    // בדיקת תעודת זהות
    if (!idInput.checkValidity()) {
        showAlert("מספר הזהות אינו תקין");
        return false;
    }

    // בדיקת מייל
    if (!emailInput.checkValidity()) {
        showAlert("כתובת המייל אינה תקינה");
        return false;
    }

    // בדיקת מספר טלפון
    if (!phoneInput.checkValidity()) {
        showAlert("מספר הטלפון אינו תקין");
        return false;
    }

    return true;
}

// Define a function to initialize Autocomplete after the Google Maps API is loaded
function initializeAutocomplete() {
    var addressInput = document.getElementById('address');
    var autocompleteInput = new google.maps.places.Autocomplete(addressInput);

}

// Function to handle Google Maps API loading errors
function handleApiError(error) {
    console.error('Google Maps API failed to load:', error);
}

//וולידציה של המייל , מספר זהות , ומספר טלפון
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');

    const idInput = document.getElementById('id');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phoneNumber');

    const idFeedback = document.getElementById('id-feedback');
    const emailFeedback = document.getElementById('email-feedback');
    const phoneFeedback = document.getElementById('phone-feedback');

    idInput.addEventListener('input', () => {
        if (!idInput.checkValidity()) {
            idFeedback.style.display = 'block';
        } else {
            idFeedback.style.display = 'none';
        }
    });

    emailInput.addEventListener('input', () => {
        if (!emailInput.checkValidity()) {
            emailFeedback.style.display = 'block';
        } else {
            emailFeedback.style.display = 'none';
        }
    });

    phoneInput.addEventListener('input', () => {
        if (!phoneInput.checkValidity()) {
            phoneFeedback.style.display = 'block';
        } else {
            phoneFeedback.style.display = 'none';
        }
    });

    idInput.addEventListener('blur', () => {
        if (!idInput.checkValidity()) {
            idFeedback.style.display = 'block';
        } else {
            idFeedback.style.display = 'none';
        }
    });

    emailInput.addEventListener('blur', () => {
        if (!emailInput.checkValidity()) {
            emailFeedback.style.display = 'block';
        } else {
            emailFeedback.style.display = 'none';
        }
    });

    phoneInput.addEventListener('blur', () => {
        if (!phoneInput.checkValidity()) {
            phoneFeedback.style.display = 'block';
        } else {
            phoneFeedback.style.display = 'none';
        }
    });

    form.addEventListener('submit', (event) => {
        if (!form.checkValidity()) {
            event.preventDefault(); // Prevent form submission if invalid
        }
    });
});


