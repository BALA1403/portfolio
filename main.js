// Modern Portfolio JavaScript - Enhanced Version
'use strict';

// Application State Management
const AppState = {
  isLoading: true,
  isMobileMenuOpen: false,
  activeSection: 'home',
  theme: 'dark',
  isScrolling: false,
  lastScrollY: 0,
  animationFrameId: null,
  prefersReducedMotion: false
};

// Utility Functions
const Utils = {
  // Debounce function for performance optimization
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const context = this;
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },

  // Throttle function for scroll events
  throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function executedFunction(...args) {
      const context = this;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  },

  // Safe element selection
  $(selector, parent = document) {
    try {
      return parent.querySelector(selector);
    } catch (e) {
      console.warn('Selector error:', selector, e);
      return null;
    }
  },

  $$(selector, parent = document) {
    try {
      return parent.querySelectorAll(selector);
    } catch (e) {
      console.warn('Selector error:', selector, e);
      return [];
    }
  },

  // Check if device is mobile
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768;
  },

  // Check feature support
  supportsFeature(feature) {
    try {
      switch (feature) {
        case 'transform':
          return 'transform' in document.documentElement.style;
        case 'requestAnimationFrame':
          return 'requestAnimationFrame' in window;
        case 'localStorage':
          return typeof(Storage) !== "undefined";
        case 'intersectionObserver':
          return 'IntersectionObserver' in window;
        case 'passiveListeners':
          try {
            const opts = Object.defineProperty({}, 'passive', {
              get() {
                return true;
              }
            });
            window.addEventListener('testPassive', null, opts);
            window.removeEventListener('testPassive', null, opts);
            return true;
          } catch (e) {
            return false;
          }
        default:
          return false;
      }
    } catch (e) {
      return false;
    }
  },

  // Smooth scroll to element
  scrollToElement(element, offset = 80) {
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  },

  // Show notification
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--accent-primary);
      color: var(--bg-primary);
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s ease;
      max-width: min(300px, 90vw);
      word-wrap: break-word;
      box-shadow: 0 10px 30px var(--shadow-color);
    `;

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, duration);
  },

  // Generate unique ID
  generateId(prefix = 'id') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Check if element is in viewport
  isInViewport(element, threshold = 0.1) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) * (1 - threshold) &&
      rect.bottom >= (window.innerHeight || document.documentElement.clientHeight) * threshold
    );
  }
};

// Theme Management
// Updated ThemeManager in main.js
const ThemeManager = {
  init() {
    this.checkPrefersReducedMotion();
    this.loadTheme();
    this.bindEvents();
    this.updateToggleStates();
  },

  checkPrefersReducedMotion() {
    AppState.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (AppState.prefersReducedMotion) {
      document.documentElement.style.setProperty('--transition-time', '0ms');
    }
  },

  loadTheme() {
    try {
      const savedTheme = localStorage.getItem('portfolioTheme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      // Use saved theme if available, otherwise use system preference, fallback to dark
      const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
      this.setTheme(theme);
    } catch (error) {
      console.warn('Could not load theme preference:', error);
      this.setTheme('dark');
    }
  },

  setTheme(theme) {
    AppState.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    this.updateMetaThemeColor();
    this.updateToggleStates();

    try {
      localStorage.setItem('portfolioTheme', theme);
    } catch (error) {
      console.warn('Could not save theme preference:', error);
    }
  },

  updateToggleStates() {
    // Update both desktop and mobile toggles
    const allToggleButtons = Utils.$$('.theme-toggle, .mobile-theme-toggle');

    allToggleButtons.forEach(toggle => {
      const sunIcon = toggle.querySelector('.sun-icon');
      const moonIcon = toggle.querySelector('.moon-icon');

      if (sunIcon && moonIcon) {
        if (AppState.theme === 'light') {
          sunIcon.style.opacity = '1';
          sunIcon.style.transform = 'rotate(0deg) scale(1)';
          moonIcon.style.opacity = '0';
          moonIcon.style.transform = 'rotate(-180deg) scale(0)';
        } else {
          sunIcon.style.opacity = '0';
          sunIcon.style.transform = 'rotate(180deg) scale(0)';
          moonIcon.style.opacity = '1';
          moonIcon.style.transform = 'rotate(0deg) scale(1)';
        }
      }
    });
  },

  toggleTheme() {
    const newTheme = AppState.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);

    // Dispatch theme change event
    document.dispatchEvent(new CustomEvent('themeChanged', {
      detail: {
        theme: newTheme
      }
    }));
  },

  updateMetaThemeColor() {
    const themeColorMeta = Utils.$('meta[name="theme-color"]');
    const appleThemeColorMeta = Utils.$('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (themeColorMeta) {
      const color = AppState.theme === 'light' ? '#fafafa' : '#0a0a0f';
      themeColorMeta.setAttribute('content', color);
    }
    if (appleThemeColorMeta) {
      const color = AppState.theme === 'light' ? 'default' : 'black';
      appleThemeColorMeta.setAttribute('content', color);
    }
  },

  bindEvents() {
    // Handle all theme toggles (both desktop and mobile) using event delegation
    document.addEventListener('click', (e) => {
      const themeToggle = e.target.closest('.theme-toggle, .mobile-theme-toggle');
      if (themeToggle) {
        e.preventDefault();
        e.stopPropagation();
        this.toggleTheme();
      }
    });

    // Keyboard accessibility
    document.addEventListener('keydown', (e) => {
      const themeToggle = document.activeElement.closest('.theme-toggle, .mobile-theme-toggle');
      if (themeToggle && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        this.toggleTheme();
      }
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('portfolioTheme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });

    // Sync both toggles when theme changes
    document.addEventListener('themeChanged', () => {
      this.updateToggleStates();
    });
  }
};

console.log('Theme toggles found:', document.querySelectorAll('.theme-toggle, .mobile-theme-toggle').length);

// Test function you can run in console
window.testThemeToggle = function() {
  console.log('Current theme:', AppState.theme);
  console.log('Data theme attribute:', document.documentElement.getAttribute('data-theme'));
  console.log('Desktop toggles:', document.querySelectorAll('.theme-toggle').length);
  console.log('Mobile toggles:', document.querySelectorAll('.mobile-theme-toggle').length);
};

// Preloader Management
const PreloaderManager = {
  init() {
    const preloader = Utils.$('#preloader');
    if (!preloader) {
      console.warn('Preloader element not found');
      AppState.isLoading = false;
      this.onPreloaderHidden();
      return;
    }

    const hidePreloader = () => {
      if (AppState.isLoading) {
        this.hide(preloader);
      }
    };

    if (document.readyState === 'complete') {
      setTimeout(hidePreloader, 500);
    } else {
      window.addEventListener('load', hidePreloader);
      // Fallback timer - ensures preloader always hides
      setTimeout(hidePreloader, 3000);
    }
  },

  hide(preloader) {
    console.log('Hiding preloader...');
    preloader.style.opacity = '0';
    preloader.style.pointerEvents = 'none';

    setTimeout(() => {
      preloader.style.display = 'none';
      AppState.isLoading = false;
      this.onPreloaderHidden();
      console.log('Preloader hidden successfully');
    }, 500);
  },

  onPreloaderHidden() {
    // Trigger greeting animation
    const greeting = Utils.$('.greeting');
    if (greeting) {
      greeting.classList.add('animate');
    }

    // Initialize jello animations
    AnimationManager.initJelloAnimations();

    // Adjust hero padding
    NavigationManager.adjustHeroPadding();

    // Focus on main content for accessibility
    const mainContent = Utils.$('main');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
    }
  }
};

// Animation Management
const AnimationManager = {
  init() {
    this.initScrollAnimations();
    this.initIntersectionObserver();
    this.initParallaxElements();
  },

  initJelloAnimations() {
    if (AppState.prefersReducedMotion) return;

    const jelloElements = Utils.$$('.jello');
    jelloElements.forEach((element, index) => {
      element.style.setProperty('--i', index);

      element.addEventListener('click', function() {
        this.style.animation = 'none';
        requestAnimationFrame(() => {
          this.style.animation = '';
        });
      });
    });
  },

  initScrollAnimations() {
    const elements = Utils.$$('[data-aos]');
    elements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'all 0.6s ease';
    });
  },

  initIntersectionObserver() {
    if (!Utils.supportsFeature('intersectionObserver')) {
      this.fallbackScrollAnimations();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    Utils.$$('[data-aos]').forEach(el => observer.observe(el));
  },

  fallbackScrollAnimations() {
    const animateOnScroll = Utils.throttle(() => {
      const elements = Utils.$$('[data-aos]');
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }
      });
    }, 100);

    window.addEventListener('scroll', animateOnScroll, {
      passive: true
    });
    animateOnScroll(); // Initial check
  },

  initParallaxElements() {
    if (AppState.prefersReducedMotion || Utils.isMobile()) return;

    const parallaxElements = Utils.$$('[data-parallax]');
    if (parallaxElements.length === 0) return;

    const updateParallax = Utils.throttle(() => {
      const scrolled = window.pageYOffset;
      parallaxElements.forEach(element => {
        const speed = parseFloat(element.dataset.parallax) || 0.1;
        const offset = scrolled * speed;
        element.style.transform = `translateY(${offset}px)`;
      });
    }, 16);

    window.addEventListener('scroll', updateParallax, {
      passive: true
    });
    updateParallax(); // Initial setup
  }
};

// Navigation Management
const NavigationManager = {
  init() {
    this.bindSmoothScroll();
    this.bindScrollEvents();
    this.bindMobileMenu();
    this.bindBackToTop();
    this.adjustHeroPadding();
  },

  bindSmoothScroll() {
    // Desktop navigation
    Utils.$$('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const target = Utils.$(targetId);
        if (target) {
          Utils.scrollToElement(target);
          this.updateActiveNavigation(targetId.substring(1));
        }
      });
    });

    // Mobile navigation
    Utils.$$('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const target = Utils.$(targetId);
        if (target) {
          Utils.scrollToElement(target);
          this.updateActiveNavigation(targetId.substring(1));
          this.closeMobileMenu();
        }
      });
    });
  },

  bindScrollEvents() {
    const throttledScroll = Utils.throttle(() => {
      this.updateActiveNavigationOnScroll();
      this.updateBackToTop();
      if (!AppState.prefersReducedMotion) {
        AnimationManager.initParallaxElements();
      }
    }, 16);

    window.addEventListener('scroll', throttledScroll, {
      passive: true
    });
  },

  updateActiveNavigationOnScroll() {
    const sections = Utils.$$('section[id]');
    const scrollPosition = window.pageYOffset + 150;

    let activeId = 'home';

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        activeId = section.getAttribute('id');
      }
    });

    if (activeId !== AppState.activeSection) {
      this.updateActiveNavigation(activeId);
    }
  },

  updateActiveNavigation(activeId) {
    AppState.activeSection = activeId;

    // Update desktop navigation
    Utils.$$('.nav-link').forEach(link => {
      const isActive = link.getAttribute('data-section') === activeId;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    // Update mobile navigation
    Utils.$$('.mobile-nav-link').forEach(link => {
      const isActive = link.getAttribute('data-section') === activeId;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  },

  bindMobileMenu() {
    const mobileToggle = Utils.$('.mobile-menu-toggle');
    const mobileOverlay = Utils.$('.mobile-menu-overlay');

    if (mobileToggle && mobileOverlay) {
      mobileToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMobileMenu();
      });

      // Close menu when clicking overlay
      mobileOverlay.addEventListener('click', (e) => {
        if (e.target === mobileOverlay) {
          this.closeMobileMenu();
        }
      });

      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && AppState.isMobileMenuOpen) {
          this.closeMobileMenu();
        }
      });

      // Handle mobile nav links
      Utils.$$('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href');
          const target = Utils.$(targetId);
          if (target) {
            Utils.scrollToElement(target);
            this.updateActiveNavigation(targetId.substring(1));
            this.closeMobileMenu();
          }
        });
      });

      // Prevent body scroll when menu is open
      document.addEventListener('touchmove', (e) => {
        if (AppState.isMobileMenuOpen) {
          e.preventDefault();
        }
      }, {
        passive: false
      });
    }
  },

  toggleMobileMenu() {
    AppState.isMobileMenuOpen = !AppState.isMobileMenuOpen;

    const mobileToggle = Utils.$('.mobile-menu-toggle');
    const mobileOverlay = Utils.$('.mobile-menu-overlay');
    const body = document.body;

    if (mobileToggle) {
      mobileToggle.classList.toggle('active', AppState.isMobileMenuOpen);
      mobileToggle.setAttribute('aria-expanded', AppState.isMobileMenuOpen);
    }

    if (mobileOverlay) {
      mobileOverlay.classList.toggle('active', AppState.isMobileMenuOpen);
      mobileOverlay.setAttribute('aria-hidden', !AppState.isMobileMenuOpen);
    }

    // Prevent body scroll when menu is open
    if (AppState.isMobileMenuOpen) {
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${window.scrollY}px`;
      body.style.width = '100%';
    } else {
      const scrollY = body.style.top;
      body.style.overflow = '';
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    // Trap focus in mobile menu
    if (AppState.isMobileMenuOpen) {
      this.trapFocus(mobileOverlay);
    }
  },

  closeMobileMenu() {
    if (!AppState.isMobileMenuOpen) return;

    AppState.isMobileMenuOpen = false;

    const mobileToggle = Utils.$('.mobile-menu-toggle');
    const mobileOverlay = Utils.$('.mobile-menu-overlay');
    const body = document.body;

    if (mobileToggle) {
      mobileToggle.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }

    if (mobileOverlay) {
      mobileOverlay.classList.remove('active');
      mobileOverlay.setAttribute('aria-hidden', 'true');
    }

    // Restore body scroll
    const scrollY = body.style.top;
    body.style.overflow = '';
    body.style.position = '';
    body.style.top = '';
    body.style.width = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  },

  trapFocus(container) {
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    container.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    });

    firstFocusableElement?.focus();
  },

  bindBackToTop() {
    const backToTop = Utils.$('.back-to-top');
    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  },

  updateBackToTop() {
    const backToTop = Utils.$('.back-to-top');
    const coffeeButton = Utils.$('#coffee-button');
    if (!backToTop || !coffeeButton) return;

    const scrollPosition = window.pageYOffset;
    const shouldShow = scrollPosition > 400;

    if (shouldShow) {
      backToTop.classList.add('visible');
      backToTop.setAttribute('aria-hidden', 'false');
      coffeeButton.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
      backToTop.setAttribute('aria-hidden', 'true');
      coffeeButton.classList.remove('visible');
    }
  },

  adjustHeroPadding() {
    const navbar = Utils.$('.navbar');
    const hero = Utils.$('.hero-section');

    if (navbar && hero) {
      const navbarHeight = navbar.offsetHeight;
      hero.style.paddingTop = `${navbarHeight + 20}px`;
      hero.style.scrollMarginTop = `${navbarHeight}px`;
    }
  }
};

