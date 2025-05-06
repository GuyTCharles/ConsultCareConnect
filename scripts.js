/* ================================
   MODAL FUNCTIONALITY
   ================================ */
// Generic open modal function
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex'; // Show the modal
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

// Generic close modal function
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none'; // Hide the modal
        document.body.style.overflow = ''; // Restore scrolling
    }
}

/**
 * Function to open login modal.
 * If user is logged in, show only the logout button.
 */
function openLoginModal() {
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (loggedInUser) {
        updateLoginModalView(); // Ensure only logout button is visible
    }

    openModal('loginModal'); // Open modal after ensuring correct UI state
}

// Function to close login modal
function closeLoginModal() {
    closeModal('loginModal');
    clearLoginFields();
}

// Open Forgot Password Modal
function openForgotPasswordModal() {
    closeModal('loginModal');
    openModal('forgotPasswordModal');
}

// Close Forgot Password Modal and Redirect
function closeModalAndRedirect() {
    closeModal('forgotPasswordModal');
    clearLoginFields();
}

// Open Signup Modal
function openSignupModal() {
    closeModal('loginModal'); // Close login modal if open
    openModal('signupModal'); // Open signup modal
}

// Attach event listeners for modal buttons (if needed)
document.getElementById('signupButton').addEventListener('click', openSignupModal);
document.querySelector('.modal-close.signup-modal').addEventListener('click', () => closeModal('signupModal'));

/**
 * Function to load the logged-in user's data on page load.
 * Keeps the welcome message visible and ensures only the logout button shows.
 */
function loadUserSession() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const firstLogin = localStorage.getItem('firstLogin'); // Retrieve firstLogin flag
    const usernameDisplay = document.getElementById('usernameDisplay');
    const logoutButton = document.getElementById('logoutButton');
    const loginModal = document.getElementById('loginModal');

    if (loggedInUser) {
        usernameDisplay.textContent = `Hello, ${loggedInUser}`;
        logoutButton.style.display = 'block';

        // Hide the login modal if user is already logged in
        if (loginModal) loginModal.style.display = 'none';

        // Prevent the bounce animation on page refresh
        if (firstLogin === 'true') {
            usernameDisplay.classList.add('zoom-bounce-animation');

            setTimeout(() => {
                usernameDisplay.classList.remove('zoom-bounce-animation');
                localStorage.setItem('firstLogin', 'false'); // Prevent animation from replaying
            }, 1500);
        }
    } else {
        usernameDisplay.textContent = '';
        logoutButton.style.display = 'none';
    }
}

/**
 * Function to handle the "Sign in" button in the Login Modal.
 * Validates input and displays the username on successful login.
 */
function handleLoginNext() {
    const usernameInput = document.getElementById('loginInput');
    const passwordInput = document.getElementById('passwordInput');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const loginError = document.getElementById('loginError');
    const passwordError = document.getElementById('passwordError');
    const logoutButton = document.getElementById('logoutButton');

    // Validation regex
    const usernameRegex = /^[A-Za-z]+\s[A-Za-z]+$/; // First and last name
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Email format
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/; // Password requirements

    // Reset error states
    loginError.textContent = '';
    loginError.style.display = 'none';
    passwordError.textContent = '';
    passwordError.style.display = 'none';
    usernameInput.classList.remove('error');
    passwordInput.classList.remove('error');

    // Validate username or email
    if (!usernameInput.value.trim()) {
        loginError.textContent = 'Please enter your username or email';
        loginError.style.display = 'block';
        usernameInput.classList.add('error');
        return;
    } else if (!usernameRegex.test(usernameInput.value.trim()) && !emailRegex.test(usernameInput.value.trim())) {
        loginError.textContent = 'Enter a valid first and last name (e.g., John Doe) or a valid email address (e.g., example@domain.com)';
        loginError.style.display = 'block';
        usernameInput.classList.add('error');
        return;
    }

    // Validate password
    if (!passwordInput.value.trim()) {
        passwordError.textContent = 'Please enter your password';
        passwordError.style.display = 'block';
        passwordInput.classList.add('error');
        return;
    } else if (!passwordRegex.test(passwordInput.value.trim())) {
        passwordError.textContent = 'Password must be at least 8 characters long, include 1 uppercase letter, and 1 number.';
        passwordError.style.display = 'block';
        passwordInput.classList.add('error');
        return;
    }

    // Save user session and update display
    const loggedInUser = usernameInput.value.trim();
    localStorage.setItem('loggedInUser', loggedInUser);
    localStorage.setItem('firstLogin', 'true'); // Store flag for first-time login

    // Show the username on the main screen
    usernameDisplay.textContent = `Hello, ${loggedInUser}`;
    logoutButton.style.display = 'block'; // Show logout button

    // Add the bounce animation only on first login
    usernameDisplay.classList.add('zoom-bounce-animation');

    // Remove the animation class after animation completes (prevent repeating)
    setTimeout(() => {
        usernameDisplay.classList.remove('zoom-bounce-animation');
        localStorage.setItem('firstLogin', 'false'); // Prevent animation on page reload
    }, 1500);

    // Clear fields after login & close modal
    clearLoginFields();
    closeLoginModal();

    // Ensure the correct modal state updates
    updateLoginModalView();
}

