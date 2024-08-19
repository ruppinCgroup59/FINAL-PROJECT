$(document).ready(function () {
    const userType = localStorage.getItem('userType');

    // If user is not logged in, redirect to login page
    if (!userType) {        
        window.location.href = "login.html";
        return;
    }


    $("#searchForm").submit(function (event) {
        event.preventDefault(); // Prevents the default form submission
        var area = $("#area").val();
        var date = $("#moving-date").val();



        const currentDate = new Date().toISOString().split('T')[0];
        // Check if the selected date is in the past
        if (date < currentDate) {
            showAlert("לא ניתן לבחור בתאריך שעבר, יש לבחור תאריך עתידי");
            return; // Prevents further execution
        }
        localStorage.setItem('date', date);
        getAvailableSuppliers(area, date);
    });


    //כפתור מעבר לפרטי מוביל מבוקש
    $("#ph").on("click", "a.supplier-details", function (e) {
        e.preventDefault();
        localStorage.setItem('SupplierUsername', $(this).data("username"));
        window.location.href = "SupplierProfileByCustomer.html";
    });



    //כפתור התנתקות מהמערכת
    $(document).on("click", "#backToLogin", function (e) {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "Login.html";
    });
});



// קריאת המובילים שעומדים בקריטריונים
function getAvailableSuppliers(area, date) {
    var api = server + "/api/Suppliers/" + area + "/AvailableSuppliers/" + date;
    ajaxCall("GET", api, "", getSCB, getECB);
}

function getSCB(suppliersArr) {
    renderSuppliers(suppliersArr);
}

function getECB(err) {
    console.log("Error:", err);
    document.getElementById("ph").innerHTML = '<h3 class="text-center text-blue">לא נמצאו ספקים לפי דרישה זו.</h3>';
}




// רנדור המובילים למסך
function renderSuppliers(suppliers) {
    var str = "";
    if (suppliers.length === 0) {
        str += '<h3 class="text-center text-blue">לא נמצאו ספקים לפי דרישה זו.</h3>';
    } else {
        suppliers.forEach(supplier => {
            str += `<div class="card col-12 col-md-6 col-lg-4 mb-4">
                        <div class="card-body text-center">
                            <h5 class="card-title">${supplier.first_name || ''} ${supplier.last_name || ''}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">${supplier.company_name || ''}</h6>
                            <p class="card-text">אזור בארץ: ${supplier.preferred_Areas || ''}</p>
                            <a href="#" class="btn btn-primary btn-block supplier-details" data-username="${supplier.username || ''}">לפרטים נוספים</a>
                        </div>
                    </div>`;
        });
    }

    document.getElementById("ph").innerHTML = str;
}






var userId = localStorage.getItem('customerId');
getServicesByUserId(userId);

//קריאת כל בקשות השירות של הלקוח
function getServicesByUserId(userId) {
    let api = `${server}/api/Services/active/${userId}`;

    fetch(api, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            AcgetSCB(data); 
        })
        .catch(error => {
            AcgetECB(error); 
        });
}


function AcgetSCB(suppliersArr) {
    renderActiveServices(suppliersArr);
}


function AcgetECB(err) {
    console.log("Error:", err);
}





// רנדור הובלות פעילות
function renderActiveServices(servicesArr) {
    const container = document.getElementById('ActiveService');

    // Clear previous content
    container.innerHTML = '';

    // Check if there are any active services
    if (servicesArr.length > 0) {
        // Create a button to open the modal
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-danger flashing-button'; 
        button.setAttribute('data-toggle', 'modal');
        button.setAttribute('data-target', '#myModal');
        button.innerText = 'הובלה פעילה';

        // Create the modal structure
        let modalHtml = `
            <!-- The Modal -->
            <div class="modal" id="myModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <!-- Modal Header -->
                        <div class="modal-header">
                            <h4 class="modal-title">הובלה פעילה</h4>
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                        </div>
                        <!-- Modal body -->
                        <div class="modal-body" id="modal-body-content">
                            <!-- Dynamic content will be inserted here -->
                        </div>
                        <!-- Modal footer -->
                        <div class="modal-footer">
                            <button type="button" class="btn btn-danger" data-dismiss="modal">סגירה</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Append the button and modal HTML to the container
        container.innerHTML = button.outerHTML + modalHtml;

        // Fill the modal body with service details
        const modalBody = document.getElementById('modal-body-content');
        servicesArr.forEach(service => {
            modalBody.innerHTML += `
                <div class="service-info">
                    <p><strong>קוד הובלה עבור מעקב בזמן אמת:</strong> ${service.service_Id}</p>
                    <p><strong>שם המוביל:</strong> ${service.supplier_Name}</p>
                    <p><strong>מקור:</strong> ${service.from}</p>
                    <p><strong>יעד:</strong> ${service.to}</p>
                    <hr />
                </div>
            `;
        });
    }
}