// Modal Management
const ModalManager = {
  init() {
    this.bindCertificateModal();
    this.bindAllModals();
  },

  bindCertificateModal() {
    const modal = Utils.$('#certificateModal');
    const modalImg = Utils.$('#modalImage');
    const modalCaption = Utils.$('#modalCaption');
    const closeBtn = Utils.$('.modal-close');
    const certButtons = Utils.$$('.cert-view-btn');

    if (!modal || !modalImg || !modalCaption) return;

    certButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal(modal, modalImg, modalCaption, button);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal(modal);
      });
    }

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'block') {
        this.closeModal(modal);
      }
    });
  },

  bindAllModals() {
    const modalTriggers = Utils.$$('[data-modal-target]');

    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal-target');
        const modal = Utils.$(modalId);
        if (modal) {
          this.openGenericModal(modal);
        }
      });
    });

    const modalCloseButtons = Utils.$$('.modal-close');
    modalCloseButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = button.closest('.modal');
        if (modal) {
          this.closeGenericModal(modal);
        }
      });
    });

    // Close on background click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeGenericModal(e.target);
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = Utils.$('.modal[style="display: block;"]');
        if (openModal) {
          this.closeGenericModal(openModal);
        }
      }
    });
  },

  openModal(modal, modalImg, modalCaption, button) {
    const certificatePath = button.getAttribute('data-certificate');
    const card = button.closest('.certification-card');
    const title = card ? card.querySelector('.cert-title') : null;

    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    modalImg.src = certificatePath;
    modalImg.alt = title ? `Certificate for ${title.textContent}` : 'Certificate';
    modalCaption.textContent = title ? title.textContent : 'Certificate';

    document.body.style.overflow = 'hidden';
    this.trapFocus(modal);
  },

  closeModal(modal) {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  },

  openGenericModal(modal) {
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    this.trapFocus(modal);
  },

  closeGenericModal(modal) {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  },

  trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    });

    firstElement?.focus();
  }
};

