// Enhanced Portfolio JavaScript - Fully Optimized for All Browsers
'use strict';

// Global state management with better state tracking
const AppState = {
  isLoading: true,
  isMobileMenuOpen: false,
  activeSection: 'home',
  theme: 'dark', // Track current theme
  animationId: null,
  resizeTimeout: null,
  scrollTimeout: null,
  isThemeToggling: false // Prevent multiple toggles
};

// Utility functions with better error handling
const Utils = {
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768;
  },

  hasSupport(feature) {
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
        default:
          return false;
      }
    } catch (e) {
      return false;
    }
  },

  $(selector) {
    try {
      return document.querySelector(selector);
    } catch (e) {
      console.warn('Selector error:', selector, e);
      return null;
    }
  },

  $$(selector) {
    try {
      return document.querySelectorAll(selector);
    } catch (e) {
      console.warn('Selector error:', selector, e);
      return [];
    }
  },

  // Safe element creation
  createElement(tag, options = {}) {
    const element = document.createElement(tag);
    Object.entries(options).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else if (key === 'textContent') {
        element.textContent = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    return element;
  }
};

// FIXED Theme Management - Completely rewritten for reliability
const ThemeManager = {
  isInitialized: false,
  toggleInProgress: false,

  init() {
    if (this.isInitialized) return;

    console.log('ThemeManager: Initializing...');

    // Load saved theme first
    this.loadThemePreference();

    // Wait for DOM to be fully ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.setupEventListeners(), 300);
      });
    } else {
      setTimeout(() => this.setupEventListeners(), 300);
    }

    this.isInitialized = true;
  },

  setupEventListeners() {
    console.log('ThemeManager: Setting up event listeners...');

    const toggleBtn = Utils.$('.light-mode-toggle');
    if (!toggleBtn) {
      console.error('ThemeManager: Toggle button not found');
      return;
    }

    // Clear any existing listeners by cloning the element
    const newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);

    // Single unified event handler
    const handleToggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      console.log('Theme toggle triggered');
      this.performToggle();
    };

    // Add event listeners with proper options
    ['click', 'touchend'].forEach(eventType => {
      newToggleBtn.addEventListener(eventType, handleToggle, {
        passive: false,
        capture: true,
        once: false
      });
    });

    // Prevent double-tap zoom on mobile
    newToggleBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
    }, { passive: false });

    // Keyboard accessibility
    newToggleBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.performToggle();
      }
    });

    // Make function globally available for legacy support
    window.toggleVisualMode = () => this.performToggle();
    window.visualmode = () => this.performToggle();

    console.log('ThemeManager: Event listeners setup complete');
  },

  performToggle() {
    // Prevent rapid successive toggles
    if (this.toggleInProgress) {
      console.log('ThemeManager: Toggle already in progress, ignoring');
      return;
    }

    this.toggleInProgress = true;
    console.log('ThemeManager: Starting toggle, current theme:', AppState.theme);

    try {
      const body = document.body;
      const currentlyLight = body.classList.contains('light-mode');

      // Perform the toggle with clear state management
      if (currentlyLight) {
        // Switch to dark mode
        body.classList.remove('light-mode');
        AppState.theme = 'dark';
        console.log('ThemeManager: Switched to dark mode');
      } else {
        // Switch to light mode
        body.classList.add('light-mode');
        AppState.theme = 'light';
        console.log('ThemeManager: Switched to light mode');
      }

      // Save the preference immediately
      this.saveThemePreference();

      // Update meta theme color
      this.updateMetaThemeColor();

      // Provide visual feedback
      this.provideVisualFeedback();

      // Dispatch custom event for other components
      this.dispatchThemeEvent();

    } catch (error) {
      console.error('ThemeManager: Toggle error:', error);
    } finally {
      // Release the toggle lock after a reasonable delay
      setTimeout(() => {
        this.toggleInProgress = false;
        console.log('ThemeManager: Toggle lock released');
      }, 500);
    }
  },

  loadThemePreference() {
    try {
      let savedTheme = null;

      // Try multiple storage methods
      if (Utils.hasSupport('localStorage')) {
        savedTheme = localStorage.getItem('portfolioTheme');
        // Also check old format for backward compatibility
        if (!savedTheme) {
          const oldFormat = localStorage.getItem('lightMode');
          if (oldFormat === 'true') savedTheme = 'light';
          if (oldFormat === 'false') savedTheme = 'dark';
        }
      }

      // Fallback to sessionStorage
      if (!savedTheme && typeof sessionStorage !== 'undefined') {
        savedTheme = sessionStorage.getItem('portfolioTheme');
      }

      // Fallback to cookies
      if (!savedTheme) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'portfolioTheme') {
            savedTheme = value;
            break;
          }
        }
      }

      console.log('ThemeManager: Loaded theme preference:', savedTheme);

      // Apply the saved theme
      if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        AppState.theme = 'light';
      } else {
        document.body.classList.remove('light-mode');
        AppState.theme = 'dark';
      }

      this.updateMetaThemeColor();

    } catch (error) {
      console.warn('ThemeManager: Could not load theme preference:', error);
      // Default to dark theme
      AppState.theme = 'dark';
      document.body.classList.remove('light-mode');
    }
  },

  saveThemePreference() {
    try {
      const themeValue = AppState.theme;

      // Save to multiple storage types for reliability
      if (Utils.hasSupport('localStorage')) {
        localStorage.setItem('portfolioTheme', themeValue);
        // Also maintain old format for compatibility
        localStorage.setItem('lightMode', themeValue === 'light' ? 'true' : 'false');
      }

      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('portfolioTheme', themeValue);
      }

      // Set cookie with long expiration
      document.cookie = `portfolioTheme=${themeValue}; path=/; max-age=31536000; SameSite=Lax`;

      console.log('ThemeManager: Theme preference saved:', themeValue);

    } catch (error) {
      console.warn('ThemeManager: Could not save theme preference:', error);
    }
  },

  updateMetaThemeColor() {
    try {
      const themeColorMeta = Utils.$('meta[name="theme-color"]');
      if (themeColorMeta) {
        const color = AppState.theme === 'light' ? '#fafafa' : '#0a0a0f';
        themeColorMeta.setAttribute('content', color);
        console.log('ThemeManager: Meta theme color updated to:', color);
      }
    } catch (error) {
      console.warn('ThemeManager: Could not update meta theme color:', error);
    }
  },

  provideVisualFeedback() {
    try {
      const button = Utils.$('.light-mode-toggle');
      if (button) {
        // Immediate scale feedback
        button.style.transform = 'scale(0.9)';
        button.style.transition = 'transform 0.1s ease';

        // Reset after short delay
        setTimeout(() => {
          button.style.transform = '';
          button.style.transition = 'all 0.3s ease';
        }, 150);
      }
    } catch (error) {
      console.warn('ThemeManager: Could not provide visual feedback:', error);
    }
  },

  dispatchThemeEvent() {
    try {
      const event = new CustomEvent('themeChanged', {
        detail: { theme: AppState.theme },
        bubbles: true
      });
      document.dispatchEvent(event);
    } catch (error) {
      console.warn('ThemeManager: Could not dispatch theme event:', error);
    }
  }
};

