//רנדור לוח שנה - תאריכים חסומים באדום , הובלה שאושרה בירוק .
document.addEventListener('DOMContentLoaded', function () {
    let username = localStorage.getItem('SupplierUsername');
    let userId = localStorage.getItem('supplierId');
    let userType = localStorage.getItem('userType');

    let calendarEl = document.getElementById('calendar');
    let buttonContainer = document.getElementById('button-container');
    let serviceTrackContainer = document.getElementById('serviceTrack-container');

    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        selectable: true,
        select: function (arg) {
            let date = arg.start;
            let utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

            let blockedDate = calendar.getEventById(utcDate.toISOString().split('T')[0]);

            let approvedService = calendar.getEvents().some(event =>
                event.backgroundColor === 'green' &&
                event.start.getTime() === utcDate.getTime()
            );

            if (blockedDate) {
                if (true) {
                    let api = server + '/api/Suppliers/' + username + '/blockedate/' + utcDate.toISOString().split('T')[0];
                    fetch(api, {
                        method: 'DELETE'
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to delete blocked date');
                            }
                            blockedDate.remove();
                        })
                        .catch(error => {
                            console.error('Error deleting blocked date:', error);
                        });
                }
            } else {
                let today = new Date().setUTCHours(0, 0, 0, 0);
                if (utcDate.getTime() < today) {
                    return;
                }

                if (approvedService) {
                    showAlert('There is already an approved service on this date. You cannot block this date.');
                    return;
                }

                calendar.addEvent({
                    id: utcDate.toISOString().split('T')[0],
                    title: 'תאריך חסום',
                    start: utcDate,
                    allDay: true,
                    backgroundColor: 'red'
                });

                let api = server + '/api/Suppliers/' + username + '/blockedate';
                if (utcDate.getTime() >= today) {
                    ajaxCall('POST', api, JSON.stringify(utcDate.toISOString().split('T')[0]));
                }
            }
            calendar.unselect();
        },
        eventContent: function (arg) {
            let eventTitle = arg.event.title;
            return { html: `<div style="color: white; background-color: ${arg.event.backgroundColor}; padding: 5px;">${eventTitle}</div>` };
        },
        eventDidMount: function (info) {
            let today = new Date().setUTCHours(0, 0, 0, 0);
            if (info.event.start.getTime() < today) {
                info.el.style.backgroundColor = 'red';
                info.el.style.color = 'white';
                info.el.style.pointerEvents = 'none';
            }
        },
        eventClick: function (info) {
            if (info.event.backgroundColor === 'green') {
                selectedEventId = info.event.id;
                let serviceId = info.event.id;
                // Extract the numeric part from the serviceId
                let numericId = serviceId.split('-')[1];
                // Save the numericId to local storage
                localStorage.setItem('currentServiceId', numericId)
                serviceTrackContainer.style.visibility = 'visible';
                buttonContainer.style.visibility = 'visible';
                getSupplierLocations(numericId);

            } else {
                buttonContainer.style.visibility = 'hidden';
                serviceTrackContainer.style.visibility = 'hidden';
            }
        },
        eventDidMount: function (info) {
            info.el.addEventListener('dblclick', function () {
                if (info.event.backgroundColor === 'red') {
                    let date = info.event.start;
                    if (true) {
                        let api = server + '/api/Suppliers/' + username + '/blockedate/' + date.toISOString().split('T')[0];
                        fetch(api, {
                            method: 'DELETE'
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Failed to delete blocked date');
                                }
                                info.event.remove();
                            })
                            .catch(error => {
                                console.error('Error deleting blocked date:', error);
                            });
                    }
                }
            });
        }
    });

    calendar.render();

    // רנדור תאריכים חסומים מהשרת
    let api = server + '/api/Suppliers/' + username;
    ajaxCall('GET', api, null, getSCB, getECB);

    function getSCB(data) {
        data.forEach(function (blockedDate) {
            let today = new Date().setUTCHours(0, 0, 0, 0);
            let blockedDateObj = new Date(blockedDate.blockedate);
            if (blockedDateObj.getTime() >= today) {
                let utcBlockedDate = new Date(Date.UTC(blockedDateObj.getFullYear(), blockedDateObj.getMonth(), blockedDateObj.getDate()));
                let existingBlockedDate = calendar.getEventById(utcBlockedDate.toISOString().split('T')[0]);
                if (!existingBlockedDate) {
                    calendar.addEvent({
                        id: utcBlockedDate.toISOString().split('T')[0],
                        title: 'תאריך חסום',
                        start: utcBlockedDate,
                        allDay: true,
                        backgroundColor: 'red'
                    });
                }
            }
        });
    }

    function getECB(error) {
        console.error('Error fetching blocked dates:', error);
    }

    // רנדור עסקאות מאושרות מהשרת
    let servicesApi = server + "/api/Services/" + userId + "/" + userType;
    ajaxCall('GET', servicesApi, "", getConfirmedServicesCB, getECB);

    function getConfirmedServicesCB(data) {
        data.forEach(function (service) {
            if (service.confirmed === 2) {
                let serviceDate = new Date(service.date);
                let utcServiceDate = new Date(Date.UTC(serviceDate.getFullYear(), serviceDate.getMonth(), serviceDate.getDate()));
                let existingServiceDate = calendar.getEventById('service-' + service.service_Id);
                if (!existingServiceDate) {
                    calendar.addEvent({
                        id: 'service-' + service.service_Id,
                        title: 'הובלה אושרה',
                        start: utcServiceDate,
                        allDay: true,
                        backgroundColor: 'green'
                    });
                }
            }
        });
    }
});




