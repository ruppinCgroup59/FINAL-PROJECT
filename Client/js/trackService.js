$(document).ready(function () {

    let supplierLat = 0; // Initialize with a default value
    let supplierLng = 0; // Initialize with a default value
    let map;
    var supplierMarker;
    let animationInterval; // Declare animationInterval here
    let toLat = 0; // Initialize with default value
    let toLng = 0; // Initialize with default value
    const arrivalThreshold = 1.5; // Threshold distance in km 

    // Handle form submission
    $('#tracking-form').on('submit', function (e) {
        e.preventDefault(); // Prevent form from submitting the traditional way
        let service_Id = $('#tracking-number').val();

        if (service_Id) {
            getServiceActiveById(service_Id);
        } else {
            showAlert("הכנס מספר מעקב.");
        }
    });

    // Fetch service data to check if it is active
    function getServiceActiveById(service_Id) {
        let api = `${server}/api/Services/${service_Id}`;
        ajaxCall("GET", api, "", function (service) {
            if (service.isActive) {
                localStorage.setItem('service_Id', service_Id);
                window.location.href = "tracking.html";
            } else {
                showAlert("ההובלה לא פעילה");
            }
        }, function (err) {
            console.log("Error fetching service:", err);
            alert("Error checking service status. Please try again.");
        });
    }

    // Check if on tracking.html page and fetch supplier location
    if (window.location.pathname.endsWith('tracking.html')) {
        let service_Id = localStorage.getItem('service_Id');
        if (service_Id) {
            startLiveTracking(service_Id);
        } else {
            showAlert("No tracking number found. Please go back and enter a tracking number.");
        }
    }

    // Fetch supplier location from the server
    function getSupplierLocation(service_Id) {
        let api = `${server}/api/SupplierLocations/${service_Id}`;
        ajaxCall("GET", api, "", getSLSCB, getSLECB);
    }

    // Handle successful response for supplier location
    function getSLSCB(SL) {
        let driverName = SL.driverName;
        let driverPhone = SL.driver_Phone;
        let newLat = parseFloat(SL.latitude);
        let newLng = parseFloat(SL.longitude);

        document.getElementById("driverName").innerHTML = driverName;
        document.getElementById("driverPhone").innerHTML = driverPhone;

        // Fetch service addresses
        getServiceAddById(SL.serviceId); // Assuming serviceId is present in SL

        // Animate the marker to the new position only if coordinates have changed
        if (newLat !== supplierLat || newLng !== supplierLng) {
            animateMarker(newLat, newLng);
            checkArrival(newLat, newLng, toLat, toLng);
        }
    }

    // Handle errors
    function getSLECB(err) {
        console.log("Error fetching supplier location:", err);
    }

    // Fetch service addresses from the server
    function getServiceAddById(service_Id) {
        let api = `${server}/api/Services/${service_Id}`;
        ajaxCall("GET", api, "", getServiceAddSCB, getServiceAddECB);
    }

    // Handle successful response for service addresses
    function getServiceAddSCB(service) {
        const fromAddress = service.from;
        const toAddress = service.to;

        // Convert addresses to coordinates and initialize map
        geocodeAddress(fromAddress, toAddress, supplierLat, supplierLng);
    }

    // Handle errors
    function getServiceAddECB(err) {
        console.log("Error fetching service addresses:", err);
    }

    // Convert addresses to coordinates
    function geocodeAddress(fromAddress, toAddress, supplierLat, supplierLng) {
        const geocoder = new google.maps.Geocoder();

        // Convert "from" address
        geocoder.geocode({ address: fromAddress }, function (results, status) {
            if (status === 'OK') {
                const fromLat = results[0].geometry.location.lat();
                const fromLng = results[0].geometry.location.lng();

                // Convert "to" address
                geocoder.geocode({ address: toAddress }, function (results, status) {
                    if (status === 'OK') {
                        toLat = results[0].geometry.location.lat();
                        toLng = results[0].geometry.location.lng();

                        // Initialize or update the map with the locations
                        initMap(fromLat, fromLng, toLat, toLng, supplierLat, supplierLng);
                    } else {
                        console.error('Geocode was not successful for the "to" address:', status);
                    }
                });
            } else {
                console.error('Geocode was not successful for the "from" address:', status);
            }
        });
    }

    // Initialize or update map with coordinates
    function initMap(fromLat, fromLng, toLat, toLng, supplierLat, supplierLng) {
        // Debugging: Check the coordinates before using them
        console.log('Initializing map with:');
        console.log('From Lat:', fromLat, 'From Lng:', fromLng);
        console.log('To Lat:', toLat, 'To Lng:', toLng);
        console.log('Supplier Lat:', supplierLat, 'Supplier Lng:', supplierLng);

        // Validate coordinates
        if (isNaN(fromLat) || isNaN(fromLng) || isNaN(toLat) || isNaN(toLng) || isNaN(supplierLat) || isNaN(supplierLng)) {
            console.error('Invalid coordinates provided.');
            return;
        }

        // Initialize map only if it's not already initialized
        if (!map) {
            let mapOptions = {
                center: new google.maps.LatLng(supplierLat, supplierLng),
                zoom: 15
            };
            map = new google.maps.Map(document.getElementById("map"), mapOptions);
        }

        // Update map center to supplier's new location
        map.setCenter(new google.maps.LatLng(supplierLat, supplierLng));

        // Add or update markers on the map
        new google.maps.Marker({
            position: { lat: fromLat, lng: fromLng },
            map: map,
            title: "From Location",
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });

        new google.maps.Marker({
            position: { lat: toLat, lng: toLng },
            map: map,
            title: "To Location",
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });

        // Add or update supplier marker with truck icon
        const truckIcon = 'https://maps.google.com/mapfiles/kml/shapes/truck.png';
        if (supplierMarker) {
            supplierMarker.setPosition(new google.maps.LatLng(supplierLat, supplierLng));
        } else {
            supplierMarker = new google.maps.Marker({
                position: { lat: supplierLat, lng: supplierLng },
                map: map,
                title: "Supplier's Location",
                icon: truckIcon // Use truck icon
            });
        }
    }

    // Smoothly animate marker to new location using linear interpolation
    function animateMarker(newLat, newLng) {
        if (animationInterval) {
            clearInterval(animationInterval);
        }

        const steps = 60; // Number of animation steps (increase for smoother)
        const delay = 35; // Delay between steps in milliseconds (~60 FPS)

        const latStep = (newLat - supplierLat) / steps;
        const lngStep = (newLng - supplierLng) / steps;

        let currentStep = 0;

        animationInterval = setInterval(function () {
            supplierLat += latStep;
            supplierLng += lngStep;

            // Debugging: Check intermediate values
            console.log(`Animating to: ${supplierLat}, ${supplierLng}`);

            if (supplierMarker) {
                supplierMarker.setPosition(new google.maps.LatLng(supplierLat, supplierLng));
                map.setCenter(new google.maps.LatLng(supplierLat, supplierLng));
            } else {
                console.error("Supplier marker is undefined.");
                clearInterval(animationInterval); // Stop animation if marker is undefined
            }

            currentStep++;
            if (currentStep >= steps) {
                clearInterval(animationInterval);
                supplierLat = newLat;
                supplierLng = newLng;
            }
        }, delay);
    }

    // Start live tracking
    function startLiveTracking(service_Id) {
        // Initial location fetch
        getSupplierLocation(service_Id);

        // Update every second
        setInterval(function () {
            getSupplierLocation(service_Id);
        }, 1000); // 1 second
    }

    // AJAX call function
    function ajaxCall(method, url, data, successCB, errorCB) {
        $.ajax({
            type: method,
            url: url,
            data: data,
            contentType: "application/json",
            success: successCB,
            error: errorCB
        });
    }

    // Calculate distance between two coordinates using Haversine formula
    function calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }

    // Check if the supplier has arrived at the destination
    function checkArrival(supplierLat, supplierLng, toLat, toLng) {
        let service_Id = localStorage.getItem('service_Id');
        const distance = calculateDistance(supplierLat, supplierLng, toLat, toLng);
        if (distance <= arrivalThreshold) {
            alert("ההובלה הגיעה ליעד והסתיימה");
            isActiveTrackingFalse(service_Id);
            putServiceCompleted(service_Id);
            window.location.href = "MAIN.html";
        }
    }

    function isActiveTrackingFalse(service_Id) {
        const api = `${server}/api/Services/isActive?service_Id=${service_Id}&isActive=false`;
        ajaxCall("PUT", api, null, putisActiveTrackingFSCB, putisActiveTrackingFECB);
    }

    function putisActiveTrackingFSCB(response) {
        console.log('Service stopped successfully:', response);
    }

    function putisActiveTrackingFECB(xhr) {
        const errorMessage = xhr.responseText || 'An error occurred';
        console.log('Error stopping service:', errorMessage);
        showAlert(errorMessage);
    }

    function putServiceCompleted(service_Id) {
        const api = `${server}/api/Services/complete?service_Id=${service_Id}&complete=true`;
        ajaxCall("PUT", api, null, putServiceCompletedSCB, putServiceCompletedECB);
    }

    function putServiceCompletedSCB(response) {
        console.log('Service completed successfully:', response);
    }

    function putServiceCompletedECB(xhr) {
        var errorMessage = xhr.responseText || 'An error occurred';
        console.log('Error stopping service:', errorMessage);
        showAlert(errorMessage);
    }
});