// Preloader Management - Simplified and more reliable
const PreloaderManager = {
  init() {
    const loader = Utils.$('#preloader');
    if (!loader) return;

    // Hide preloader after window load
    const hideLoader = () => {
      if (AppState.isLoading) {
        this.hide(loader);
      }
    };

    // Multiple trigger points for reliability
    if (document.readyState === 'complete') {
      setTimeout(hideLoader, 100);
    } else {
      window.addEventListener('load', hideLoader);
      // Fallback timer
      setTimeout(hideLoader, 3000);
    }
  },

  hide(loader) {
    try {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.3s ease';

      setTimeout(() => {
        loader.style.display = 'none';
        AppState.isLoading = false;
        this.triggerPostLoadAnimations();
      }, 300);
    } catch (error) {
      console.error('PreloaderManager: Hide error:', error);
      AppState.isLoading = false;
    }
  },

  triggerPostLoadAnimations() {
    try {
      const greeting = Utils.$('.hey');
      if (greeting) {
        greeting.classList.add('popup');
      }

      AnimationManager.initJelloAnimations();
      NavigationManager.adjustLandingPadding();
    } catch (error) {
      console.warn('PreloaderManager: Animation trigger error:', error);
    }
  }
};

// Animation Management - Enhanced with better performance
const AnimationManager = {
  init() {
    this.initScrollAnimations();
    this.initIntersectionObserver();
  },

  initScrollAnimations() {
    try {
      const elements = Utils.$$('[data-aos]');
      elements.forEach(element => {
        element.classList.add('loading');
      });

      setTimeout(() => {
        elements.forEach(element => {
          element.classList.remove('loading');
          element.classList.add('loaded');
        });
      }, 500);
    } catch (error) {
      console.warn('AnimationManager: Scroll animation error:', error);
    }
  },

  initJelloAnimations() {
    try {
      const jelloElements = Utils.$$('.jello');
      jelloElements.forEach((element, index) => {
        element.style.setProperty('--i', index);
        element.style.animation = 'jello 3s ease-in-out infinite';
        element.style.animationDelay = `${index * 0.15}s`;

        element.addEventListener('click', function() {
          this.style.animation = 'none';
          requestAnimationFrame(() => {
            this.style.animation = 'jello 3s ease-in-out infinite';
            this.style.animationDelay = `${index * 0.15}s`;
          });
        });
      });
    } catch (error) {
      console.warn('AnimationManager: Jello animation error:', error);
    }
  },

  initIntersectionObserver() {
    if (!Utils.hasSupport('intersectionObserver')) return;

    try {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      }, observerOptions);

      Utils.$$('section, .project-box, .tech-stack-box, .certification-card').forEach(el => {
        observer.observe(el);
      });
    } catch (error) {
      console.warn('AnimationManager: Intersection observer error:', error);
    }
  },

  parallaxEffect() {
    try {
      const blob = Utils.$('.blob');
      const footerBlob = Utils.$('.footer-blob');
      const scrolled = window.pageYOffset;

      if (blob) {
        blob.style.transform = `translate(-50%, -50%) translateY(${scrolled * 0.1}px)`;
      }

      if (footerBlob) {
        footerBlob.style.transform = `translate(-50%, -50%) translateY(${scrolled * 0.05}px)`;
      }
    } catch (error) {
      console.warn('AnimationManager: Parallax error:', error);
    }
  }
};

