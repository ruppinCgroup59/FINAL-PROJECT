$(document).ready(function () {
    userType = localStorage.getItem('userType');
    username = localStorage.getItem('SupplierUsername');

    // If user is not logged in, redirect to login page
    if (!userType) {
        window.location.href = "login.html";
        return;
    }

    // קריאה לפונקציה לקבלת רשימת הספקים לפי שם המשתמש
    getSuppliersByUsername(username);


    // חזרה לעמוד הראשי של הלקוח
    $('#backToMain').click(function (event) {
        event.preventDefault();
        localStorage.removeItem('SupplierUsername');
        localStorage.removeItem('supplierId');
        localStorage.removeItem('date');
        window.location.href = "MAIN.html";
    });
});



// קריאת רשימת הספקים לפי שם המשתמש
function getSuppliersByUsername(username) {
    var api = server + "/api/Suppliers/" + username;
    ajaxCall("GET", api, "", getSCB, getECB);
}

function getSCB(suppliers) {
    renderSupplier(suppliers[0]); // העברת הספק הראשון ברשימה לפונקצית ההצגה
    var supplierPhoneNumber = suppliers[0].phone_number;
    updateWhatsappLink(supplierPhoneNumber);
}

function getECB(err) {
    console.log("Error:", err);
}



// פונקציה להצגת פרטי הספק בדף
function renderSupplier(supplier) {
    $('#FullNameHeader').text(`${supplier.first_name} ${supplier.last_name}`);
    $('#CompanyName').text(supplier.company_name);
    $('#FullName').text(`${supplier.first_name} ${supplier.last_name}`);
    $('#Email').text(supplier.email);
    $('#PhoneNum').text(supplier.phone_number);
    $('.AreaPref').text(supplier.preferred_Areas);
    localStorage.setItem('supplierId', supplier.id);
    renderSupplierPhoto(supplier.id);
    getAvgFeedback(supplier.id);

}


// רנדור תמונת המוביל
function renderSupplierPhoto(supplierId) {
    var imgElement = document.getElementById("supplierPhoto");
    var Photoapi = server + `/api/Suppliers/getPicture?supplierId=${supplierId}`

    fetch(Photoapi)
        .then(response => {
            if (response.ok) {
                return response.blob(); // קבלת התמונה כ-blob
            } else {
                throw new Error("Failed to load picture");
            }
        })
        .then(blob => {
            var imgUrl = URL.createObjectURL(blob);
            imgElement.src = imgUrl; // הצגת התמונה ב-<img>
        })
        .catch(error => console.error("Error:", error));
}





//SUPPLIER AVERAGE FEEDBACK
function getAvgFeedback(supplierId) {
    let api = `${server}/api/Suppliers/${supplierId}/avgFeedback`; 
    ajaxCall("GET", api, "", updateFeedbackUI, handleError);
}

function updateFeedbackUI(response) {
    $('#SupplierRanking').text(response + '/5');
    console.log(response);
}

function handleError(error) {
    console.error('There was a problem with the fetch operation:', error);
}




// פונקציה לעדכון הלינק ל-WhatsApp עם המספר הטלפון
function updateWhatsappLink(phoneNumber) {
    // הסרת ה-0 הראשון מהמספר הטלפון
    var formattedPhoneNumber = phoneNumber.replace(/^0+/, '');
    // שילוב קידומת המדינה עם המספר הטלפון
    var fullPhoneNumber = '972' + formattedPhoneNumber;

    // קבלת אלמנט הלינק ל-WhatsApp בעזרת jQuery
    var whatsappLink = $('#Whatsapp_Link');

    // עדכון קישור ה-WhatsApp
    whatsappLink.attr('href', 'https://api.whatsapp.com/send?phone=' + fullPhoneNumber);
}

