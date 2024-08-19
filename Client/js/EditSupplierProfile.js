$(document).ready(function () {
    const userType = localStorage.getItem('userType');

    // If user is not logged in, redirect to login page
    if (!userType) {
        window.location.href = "login.html";
        return;
    }

    username = localStorage.getItem('SupplierUsername');

    getSupplierByUsername(username);


    $("#ConfirmBTN").click(function (event) {
        event.preventDefault(); // מניעת השליחה של הטופס
        updateSupplier(username);
    });
});




// קבלת פרטי ספק לפי שם משתמש
function getSupplierByUsername(username) {
    var api = server + "/api/Suppliers/" + username;
    ajaxCall("GET", api, "", getSCB, getECB);
}

function getSCB(suppliers) {
    renderSupplier(suppliers[0]);
}

function getECB(err) {
    console.log("Error:", err);
}




//רנדור פרטי ספק
function renderSupplier(supplier) {
    // Populate fields with supplier details
    $('#firstName').val(supplier.first_name);
    $('#lastName').val(supplier.last_name);
    $('#companyName').val(supplier.company_name);
    $('#email').val(supplier.email);
    $('#phoneNumber').val(supplier.phone_number);
    $('#address').val(supplier.address);
    $('#preferredRegions').val(supplier.preferred_Areas);

    //שדות שלא ניתנות לשינוי על ידי הספק
    supplierId = supplier.id;
    supplierEmail = supplier.email;
    supplierRegistraionDate = supplier.registration_Date;
    supplierBlockedate = supplier.blockedate;
}




//עדכון פרטי ספק
function updateSupplier(username) {
    if (validateUserForm()) {
        let u = {
            "id": supplierId,
            "username": username,
            "email": supplierEmail,
            "password": $('#password').val(),
            "company_name": $("#companyName").val(),
            "first_name": $("#firstName").val(),
            "last_name": $("#lastName").val(),
            "phone_number": $("#phoneNumber").val(),
            "address": $("#address").val(),
            "preferred_Areas": $("#preferredRegions").val(),
            "registration_Date": supplierRegistraionDate,
            "blockedate": supplierBlockedate
        };
        api = server + `/api/Suppliers/Edit?username=${username}`;
        ajaxCall("PUT", api, JSON.stringify(u), updateSCB, updateECB);
    }
    return false;
}


function updateSCB(response) {
    window.location.href = "Supplier_MAIN.html";
}


function updateECB(xhr) {
    var response = JSON.parse(xhr.responseText);
    alert("Failed to update supplier details: " + response.message);
}


// וולידציה של הנתונים
function validateUserForm() {
    const confirmPassword = $("#confirmPassword").val();
    const password = $("#password").val();
    const phoneInput = $("#phoneNumber")[0];

    // בדיקת  אימות סיסמא
    if (password !== confirmPassword) {
        showAlert("אישור הסיסמא אינו תקין");
        return false;
    }

    // בדיקת סיסמא
    if (password === "") {
        showAlert("בחר סיסמא");
        return false;
    }


    // בדיקת מספר טלפון
    if (!phoneInput.checkValidity()) {
        showAlert("מספר הטלפון אינו תקין");
        return false;
    }

    return true;
}


document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profileForm');
    const phoneInput = document.getElementById('phoneNumber');
    const phoneFeedback = document.getElementById('phone-feedback');

    phoneInput.addEventListener('input', () => {
        if (!phoneInput.checkValidity()) {
            phoneFeedback.style.display = 'block';
        } else {
            phoneFeedback.style.display = 'none';
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