// Custom Cursor Management
const CursorManager = {
  init() {
    if (Utils.isMobile() || !Utils.supportsFeature('transform') || AppState.prefersReducedMotion) {
      return;
    }
    this.initCustomCursor();
  },

  initCustomCursor() {
    const cursorInner = Utils.$('.cursor-inner');
    const cursorOuter = Utils.$('.cursor-outer');
    const interactiveElements = Utils.$$('a, button, .tech-item, .project-card, .certification-card, [data-cursor-hover]');

    if (!cursorInner || !cursorOuter) return;

    let mouseX = 0,
      mouseY = 0;
    let outerX = 0,
      outerY = 0;

    // Mouse move handler
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursorInner.style.left = `${mouseX}px`;
      cursorInner.style.top = `${mouseY}px`;
    });

    // Smooth animation for outer cursor
    const animateOuterCursor = () => {
      const dx = mouseX - outerX;
      const dy = mouseY - outerY;

      outerX += dx * 0.1;
      outerY += dy * 0.1;

      cursorOuter.style.left = `${outerX}px`;
      cursorOuter.style.top = `${outerY}px`;

      AppState.animationFrameId = requestAnimationFrame(animateOuterCursor);
    };

    if (Utils.supportsFeature('requestAnimationFrame')) {
      animateOuterCursor();
    }

    // Hover effects
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        cursorInner.classList.add('hover');
        cursorOuter.classList.add('hover');

        // Custom cursor size for specific elements
        if (element.hasAttribute('data-cursor-hover')) {
          const size = element.getAttribute('data-cursor-hover');
          cursorInner.style.setProperty('--cursor-size', size);
        }
      });

      element.addEventListener('mouseleave', () => {
        cursorInner.classList.remove('hover');
        cursorOuter.classList.remove('hover');

        // Reset cursor size
        if (element.hasAttribute('data-cursor-hover')) {
          cursorInner.style.removeProperty('--cursor-size');
        }
      });
    });
  }
};