/**
 * Function to handle Google and Apple login buttons.
 * Simulates login via social platforms and applies zoom-bounce animation.
 */
function handleSocialLogin(provider) {
    const usernameDisplay = document.getElementById('usernameDisplay');
    const logoutButton = document.getElementById('logoutButton');
    const providerEmail = provider === 'Google' ? 'user@gmail.com' : 'user@icloud.com';

    // Save user session and mark as first-time login
    localStorage.setItem('loggedInUser', providerEmail);
    localStorage.setItem('firstLogin', 'true'); // Ensure animation plays once

    // Update UI to show username
    usernameDisplay.textContent = `Hello, ${providerEmail}`;
    logoutButton.style.display = 'block'; // Show logout button

    // Add zoom-bounce animation (same as handleLoginNext)
    if (localStorage.getItem('firstLogin') === 'true') {
        usernameDisplay.classList.add('zoom-bounce-animation');

        setTimeout(() => {
            usernameDisplay.classList.remove('zoom-bounce-animation');
            localStorage.setItem('firstLogin', 'false'); // Prevent animation replay
        }, 1500);
    }

    // Close the modal after successful login
    closeLoginModal();

    // Ensure correct UI updates
    updateLoginModalView();
}

/**
 * Function to handle the logout button.
 * Clears the session, resets UI, and redirects user to the main screen.
 */
function handleLogout() {
    // Clear stored user session
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('socialLogin'); // If social login was used

    // Get UI elements
    const usernameDisplay = document.getElementById('usernameDisplay');
    const logoutButton = document.getElementById('logoutButton');
    const loginButton = document.getElementById('loginButton');

    // Hide username from the main screen
    if (usernameDisplay) {
        usernameDisplay.textContent = '';
    }

    // Hide logout button and show login button
    if (logoutButton) {
        logoutButton.style.display = 'none';
    }
    if (loginButton) {
        loginButton.style.display = 'block';
    }

    // Close all open modals
    document.querySelectorAll('.modal-container').forEach(modal => {
        modal.style.display = 'none';
    });

    // Restore scrolling if it was disabled
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    // Clear input fields in the login modal
    clearLoginFields();

    // Reset the login modal state
    updateLoginModalView();

    // Redirect user to the main screen (Homepage)
    setTimeout(() => {
        window.location.href = 'homepage.html'; // Change to your actual homepage URL
    }, 100); // Small delay to ensure UI updates before redirecting
}


/**
 * Function to update the login modal view based on login status.
 */
