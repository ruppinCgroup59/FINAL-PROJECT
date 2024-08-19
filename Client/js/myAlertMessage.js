// Alert Message
function showAlert(message) {
    const alertBox = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message;
    alertBox.style.display = 'block';
}

function closeAlert() {
    const alertBox = document.getElementById('customAlert');
    alertBox.style.display = 'none';
}




// Success Message
function ShowSuccess(message) {
    const successBox = document.getElementById('customSuccess');
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    successBox.style.display = 'block';
}

function CloseSuccess() {
    const successBox = document.getElementById('customSuccess');
    successBox.style.display = 'none';
}