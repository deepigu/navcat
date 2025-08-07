/**
 * CATALYST - ENTERPRISE INTELLIGENCE SOLUTIONS
 * Professional JavaScript with Full Mobile Navigation Support
 */

(function() {
    'use strict';

    // ==========================================================================
    // VARIABLES & CONFIGURATION
    // ==========================================================================
    
    const CONFIG = {
        breakpoints: {
            mobile: 768,
            tablet: 1024
        },
        animation: {
            duration: 300,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        },
        scroll: {
            offset: 80,
            threshold: 100
        }
    };

    // DOM Elements
    let navToggle, navMenu, navLinks, header;
    let isMenuOpen = false;

    // ==========================================================================
    // UTILITY FUNCTIONS
    // ==========================================================================

    /**
     * Debounce function to limit the rate of function execution
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function to limit the rate of function execution
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

    /**
     * Check if user prefers reduced motion
     */
    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Smooth scroll to element with offset
     */
    function scrollToElement(element, offset = 0) {
        if (!element) return;

        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        if (prefersReducedMotion()) {
            window.scrollTo(0, offsetPosition);
            return;
        }

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // ==========================================================================
    // MOBILE NAVIGATION
    // ==========================================================================

    function initMobileNavigation() {
        navToggle = document.getElementById('nav-toggle');
        navMenu = document.getElementById('nav-menu');
        navLinks = document.querySelectorAll('.nav__link');

        if (!navToggle || !navMenu) {
            console.warn('Mobile navigation elements not found');
            return;
        }

        // Toggle button click event
        navToggle.addEventListener('click', toggleMobileMenu);

        // Close menu when clicking on navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (isMenuOpen) {
                    closeMobileMenu();
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (isMenuOpen && 
                !navMenu.contains(e.target) && 
                !navToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMobileMenu();
                navToggle.focus();
            }
        });

        // Handle resize events
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > CONFIG.breakpoints.mobile && isMenuOpen) {
                closeMobileMenu();
            }
        }, 250));
    }

    function toggleMobileMenu() {
        if (isMenuOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function openMobileMenu() {
        isMenuOpen = true;
        
        // Add classes
        navMenu.classList.add('active');
        navToggle.classList.add('active');
        document.body.classList.add('menu-open');
        
        // Update ARIA attributes
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.setAttribute('aria-label', 'Close navigation menu');
        
        // Focus first menu item
        const firstLink = navMenu.querySelector('.nav__link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
    }

    function closeMobileMenu() {
        isMenuOpen = false;
        
        // Remove classes
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
        
        // Update ARIA attributes
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation menu');
    }

    // ==========================================================================
    // SMOOTH SCROLLING NAVIGATION
    // ==========================================================================

    function initSmoothScrolling() {
        const smoothLinks = document.querySelectorAll('a[href^="#"]');
        
        smoothLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    scrollToElement(targetElement, CONFIG.scroll.offset);
                    
                    // Update URL without causing scroll
                    if (history.pushState) {
                        history.pushState(null, null, targetId);
                    }
                    
                    // Focus management for accessibility
                    manageFocus(targetElement);
                }
            });
        });
    }

    function manageFocus(targetElement) {
        // Add tabindex to make element focusable
        const originalTabIndex = targetElement.getAttribute('tabindex');
        targetElement.setAttribute('tabindex', '-1');
        
        // Focus the target element
        targetElement.focus();
        
        // Remove tabindex after focus
        setTimeout(() => {
            if (originalTabIndex === null) {
                targetElement.removeAttribute('tabindex');
            } else {
                targetElement.setAttribute('tabindex', originalTabIndex);
            }
        }, 100);
    }

    // ==========================================================================
    // HEADER SCROLL EFFECTS
    // ==========================================================================

    function initHeaderScrollEffects() {
        header = document.querySelector('.header');
        if (!header) return;

        let lastScrollTop = 0;
        let isScrolled = false;

        const handleScroll = throttle(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add/remove scrolled class
            if (scrollTop > CONFIG.scroll.threshold && !isScrolled) {
                header.classList.add('scrolled');
                isScrolled = true;
            } else if (scrollTop <= CONFIG.scroll.threshold && isScrolled) {
                header.classList.remove('scrolled');
                isScrolled = false;
            }

            lastScrollTop = scrollTop;
        }, 16); // ~60fps

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // ==========================================================================
    // SCROLL ANIMATIONS
    // ==========================================================================

    function initScrollAnimations() {
        if (prefersReducedMotion()) {
            // If user prefers reduced motion, make all elements visible immediately
            const elements = document.querySelectorAll('.fade-in');
            elements.forEach(el => el.classList.add('visible'));
            return;
        }

        // Intersection Observer for scroll animations
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Unobserve after animation for performance
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all fade-in elements
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach(el => observer.observe(el));
    }

    // ==========================================================================
    // INTERACTIVE ELEMENTS
    // ==========================================================================

    function initInteractiveElements() {
        // Card hover effects
        const cards = document.querySelectorAll('.solution-card, .challenge-card, .contact-item');
        
        cards.forEach(card => {
            // Mouse events
            card.addEventListener('mouseenter', () => {
                if (!prefersReducedMotion()) {
                    card.style.transform = 'translateY(-10px)';
                }
            });

            card.addEventListener('mouseleave', () => {
                if (!prefersReducedMotion()) {
                    card.style.transform = 'translateY(0)';
                }
            });

            // Focus events for keyboard users
            card.addEventListener('focus', () => {
                if (!prefersReducedMotion()) {
                    card.style.transform = 'translateY(-5px)';
                }
            });

            card.addEventListener('blur', () => {
                if (!prefersReducedMotion()) {
                    card.style.transform = 'translateY(0)';
                }
            });
        });

        // CTA Button effects
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', createRippleEffect);
        }
    }

    function createRippleEffect(e) {
        if (prefersReducedMotion()) return;

        const button = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.height, rect.width);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        // Create ripple styles
        const rippleStyles = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            z-index: 1;
        `;

        // Add ripple animation keyframes if not already added
        if (!document.getElementById('ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        ripple.style.cssText = rippleStyles;
        
        // Ensure button has relative positioning
        const originalPosition = getComputedStyle(button).position;
        if (originalPosition === 'static') {
            button.style.position = 'relative';
        }

        button.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
            // Restore original position if it was static
            if (originalPosition === 'static') {
                button.style.position = '';
            }
        }, 600);
    }

    // ==========================================================================
    // ERROR HANDLING
    // ==========================================================================

    function handleErrors() {
        window.addEventListener('error', (e) => {
            console.error('JavaScript Error:', e.error);
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled Promise Rejection:', e.reason);
        });
    }

    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================

    function init() {
        try {
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
                return;
            }

            // Initialize all components
            initMobileNavigation();
            initSmoothScrolling();
            initHeaderScrollEffects();
            initScrollAnimations();
            initInteractiveElements();
            handleErrors();

            // Add loaded class to body
            document.body.classList.add('js-loaded');

            console.log('Catalyst website initialized successfully');

        } catch (error) {
            console.error('Error initializing Catalyst website:', error);
        }
    }

    // ==========================================================================
    // AUTO-INITIALIZATION
    // ==========================================================================

    // Initialize when script loads
    init();

    // Export for debugging (optional)
    window.Catalyst = {
        toggleMobileMenu,
        scrollToElement,
        CONFIG
    };

})();