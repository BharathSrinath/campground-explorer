(function () {
    'use strict';

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.validated-form');

    // Loop over them and prevent submission
    Array.from(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            // Check validity of the form
            let isValid = form.checkValidity();

            // Check if the Mapbox search box has a value
            const locationInput = document.getElementById('location-input');
            const locationWrapper = document.getElementById('location-wrapper');
            const locationValue = locationInput.value;

            if (!locationValue) {
                isValid = false; // Mark the form as invalid
                locationWrapper.classList.add('is-invalid'); // Add invalid class for red border
                locationWrapper.classList.remove('is-valid'); // Remove valid class if present
            } else {
                locationWrapper.classList.remove('is-invalid'); // Remove invalid class if valid
                locationWrapper.classList.add('is-valid'); // Add valid class
            }

            // If the form is not valid, prevent submission
            if (!isValid) {
                event.preventDefault();
                event.stopPropagation();
            }

            form.classList.add('was-validated'); // Bootstrap validation class
        }, false);
    });
})();