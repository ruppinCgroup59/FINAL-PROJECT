////0 - מצב ברירת מחדל פתיחת בקשת שירות
////1 - לקוח ביקש הצעת מחיר חדשה
////2 - לקוח אישר את הבקשה
////3 - לקוח / ספק ביטל את הבקשה
////4 - ספק הציע מחיר חדש


$(document).ready(function () {
    const userType = localStorage.getItem('userType');

    // If user is not logged in, redirect to login page
    if (!userType) {
        window.location.href = "login.html";
        return;
    }


    // Get the appropriate user ID based on the user type
    let userId;
    if (userType === 'supplier') {
        userId = localStorage.getItem('supplierId');
    } else if (userType === 'customer') {
        userId = localStorage.getItem('customerId');
    } else {
        console.error('Invalid user type');
        return;
    }
    getServicesByUserId(userId, userType, server);
});




function getServiceForConfirmedStatus(serviceId) {
    var api = `${server}/api/Services/${serviceId}`;
    ajaxCall("GET", api, "", getServiceForConfirmedStatusSCB, getServiceForConfirmedStatusECB);
}

function getServiceForConfirmedStatus(serviceId) {
    return new Promise((resolve, reject) => {
        var api = `${server}/api/Services/${serviceId}`;
        ajaxCall("GET", api, "", function (service) {
            resolve(service.confirmed);
        }, reject);
    });
}

function getServiceForConfirmedStatusECB(err) {
    console.log("Error:", err);
}

function getServicesByUserId(userId, userType, server) {
    var api = server + "/api/Services/" + userId + "/" + userType;
    ajaxCall("GET", api, "", function (servicesArr) {
        getServicesSCB(servicesArr, userType);
    }, getServicesECB);
}

function getServicesSCB(servicesArr, userType) {
    renderServices(servicesArr, userType);
}

function getServicesECB(err) {
    console.log("Error:", err);
    document.getElementById("services-container").innerHTML = '<h3 class="text-center text-blue">לא נמצאו שירותים לפי דרישה זו.</h3>';
}




