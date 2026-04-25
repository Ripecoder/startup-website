/* ========================================
   MAIN LANDING PAGE SCRIPT
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    initializeLandingPage();
});

/**
 * Initialize landing page
 */
function initializeLandingPage() {
    checkUserLogin();
    setupEventListeners();
    setupScrollAnimations();
}

/**
 * Check if user is already logged in
 */
function checkUserLogin() {
    const user = localStorage.getItem('user');
    if (user) {
        // User is already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            // Trigger Google Sign-In
            const googleBtn = document.querySelector('[role="button"]');
            if (googleBtn) {
                googleBtn.click();
            }
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/**
 * Setup scroll animations
 */
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe feature cards and pricing cards
    document.querySelectorAll('.feature-card, .pricing-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, info)
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 9999;
            animation: slideInRight 0.3s ease;
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
    `;
    
    if (!document.querySelector('style[data-toast]')) {
        style.setAttribute('data-toast', '');
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Get query parameters
 * @returns {Object} Query parameters
 */
function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    
    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    
    return params;
}

/**
 * Set active nav link
 * @param {string} href - Href of active link
 */
function setActiveNavLink(href) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === href) {
            link.classList.add('active');
        }
    });
}

/**
 * Track event (for analytics)
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
function trackEvent(event, data = {}) {
    console.log(`Event tracked: ${event}`, data);
    
    // Integrate with Google Analytics or other tracking service
    if (window.gtag) {
        gtag('event', event, data);
    }
}

/**
 * Initialize feature comparison
 */
function initializeFeatureComparison() {
    const features = [
        { name: 'Conversations/month', starter: '1,000', pro: '10,000', enterprise: 'Unlimited' },
        { name: 'Response Time', starter: '2-3s', pro: '0.5s', enterprise: '<0.5s' },
        { name: 'Support', starter: 'Email', pro: '24/7 Phone', enterprise: 'Dedicated Manager' },
        { name: 'Custom Templates', starter: 'No', pro: 'Yes', enterprise: 'White-Label' },
        { name: 'API Access', starter: 'No', pro: 'Limited', enterprise: 'Full Access' },
        { name: 'Integrations', starter: '1', pro: '5', enterprise: 'Unlimited' }
    ];
    
    return features;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise} Clipboard write promise
 */
function copyToClipboard(text) {
    return navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('Failed to copy', 'error');
    });
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in ms
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showToast,
        validateEmail,
        getQueryParams,
        setActiveNavLink,
        trackEvent,
        initializeFeatureComparison,
        copyToClipboard,
        debounce,
        throttle,
        formatCurrency
    };
}
