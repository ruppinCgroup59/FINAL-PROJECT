$(document).ready(function () {

    let supplierId = localStorage.getItem('supplierId');
    let supplierName = localStorage.getItem('SupplierUsername');




    // Fetch and render supplier feedback
    if (supplierId) {
        getSupplierFeedback(supplierId);
    } else {
        console.error("SupplierId is missing from localStorage");
    }

    if (supplierName) {
        $('#supplier-name').text(supplierName);
    } else {
        console.error("SupplierName is missing from localStorage");
    }





    // קריאת חוות דעת מהשרת
    function getSupplierFeedback(supplierId) {
        let api = `${server}/api/Feedback?supplier_Id=${supplierId}`;
        ajaxCall("GET", api, "", loadFeedbackSuccess, handleError);
    }

    function loadFeedbackSuccess(feedbacks) {
        if (feedbacks) {
            renderReviews(feedbacks);
        } else {
            console.error("No feedback found or unexpected response format");
        }
    }

    function handleError(err) {
        console.log("Error:", err);
    }




    //רנדור חוות דעת
    function renderReviews(feedbacks) {
        $('#reviews-container').empty();
        feedbacks.forEach(function (review) {
            const reviewHTML = `
            <div class="review" style="border-bottom: 1px solid #ccc; padding: 10px 0; margin-bottom: 10px;">
                <div class="review-header" style="margin-bottom: 5px;">
                    <span class="review-date">${new Date(review.feedbackDate).toLocaleDateString()}</span>
                </div>
                <div class="review-rating" style="margin-bottom: 10px;">
                    ${'★'.repeat(review.rate)}
                </div>
                <div class="review-body">
                    <p>${review.description}</p>
                </div>
            </div>
        `;
            $('#reviews-container').append(reviewHTML);
        });
    }

});