// רנדור הצעות שירות למסך
function renderServices(services, userType) {
    const container = $('#services-container');
    let html = '';
    if (services.length === 0) {
        html += '<p>לא נמצאו בקשות שירות</p>';
    } else {
        services.forEach(service => {
            const nameText = userType === 'supplier' ? 'שם לקוח' : 'שם ספק';
            const nameValue = userType === 'supplier' ? service.customer_Name : service.supplier_Name;

            html += `
                <div class="service-card">
                    <p><strong>${nameText}:</strong> ${nameValue}</p>
                    <p><strong>שם השירות:</strong> ${service.service_Name}</p>
                    <p><strong>תאריך:</strong> ${service.date.split('T')[0]}</p>
                    <p><strong>מוצא:</strong> ${service.from}</p>
                    <p><strong>יעד:</strong> ${service.to}</p>
                    <p><strong>תיאור:</strong> ${service.description}</p>
            `;

            // Display input field for price if userType is supplier
            if (userType === 'supplier' && service.confirmed !== 1 && service.price === 0) {
                html += `
                    <div class="form-group">
                        <label for="priceInput${service.service_Id}">מחיר מוצע:</label>
                        <input type="number" class="form-control" id="priceInput${service.service_Id}" placeholder="הזן מחיר" value="">

                    </div>
                `;
            } else if (userType === 'supplier' && service.confirmed !== 1 && service.confirmed !== 4 && service.price !== 0) {
                html += `
                    <div class="form-group">
                        <label for="priceInput${service.service_Id}">מחיר מוצע:</label>
                        <input type="number" class="form-control" id="priceInput${service.service_Id}" placeholder="" value="${service.price}" readonly>
                    </div>
                `;
            }
            else if (userType === 'supplier' && service.confirmed === 1) {
                html += `
                        <p id="originalpriceInput${service.service_Id}" ><strong>מחיר מוצע קודם:</strong> ${service.price}</p>
                        <div class="form-group">
                            <label for="priceInput${service.service_Id}">לקוח ביקש הצעה חדשה נא הזן הצעת מחיר סופית:</label>
                            <input type="number" class="form-control" id="priceInput${service.service_Id}" placeholder="הזן מחיר" value="">

                        </div>
                    `;
            } else if (userType === 'supplier' && service.confirmed === 4) {
                html += `
                    <div class="form-group">
                        <label for="priceInput${service.service_Id}">מחיר מוצע סופי:</label>
                        <input type="number" class="form-control" id="priceInput${service.service_Id}" placeholder="" value="${service.price}" readonly>
                    </div>
                `;
            }
            else if (userType === 'customer' && service.confirmed === 1) {
                html += `
                    <p class="statusWaiting"><strong>מחיר מוצע:</strong> ממתין להצעת מחיר סופית</p>
                `;
            }
            else if (userType === 'customer' && service.confirmed === 4) {
                html += `
                    <p><strong>מחיר מוצע סופי:</strong> ${service.price}</p>
                `;
            } else if (userType === 'customer' && service.confirmed === 0 && service.price === 0) {
                html += `
                    <p class="statusWaiting"><strong>מחיר מוצע:</strong> ממתין להצעת מחיר</p>
                `;
            } else {
                // Display read-only text for price if userType is customer
                html += `
                    <p><strong>מחיר מוצע:</strong> ${service.price !== 0 ? `${service.price} ש"ח` : 'ממתין להצעת מחיר'}</p>
                `;

            }
            // Add confirmation status line based on service.confirmed value
            if (service.complete) {
                html += `
                    <p class="statusAccepted"><strong>ההובלה הסתיימה</strong>  </p>
                `;
            }
            else if (service.confirmed === 2 && !service.complete) {
                html += `
                    <p class="statusAccepted"><strong>סטטוס בקשה:</strong> בקשה מאושרת</p>
                `;
            } else if ((service.confirmed === 0 && userType === 'supplier' && service.price !== 0 || service.confirmed === 4 && userType === 'supplier')) {
                html += `
                    <p><strong>סטטוס בקשה:</strong> ממתין לתגובת הלקוח</p>
                `;
            }
            else if (service.confirmed === 3) {
                html += `
                    <p class="statusDenied"><strong>סטטוס בקשה:</strong> בקשה מבוטלת</p>
                `;
            }


            // Buttons for supplier
            if (userType === 'supplier') {
                if (service.confirmed === 3) {
                    html += `
                        <button class="btn btn-primary btn-sm mt-2 disabled-btn" disabled>הגש הצעת מחיר</button>
                        <button class="btn btn-danger btn-sm mt-2 disabled-btn" disabled>סרב/בטל בקשה</button>
                    `;
                } else if (service.confirmed === 2) {
                    html += `
                        <button class="btn btn-primary btn-sm mt-2 disabled-btn" disabled>הגש הצעת מחיר</button>
                        <button class="btn btn-danger btn-sm mt-2" onclick="rejectService(${service.service_Id})">סרב/בטל בקשה</button>
                    `;
                } else if (service.confirmed === 1) {
                    html += `
                         <button class="btn btn-primary btn-sm mt-2" onclick="submitOriginalPrice(${service.service_Id})">הגש שוב הצעת מחיר מקורית</button>
                         <button class="btn btn-primary btn-sm mt-2" onclick="submitPrice(${service.service_Id})">הגש הצעת מחיר סופית</button>
                         <button class="btn btn-danger btn-sm mt-2" onclick="rejectService(${service.service_Id})">סרב/בטל בקשה</button>
                    `;
                } else if (service.confirmed === 4) {
                    html += `
                        <button class="btn btn-primary btn-sm mt-2 disabled-btn" disabled>הגש שוב הצעת מחיר מקורית</button>
                        <button class="btn btn-primary btn-sm mt-2 disabled-btn" disabled>הגש הצעת מחיר סופית</button>
                        <button class="btn btn-danger btn-sm mt-2" onclick="rejectService(${service.service_Id})">סרב/בטל בקשה</button>
                    `;
                } else if (service.confirmed === 0 && userType === 'supplier' && service.price !== 0) {
                    html += `
                        <button class="btn btn-primary btn-sm mt-2 disabled-btn" disabled>הגש הצעת מחיר</button>
                        <button class="btn btn-danger btn-sm mt-2" onclick="rejectService(${service.service_Id})">סרב/בטל בקשה</button>
                    `;
                } else {
                    html += `
                         <button class="btn btn-primary btn-sm mt-2" onclick="submitPrice(${service.service_Id})">הגש הצעת מחיר</button>
                         <button class="btn btn-danger btn-sm mt-2" onclick="rejectService(${service.service_Id})">סרב/בטל בקשה</button>
                    `;
                }
                // Buttons for customer
            } else if (userType === 'customer') {
                if (!service.complete && !service.isActive) {

                    if (service.confirmed === 3) {
                        html += `
                        <button class="btn btn-success btn-sm mt-2 disabled-btn" disabled>אשר בקשה</button>
                        <button class="btn btn-primary btn-sm mt-2 disabled-btn" disabled>בקש הצעה נוספת</button>
                        <button class="btn btn-danger btn-sm mt-2 disabled-btn" disabled>סרב/בטל בקשה</button>
                    `;
                    } else if (service.confirmed === 2) {
                        html += `
                        <button class="btn btn-success btn-sm mt-2 disabled-btn" disabled>אשר בקשה</button>
                        <button class="btn btn-primary btn-sm mt-2 disabled-btn" disabled>בקש הצעה נוספת</button>
                        <button class="btn btn-danger btn-sm mt-2" onclick="rejectService(${service.service_Id})">סרב/בטל בקשה</button>
                    `;
                    } else if (service.confirmed === 1) {
                        html += `
                        <button class="btn btn-success btn-sm mt-2 disabled-btn" disabled>אשר בקשה</button>
                        <button class="btn btn-primary btn-sm mt-2 disabled-btn" disabled>בקש הצעה נוספת</button>
                        <button class="btn btn-danger btn-sm mt-2" onclick="rejectService(${service.service_Id})">סרב/בטל בקשה</button>
                    `;
                    } else if (service.confirmed === 4) {
                        html += `
                        <button class="btn btn-success btn-sm mt-2"  onclick="approveRequest(${service.service_Id})" >אשר בקשה</button>
                        <button class="btn btn-primary btn-sm mt-2 disabled-btn" disabled>בקש הצעה נוספת</button>
                        <button class="btn btn-danger btn-sm mt-2" onclick="rejectService(${service.service_Id})">סרב/בטל בקשה</button>
                    `;
                    } else if (service.confirmed === 0 && service.price === 0) {
                        html += `
                        <button class="btn btn-success btn-sm mt-2 disabled-btn" disabled>אשר בקשה</button>
                        <button class="btn btn-primary btn-sm mt-2 disabled-btn" disabled>בקש הצעה נוספת</button>
                        <button class="btn btn-danger btn-sm mt-2" onclick="rejectService(${service.service_Id})">סרב/בטל בקשה</button>
                    `;
                    } else if (service.confirmed === 0 && service.price !== 0) {
                        html += `
                        <button class="btn btn-success btn-sm mt-2"  onclick="approveRequest(${service.service_Id})">אשר בקשה</button>
                        <button class="btn btn-primary btn-sm mt-2" onclick="addProposal(${service.service_Id})">בקש הצעה נוספת</button>
                        <button class="btn btn-danger btn-sm mt-2" onclick="rejectService(${service.service_Id})">סרב/בטל בקשה</button>
                    `;
                    } else {
                        // Check if price is 0 and disable the "בקש הצעה נוספת" button if true
                        html += `
                        <button class="btn btn-success btn-sm mt-2"  onclick="approveRequest(${service.service_Id})"${service.price === 0 ? 'disabled' : ''} >אשר בקשה</button>
                        <button class="btn btn-primary btn-sm mt-2" onclick="addProposal(${service.service_Id})" ${service.price === 0 || service.confirmed === 1 ? 'disabled' : ''}>בקש הצעה נוספת</button>
                        <button class="btn btn-danger btn-sm mt-2" onclick="rejectService(${service.service_Id})">סרב/בטל בקשה</button>
                    `;
                    }
                }
                else {
                    html += `
                        <button class="btn btn-warning btn-sm mt-2" onclick="addReview(${service.service_Id},${service.supplier_Id})" style="width: 380px;">חוות דעת</button>
                    `;
                }

            }

            html += `
                </div>
            `;
        });
    }

    container.html(html);
}






// הצעת מחיר של ספק
function submitPrice(serviceId) {
    const price = $(`#priceInput${serviceId}`).val();
    const priceFloat = price ? parseFloat(price) : null;

    if (isNaN(priceFloat) || priceFloat <= 0) {
        showAlert("הזן מספר גדול מ-0");
        return; // Prevent the function from continuing
    }

    // Send the price update to the server
    var api = `${server}/api/Services/Price?service_Id=${serviceId}&price=${priceFloat}`;
    ajaxCall("PUT", api, null, function (response) {
        // After successful price submission, check the service status
        getServiceForConfirmedStatus(serviceId).then(serviceStatus => {

            if (serviceStatus !== 1) {
                // Show the success alert and reload the page if the status isn't 1
                location.reload();
            } else {
                // If the status is 1, send a new proposal but do not reload the page
                sendNewProposal(serviceId);
            }
        }).catch(err => console.log(err));
    }, putPriceECB);
}

function putPriceECB(xhr) {
    var errorMessage = xhr.responseText || 'An error occurred'; // Example error callback
    showAlert(errorMessage);
}





/*הצעת מחיר על בסיס הצעה מקורית*/
function submitOriginalPrice(serviceId) {
    const originalPrice = $(`#originalpriceInput${serviceId}`).text().match(/[\d.]+/);
    var api = `${server}/api/Services/Price?service_Id=${serviceId}&price=${parseFloat(originalPrice)}`;

    ajaxCall("PUT", api, null, putOriginalPriceSCB, putOriginalPriceECB);
    sendNewProposal(serviceId);
}

function putOriginalPriceSCB(response) {
    location.reload();
}

function putOriginalPriceECB(xhr) {
    var errorMessage = xhr.responseText || 'An error occurred';
    showAlert(errorMessage);
}





// אישור בקשת שירות ע"י לקוח"
function approveRequest(serviceId) {
    var api = `${server}/api/Services/Confirmed?service_Id=${serviceId}&confirmed=2`;
    ajaxCall("PUT", api, null, putApproveSCB, putApproveECB);
}

function putApproveSCB(response) {
    location.reload();
}

function putApproveECB(xhr) {
    const errorMessage = xhr.responseText || 'An error occurred';
    showAlert(errorMessage);
}





// ביטול/סירוב בקשת שירות ע"י ספק או לקוח"
function rejectService(serviceId) {
    var api = `${server}/api/Services/Confirmed?service_Id=${serviceId}&confirmed=3`;
    ajaxCall("PUT", api, null, putRejectSCB, putRejectECB);
}

function putRejectSCB(response) {
    location.reload();
}

function putRejectECB(xhr) {
    var errorMessage = xhr.responseText || 'An error occurred';
    showAlert(errorMessage);
}





// בקשה להצעת מחיר חדשה על ידי לקוח
function addProposal(serviceId) {
    var api = `${server}/api/Services/Confirmed?service_Id=${serviceId}&confirmed=1`;
    ajaxCall("PUT", api, null, putAddProposalSCB, putAddProposalECB);
}

function putAddProposalSCB(response) {
    location.reload();
}

function putAddProposalECB(xhr) {
    var errorMessage = xhr.responseText || 'An error occurred';
    showAlert(errorMessage);
}






// הגשת הצעת מחיר חדשה על ידי ספק
function sendNewProposal(serviceId) {
    var api = `${server}/api/Services/Confirmed?service_Id=${serviceId}&confirmed=4`;
    ajaxCall("PUT", api, null, sendNewProposalSCB, sendNewProposalECB);
}

function sendNewProposalSCB(response) {   
    location.reload();
}

function sendNewProposalECB(xhr) {
    var errorMessage = xhr.responseText || 'An error occurred';
    showAlert(errorMessage);
}








// פונקציה להצגת חוות דעת
function addReview(serviceId, supplier_id) {

    currentSupplierId = supplier_id;
    currentServiceId = serviceId;

    // Update the text in the modal
    $('#serviceIdText').text(`מספר שירות: ${serviceId}`);


    // Show the modal
    $('#reviewModal').modal('show');
}



function submitReview() {
    let rating = document.querySelector('input[name="rating"]:checked') ? document.querySelector('input[name="rating"]:checked').value : null;
    let reviewText = $("#reviewText").val();
    let customerId = localStorage.getItem('customerId');


    if (!rating || !reviewText) {
        showAlert('נא למלא את כל השדות.');
        return;
    }

    let reviewData = {
        "cId": customerId,
        "sId": currentSupplierId,
        "rate": rating,
        "description": reviewText
    };

    const api = server + "/api/Feedback";
    ajaxCall("POST", api, JSON.stringify(reviewData), postSCB, postECB);
}

function postSCB(response) {
    ShowSuccess('החוות דעת נשלחה בהצלחה.');
    $('#reviewModal').modal('hide');
}

function postECB(xhr, status, error) {
    showAlert('אירעה שגיאה בשליחת החוות דעת.');
}






