function updateLoginModalView() {
    const loggedInUser = localStorage.getItem('loggedInUser');

    // Elements to hide when logged in
    const loginTitle = document.querySelector('.modal-title'); // "Log in to ConsultCareConnect" text
    const divider = document.querySelector('.divider'); // The divider line
    const loginOrText = document.querySelector('.divider p'); // "or" text inside the divider
    const usernameInput = document.getElementById('loginInput');
    const passwordInput = document.getElementById('passwordInput');
    const passwordWrapper = document.querySelector('.password-wrapper'); // Includes eye icon
    const loginButton = document.getElementById('loginButton');
    const forgotPasswordButton = document.querySelector('.secondary-button');
    const signUpOption = document.querySelector('.sign-up');
    const googleLoginButton = document.getElementById('googleLoginButton');
    const appleLoginButton = document.getElementById('appleLoginButton');
    const logoutButton = document.getElementById('logoutButton');

    // 🛑 Find and hide the **Username or Email** label
    const usernameLabel = document.querySelector("label[for='loginInput']");

    // 🛑 Hide any potential error messages
    const loginError = document.getElementById('loginError');
    const passwordError = document.getElementById('passwordError');

    if (loggedInUser) {
        // Hide everything except the logout button
        if (loginTitle) loginTitle.style.display = 'none';
        if (divider) divider.style.display = 'none'; // Hide divider
        if (loginOrText) loginOrText.style.display = 'none';
        if (usernameLabel) usernameLabel.style.display = 'none'; // Hide the "Username or Email" label
        if (usernameInput) usernameInput.style.display = 'none';
        if (passwordInput) passwordInput.style.display = 'none';
        if (passwordWrapper) passwordWrapper.style.display = 'none'; // Hide eye icon along with password input
        if (loginButton) loginButton.style.display = 'none';
        if (forgotPasswordButton) forgotPasswordButton.style.display = 'none';
        if (signUpOption) signUpOption.style.display = 'none';
        if (googleLoginButton) googleLoginButton.style.display = 'none';
        if (appleLoginButton) appleLoginButton.style.display = 'none';

        // Hide error messages
        if (loginError) {
            loginError.style.display = 'none';
            loginError.textContent = ''; // Clear error message
        }
        if (passwordError) {
            passwordError.style.display = 'none';
            passwordError.textContent = ''; // Clear error message
        }

        // Show only the logout button
        if (logoutButton) logoutButton.style.display = 'block';

    } else {
        // Show everything again when logged out
        if (loginTitle) loginTitle.style.display = 'block';
        if (divider) {
            divider.style.display = 'flex'; // Ensure the divider is visible again
            divider.style.alignItems = 'center'; // Ensure the divider and text are centered properly
        }
        if (loginOrText) loginOrText.style.display = 'block';
        if (usernameLabel) usernameLabel.style.display = 'block'; // Show the label again when logged out
        if (usernameInput) usernameInput.style.display = 'block';
        if (passwordInput) passwordInput.style.display = 'block';
        if (passwordWrapper) passwordWrapper.style.display = 'flex'; // Show eye icon along with password input
        if (loginButton) loginButton.style.display = 'block';
        if (forgotPasswordButton) forgotPasswordButton.style.display = 'block';
        if (signUpOption) signUpOption.style.display = 'block';
        if (googleLoginButton) googleLoginButton.style.display = 'block';
        if (appleLoginButton) appleLoginButton.style.display = 'block';

        // Hide the logout button
        if (logoutButton) logoutButton.style.display = 'none';
    }
}

/**
 * Function to clear the username and password input fields.
 */
function clearLoginFields() {
    document.getElementById('loginInput').value = ''; // Clear username field
    document.getElementById('passwordInput').value = ''; // Clear password field
}

/**
 * Initialize the page on load.
 */
document.addEventListener('DOMContentLoaded', () => {
    loadUserSession(); // Ensures username persists after refresh

    // Attach event listeners
    document.getElementById('loginButton').addEventListener('click', handleLoginNext);
    document.getElementById('googleLoginButton').addEventListener('click', () => handleSocialLogin('Google'));
    document.getElementById('appleLoginButton').addEventListener('click', () => handleSocialLogin('Apple'));
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
});

/**
 * Function to handle the "Next" button in the Forgot Password Modal.
 * Validates input and switches to the Login Modal with pre-filled username or email.
 */