// פונקציה לקבלת פרטי שירות לפי מזהה שירות
function getService(serviceId, driverName = '', driverPhone = '') {
    let api = `${server}/api/Services/${serviceId}`;
    ajaxCall("GET", api, "", function (service) {
        getServiceSCB(service, driverName, driverPhone);
    }, getServiceECB);
}

function getServiceSCB(service, driverName, driverPhone) {
    renderService(service, driverName, driverPhone);
}

function getServiceECB(err) {
    console.log("Error:", err);
}





// קריאת מיקום של מוביל 
function getSupplierLocations(serviceId) {
    let api = `${server}/api/SupplierLocations/${serviceId}`;
    ajaxCall("GET", api, "", function (sl) {
        getSLSCB(sl, serviceId);
    }, getSLECB);
}

function getSLSCB(sl, serviceId) {
    const driverName = sl.driverName;
    const driverPhone = sl.driver_Phone;
    localStorage.setItem('driverName', driverName);
    localStorage.setItem('driverPhone', driverPhone);
    getService(serviceId, driverName, driverPhone);
}

function getSLECB(err) {
    console.log("Error:", err);
}





// רנדור פרטי הצעה של עסקה שאושרה עבור - תחילת שירות או עצירת שירות
function renderService(service, driverName, driverPhone) {
    let html = '';
    let serviceDate = new Date(service.date);
    let today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to midnight to ensure date comparison only

    if (serviceDate < today || service.complete) {
        if (service.complete) {
            html = '<div class="service-card"><p>ההובלה בוצעה בהצלחה</p></div>';
            deleteLocationOnServer(service.service_Id);
        } else {
            html = '<div class="service-card"><p>ההובלה לא בוצעה</p></div>';
        }
        // הסתר את הכפתורים
        $('#start-service').hide();
        $('#stop-service').hide();
    } else {
        // אם התאריך של השירות הוא היום או בעתיד
        html = `
            <div class="service-card">
                <p><strong>שם הלקוח:</strong> ${service.customer_Name}</p>
                <p><strong>שם השירות:</strong> ${service.service_Name}</p>
                <p><strong>תאריך:</strong> ${service.date.split('T')[0]}</p>
                <p><strong>מוצא:</strong> ${service.from}</p>
                <p><strong>יעד:</strong> ${service.to}</p>
                <p><strong>תיאור:</strong> ${service.description}</p>`;

        let isToday = serviceDate.toDateString() === today.toDateString();

        if (service.isActive) {
            html += `
                <label>שם הנהג</label>   <input id="driverName" type="text" name="name" value="${driverName}" readonly />
                <br/>
                <label>מס טלפון</label>   <input id="driverPhone" type="text" name="name" value="${driverPhone}" readonly />`;

            $('#start-service').prop('disabled', true).show();
            $('#stop-service').prop('disabled', !isToday).show();
        } else {
            html += `
                <label>שם הנהג</label>   <input id="driverName" type="text" name="name" value="${service.supplier_Name}" />
                <br/>
                <label>מס טלפון</label>   <input id="driverPhone" type="text" name="name" value=""  pattern="^(?:\+972|0)(?:[23489]|5[0248]|7[2-9])\d{7}$" />`;

            $('#start-service').prop('disabled', !isToday).show();
            $('#stop-service').prop('disabled', true).show();
        }

        html += '</div>';
    }

    document.getElementById("serviceTrack-container").innerHTML = html;
}






// DELETE SUPPLIER LOCATION IF THE SERVICE IS STOPPED
function deleteLocationOnServer(serviceId) {
    let api = `${server}/api/SupplierLocations/${serviceId}`;

    fetch(api, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete location');
            }
            return response.json();
        })
        .then(data => {
            console.log('Location deleted successfully:', data);
        })
        .catch(error => {
            console.error('Error deleting location:', error);
        });
}





// וולדציה של מספר טלפון תקין עבור התחלת שירות 
function validatePhoneNumber(event) {
    const phonePattern = /^(?:\+972|0)(?:[23489]|5[0248]|7[2-9])\d{7}$/;
    const phoneNumber = event.target.value;
    if (!phonePattern.test(phoneNumber)) {
        showAlert('הזן פורמט טלפון תקין');
        event.target.value = ''; // Clear the input field
    }
}

document.addEventListener('blur', function (event) {
    if (event.target.id === 'driverPhone') {
        validatePhoneNumber(event);
    }
}, true);