// Navigation Management - FIXED Mobile Menu Issues
const NavigationManager = {
  init() {
    this.bindSmoothScroll();
    this.bindScrollEvents();
    this.bindHamburgerMenu();
    this.bindBackToTop();
    this.bindMobileMenuLinks();
  },

  bindSmoothScroll() {
    try {
      const navLinks = Utils.$$('a[href^="#"]');
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const target = Utils.$(link.getAttribute('href'));
          if (target) {
            this.smoothScrollTo(target);
            this.closeMobileMenu();
          }
        });
      });
    } catch (error) {
      console.warn('NavigationManager: Smooth scroll error:', error);
    }
  },

  smoothScrollTo(target) {
    try {
      const navbar = Utils.$('#navbar');
      const navbarHeight = navbar ? navbar.offsetHeight : 80;
      const targetPosition = target.offsetTop - navbarHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    } catch (error) {
      console.warn('NavigationManager: Smooth scroll to error:', error);
    }
  },

  bindScrollEvents() {
    const throttledScroll = Utils.throttle(() => {
      this.updateActiveNavigation();
      this.updateBackToTop();
      AnimationManager.parallaxEffect();
    }, 16);

    window.addEventListener('scroll', throttledScroll, { passive: true });
  },

  updateActiveNavigation() {
    try {
      const sections = Utils.$$("section[id]");
      const navItems = Utils.$$(".navbar .navbar-tabs .navbar-tabs-ul li");
      const mobileNavItems = Utils.$$(".mobiletogglemenu .mobile-navbar-tabs-ul li");

      let activeId = "";
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

      sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          activeId = section.getAttribute("id");
        }
      });

      if (activeId && activeId !== AppState.activeSection) {
        AppState.activeSection = activeId;

        // Update desktop navigation
        navItems.forEach(item => {
          const isActive = item.classList.contains(activeId);
          item.classList.toggle("activeThistab", isActive);
        });

        // Update mobile navigation
        mobileNavItems.forEach(item => {
          const isActive = item.classList.contains(activeId);
          item.classList.toggle("activeThismobiletab", isActive);
        });
      }
    } catch (error) {
      console.warn('NavigationManager: Update active navigation error:', error);
    }
  },

  bindHamburgerMenu() {
    try {
      const hamburgerBtn = Utils.$('#hamburger-button');
      const hamburgerContainer = Utils.$('#hamburger');

      if (hamburgerBtn) {
        // Clear existing listeners
        const newHamburgerBtn = hamburgerBtn.cloneNode(true);
        hamburgerBtn.parentNode.replaceChild(newHamburgerBtn, hamburgerBtn);

        // Unified toggle handler
        const handleToggle = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleMobileMenu();
        };

        // Add event listeners
        ['click', 'touchend'].forEach(eventType => {
          newHamburgerBtn.addEventListener(eventType, handleToggle, {
            passive: false,
            capture: true
          });
        });

        // Prevent touchstart
        newHamburgerBtn.addEventListener('touchstart', (e) => {
          e.preventDefault();
        }, { passive: false });
      }

      // Make globally available
      window.hamburgerMenu = () => this.toggleMobileMenu();
    } catch (error) {
      console.warn('NavigationManager: Hamburger menu binding error:', error);
    }
  },

  bindMobileMenuLinks() {
    try {
      const mobileLinks = Utils.$$('.mobile-navbar-tabs-ul li a');
      const mobileListItems = Utils.$$('.mobile-navbar-tabs-ul li');

      mobileLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          setTimeout(() => {
            this.closeMobileMenu();
          }, 300);
        });
      });

      mobileListItems.forEach(item => {
        item.addEventListener('click', (e) => {
          const link = item.querySelector('a');
          if (link && e.target !== link) {
            link.click();
          }
        });
      });

      // Global function
      window.hidemenubyli = () => this.closeMobileMenu();
    } catch (error) {
      console.warn('NavigationManager: Mobile menu links binding error:', error);
    }
  },

  toggleMobileMenu() {
    try {
      const body = document.body;
      const menu = Utils.$('#mobiletogglemenu');

      if (!menu) return;

      AppState.isMobileMenuOpen = !AppState.isMobileMenuOpen;

      if (AppState.isMobileMenuOpen) {
        body.classList.add("stopscrolling");
        menu.classList.add("show-toggle-menu");
      } else {
        body.classList.remove("stopscrolling");
        menu.classList.remove("show-toggle-menu");
      }

      // Animate hamburger bars
      const bars = [
        { id: 'burger-bar1', class: 'hamburger-animation1' },
        { id: 'burger-bar2', class: 'hamburger-animation2' },
        { id: 'burger-bar3', class: 'hamburger-animation3' }
      ];

      bars.forEach(bar => {
        const element = Utils.$(`#${bar.id}`);
        if (element) {
          element.classList.toggle(bar.class, AppState.isMobileMenuOpen);
        }
      });
    } catch (error) {
      console.error('NavigationManager: Mobile menu toggle error:', error);
    }
  },

  closeMobileMenu() {
    if (!AppState.isMobileMenuOpen) return;

    try {
      const body = document.body;
      const menu = Utils.$('#mobiletogglemenu');

      AppState.isMobileMenuOpen = false;
      body.classList.remove("stopscrolling");

      if (menu) {
        menu.classList.remove("show-toggle-menu");
      }

      // Reset hamburger bars
      const bars = [
        { id: 'burger-bar1', class: 'hamburger-animation1' },
        { id: 'burger-bar2', class: 'hamburger-animation2' },
        { id: 'burger-bar3', class: 'hamburger-animation3' }
      ];

      bars.forEach(bar => {
        const element = Utils.$(`#${bar.id}`);
        if (element) {
          element.classList.remove(bar.class);
        }
      });
    } catch (error) {
      console.warn('NavigationManager: Close mobile menu error:', error);
    }
  },

  bindBackToTop() {
    try {
      const backToTopBtn = Utils.$('#backtotopbutton');
      if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        });
      }
    } catch (error) {
      console.warn('NavigationManager: Back to top binding error:', error);
    }
  },

  updateBackToTop() {
    try {
      const backToTopBtn = Utils.$('#backtotopbutton');
      if (!backToTopBtn) return;

      const scrollPosition = document.body.scrollTop || document.documentElement.scrollTop;
      const shouldShow = scrollPosition > 400;

      if (shouldShow && backToTopBtn.style.display !== 'block') {
        backToTopBtn.style.display = "block";
        backToTopBtn.style.opacity = "1";
      } else if (!shouldShow && backToTopBtn.style.opacity !== "0") {
        backToTopBtn.style.opacity = "0";
        setTimeout(() => {
          if (backToTopBtn.style.opacity === "0") {
            backToTopBtn.style.display = "none";
          }
        }, 300);
      }
    } catch (error) {
      console.warn('NavigationManager: Update back to top error:', error);
    }
  },

  adjustLandingPadding() {
    try {
      const navbar = Utils.$('#navbar');
      const landing = Utils.$('.landing-page-container');
      if (navbar && landing) {
        const navbarHeight = navbar.offsetHeight;
        landing.style.paddingTop = `${navbarHeight + 20}px`;
      }
    } catch (error) {
      console.warn('NavigationManager: Adjust landing padding error:', error);
    }
  }
};

