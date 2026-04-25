/* ========================================
   DASHBOARD FUNCTIONALITY
   ======================================== */

let selectedPlan = null;
let apiKey = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

/**
 * Initialize dashboard
 */
function initializeDashboard() {
    // Check if user is logged in
    if (!checkUserLogin()) {
        window.location.href = 'index.html';
        return;
    }

    // Load user profile
    loadUserProfile();

    // Setup navigation
    setupDashboardNavigation();

    // Setup event listeners
    setupEventListeners();

    // Load saved data
    loadSavedData();
}

/**
 * Check if user is logged in
 * @returns {boolean} True if user is logged in
 */
function checkUserLogin() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
        return false;
    }
    
    return true;
}

/**
 * Load user profile
 */
function loadUserProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) return;

    // Set user avatar
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar && user.picture) {
        userAvatar.src = user.picture;
    }

    // Set user name
    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = user.name || user.email;
    }

    // Set email in settings
    const settingsEmail = document.getElementById('settingsEmail');
    if (settingsEmail) {
        settingsEmail.value = user.email;
    }
}

/**
 * Setup dashboard navigation
 */
function setupDashboardNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            menuItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all sections
            document.querySelectorAll('.dashboard-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show selected section
            const sectionId = this.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('active');
            }
        });
    });
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Generate API Key button
    const generateKeyBtn = document.getElementById('generateKeyBtn');
    if (generateKeyBtn) {
        generateKeyBtn.addEventListener('click', handleGenerateKey);
    }

    // Copy Script button
    const copyScriptBtn = document.getElementById('copyScriptBtn');
    if (copyScriptBtn) {
        copyScriptBtn.addEventListener('click', handleCopyScript);
    }

    // Select Plan buttons
    document.querySelectorAll('.select-plan').forEach(btn => {
        btn.addEventListener('click', handleSelectPlan);
    });

    // Payment method radios
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });

    // Pay Now button
    const payNowBtn = document.getElementById('payNowBtn');
    if (payNowBtn) {
        payNowBtn.addEventListener('click', handlePaymentSubmit);
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Save Settings button
    const saveSettingsBtn = document.querySelector('#settings .btn-primary');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', handleSaveSettings);
    }
}

/**
 * Handle Generate API Key
 */
async function handleGenerateKey() {
    const btn = document.getElementById('generateKeyBtn');
    const originalText = btn.textContent;
    
    try {
        btn.disabled = true;
        btn.textContent = 'Generating...';

        // Simulate API call - replace with real backend call
        const newApiKey = generateMockApiKey();
        
        // Save API key
        localStorage.setItem('apiKey', newApiKey);
        apiKey = newApiKey;

        // Update integration script
        updateIntegrationScript(newApiKey);

        // Show success message
        showToast('API Key generated successfully!', 'success');

        // Mark step as completed
        markStepCompleted(2);

        // Move to next step
        setTimeout(() => {
            document.querySelector('[data-section="integration"]').click();
        }, 1000);

    } catch (error) {
        console.error('Error generating API key:', error);
        showToast('Failed to generate API key', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

/**
 * Generate mock API key (replace with backend API call)
 * @returns {string} Generated API key
 */
function generateMockApiKey() {
    const user = JSON.parse(localStorage.getItem('user'));
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `cbp_${user.email.split('@')[0]}_${timestamp}${randomStr}`.toUpperCase();
}

/**
 * Update integration script display
 * @param {string} key - API key
 */
function updateIntegrationScript(key) {
    const scriptElement = document.getElementById('integrationScript');
    if (scriptElement) {
        scriptElement.textContent = `<script src="https://chatbotpro.io/chatbot.js?key=${key}"></script>`;
    }
}

/**
 * Handle Copy Script
 */
function handleCopyScript() {
    const scriptElement = document.getElementById('integrationScript');
    if (scriptElement) {
        const text = scriptElement.textContent;
        copyToClipboard(text);
    }
}

/**
 * Copy to clipboard
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Script copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('Failed to copy', 'error');
    });
}

/**
 * Handle Select Plan
 */
function handleSelectPlan(e) {
    const plan = e.target.getAttribute('data-plan');
    selectPlan(plan);
}

/**
 * Select pricing plan
 * @param {string} plan - Plan name
 */
function selectPlan(plan) {
    selectedPlan = plan;
    
    // Save to localStorage
    localStorage.setItem('selectedPlan', plan);

    // Plan details
    const plans = {
        starter: { name: 'Starter', price: 9999 },
        pro: { name: 'Pro', price: 24999 },
        enterprise: { name: 'Enterprise', price: 99999 }
    };

    const planDetails = plans[plan];

    // Update payment section
    const selectedPlanDisplay = document.getElementById('selectedPlanDisplay');
    const selectedPlanName = document.getElementById('selectedPlanName');
    const selectedPlanAmount = document.getElementById('selectedPlanAmount');

    if (selectedPlanDisplay && selectedPlanName && selectedPlanAmount) {
        selectedPlanName.textContent = planDetails.name;
        selectedPlanAmount.textContent = planDetails.price.toLocaleString('en-IN');
        selectedPlanDisplay.style.display = 'block';
    }

    showToast(`${planDetails.name} plan selected!`, 'success');

    // Navigate to payment section
    setTimeout(() => {
        document.querySelector('[data-section="payment"]').click();
    }, 500);
}

/**
 * Handle Payment Method Change
 */
function handlePaymentMethodChange(e) {
    const method = e.target.value;
    
    // Hide all payment forms
    document.getElementById('cardForm').style.display = 'none';
    document.getElementById('upiForm').style.display = 'none';
    document.getElementById('netbankingForm').style.display = 'none';

    // Show selected form
    if (method === 'card') {
        document.getElementById('cardForm').style.display = 'flex';
    } else if (method === 'upi') {
        document.getElementById('upiForm').style.display = 'flex';
    } else if (method === 'netbanking') {
        document.getElementById('netbankingForm').style.display = 'flex';
    }
}

/**
 * Handle Payment Submit
 */
async function handlePaymentSubmit() {
    if (!selectedPlan) {
        showToast('Please select a plan first', 'error');
        return;
    }

    const btn = document.getElementById('payNowBtn');
    const originalText = btn.textContent;

    try {
        btn.disabled = true;
        btn.textContent = 'Processing Payment...';

        // Validate form
        const formInputs = document.querySelectorAll('.form-section:not([style*="display: none"]) .form-input');
        let isValid = true;

        formInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = 'var(--danger)';
            } else {
                input.style.borderColor = '';
            }
        });

        if (!isValid) {
            showToast('Please fill all fields', 'error');
            btn.disabled = false;
            btn.textContent = originalText;
            return;
        }

        // Simulate payment processing (replace with real payment gateway)
        await simulatePayment();

        // Save payment data
        const paymentData = {
            plan: selectedPlan,
            paymentDate: new Date().toISOString(),
            status: 'active'
        };
        localStorage.setItem('paymentData', JSON.stringify(paymentData));

        showToast('Payment successful! Your chatbot is now active.', 'success');

        // Update UI
        setTimeout(() => {
            // Redirect or show confirmation
            alert('Payment successful! Your chatbot is ready to use.\n\nYour integration script has been updated with your API key.\n\nStart embedding it on your website!');
            window.location.href = 'dashboard.html';
        }, 1500);

    } catch (error) {
        console.error('Payment error:', error);
        showToast('Payment failed. Please try again.', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

/**
 * Simulate payment processing
 * @returns {Promise} Simulated payment
 */
function simulatePayment() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Randomly succeed or fail for demo
            if (Math.random() > 0.1) {
                resolve();
            } else {
                reject(new Error('Payment declined'));
            }
        }, 2000);
    });
}

