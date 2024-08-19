$(document).ready(function () {
    const Sim_Service = 1150;  //SERVICE ID FOR SIMULATION !!  - נועד כדי להציג לבוחנים סימולציה 14/8/24


    const username = localStorage.getItem('SupplierUsername');
    const userType = localStorage.getItem('userType');
    var photoId = localStorage.getItem('supplierId');


    let driverName = null;
    let driverPhone = null;
    let updateIndex = 0;
    let simulationInterval;
    let watchId;
    let userId;


    // If user is not logged in, redirect to login page
    if (!userType) { 
        window.location.href = "login.html";
        return;
    }


    // Get the appropriate user ID based on the user type
    if (userType === 'supplier') {
        userId = localStorage.getItem('supplierId');
    } else if (userType === 'customer') {
        userId = localStorage.getItem('customerId');
    } else {
        console.error('Invalid user type');
        return;
    }

    // כפתור עריכת פרופיל
    $('#EditBTN').click(function () {
        window.location.href = "EditSupplierProfile.html";
    });


    // כפתור התנתקות מהמערכת
    $('#Logout').click(function (event) {
        event.preventDefault(); // Prevent default link behavior
        localStorage.removeItem('SupplierUsername');
        localStorage.removeItem('supplierId');
        localStorage.removeItem('userType');
        localStorage.removeItem('currentServiceId');
        localStorage.removeItem('driverName');
        localStorage.removeItem('driverPhone');
        window.location.href = "Login.html";
    });



    getSuppliersByUsername(username);
    getServicesByUserIdTracking(userId, userType);
    getAvgFeedback(userId);
    renderSupplierPicture(photoId);



    //SUPPLIERS DETAILS by username
    function getSuppliersByUsername(username) {
        let api = `${server}/api/Suppliers/${username}`;
        ajaxCall("GET", api, "", getSCB, getECB);
    }

    function getSCB(suppliers) {
        if (suppliers.length > 0) {
            renderSupplier(suppliers[0]); // Render the first supplier
        } else {
            console.log('No suppliers found.');
        }
    }

    function getECB(err) {
        console.log("Error:", err);
    }



    //רנדור פרטי המוביל
    function renderSupplier(supplier) {
        $('#FullNameHeader').text(`${supplier.first_name} ${supplier.last_name}`);
        $('#CompanyName').text(supplier.company_name);
        $('#FullName').text(`${supplier.first_name} ${supplier.last_name}`);
        $('#Email').text(supplier.email);
        $('#PhoneNum').text(supplier.phone_number);
        $('.AreaPref').text(supplier.preferred_Areas);
    }



    //רנדור ממוצע חוות דעות שקיבל המוביל
    function getAvgFeedback(supplierId) {
        let api = `${server}/api/Suppliers/${supplierId}/avgFeedback`;
        ajaxCall("GET", api, "", updateFeedbackUI, handleError);
    }

    function updateFeedbackUI(response) {
        $('#ranking').text(response + '/5');
    }

    function handleError(error) {
        console.error('There was a problem with the fetch operation:', error);
    }





    // קבלת שירות לפי מספר זהות וסוג המשתמש
    function getServicesByUserIdTracking(userId, userType) {
        var api = server + "/api/Services/" + userId + "/" + userType;
        ajaxCall("GET", api, "", function (servicesArr) {
            getServicesTrackingSCB(servicesArr, userType);
        }, getServicesTrackingECB);
    }

    function getServicesTrackingSCB(servicesArr) {
        let today = new Date().toISOString().split('T')[0];
        for (var i = 0; i < servicesArr.length; i++) {
            let service_Id = servicesArr[i].service_Id;
            if (servicesArr[i].isActive && servicesArr[i].date == today && !servicesArr[i].complete) {
                getSupplierLocationsDriverNameAndNumber(service_Id);
            }
        }
    }

    function getServicesTrackingECB(err) {
        console.log("Error:", err);
    }



    // קריאת שם הנהג ומספר טלפון של מבצע ההובלה
    function getSupplierLocationsDriverNameAndNumber(service_Id) {
    let api = `${server}/api/SupplierLocations/${service_Id}`;
    ajaxCall("GET", api, "", function (sl) {
        getSLDriverNameAndNumberSCB(sl, service_Id);
    }, getSLDriverNameAndNumberECB);
}

    function getSLDriverNameAndNumberSCB(sl, service_Id) {
        const driverName = sl.driverName;
        const driverPhone = sl.driver_Phone;
        if (navigator.geolocation && service_Id != Sim_Service) {
            watchId = navigator.geolocation.watchPosition(function (position) {
                console.log(position.coords);
                updateLocationOnServer(service_Id, position.coords, driverName, driverPhone);
            });
        } else {
            startLocationSimulation(service_Id, driverName, driverPhone); // Start location simulation
        }

    }

    function getSLDriverNameAndNumberECB(err) {
    console.log("Error:", err);
    }





    // כפתור הפעלת הובלה
    $('#start-service').click(function () {
        driverName = document.getElementById("driverName").value;
        driverPhone = document.getElementById("driverPhone").value;
        service_Id = parseInt(localStorage.getItem('currentServiceId'));

        if (driverName && driverPhone) {
            isActiveTrue(service_Id);
        } else {
            showAlert('חובה למלא שם נהג ומספר טלפון');
        }
    });



    //כפתור הפסקת הובלה
    $('#stop-service').click(function () {
        service_Id = parseInt(localStorage.getItem('currentServiceId'));
        isActiveFalse(service_Id);
        deleteLocationOnServer(service_Id);
    });




    //service is on (ACTIVE = 1)
    function isActiveTrue(service_Id) {
        let api = `${server}/api/Services/isActive?service_Id=${service_Id}&isActive=true`;
        ajaxCall("PUT", api, null, putisActiveTSCB, putisActiveTECB);
    }

    function putisActiveTSCB(response) {
        if (navigator.geolocation && service_Id != Sim_Service ) {
            watchId = navigator.geolocation.watchPosition(function (position) {
                console.log(position.coords);
                updateLocationOnServer(service_Id, position.coords, driverName, driverPhone);
                location.reload();
            });
        } else {
            startLocationSimulation(service_Id, driverName, driverPhone); // Start location simulation
        }

    }

    function putisActiveTECB(xhr) {
        const errorMessage = xhr.responseText || 'An error occurred';
        console.log('Error starting service:', errorMessage);
        alert(errorMessage);
    }



    //service is off (ACTIVE = 0)
    function isActiveFalse(service_Id) {
        let api = `${server}/api/Services/isActive?service_Id=${service_Id}&isActive=false`;
        ajaxCall("PUT", api, null, putisActiveFSCB, putisActiveFECB);
    }

    function putisActiveFSCB(response) {
        if (simulationInterval) {
            clearInterval(simulationInterval);
            simulationInterval = null;
        }
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
        }
        location.reload();
    }

    function putisActiveFECB(xhr) {
        const errorMessage = xhr.responseText || 'An error occurred';
        console.log('Error stopping service:', errorMessage);
        showAlert(errorMessage);
    }






    //SUPPLIER LOCATION WHILE SERVICE IS ACTIVE
    function updateLocationOnServer(service_Id, coords, driverName, driverPhone) {
        let l = {
            "serviceId": service_Id,
            "latitude": coords.latitude,
            "longitude": coords.longitude,
            "driverName": driverName,
            "driver_Phone": driverPhone
        };
        console.log('Updating location:', l);
        let api = `${server}/api/SupplierLocations`;
        ajaxCall("PUT", api, JSON.stringify(l), putSLSCB, putSLECB);
    }

    function putSLSCB(response) {
        console.log('Location updated successfully:', response);
    }

    function putSLECB(xhr) {
        const errorMessage = xhr.responseText || 'An error occurred';
        console.log('Error updating location:', errorMessage);
        showAlert(errorMessage);
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



    // העלאת תמונה לשרת ולבסיס נתונים 
    document.getElementById("Picture").addEventListener("change", function () {
        var formData = new FormData();
        var fileInput = document.getElementById("Picture");
        formData.append("picture", fileInput.files[0]);


        supplierId = localStorage.getItem('supplierId');
        api = server + "/api/Suppliers/uploadPicture?supplierId=" + supplierId
        formData.append("supplierId", supplierId);

        fetch(api, {
            method: "POST",
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    location.reload();
                } else {
                    showAlert("שגיאה: " + data.message);
                }
            })
            .catch(error => console.error("שגיאה:", error));
    });




    // פונקציה לשליפת התמונה מהשרת והצגתה ב-<img>
    function renderSupplierPicture(supplierId) {
        var imgElement = document.getElementById("supplierPicture");
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






    /////////////////////SIMULATION ONLY!!////////////////////
    // נועד רק עבור הצגה של אלמנט המעקב בזמן אמת בכיתה מול הבוחנים 14.8.24 

    const locationUpdates = [   // Predefined coordinates array for simulation
        { latitude: 32.4380, longitude: 34.9154 }, // Hadera
        { latitude: 32.4320, longitude: 34.9150 },
        { latitude: 32.4260, longitude: 34.9145 },
        { latitude: 32.4200, longitude: 34.9140 },
        { latitude: 32.4140, longitude: 34.9135 },
        { latitude: 32.4080, longitude: 34.9130 },
        { latitude: 32.4020, longitude: 34.9125 },
        { latitude: 32.3960, longitude: 34.9120 },
        { latitude: 32.3900, longitude: 34.9115 },
        { latitude: 32.3840, longitude: 34.9110 },
        { latitude: 32.3780, longitude: 34.9105 },
        { latitude: 32.3720, longitude: 34.9100 },
        { latitude: 32.3660, longitude: 34.9095 },
        { latitude: 32.3600, longitude: 34.9090 },
        { latitude: 32.3540, longitude: 34.9085 },
        { latitude: 32.3480, longitude: 34.9080 },
        { latitude: 32.3420, longitude: 34.9075 },
        { latitude: 32.3360, longitude: 34.9070 },
        { latitude: 32.3300, longitude: 34.9065 },
        { latitude: 32.3240, longitude: 34.9060 },
        { latitude: 32.3180, longitude: 34.9055 },
        { latitude: 32.3120, longitude: 34.9050 },
        { latitude: 32.3060, longitude: 34.9045 },
        { latitude: 32.3000, longitude: 34.9040 },
        { latitude: 32.2940, longitude: 34.9035 },
        { latitude: 32.2880, longitude: 34.9030 },
        { latitude: 32.2820, longitude: 34.9025 },
        { latitude: 32.2760, longitude: 34.9020 },
        { latitude: 32.2700, longitude: 34.9015 },
        { latitude: 32.2640, longitude: 34.9010 },
        { latitude: 32.2580, longitude: 34.9005 },
        { latitude: 32.2520, longitude: 34.9000 },
        { latitude: 32.2460, longitude: 34.8995 },
        { latitude: 32.2400, longitude: 34.8990 },
        { latitude: 32.2340, longitude: 34.8985 },
        { latitude: 32.2280, longitude: 34.8980 },
        { latitude: 32.2220, longitude: 34.8975 },
        { latitude: 32.2160, longitude: 34.8970 },
        { latitude: 32.2100, longitude: 34.8965 },
        { latitude: 32.2040, longitude: 34.8960 },
        { latitude: 32.1980, longitude: 34.8955 },
        { latitude: 32.1920, longitude: 34.8950 },
        { latitude: 32.1860, longitude: 34.8945 },
        { latitude: 32.1800, longitude: 34.8940 },
        { latitude: 32.1740, longitude: 34.8935 },
        { latitude: 32.1680, longitude: 34.8930 },
        { latitude: 32.1620, longitude: 34.8925 },
        { latitude: 32.1560, longitude: 34.8920 },
        { latitude: 32.1500, longitude: 34.8915 },
        { latitude: 32.1440, longitude: 34.8910 },
        { latitude: 32.1380, longitude: 34.8905 },
        { latitude: 32.1320, longitude: 34.8900 },
        { latitude: 32.1260, longitude: 34.8895 },
        { latitude: 32.1200, longitude: 34.8890 },
        { latitude: 32.1140, longitude: 34.8885 },
        { latitude: 32.1080, longitude: 34.8880 },
        { latitude: 32.1020, longitude: 34.8875 },
        { latitude: 32.0960, longitude: 34.8870 },
        { latitude: 32.0900, longitude: 34.8865 },
        { latitude: 32.0840, longitude: 34.8860 },
        { latitude: 32.0780, longitude: 34.8855 },
        { latitude: 32.0720, longitude: 34.8850 },
        { latitude: 32.0660, longitude: 34.8845 },
        { latitude: 32.0600, longitude: 34.8840 },
        { latitude: 32.0540, longitude: 34.8835 },
        { latitude: 32.0480, longitude: 34.8830 },
        { latitude: 32.0420, longitude: 34.8825 },
        { latitude: 32.0360, longitude: 34.8820 },
        { latitude: 32.0300, longitude: 34.8815 },
        { latitude: 32.0240, longitude: 34.8810 },
        { latitude: 32.0180, longitude: 34.8805 },
        { latitude: 32.0120, longitude: 34.8800 },
        { latitude: 32.0060, longitude: 34.8795 },
        { latitude: 32.0000, longitude: 34.8790 },
        { latitude: 31.9940, longitude: 34.8785 },
        { latitude: 31.9880, longitude: 34.8780 },
        { latitude: 31.9820, longitude: 34.8775 },
        { latitude: 31.9760, longitude: 34.8770 },
        { latitude: 31.9700, longitude: 34.8765 },
        { latitude: 31.9640, longitude: 34.8760 },
        { latitude: 31.9580, longitude: 34.8755 },
        { latitude: 31.9520, longitude: 34.8750 },
        { latitude: 31.9460, longitude: 34.8745 },
        { latitude: 31.9400, longitude: 34.8740 },
        { latitude: 31.9340, longitude: 34.8735 },
        { latitude: 31.9280, longitude: 34.8730 },
        { latitude: 31.9220, longitude: 34.8725 },
        { latitude: 31.9160, longitude: 34.8720 },
        { latitude: 31.9100, longitude: 34.8715 },
        { latitude: 31.9040, longitude: 34.8710 },
        { latitude: 31.8980, longitude: 34.8705 },
        { latitude: 31.8920, longitude: 34.8700 },
        { latitude: 31.8860, longitude: 34.8695 },
        { latitude: 31.8800, longitude: 34.8690 },
        { latitude: 31.8740, longitude: 34.8685 },
        { latitude: 31.8680, longitude: 34.8680 },
        { latitude: 31.8620, longitude: 34.8675 },
        { latitude: 31.8560, longitude: 34.8670 },
        { latitude: 31.8500, longitude: 34.8665 },
        { latitude: 31.8440, longitude: 34.8660 },
        { latitude: 31.8380, longitude: 34.8655 },
        { latitude: 31.8320, longitude: 34.8650 },
        { latitude: 31.8260, longitude: 34.8645 },
        { latitude: 31.8200, longitude: 34.8640 },
        { latitude: 31.8140, longitude: 34.8635 },
        { latitude: 31.8080, longitude: 34.8630 },
        { latitude: 31.8020, longitude: 34.8625 },
        { latitude: 31.7960, longitude: 34.8620 },
        { latitude: 31.7900, longitude: 34.8615 },
        { latitude: 31.7840, longitude: 34.8610 },
        { latitude: 31.7780, longitude: 34.8605 },
        { latitude: 31.7720, longitude: 34.8600 },
        { latitude: 31.7660, longitude: 34.8595 },
        { latitude: 31.7600, longitude: 34.8590 },
        { latitude: 31.7540, longitude: 34.8585 },
        { latitude: 31.7480, longitude: 34.8580 },
        { latitude: 31.7420, longitude: 34.8575 },
        { latitude: 31.7360, longitude: 34.8570 },
        { latitude: 31.7300, longitude: 34.8565 },
        { latitude: 31.7240, longitude: 34.8560 },
        { latitude: 31.7180, longitude: 34.8555 },
        { latitude: 31.7120, longitude: 34.8550 },
        { latitude: 31.7060, longitude: 34.8545 },
        { latitude: 31.7000, longitude: 34.8540 },
        { latitude: 31.6940, longitude: 34.8535 },
        { latitude: 31.6880, longitude: 34.8530 },
        { latitude: 31.6820, longitude: 34.8525 },
        { latitude: 31.6760, longitude: 34.8520 },
        { latitude: 31.6700, longitude: 34.8515 },
        { latitude: 31.6640, longitude: 34.8510 },
        { latitude: 31.6580, longitude: 34.8505 },
        { latitude: 31.6520, longitude: 34.8500 },
        { latitude: 31.6460, longitude: 34.8495 },
        { latitude: 31.6400, longitude: 34.8490 },
        { latitude: 31.6340, longitude: 34.8485 },
        { latitude: 31.6280, longitude: 34.8480 },
        { latitude: 31.6220, longitude: 34.8475 },
        { latitude: 31.6160, longitude: 34.8470 },
        { latitude: 31.6100, longitude: 34.8465 },
        { latitude: 31.6040, longitude: 34.8460 },
        { latitude: 31.5980, longitude: 34.8455 },
        { latitude: 31.5920, longitude: 34.8450 },
        { latitude: 31.5860, longitude: 34.8445 },
        { latitude: 31.5800, longitude: 34.8440 },
        { latitude: 31.5740, longitude: 34.8435 },
        { latitude: 31.5680, longitude: 34.8430 },
        { latitude: 31.5620, longitude: 34.8425 },
        { latitude: 31.5560, longitude: 34.8420 },
        { latitude: 31.5500, longitude: 34.8415 },
        { latitude: 31.5440, longitude: 34.8410 },
        { latitude: 31.5380, longitude: 34.8405 },
        { latitude: 31.5320, longitude: 34.8400 },
        { latitude: 31.5260, longitude: 34.8395 },
        { latitude: 31.5200, longitude: 34.8390 },
        { latitude: 31.5140, longitude: 34.8385 },
        { latitude: 31.5080, longitude: 34.8380 },
        { latitude: 31.5020, longitude: 34.8375 },
        { latitude: 31.4960, longitude: 34.8370 },
        { latitude: 31.4900, longitude: 34.8365 },
        { latitude: 31.4840, longitude: 34.8360 },
        { latitude: 31.4780, longitude: 34.8355 },
        { latitude: 31.4720, longitude: 34.8350 },
        { latitude: 31.4660, longitude: 34.8345 },
        { latitude: 31.4600, longitude: 34.8340 },
        { latitude: 31.4540, longitude: 34.8335 },
        { latitude: 31.4480, longitude: 34.8330 },
        { latitude: 31.4420, longitude: 34.8325 },
        { latitude: 31.4360, longitude: 34.8320 },
        { latitude: 31.4300, longitude: 34.8315 },
        { latitude: 31.4240, longitude: 34.8310 },
        { latitude: 31.4180, longitude: 34.8305 },
        { latitude: 31.4120, longitude: 34.8300 },
        { latitude: 31.4060, longitude: 34.8295 },
        { latitude: 31.4000, longitude: 34.8290 },
        { latitude: 31.3940, longitude: 34.8285 },
        { latitude: 31.3880, longitude: 34.8280 },
        { latitude: 31.3820, longitude: 34.8275 },
        { latitude: 31.3760, longitude: 34.8270 },
        { latitude: 31.3700, longitude: 34.8265 },
        { latitude: 31.3640, longitude: 34.8260 },
        { latitude: 31.3580, longitude: 34.8255 },
        { latitude: 31.3520, longitude: 34.8250 },
        { latitude: 31.3460, longitude: 34.8245 },
        { latitude: 31.3400, longitude: 34.8240 },
        { latitude: 31.3340, longitude: 34.8235 },
        { latitude: 31.3280, longitude: 34.8230 },
        { latitude: 31.3220, longitude: 34.8225 },
        { latitude: 31.3160, longitude: 34.8220 },
        { latitude: 31.3100, longitude: 34.8215 },
        { latitude: 31.3040, longitude: 34.8210 },
        { latitude: 31.2980, longitude: 34.8205 },
        { latitude: 31.2920, longitude: 34.8200 },
        { latitude: 31.2860, longitude: 34.8195 },
        { latitude: 31.2800, longitude: 34.8190 },
        { latitude: 31.2740, longitude: 34.8185 },
        { latitude: 31.2680, longitude: 34.8180 },
        { latitude: 31.2620, longitude: 34.8175 },
        { latitude: 31.2560, longitude: 34.8170 },
        { latitude: 31.2500, longitude: 34.8165 },
        { latitude: 31.2440, longitude: 34.8160 },
        { latitude: 31.2380, longitude: 34.8155 },
        { latitude: 31.2320, longitude: 34.8150 },
        { latitude: 31.2260, longitude: 34.8145 },
        { latitude: 31.2200, longitude: 34.8140 },
        { latitude: 31.2140, longitude: 34.8135 },
        { latitude: 31.2080, longitude: 34.8130 },
        { latitude: 31.2020, longitude: 34.8125 },
        { latitude: 31.1960, longitude: 34.8120 },
        { latitude: 31.1900, longitude: 34.8115 },
        { latitude: 31.1840, longitude: 34.8110 },
        { latitude: 31.1780, longitude: 34.8105 },
        { latitude: 31.1720, longitude: 34.8100 },
        { latitude: 31.1660, longitude: 34.8095 },
        { latitude: 31.1600, longitude: 34.8090 },
        { latitude: 31.1540, longitude: 34.8085 },
        { latitude: 31.1480, longitude: 34.8080 },
        { latitude: 31.1420, longitude: 34.8075 },
        { latitude: 31.1360, longitude: 34.8070 },
        { latitude: 31.1300, longitude: 34.8065 },
        { latitude: 31.1240, longitude: 34.8060 },
        { latitude: 31.1180, longitude: 34.8055 },
        { latitude: 31.1120, longitude: 34.8050 },
        { latitude: 31.1060, longitude: 34.8045 },
        { latitude: 31.1000, longitude: 34.8040 },
        { latitude: 31.0940, longitude: 34.8035 },
        { latitude: 31.0880, longitude: 34.8030 },
        { latitude: 31.0820, longitude: 34.8025 },
        { latitude: 31.0760, longitude: 34.8020 },
        { latitude: 31.0700, longitude: 34.8015 },
        { latitude: 31.0640, longitude: 34.8010 },
        { latitude: 31.0580, longitude: 34.8005 },
        { latitude: 31.0520, longitude: 34.8000 },
        { latitude: 31.0460, longitude: 34.7995 },
        { latitude: 31.0400, longitude: 34.7990 },
        { latitude: 31.0340, longitude: 34.7985 },
        { latitude: 31.0280, longitude: 34.7980 },
        { latitude: 31.0220, longitude: 34.7975 },
        { latitude: 31.0160, longitude: 34.7970 },
        { latitude: 31.0100, longitude: 34.7965 },
        { latitude: 31.0040, longitude: 34.7960 },
        { latitude: 30.9980, longitude: 34.7955 },
        { latitude: 30.9920, longitude: 34.7950 },
        { latitude: 30.9860, longitude: 34.7945 },
        { latitude: 30.9800, longitude: 34.7940 },
        { latitude: 30.9740, longitude: 34.7935 },
        { latitude: 30.9680, longitude: 34.7930 },
        { latitude: 30.9620, longitude: 34.7925 },
        { latitude: 30.9560, longitude: 34.7920 },
        { latitude: 30.9500, longitude: 34.7915 },
        { latitude: 30.9440, longitude: 34.7910 },
        { latitude: 30.9380, longitude: 34.7905 },
        { latitude: 30.9320, longitude: 34.7900 },
        { latitude: 30.9260, longitude: 34.7895 },
        { latitude: 30.9200, longitude: 34.7890 },
        { latitude: 30.9140, longitude: 34.7885 },
        { latitude: 30.9080, longitude: 34.7880 },
        { latitude: 30.9020, longitude: 34.7875 },
        { latitude: 30.8960, longitude: 34.7870 },
        { latitude: 30.8900, longitude: 34.7865 },
        { latitude: 30.8840, longitude: 34.7860 },
        { latitude: 30.8780, longitude: 34.7855 },
        { latitude: 30.8720, longitude: 34.7850 },
        { latitude: 30.8660, longitude: 34.7845 },
        { latitude: 30.8600, longitude: 34.7840 },
        { latitude: 30.8540, longitude: 34.7835 },
        { latitude: 30.8480, longitude: 34.7830 },
        { latitude: 30.8420, longitude: 34.7825 },
        { latitude: 30.8360, longitude: 34.7820 },
        { latitude: 30.8300, longitude: 34.7815 },
        { latitude: 30.8240, longitude: 34.7810 },
        { latitude: 30.8180, longitude: 34.7805 },
        { latitude: 30.8120, longitude: 34.7800 },
        { latitude: 30.8060, longitude: 34.7795 },
        { latitude: 30.8000, longitude: 34.7790 },
        { latitude: 30.7940, longitude: 34.7785 },
        { latitude: 30.7880, longitude: 34.7780 },
        { latitude: 30.7820, longitude: 34.7775 },
        { latitude: 30.7760, longitude: 34.7770 },
        { latitude: 30.7700, longitude: 34.7765 },
        { latitude: 30.7640, longitude: 34.7760 },
        { latitude: 30.7580, longitude: 34.7755 },
        { latitude: 30.7520, longitude: 34.7750 },
        { latitude: 30.7460, longitude: 34.7745 },
        { latitude: 30.7400, longitude: 34.7740 },
        { latitude: 30.7340, longitude: 34.7735 },
        { latitude: 30.7280, longitude: 34.7730 },
        { latitude: 30.7220, longitude: 34.7725 },
        { latitude: 30.7160, longitude: 34.7720 },
        { latitude: 30.7100, longitude: 34.7715 },
        { latitude: 30.7040, longitude: 34.7710 },
        { latitude: 30.6980, longitude: 34.7705 },
        { latitude: 30.6920, longitude: 34.7700 },
        { latitude: 30.6860, longitude: 34.7695 },
        { latitude: 30.6800, longitude: 34.7690 },
        { latitude: 30.6740, longitude: 34.7685 },
        { latitude: 30.6680, longitude: 34.7680 },
        { latitude: 30.6620, longitude: 34.7675 },
        { latitude: 30.6560, longitude: 34.7670 },
        { latitude: 30.6500, longitude: 34.7665 },
        { latitude: 30.6440, longitude: 34.7660 },
        { latitude: 30.6380, longitude: 34.7655 },
        { latitude: 30.6320, longitude: 34.7650 },
        { latitude: 30.6260, longitude: 34.7645 },
        { latitude: 30.6200, longitude: 34.7640 },
        { latitude: 30.6140, longitude: 34.7635 },
        { latitude: 30.6080, longitude: 34.7630 },
        { latitude: 30.6020, longitude: 34.7625 },
        { latitude: 30.5960, longitude: 34.7620 },
        { latitude: 30.5900, longitude: 34.7615 },
        { latitude: 30.5840, longitude: 34.7610 },
        { latitude: 30.5780, longitude: 34.7605 },
        { latitude: 30.5720, longitude: 34.7600 },
        { latitude: 30.5660, longitude: 34.7595 },
        { latitude: 30.5600, longitude: 34.7590 },
        { latitude: 30.5540, longitude: 34.7585 },
        { latitude: 30.5480, longitude: 34.7580 },
        { latitude: 30.5420, longitude: 34.7575 },
        { latitude: 30.5360, longitude: 34.7570 },
        { latitude: 30.5300, longitude: 34.7565 },
        { latitude: 30.5240, longitude: 34.7560 },
        { latitude: 30.5180, longitude: 34.7555 },
        { latitude: 30.5120, longitude: 34.7550 },
        { latitude: 30.5060, longitude: 34.7545 },
        { latitude: 30.5000, longitude: 34.7540 },
        { latitude: 30.4940, longitude: 34.7535 },
        { latitude: 30.4880, longitude: 34.7530 },
        { latitude: 30.4820, longitude: 34.7525 },
        { latitude: 30.4760, longitude: 34.7520 },
        { latitude: 30.4700, longitude: 34.7515 },
        { latitude: 30.4640, longitude: 34.7510 },
        { latitude: 30.4580, longitude: 34.7505 },
        { latitude: 30.4520, longitude: 34.7500 },
        { latitude: 30.4460, longitude: 34.7495 },
        { latitude: 30.4400, longitude: 34.7490 },
        { latitude: 30.4340, longitude: 34.7485 },
        { latitude: 30.4280, longitude: 34.7480 },
        { latitude: 30.4220, longitude: 34.7475 },
        { latitude: 30.4160, longitude: 34.7470 },
        { latitude: 30.4100, longitude: 34.7465 },
        { latitude: 31.57, longitude: 34.7 } // Destination sde David

    ];


    function startLocationSimulation(service_Id, driverName, driverPhone) {
        console.log(service_Id);
        console.log(driverName);
        console.log(driverPhone);

        simulationInterval = setInterval(function () {
            console.log('Interval tick - updating location');
            updateLocationOnServer(service_Id, locationUpdates[updateIndex], driverName, driverPhone);
            updateIndex = (updateIndex + 1) % locationUpdates.length;
        }, 1000); // Update every 1/10 second
    }


        /////////////////////SIMULATION ONLY!!////////////////////
    // 14.8.24 נועד רק עבור הצגה של אלמנט המעקב בזמן אמת בכיתה מול הבוחנים


});