// Certificate Modal Management - Enhanced
const ModalManager = {
  init() {
    this.bindCertificateModal();
  },

  bindCertificateModal() {
    try {
      const modal = Utils.$('#certificateModal');
      const modalImg = Utils.$('#modalImage');
      const captionText = Utils.$('#caption');
      const certLinks = Utils.$$('.view-certificate');
      const closeBtn = Utils.$('.close');

      if (!modal || !modalImg || !captionText) return;

      certLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.openModal(modal, modalImg, captionText, link);
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
    } catch (error) {
      console.warn('ModalManager: Certificate modal binding error:', error);
    }
  },

  openModal(modal, modalImg, captionText, link) {
    try {
      const certificatePath = link.getAttribute('data-certificate');
      const title = link.closest('.certification-card').querySelector('.cert-title');

      modal.style.display = 'block';
      modalImg.src = certificatePath;
      captionText.textContent = title ? title.textContent : 'Certificate';

      document.body.style.overflow = 'hidden';
    } catch (error) {
      console.warn('ModalManager: Open modal error:', error);
    }
  },

  closeModal(modal) {
    try {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    } catch (error) {
      console.warn('ModalManager: Close modal error:', error);
    }
  }
};

// Custom Cursor Management - Enhanced with better performance
const CursorManager = {
  init() {
    if (Utils.isMobile() || !Utils.hasSupport('transform') || !Utils.hasSupport('requestAnimationFrame')) {
      return;
    }
    this.initCustomCursor();
  },

  initCustomCursor() {
    try {
      const cursorInner = Utils.$('#cursor-inner');
      const cursorOuter = Utils.$('#cursor-outer');
      const interactiveElements = Utils.$$('a, label, button, .tech-stack-box, .project-box, .certification-card');

      if (!cursorInner || !cursorOuter) return;

      let mouseX = 0, mouseY = 0;
      let outerX = 0, outerY = 0;

      // Mouse move handler with performance optimization
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

        requestAnimationFrame(animateOuterCursor);
      };

      requestAnimationFrame(animateOuterCursor);

      // Hover effects
      interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
          cursorInner.classList.add('hover');
          cursorOuter.classList.add('hover');
        });

        element.addEventListener('mouseleave', () => {
          cursorInner.classList.remove('hover');
          cursorOuter.classList.remove('hover');
        });
      });
    } catch (error) {
      console.warn('CursorManager: Custom cursor error:', error);
    }
  }
};

