$(document).ready(function () {
    let username = localStorage.getItem('SupplierUsername');

    // Fetch and render supplier details
    getSuppliersByUsername(username);

    // Initialize rating data
    let ratings = {
        total: 0,
        count: 0,
        breakdown: [0, 0, 0, 0, 0]
    };

    // Load existing feedback from server
    loadFeedback();

    // Render initial ratings
    renderRatings();

    // Add event listeners for rating stars
    const rateStars = document.querySelectorAll('#rate-stars a');
    rateStars.forEach(star => {
        star.addEventListener('click', function (event) {
            event.preventDefault();
            const value = parseInt(this.getAttribute('data-value'));
            rateStars.forEach(s => s.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Submit new feedback
    $('#submit-review').on('click', function () {
        const reviewDescription = $('#review-description').val();
        const reviewRating = $('#rate-stars a.active').data('value') || 0;

        if (reviewDescription && reviewRating) {
            submitFeedback(reviewDescription, reviewRating);
        } else {
            showAlert('Please provide a rating and a review text.');
        }
    });


    function getSuppliersByUsername(username) {
        let api = `${server}/api/feedback/supplier/${username}`;
        ajaxCall("GET", api, "", renderSupplier, handleError);
    }

    function renderSupplier(supplier) {
        $('#supplierCname').text(supplier.company_name);
        localStorage.setItem('supplierId', supplier.id);
    }

    function loadFeedback() {
        let supplierId = localStorage.getItem('supplierId');
        if (supplierId) {
            let api = `${server}/api/feedback/${supplierId}`;
            ajaxCall("GET", api, "", loadFeedbackSuccess, handleError);
        }
    }

    function loadFeedbackSuccess(response) {
        if (response && response.feedback) {
            let feedback = response.feedback;
            ratings.total = feedback.totalRating;
            ratings.count = feedback.count;
            ratings.breakdown = feedback.breakdown;
            renderRatings();
            renderReviews(feedback.reviews);
        }
    }

    function submitFeedback(text, description, rating) {
        let supplierId = localStorage.getItem('supplierId');
        if (supplierId) {
            let api = `${server}/api/feedback/${supplierId}`;
            let feedback = {
                description: description,
                rating: rating,
                date: new Date().toISOString()
            };
            ajaxCall("POST", api, JSON.stringify(feedback), feedbackSubmitSuccess, handleError);
        }
    }

    function feedbackSubmitSuccess(response) {
        $('#review-description').val('');
        $('#rate-stars a').removeClass('active');
        loadFeedback(); // Refresh the feedback
    }


    //רנדור חוות דעת למסך
    function renderRatings() {
        const averageRating = ratings.count ? (ratings.total / ratings.count).toFixed(1) : 0;
        document.getElementById('average-rating').innerText = `מדורג ${averageRating} מתוך 5`;

        const starRating = document.getElementById('star-rating');
        starRating.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('a');
            star.innerHTML = '<i class="fas fa-star"></i>';
            if (i <= Math.round(averageRating)) {
                star.classList.add('active');
            }
            starRating.appendChild(star);
        }

        const ratingBreakdown = document.getElementById('rating-breakdown');
        ratingBreakdown.innerHTML = '';
        const breakdown = ['5 ', '4 ', '3 ', '2 ', '1 '];
        for (let i = 0; i < 5; i++) {
            const percentage = ratings.count ? ((ratings.breakdown[4 - i] / ratings.count) * 100).toFixed(1) : 0;
            ratingBreakdown.innerHTML += `
                <div class="rating-list">
                    <div class="rating-list-left text-black">${breakdown[i]}</div>
                    <div class="rating-list-center">
                        <div class="progress">
                            <div style="width: ${percentage}%" class="progress-bar bg-primary" role="progressbar">
                                <span class="sr-only">${percentage}% Complete</span>
                            </div>
                        </div>
                    </div>
                    <div class="rating-list-right text-black">${percentage}%</div>
                </div>
            `;
        }
    }

    function renderReviews(reviews) {
        $('#reviews-container').empty();
        reviews.forEach(function (review) {
            const reviewHTML = `
                <div class="review">
                    <div class="review-header">
                        <span class="review-rating">${'★'.repeat(review.rating)}</span>
                        <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <div class="review-body">
                        <p>${review.description}</p>
                    </div>
                </div>
            `;
            $('#reviews-container').append(reviewHTML);
        });
    }

    function handleError(err) {
        console.log("Error:", err);
    }
});     