function handleForgotPasswordNext() {
    const forgotPasswordInput = document.getElementById('forgotPasswordInput');
    const forgotPasswordError = document.getElementById('forgotPasswordError');

    // Reset error state
    forgotPasswordError.textContent = '';
    forgotPasswordError.style.display = 'none';
    forgotPasswordInput.classList.remove('error');

    // Validation regex
    const nameRegex = /^[A-Za-z]+\s[A-Za-z]+$/; // Validates "First Last" format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Validates proper email format

    const inputValue = forgotPasswordInput.value.trim();

    // Validate the input field
    if (!inputValue) {
        forgotPasswordError.textContent = 'Please enter your username or email';
        forgotPasswordError.style.display = 'block'; // Show the error message
        forgotPasswordInput.classList.add('error'); // Highlight the input field
        return;
    }

    // Check if input matches name or email format
    if (!nameRegex.test(inputValue) && !emailRegex.test(inputValue)) {
        forgotPasswordError.textContent = 'Enter a valid first and last name (e.g., John Doe) or a valid email address (e.g., example@domain.com)';
        forgotPasswordError.style.display = 'block'; // Show the error message
        forgotPasswordInput.classList.add('error'); // Highlight the input field
        return;
    }

    // If input is valid, proceed
    const loginInput = document.getElementById('loginInput');
    const passwordError = document.getElementById('passwordError');

    loginInput.value = inputValue; // Pre-fill the username or email field in the Login Modal

    // Update password field's error message in Login Modal
    passwordError.textContent = 'Enter a new password';
    passwordError.style.display = 'block'; // Show new password instruction

    // Close Forgot Password Modal and Open Login Modal
    closeModal('forgotPasswordModal');
    openModal('loginModal');
}

/**
 * Function to handle valid input for username or email.
 * @param {string} inputValue - The value to pre-fill in the login modal.
 * @param {string} passwordErrorText - The error text for the password field in the login modal.
 */
function handleValidInput(inputValue, passwordErrorText) {
    const loginInput = document.getElementById('loginInput');
    const passwordError = document.getElementById('passwordError');

    loginInput.value = inputValue; // Pre-fill the username or email field in the Login Modal

    // Update password field's error message in the Login Modal
    passwordError.textContent = passwordErrorText;
    passwordError.style.display = 'block'; // Show the password error

    // Close the Forgot Password Modal and open the Login Modal
    closeModal('forgotPasswordModal');
    openModal('loginModal');
}

/**
 * Input event listener for the login modal's username input field.
 * Clears error messages and updates field styling when the user starts typing.
 */
document.getElementById('loginInput').addEventListener('input', function () {
    const loginError = document.getElementById('loginError');
    this.classList.remove('error');
    this.style.borderColor = '#1d9bf0'; // Blue border color
    loginError.textContent = '';
    loginError.style.display = 'none';
});

/**
 * Input event listener for the login modal's password input field.
 * Clears error messages and updates field styling when the user starts typing.
 */
document.getElementById('passwordInput').addEventListener('input', function () {
    const passwordError = document.getElementById('passwordError');
    this.classList.remove('error');
    this.style.borderColor = '#1d9bf0'; // Blue border color
    passwordError.textContent = '';
    passwordError.style.display = 'none';
});

/**
 * Input event listener for the forgot password input field.
 * Clears error messages and updates field styling when the user starts typing.
 */
document.getElementById('forgotPasswordInput').addEventListener('input', function () {
    const forgotPasswordError = document.getElementById('forgotPasswordError');
    this.classList.remove('error'); // Remove error styling
    forgotPasswordError.textContent = ''; // Clear error message
    forgotPasswordError.style.display = 'none'; // Hide the error message
    this.style.borderColor = '#1d9bf0'; // Change input border color to blue
});

/**
 * Toggle password visibility in the Login Modal.
 */