// Performance and Error Management - Enhanced
const PerformanceManager = {
  init() {
    this.bindResizeEvents();
    this.bindVisibilityEvents();
    this.bindErrorHandling();
    this.preventImageRightClick();
    this.optimizePerformance();
  },

  bindResizeEvents() {
    const debouncedResize = Utils.debounce(() => {
      NavigationManager.updateActiveNavigation();
      NavigationManager.adjustLandingPadding();
    }, 250);

    window.addEventListener('resize', debouncedResize);
  },

  bindVisibilityEvents() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && AppState.animationId) {
        cancelAnimationFrame(AppState.animationId);
        AppState.animationId = null;
      }
    });
  },

  bindErrorHandling() {
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      // Don't let errors break the app
      e.preventDefault();
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      e.preventDefault();
    });
  },

  preventImageRightClick() {
    document.addEventListener('contextmenu', (e) => {
      if (e.target.nodeName === 'IMG') {
        e.preventDefault();
        this.showNotification('Image download is disabled');
      }
    });
  },

  optimizePerformance() {
    // Preload critical images
    const criticalImages = [
      './src/png/nav-avatar.png',
      './src/png/bala_pic.jpg'
    ];

    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    // Optimize scroll performance
    let ticking = false;
    const optimizedScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Scroll optimizations
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedScroll, { passive: true });
  },

  showNotification(message) {
    try {
      const notification = Utils.createElement('div', {
        textContent: message,
        className: 'performance-notification'
      });

      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-primary);
        color: var(--bg-primary);
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
        font-weight: 600;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
        box-shadow: 0 10px 30px var(--shadow-color);
        max-width: 300px;
        word-wrap: break-word;
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
      }, 3000);
    } catch (error) {
      console.warn('PerformanceManager: Show notification error:', error);
    }
  }
};

