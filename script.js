/**
 * Portfolio & CV Client-Side Controller
 * Simon Njiyo Muranja Portfolio (muranja.github.io/dev)
 *
 * Implements performance-optimized, accessible UI interactions including:
 * - Resilient page loader dismissal
 * - Accessible navigation toggle and scroll-spy
 * - IntersectionObserver-backed scroll animations and metric counters
 * - Accessible smooth scrolling
 */

'use strict';

/**
 * Main application initialization entry point.
 */
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initNavigation();
    initScrollReveal();
    initCounterAnimation();
    initTerminalAnimation();
    initSmoothScroll();
    initActiveNavHighlight();
});

// ===================================
// Loader Controller
// ===================================
/**
 * Safely hides the full-screen initializing loader once the page and assets load.
 * Includes a defensive fallback timeout to guarantee dismissal even under high latency.
 */
function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    /** Dismisses the loader element and restores body scrolling. */
    const dismissLoader = () => {
        loader.classList.add('hidden');
        document.body.style.overflow = 'auto';
    };

    // If already loaded before DOMContentLoaded
    if (document.readyState === 'complete') {
        setTimeout(dismissLoader, 200);
    } else {
        window.addEventListener('load', () => {
            setTimeout(dismissLoader, 400);
        });
        // Defensive safeguard: dismiss after 2.5 seconds regardless
        setTimeout(dismissLoader, 2500);
    }
}

// ===================================
// Navigation & Mobile Drawer
// ===================================
/**
 * Controls responsive navigation bar transitions, hamburger menu accessibility,
 * and backdrop interactions.
 */
function initNavigation() {
    const nav = document.querySelector('.nav');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-links a');

    if (!nav || !navToggle || !mobileMenu) return;

    // Passive scroll listener for navbar elevation styling
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.pageYOffset > 40) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    /**
     * Toggles mobile drawer state with ARIA accessibility sync.
     * @param {boolean} [forceClose=false]
     */
    const toggleMenu = (forceClose = false) => {
        const isOpen = forceClose ? false : !mobileMenu.classList.contains('active');
        mobileMenu.classList.toggle('active', isOpen);
        navToggle.classList.toggle('active', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        mobileMenu.setAttribute('aria-hidden', String(!isOpen));

        const spans = navToggle.querySelectorAll('span');
        if (spans.length === 3) {
            if (isOpen) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        }
    };

    navToggle.addEventListener('click', () => toggleMenu());

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => toggleMenu(true));
    });

    // Close on Escape key press for accessibility
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            toggleMenu(true);
        }
    });
}

// ===================================
// Scroll Reveal via IntersectionObserver
// ===================================
/**
 * Uses non-blocking IntersectionObserver to reveal section content with smooth transitions.
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.skill-category, .skills-auxiliary, .exp-card, .project-card, .books-showcase, .book-card, .edu-card, .section-header, .contact-content'
    );
    if (!revealElements.length) return;

    if (!('IntersectionObserver' in window)) {
        revealElements.forEach(el => el.classList.add('reveal', 'active'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

// ===================================
// Interactive Terminal Animation
// ===================================
/**
 * Simulates blinking cursor and sequential line appearance inside hero code display.
 */
function initTerminalAnimation() {
    const cursor = document.querySelector('.cursor');
    if (cursor) {
        setInterval(() => {
            cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
        }, 500);
    }

    const codeLines = document.querySelectorAll('.code code > *');
    codeLines.forEach((line, index) => {
        const el = /** @type {HTMLElement} */ (line);
        el.style.opacity = '0';
        el.style.animation = 'fadeIn 0.35s ease forwards';
        el.style.animationDelay = `${1.2 + (index * 0.08)}s`;
    });
}

// ===================================
// Smooth Scrolling Controller
// ===================================
/**
 * Configures keyboard- and click-accessible smooth anchor scrolling with navbar offset compensation.
 */
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (!href || href === '#' || !href.startsWith('#')) return;

            const target = document.querySelector(href);
            if (!target) return;

            event.preventDefault();

            const nav = document.querySelector('.nav');
            const navOffset = nav ? nav.clientHeight : 70;
            const targetTop = target.getBoundingClientRect().top + window.pageYOffset - navOffset;

            window.scrollTo({
                top: Math.max(0, targetTop),
                behavior: 'smooth'
            });

            // Update focus for screen reader accessibility
            if (target instanceof HTMLElement) {
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }
        });
    });
}

// ===================================
// Numerical Metric Counters
// ===================================
/**
 * Observes data-counter elements and animates numbers up to their target value on scroll into view.
 */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.counter-val');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) {
        return;
    }

    const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = /** @type {HTMLElement} */ (entry.target);
                const targetValue = parseInt(element.getAttribute('data-target') || '0', 10);
                const suffix = element.getAttribute('data-suffix') || '';
                const isKFormat = element.getAttribute('data-format') === 'k';

                if (targetValue > 0) {
                    runCounter(element, targetValue, suffix, isKFormat);
                }
                obs.unobserve(element);
            }
        });
    }, { threshold: 0.3 });

    counters.forEach(counter => counterObserver.observe(counter));
}

/**
 * Animates a single counter element using requestAnimationFrame.
 * @param {HTMLElement} element Target DOM element.
 * @param {number} target Final target integer.
 * @param {string} suffix Suffix to append (e.g., '+').
 * @param {boolean} isKFormat Whether to format thousands as 'XK+'.
 */
function runCounter(element, target, suffix, isKFormat) {
    const duration = 1600;
    const startTime = performance.now();

    const update = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out quad function for smooth deceleration
        const easedProgress = 1 - (1 - progress) * (1 - progress);
        const currentValue = Math.floor(easedProgress * target);

        if (isKFormat && target >= 1000) {
            const kVal = Math.floor(currentValue / 1000);
            element.textContent = `${kVal}K${suffix}`;
        } else {
            element.textContent = `${currentValue.toLocaleString()}${suffix}`;
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            if (isKFormat && target >= 1000) {
                element.textContent = `${Math.floor(target / 1000)}K${suffix}`;
            } else {
                element.textContent = `${target.toLocaleString()}${suffix}`;
            }
        }
    };

    requestAnimationFrame(update);
}

// ===================================
// Active Navigation Spy
// ===================================
/**
 * Highlights navigation links matching the section currently in viewport view.
 */
function initActiveNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    if (!sections.length || !navLinks.length) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const nav = document.querySelector('.nav');
                const navHeight = nav ? nav.clientHeight : 70;
                let currentId = '';

                sections.forEach(section => {
                    const sectionTop = section.offsetTop - navHeight - 120;
                    const sectionHeight = section.offsetHeight;
                    if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                        currentId = section.getAttribute('id') || '';
                    }
                });

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (currentId && link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}
