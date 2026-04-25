/* ========================================
   GOOGLE AUTHENTICATION MODULE
   ======================================== */

// Configuration
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';

let isUserLoggedIn = false;
let currentUser = null;

// Initialize Google Sign-In
window.addEventListener('load', function() {
    if (document.getElementById('googleAuthContainer')) {
        initializeGoogleSignIn();
    }
});

/**
 * Initialize Google Sign-In Button
 */
function initializeGoogleSignIn() {
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false
    });

    // Try to render the button
    try {
        google.accounts.id.renderButton(
            document.getElementById('googleAuthContainer'),
            {
                theme: 'filled_blue',
                size: 'large',
                width: '100%'
            }
        );
    } catch (error) {
        console.log('Google Sign-In button will appear on page.');
    }
}

/**
 * Handle Google Sign-In Response
 * @param {Object} response - JWT response from Google
 */
function handleCredentialResponse(response) {
    // Decode JWT to get user info (in production, verify on backend)
    const token = response.credential;
    const decodedToken = parseJwt(token);
    
    console.log('Logged in user:', decodedToken);

    // Store user data
    currentUser = {
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
        token: token
    };

    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(currentUser));
    localStorage.setItem('token', token);

    isUserLoggedIn = true;

    // Redirect to dashboard
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 500);
}

/**
 * Parse JWT Token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token
 */
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

/**
 * Check if user is logged in
 * @returns {boolean} True if user is logged in
 */
function checkUserStatus() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (user && token) {
        currentUser = JSON.parse(user);
        isUserLoggedIn = true;
        return true;
    }
    return false;
}

/**
 * Get current user
 * @returns {Object|null} Current user object or null
 */
function getCurrentUser() {
    return currentUser;
}

/**
 * Logout user
 */
function logoutUser() {
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('selectedPlan');
    
    // Clear variables
    isUserLoggedIn = false;
    currentUser = null;

    // Sign out from Google
    google.accounts.id.disableAutoSelect();

    // Redirect to home
    window.location.href = 'index.html';
}

/**
 * Verify token with backend (implement on server)
 * @param {string} token - JWT token
 * @returns {Promise} Verification result
 */
async function verifyTokenWithBackend(token) {
    try {
        const response = await fetch('/api/verify-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        });

        const data = await response.json();
        return data.valid;
    } catch (error) {
        console.error('Token verification failed:', error);
        return false;
    }
}

/**
 * Generate API Key for user (integrate with backend)
 * @returns {Promise} Generated API key
 */
async function generateAPIKey() {
    const user = getCurrentUser();
    
    if (!user) {
        console.error('User not logged in');
        return null;
    }

    try {
        const response = await fetch('/api/generate-key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                email: user.email,
                name: user.name
            })
        });

        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('apiKey', data.apiKey);
            return data.apiKey;
        } else {
            console.error('Failed to generate API key:', data.error);
            return null;
        }
    } catch (error) {
        console.error('API key generation error:', error);
        return null;
    }
}

/**
 * Get existing API Key
 * @returns {string|null} API key or null
 */
function getAPIKey() {
    return localStorage.getItem('apiKey') || null;
}

export {
    initializeGoogleSignIn,
    handleCredentialResponse,
    checkUserStatus,
    getCurrentUser,
    logoutUser,
    generateAPIKey,
    getAPIKey,
    verifyTokenWithBackend,
    isUserLoggedIn,
    currentUser
};