// Utility Functions (Global) - Enhanced with better error handling
function openURL() {
  try {
    const url = "src/resume/resume.pdf";
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");

    if (!newWindow) {
      // Fallback if popup blocked
      window.location.href = url;
    }

    // Analytics tracking (if available)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'download', {
        'event_category': 'Resume',
        'event_label': 'PDF Download',
        'transport_type': 'beacon'
      });
    }

    // Show success notification
    PerformanceManager.showNotification("Resume opened successfully!");

  } catch (error) {
    console.error("Resume download error:", error);
    PerformanceManager.showNotification("Resume download temporarily unavailable");

    // Fallback: try direct navigation
    try {
      window.location.href = "src/resume/resume.pdf";
    } catch (fallbackError) {
      console.error("Fallback navigation failed:", fallbackError);
    }
  }
}

// Legacy function names for backward compatibility
function toggleVisualMode() {
  ThemeManager.performToggle();
}

function visualmode() {
  ThemeManager.performToggle();
}

function hamburgerMenu() {
  NavigationManager.toggleMobileMenu();
}

function hidemenubyli() {
  NavigationManager.closeMobileMenu();
}

function scrolltoTopfunction() {
  try {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  } catch (error) {
    // Fallback for older browsers
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
}

// Make functions globally available
window.openURL = openURL;
window.toggleVisualMode = toggleVisualMode;
window.visualmode = visualmode;
window.hamburgerMenu = hamburgerMenu;
window.hidemenubyli = hidemenubyli;
window.scrolltoTopfunction = scrolltoTopfunction;

// Enhanced Application Initialization
class PortfolioApp {
  constructor() {
    this.initialized = false;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  init() {
    if (this.initialized) {
      console.log('PortfolioApp: Already initialized');
      return;
    }

    try {
      console.log('PortfolioApp: Starting initialization...');

      // Set loading state
      document.body.classList.add('loading');

      // Initialize all managers in correct order
      this.initializeManagers();

      // Mark as initialized
      this.initialized = true;
      console.log('PortfolioApp: Initialization complete');

      // Post-load setup
      this.setupPostLoadActions();

      // Display console branding
      this.displayConsoleBranding();

    } catch (error) {
      console.error('PortfolioApp: Initialization error:', error);
      this.handleInitializationError(error);
    }
  }

  initializeManagers() {
    const managers = [
      { name: 'ThemeManager', manager: ThemeManager },
      { name: 'PreloaderManager', manager: PreloaderManager },
      { name: 'AnimationManager', manager: AnimationManager },
      { name: 'NavigationManager', manager: NavigationManager },
      { name: 'ModalManager', manager: ModalManager },
      { name: 'CursorManager', manager: CursorManager },
      { name: 'PerformanceManager', manager: PerformanceManager }
    ];

    managers.forEach(({ name, manager }) => {
      try {
        console.log(`PortfolioApp: Initializing ${name}...`);
        manager.init();
        console.log(`PortfolioApp: ${name} initialized successfully`);
      } catch (error) {
        console.error(`PortfolioApp: ${name} initialization failed:`, error);
        // Continue with other managers even if one fails
      }
    });
  }

  setupPostLoadActions() {
    const setupActions = () => {
      try {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');

        // Trigger any remaining animations
        const event = new CustomEvent('appLoaded', {
          detail: { timestamp: Date.now() }
        });
        document.dispatchEvent(event);

      } catch (error) {
        console.warn('PortfolioApp: Post-load setup error:', error);
      }
    };

    if (document.readyState === 'complete') {
      setTimeout(setupActions, 500);
    } else {
      window.addEventListener('load', () => {
        setTimeout(setupActions, 500);
      });
    }
  }

  handleInitializationError(error) {
    console.error('PortfolioApp: Critical initialization error:', error);

    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`PortfolioApp: Retrying initialization (${this.retryCount}/${this.maxRetries})...`);

      setTimeout(() => {
        this.initialized = false;
        this.init();
      }, 1000 * this.retryCount); // Exponential backoff
    } else {
      console.error('PortfolioApp: Maximum retry attempts reached. Running in degraded mode.');
      this.initializeFallbackMode();
    }
  }

  initializeFallbackMode() {
    try {
      console.log('PortfolioApp: Initializing fallback mode...');

      // Basic theme functionality
      const toggleBtn = Utils.$('.light-mode-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          document.body.classList.toggle('light-mode');
        });
      }

      // Basic hamburger menu
      const hamburgerBtn = Utils.$('#hamburger-button');
      if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const menu = Utils.$('#mobiletogglemenu');
          if (menu) {
            menu.classList.toggle('show-toggle-menu');
            document.body.classList.toggle('stopscrolling');
          }
        });
      }

      // Hide preloader
      const preloader = Utils.$('#preloader');
      if (preloader) {
        preloader.style.display = 'none';
      }

      document.body.classList.remove('loading');
      console.log('PortfolioApp: Fallback mode initialized');

    } catch (fallbackError) {
      console.error('PortfolioApp: Even fallback mode failed:', fallbackError);
    }
  }

  displayConsoleBranding() {
    try {
      console.log(
        "%c🚀 Portfolio by Balaganesh S B - Optimized Edition",
        `background: linear-gradient(90deg, #A5B68D, #C1CFA1);
         color: white;
         font-weight: 900;
         font-size: 1.2rem;
         padding: 20px;
         border-radius: 10px;
         text-shadow: 2px 2px 4px rgba(0,0,0,0.3);`
      );

      console.log(
        "%c💼 Oracle Certified Java Developer | Full Stack Developer",
        `background: linear-gradient(90deg, #000B58, #003161);
         color: white;
         font-weight: 600;
         font-size: 1rem;
         padding: 10px 20px;
         border-radius: 5px;`
      );

      console.log(
        "%c🔧 Enhanced for Cross-Browser Compatibility",
        `background: linear-gradient(90deg, #16213e, #1a1a2e);
         color: #A5B68D;
         font-weight: 600;
         font-size: 0.9rem;
         padding: 8px 16px;
         border-radius: 5px;`
      );
    } catch (error) {
      // Silent fail for console branding
    }
  }
}