document.getElementById('eyeIcon').addEventListener('click', function () {
    const passwordInput = document.getElementById('passwordInput');
    const eyeIcon = document.getElementById('eyeIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    }
});

// Event listeners
document.querySelector('.secondary-button').addEventListener('click', openForgotPasswordModal);
document.getElementById('forgotPasswordNext').addEventListener('click', handleForgotPasswordNext);
document.getElementById('loginButton').addEventListener('click', handleLoginNext);
document.querySelector('.modal-close.forgot-password-modal').addEventListener('click', closeModalAndRedirect);

/* ==========================================================
   HANDLE SIGNUP FORM SUBMISSION
========================================================== */
function handleSignup() {
    const nameInput = document.getElementById('signupNameInput');
    const emailInput = document.getElementById('signupEmailInput');
    const passwordInput = document.getElementById('signupPasswordInput');

    // Error message elements
    const nameError = document.getElementById('signupNameError');
    const emailError = document.getElementById('signupEmailError');
    const passwordError = document.getElementById('signupPasswordError');

    // Clear previous errors
    clearErrors(nameInput, nameError);
    clearErrors(emailInput, emailError);
    clearErrors(passwordInput, passwordError);

    let hasError = false;

    // FULL NAME VALIDATION
    const nameRegex = /^[A-Za-z]+ [A-Za-z]+$/; // Require first and last name
    if (!nameInput.value.trim()) {
        showError(nameInput, nameError, 'Please enter your full name');
        hasError = true;
    } else if (!nameRegex.test(nameInput.value.trim())) {
        showError(nameInput, nameError, 'Enter a valid first and last name (e.g., John Doe)');
        hasError = true;
    }

    // EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
    if (!emailInput.value.trim()) {
        showError(emailInput, emailError, 'Please enter your email address');
        hasError = true;
    } else if (!emailRegex.test(emailInput.value.trim())) {
        showError(emailInput, emailError, 'Enter a valid email address (e.g., example@domain.com)');
        hasError = true;
    }

    // PASSWORD VALIDATION
    if (!passwordInput.value.trim()) {
        showError(passwordInput, passwordError, 'Please enter your password');
        hasError = true;
    } else if (passwordInput.value.trim().length < 8) {
        showError(passwordInput, passwordError, 'Password must be at least 8 characters long, 1 uppercase letter, and 1 number.');
        hasError = true;
    }

    // STOP EXECUTION IF THERE ARE ERRORS
    if (hasError) return;

    // CLEAR INPUT FIELDS AFTER SUCCESSFUL SIGNUP
    nameInput.value = '';
    emailInput.value = '';
    passwordInput.value = '';

    // CLOSE SIGNUP MODAL AND OPEN REGISTRATION COMPLETE MODAL
    closeModal('signupModal');
    openModal('registrationCompleteModal');
}

// EVENT LISTENER FOR SIGNUP BUTTON
document.getElementById('signupButton').addEventListener('click', handleSignup);

/* ==========================================================
   EVENT LISTENERS FOR REGISTRATION COMPLETE MODAL
========================================================== */
document.getElementById('loginNowButton').addEventListener('click', function () {
    closeModal('registrationCompleteModal'); // Close registration modal
    openModal('loginModal'); // Open login modal
});

document.getElementById('maybeLaterButton').addEventListener('click', function () {
    closeModal('registrationCompleteModal'); // Just close the modal
});

/* ==========================================================
   CLOSE BUTTON FUNCTIONALITY FOR REGISTRATION COMPLETE MODAL
========================================================== */
document.getElementById('closeRegistrationModal').addEventListener('click', function () {
    closeModal('registrationCompleteModal');
});

/* ==========================================================
   ERROR HANDLING FUNCTIONS
========================================================== */

/**
 * Show error message for a specific input field
 */
function showError(input, errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block'; // Show error message
    input.classList.add('error'); // Highlight input field in red
}

/**
 * Clear error message and styling for a specific input field
 */
function clearErrors(input, errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none'; // Hide error message
    input.classList.remove('error'); // Remove red border
}

/**
 * Add event listeners to clear errors when typing
 */
function addInputListeners(input, errorElement) {
    input.addEventListener('focus', function () {
        this.style.borderColor = '#1d9bf0'; // Turn input border blue on focus
    });

    input.addEventListener('input', function () {
        clearErrors(this, errorElement); // Clear error message when typing
        this.style.borderColor = '#1d9bf0'; // Ensure input border stays blue
    });

    input.addEventListener('blur', function () {
        this.style.borderColor = ''; // Reset border color on blur
    });
}

// APPLY LISTENERS TO ALL INPUTS
addInputListeners(
    document.getElementById('signupNameInput'),
    document.getElementById('signupNameError')
);
addInputListeners(
    document.getElementById('signupEmailInput'),
    document.getElementById('signupEmailError')
);
addInputListeners(
    document.getElementById('signupPasswordInput'),
    document.getElementById('signupPasswordError')
);

/* ==========================================================
   TOGGLE PASSWORD VISIBILITY
========================================================== */
document.getElementById('signupEyeIcon').addEventListener('click', function () {
    const passwordInput = document.getElementById('signupPasswordInput');
    const eyeIcon = document.getElementById('signupEyeIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    }
});

/* ==========================================================
   SIGN-UP MODAL MANAGEMENT
========================================================== */
/**
 * Function to open a modal.
 * @param {string} modalId - The ID of the modal to open.
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex'; // Show the modal
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

/**
 * Function to close a modal.
 * @param {string} modalId - The ID of the modal to close.
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none'; // Hide the modal
        document.body.style.overflow = ''; // Restore scrolling
    }
}

/* ================================
   CARD BUTTON FUNCTIONALITY
   ================================ */
/**
 * Adds click events to the buttons inside the feature cards.
 * Redirects users to their respective pages based on the button clicked.
 * Introduces a small delay to ensure smooth transition and avoid script execution issues.
 */
document.querySelectorAll('.feature-cards .card button').forEach((button) => {
    button.addEventListener('click', (event) => {
        const action = event.target.textContent.trim();
        const delay = 100; // 100ms delay for smooth transitions

        switch (action) {
            case 'Book Appointment':
                console.log("Navigating to consultation-scheduling page...");
                setTimeout(() => {
                    window.location.href = 'scheduling.html';
                }, delay);
                break;

            case 'Add or View Records':
                console.log("Navigating to medical-records page...");
                setTimeout(() => {
                    window.location.href = 'medical-records.html';
                }, delay);
                break;

            case 'Start Assessment':
                console.log("Navigating to symptoms-checker page...");
                setTimeout(() => {
                    window.location.href = 'symptoms-checker.html';
                }, delay);
                break;

            default:
                console.error('Unrecognized action:', action);
        }
    });
});

// Event listeners for footer modals
document.querySelectorAll('.footer-links a').forEach((link) => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const modalId = event.target.getAttribute('onclick').match(/'(.*?)'/)[1]; // Extract modal ID
        openModal(modalId);
    });
});

// Event listeners for closing generic modals
document.querySelectorAll('.modal-close.generic-modal').forEach((button) => {
    button.addEventListener('click', (event) => {
        const modal = button.closest('.modal-overlay');
        if (modal) {
            closeModal(modal.id);
        }
    });
});

/* ================================
   LIGHT & DARK MODE TOGGLE SCRIPT
   ================================ */
document.addEventListener("DOMContentLoaded", function () {
    const toggleSwitch = document.getElementById("themeToggle");

    if (!toggleSwitch) {
        console.error("Theme toggle switch not found!");
        return;
    }

    // Retrieve theme from localStorage and apply it
    const isDarkMode = localStorage.getItem("theme") === "dark";
    applyTheme(isDarkMode);

    // Ensure toggle switch reflects current mode
    toggleSwitch.checked = isDarkMode;

    // Toggle theme on user interaction
    toggleSwitch.addEventListener("change", function () {
        const darkModeEnabled = this.checked;
        applyTheme(darkModeEnabled);
        localStorage.setItem("theme", darkModeEnabled ? "dark" : "light");
    });
});

/* ================================
   INITIALIZATION
   ================================ */
document.addEventListener('DOMContentLoaded', () => {
    console.log('ConsultCareConnect page initialized.');
});