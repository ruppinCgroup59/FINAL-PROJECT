$(document).ready(function () {   
    getCustomers();
    getSuppliers();
    $("#LoginBTN").click(loginUser);
})



function getCustomers() {
    api = server + "/api/Customers";
    ajaxCall("GET", api, "", getSCB, getECB);
}

function getSCB(CustomersArr) {
}

function getECB(err1) {
}





function getSuppliers() {
    api = server + "/api/Suppliers";
    ajaxCall("GET", api, "", getSuppliers, getESuppliers);
}

function getSuppliers(SuppliersArr) {
}

function getESuppliers(err2) {
}





//התחברות למערכות - בדיקת נתונים בשרת
function loginUser() {
    let username = $("#login-username").val();
    let password = $("#login-password").val();

    let user = {
        "username": username,
        "password": password
    };

    let api = server + "/api/Login/login";
    ajaxCall("POST", api, JSON.stringify(user), loginSCB, loginECB);
    return false;
}


// שמירת נתונים חשובים ב LOCAL STORAGE
function loginSCB(response) {
    localStorage.setItem('userType', response.userType);

    if (response.userType === 'supplier') {
        localStorage.setItem('SupplierUsername', response.userName); 
        localStorage.setItem('supplierId', response.supplierId);
        window.location.href = "Supplier_MAIN.html";
    }
    else {
        localStorage.setItem('CustomerUsername', response.userName); 
        localStorage.setItem('customerId', response.customerId);
        window.location.href = "MAIN.html";
    }
}


function loginECB(xhr) {
    var response = JSON.parse(xhr.responseText);
    showAlert(response.message);
}