// Safe Initialization with Multiple Entry Points
const app = new PortfolioApp();

// Primary initialization
const initializeApp = () => {
  app.init();
};

// Multiple initialization triggers for maximum reliability
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already ready
  setTimeout(initializeApp, 100);
}

// Backup initialization
window.addEventListener('load', () => {
  if (!app.initialized) {
    console.log('PortfolioApp: Backup initialization triggered');
    initializeApp();
  }
});

// Final fallback
setTimeout(() => {
  if (!app.initialized) {
    console.log('PortfolioApp: Emergency initialization triggered');
    initializeApp();
  }
}, 3000);

// Service Worker Registration (Progressive Web App support)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker: Registered successfully');
        return registration;
      })
      .catch((error) => {
        console.log('ServiceWorker: Registration failed', error);
      });
  });
}

// Enhanced Error Recovery
window.addEventListener('error', (event) => {
  console.error('Global Error Handler:', event.error);

  // Try to recover from critical errors
  if (event.error && event.error.message && event.error.message.includes('theme')) {
    console.log('Attempting to recover from theme-related error...');
    try {
      document.body.classList.remove('light-mode');
      AppState.theme = 'dark';
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
    }
  }
});

// Prevent common mobile issues
document.addEventListener('touchstart', function() {}, { passive: true });
document.addEventListener('touchmove', function() {}, { passive: true });

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PortfolioApp,
    ThemeManager,
    NavigationManager,
    Utils
  };
}

console.log('📱 Portfolio JavaScript: Fully loaded and optimized for all browsers including Brave mobile!');
