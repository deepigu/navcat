/**
 * CATALYST - ENTERPRISE INTELLIGENCE SOLUTIONS
 * Professional JavaScript with Full Accessibility Support
 * 
 * Features:
 * - Smooth scrolling navigation
 * - Mobile menu functionality
 * - Scroll-based animations
 * - Header scroll effects
 * - Intersection Observer for performance
 * - Keyboard navigation support
 * - Screen reader compatibility
 * - Reduced motion support
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONSTANTS & CONFIGURATION
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

    // ==========================================================================
    // UTILITY FUNCTIONS
    // ==========================================================================

    /**
     * Debounce function to limit the rate of function execution
     */
    function debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    /**
     * Throttle function to limit the rate of function execution
     */
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
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
     * Get scroll position with cross-browser support
     */
    function getScrollTop() {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
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

    class MobileNavigation {
        constructor() {
            this.toggle = document.querySelector('.nav__toggle');
            this.menu = document.querySelector('.nav__menu');
            this.links = document.querySelectorAll('.nav__link');
            this.isOpen = false;

            this.init();
        }

        init() {
            if (!this.toggle || !this.menu) return;

            this.bindEvents();
            this.setupKeyboardNavigation();
        }

        bindEvents() {
            // Toggle button click
            this.toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMenu();
            });

            // Close menu when clicking links
            this.links.forEach(link => {
                link.addEventListener('click', () => {
                    if (this.isOpen) {
                        this.closeMenu();
                    }
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.menu.contains(e.target) && !this.toggle.contains(e.target)) {
                    this.closeMenu();
                }
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeMenu();
                    this.toggle.focus();
                }
            });

            // Handle resize events
            window.addEventListener('resize', debounce(() => {
                if (window.innerWidth > CONFIG.breakpoints.mobile && this.isOpen) {
                    this.closeMenu();
                }
            }, 250));
        }

        setupKeyboardNavigation() {
            // Trap focus in mobile menu when open
            this.menu.addEventListener('keydown', (e) => {
                if (!this.isOpen) return;

                const focusableElements = this.menu.querySelectorAll(
                    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.key === 'Tab') {
                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            });
        }

        toggleMenu() {
            if (this.isOpen) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
        }

        openMenu() {
            this.isOpen = true;
            this.menu.classList.add('active');
            this.toggle.setAttribute('aria-expanded', 'true');
            this.toggle.setAttribute('aria-label', 'Close navigation menu');
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';

            // Focus first menu item
            const firstLink = this.menu.querySelector('.nav__link');
            if (firstLink) {
                setTimeout(() => firstLink.focus(), 100);
            }

            // Announce to screen readers
            this.announceToScreenReader('Navigation menu opened');
        }

        closeMenu() {
            this.isOpen = false;
            this.menu.classList.remove('active');
            this.toggle.setAttribute('aria-expanded', 'false');
            this.toggle.setAttribute('aria-label', 'Open navigation menu');
            
            // Restore body scroll
            document.body.style.overflow = '';

            // Announce to screen readers
            this.announceToScreenReader('Navigation menu closed');
        }

        announceToScreenReader(message) {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = message;

            document.body.appendChild(announcement);
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 1000);
        }
    }

    // ==========================================================================
    // SMOOTH SCROLLING NAVIGATION
    // ==========================================================================

    class SmoothScrolling {
        constructor() {
            this.links = document.querySelectorAll('a[href^="#"]');
            this.init();
        }

        init() {
            this.bindEvents();
        }

        bindEvents() {
            this.links.forEach(link => {
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
                        this.manageFocus(targetElement);
                    }
                });
            });
        }

        manageFocus(targetElement) {
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
    }

    // ==========================================================================
    // HEADER SCROLL EFFECTS
    // ==========================================================================

    class HeaderScrollEffects {
        constructor() {
            this.header = document.querySelector('.header');
            this.lastScrollTop = 0;
            this.isScrolled = false;

            this.init();
        }

        init() {
            if (!this.header) return;
            this.bindEvents();
        }

        bindEvents() {
            const handleScroll = throttle(() => {
                this.updateHeader();
            }, 16); // ~60fps

            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        updateHeader() {
            const scrollTop = getScrollTop();
            
            // Add/remove scrolled class
            if (scrollTop > CONFIG.scroll.threshold && !this.isScrolled) {
                this.header.classList.add('scrolled');
                this.isScrolled = true;
            } else if (scrollTop <= CONFIG.scroll.threshold && this.isScrolled) {
                this.header.classList.remove('scrolled');
                this.isScrolled = false;
            }

            this.lastScrollTop = scrollTop;
        }
    }

    // ==========================================================================
    // SCROLL ANIMATIONS
    // ==========================================================================

    class ScrollAnimations {
        constructor() {
            this.elements = document.querySelectorAll('.fade-in');
            this.observer = null;

            this.init();
        }

        init() {
            if (prefersReducedMotion()) {
                this.elements.forEach(el => el.classList.add('visible'));
                return;
            }

            this.setupIntersectionObserver();
        }

        setupIntersectionObserver() {
            const options = {
                root: null,
                rootMargin: '0px 0px -50px 0px',
                threshold: 0.1
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        
                        // Optional: unobserve after animation for performance
                        this.observer.unobserve(entry.target);
                    }
                });
            }, options);

            this.elements.forEach(el => {
                this.observer.observe(el);
            });
        }
    }

    // ==========================================================================
    // INTERACTIVE ELEMENTS
    // ==========================================================================

    class InteractiveElements {
        constructor() {
            this.cards = document.querySelectorAll('.solution-card, .challenge-card, .contact-item');
            this.ctaButton = document.querySelector('.cta-button');

            this.init();
        }

        init() {
            this.setupCardInteractions();
            this.setupCTAButton();
        }

        setupCardInteractions() {
            this.cards.forEach(card => {
                // Mouse events
                card.addEventListener('mouseenter', () => {
                    if (!prefersReducedMotion()) {
                        card.style.transform = 'translateY(-10px) scale(1.02)';
                    }
                });

                card.addEventListener('mouseleave', () => {
                    if (!prefersReducedMotion()) {
                        card.style.transform = 'translateY(0) scale(1)';
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
        }

        setupCTAButton() {
            if (!this.ctaButton) return;

            this.ctaButton.addEventListener('click', (e) => {
                this.createRippleEffect(e);
            });
        }

        createRippleEffect(e) {
            if (prefersReducedMotion()) return;

            const button = e.currentTarget;
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.height, rect.width);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                position: absolute;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;

            // Add ripple keyframes if not already present
            if (!document.querySelector('#ripple-keyframes')) {
                const style = document.createElement('style');
                style.id = 'ripple-keyframes';
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

            // Ensure button has relative positioning
            const originalPosition = getComputedStyle(button).position;
            if (originalPosition === 'static') {
                button.style.position = 'relative';
            }

            button.appendChild(ripple);

            // Remove ripple after animation
            setTimeout(() => {
                if (ripple && ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        }
    }

    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================

    // Initialize all features when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        new MobileNavigation();
        new SmoothScrolling();
        new HeaderScrollEffects();
        new ScrollAnimations();
        new InteractiveElements();
    });

})();