/**
 * Handle Logout
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('apiKey');
        localStorage.removeItem('selectedPlan');
        localStorage.removeItem('paymentData');

        // Redirect to home
        window.location.href = 'index.html';
    }
}

/**
 * Handle Save Settings
 */
function handleSaveSettings() {
    const inputs = document.querySelectorAll('#settings .form-input');
    const settings = {};

    inputs.forEach(input => {
        const label = input.parentElement.querySelector('label');
        if (label) {
            settings[label.textContent] = input.value;
        }
    });

    // Save settings
    localStorage.setItem('userSettings', JSON.stringify(settings));
    showToast('Settings saved successfully!', 'success');
}

/**
 * Mark step as completed
 * @param {number} stepNumber - Step number
 */
function markStepCompleted(stepNumber) {
    const steps = document.querySelectorAll('.step-card');
    if (steps[stepNumber - 1]) {
        steps[stepNumber - 1].classList.add('completed');
        steps[stepNumber - 1].classList.remove('active');
        
        if (steps[stepNumber]) {
            steps[stepNumber].classList.add('active');
        }
    }
}

/**
 * Load saved data from localStorage
 */
function loadSavedData() {
    // Load API key
    apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
        updateIntegrationScript(apiKey);
    }

    // Load selected plan
    selectedPlan = localStorage.getItem('selectedPlan');

    // Load settings
    const settings = localStorage.getItem('userSettings');
    if (settings) {
        const settingsObj = JSON.parse(settings);
        Object.keys(settingsObj).forEach(key => {
            const input = document.querySelector(`#settings [placeholder*="${key}"]`);
            if (input) {
                input.value = settingsObj[key];
            }
        });
    }
}

/**
 * Show toast notification
 * @param {string} message - Message to show
 * @param {string} type - Type (success, error, info)
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    const styles = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        animation: 'slideInRight 0.3s ease'
    };

    Object.assign(toast.style, styles);

    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        .toast-success {
            background: linear-gradient(135deg, #10b981, #059669);
        }
        .toast-error {
            background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        .toast-info {
            background: linear-gradient(135deg, #3b82f6, #1e40af);
        }
    `;

    if (!document.querySelector('style[data-toast-styles]')) {
        styleElement.setAttribute('data-toast-styles', '');
        document.head.appendChild(styleElement);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