// Performance Manager
const PerformanceManager = {
  init() {
    this.bindResizeEvents();
    this.bindVisibilityEvents();
    this.preventRightClick();
    this.optimizeImages();
    this.initLazyLoading();
  },

  bindResizeEvents() {
    const debouncedResize = Utils.debounce(() => {
      NavigationManager.adjustHeroPadding();
      NavigationManager.updateActiveNavigationOnScroll();
    }, 250);

    window.addEventListener('resize', debouncedResize);
  },

  bindVisibilityEvents() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && AppState.animationFrameId) {
        cancelAnimationFrame(AppState.animationFrameId);
        AppState.animationFrameId = null;
      }
    });
  },

  preventRightClick() {
    document.addEventListener('contextmenu', (e) => {
      if (e.target.nodeName === 'IMG' && e.target.classList.contains('protected')) {
        e.preventDefault();
        Utils.showNotification('Image download is disabled', 'warning');
      }
    });
  },

  optimizeImages() {
    // Lazy load images if IntersectionObserver is supported
    if (Utils.supportsFeature('intersectionObserver')) {
      const images = Utils.$$('img[data-src]');

      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
            }
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '200px 0px'
      });

      images.forEach(img => {
        // Add loading="lazy" as fallback
        if (!img.loading) {
          img.loading = 'lazy';
        }
        imageObserver.observe(img);
      });
    }
  },

  initLazyLoading() {
    // Lazy load iframes
    const lazyIframes = Utils.$$('iframe[data-src]');
    if (lazyIframes.length > 0 && Utils.supportsFeature('intersectionObserver')) {
      const iframeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const iframe = entry.target;
            iframe.src = iframe.dataset.src;
            iframeObserver.unobserve(iframe);
          }
        });
      }, {
        rootMargin: '200px 0px'
      });

      lazyIframes.forEach(iframe => iframeObserver.observe(iframe));
    }
  }
};

// Form Handling
const FormManager = {
  init() {
    this.bindContactForm();
  },

  bindContactForm() {
    const form = Utils.$('#contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitButton = Utils.$('#submitButton', form);
      const originalButtonText = submitButton.textContent;

      try {
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        // Collect form data
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          form.reset();
          Utils.showNotification('Message sent successfully!', 'success');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to send message');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        Utils.showNotification(error.message || 'Failed to send message', 'error');
      } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
  }
};

// Global Functions (for backward compatibility and direct calls)
function openResume() {
  try {
    const resumeUrl = "src/resume/resume.pdf";
    const newWindow = window.open(resumeUrl, "_blank", "noopener,noreferrer");

    if (!newWindow) {
      // Fallback if popup blocked
      window.location.href = resumeUrl;
    }

    Utils.showNotification("Resume opened successfully!", 'success');

    // Analytics tracking if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'download', {
        'event_category': 'Resume',
        'event_label': 'PDF Download'
      });
    }

  } catch (error) {
    console.error("Resume open error:", error);
    Utils.showNotification("Resume temporarily unavailable", 'error');
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Make functions globally available
window.openResume = openResume;
window.scrollToTop = scrollToTop;

// Main Application Class
class PortfolioApp {
  constructor() {
    this.initialized = false;
    this.managers = [{
        name: 'ThemeManager',
        instance: ThemeManager
      },
      {
        name: 'PreloaderManager',
        instance: PreloaderManager
      },
      {
        name: 'AnimationManager',
        instance: AnimationManager
      },
      {
        name: 'NavigationManager',
        instance: NavigationManager
      },
      {
        name: 'ModalManager',
        instance: ModalManager
      },
      {
        name: 'CursorManager',
        instance: CursorManager
      },
      {
        name: 'PerformanceManager',
        instance: PerformanceManager
      },
      {
        name: 'FormManager',
        instance: FormManager
      }
    ];
  }

  init() {
    if (this.initialized) return;

    try {
      console.log('🚀 Portfolio App: Initializing...');

      // Initialize all managers
      this.managers.forEach(({
        name,
        instance
      }) => {
        try {
          instance.init();
          console.log(`✅ ${name}: Initialized`);
        } catch (error) {
          console.error(`❌ ${name}: Initialization failed`, error);
        }
      });
      this.initialized = true;
      this.setupPostLoadActions();
      this.displayConsoleBranding();

      console.log('🎉 Portfolio App: Initialization complete');

    } catch (error) {
      console.error('💥 Portfolio App: Critical initialization error', error);
      this.initializeFallbackMode();
    }


  }

  setupPostLoadActions() {
    const finishLoading = () => {
      document.body.classList.add('loaded');

      // Dispatch app loaded event
      document.dispatchEvent(new CustomEvent('appLoaded', {
        detail: {
          timestamp: Date.now()
        }
      }));
    };

    if (document.readyState === 'complete') {
      setTimeout(finishLoading, 500);
    } else {
      window.addEventListener('load', () => setTimeout(finishLoading, 500));
    }
  }

  initializeFallbackMode() {
    console.log('🔧 Portfolio App: Initializing fallback mode...');

    try {
      // Basic theme toggle
      const themeToggle = Utils.$('.theme-toggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', () => {
          document.body.classList.toggle('light-theme');
        });
      }

      // Basic mobile menu
      const mobileToggle = Utils.$('.mobile-menu-toggle');
      const mobileOverlay = Utils.$('.mobile-menu-overlay');

      if (mobileToggle && mobileOverlay) {
        mobileToggle.addEventListener('click', () => {
          mobileToggle.classList.toggle('active');
          mobileOverlay.classList.toggle('active');
          document.body.style.overflow = mobileToggle.classList.contains('active') ? 'hidden' : '';
        });
      }

      // Hide preloader
      const preloader = Utils.$('#preloader');
      if (preloader) {
        preloader.style.display = 'none';
        AppState.isLoading = false;
      }

      console.log('✅ Fallback mode initialized');

    } catch (error) {
      console.error('💥 Even fallback mode failed:', error);
    }
  }

  displayConsoleBranding() {
    try {
      console.log(
        "%c🚀 Portfolio by Balaganesh S B - Modern Edition",
        `background: linear-gradient(90deg, #A5B68D, #C1CFA1);
         color: white;
         font-weight: 900;
         padding: 5px 15px;
         border-radius: 4px;
         font-size: 14px;`
      );
      console.log(
        "%c🔧 Built with modern JavaScript, CSS3, and HTML5",
        "color: #A5B68D; font-weight: 600;"
      );
      console.log(
        "%c📫 Contact: bxlz143@gmail.com",
        "color: #C1CFA1; font-weight: 600;"
      );
      console.log(
        "%c⚠️ Please don't copy/paste scripts you don't understand!",
        "color: #FCDC94; font-weight: 600;"
      );
    } catch (e) {
      console.log("Portfolio by Balaganesh S B - Modern Edition");
    }
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new PortfolioApp();
  app.init();
});

// Fallback initialization if DOMContentLoaded doesn't fire
if (document.readyState !== 'loading') {
  const app = new PortfolioApp();
  app.init();
}

// Service Worker Registration (Progressive Web App)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
