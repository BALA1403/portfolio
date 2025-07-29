// Enhanced Portfolio JavaScript - Optimized and Modern
'use strict';

// Global state management
const AppState = {
  isLoading: true,
  isMobileMenuOpen: false,
  activeSection: 'home',
  theme: 'dark',
  animationId: null,
  resizeTimeout: null,
  scrollTimeout: null
};

// Utility functions
const Utils = {
  // Debounce function for performance optimization
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

  // Throttle function for scroll events
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

  // Check if device is mobile
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768;
  },

  // Check if browser supports feature
  hasSupport(feature) {
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
  },

  // Safe element selector
  $(selector) {
    return document.querySelector(selector);
  },

  // Safe elements selector
  $$(selector) {
    return document.querySelectorAll(selector);
  }
};

// Theme Management - FIXED FOR BRAVE BROWSER
const ThemeManager = {
  isToggling: false,
  currentTheme: 'dark',

  init() {
    this.loadThemePreference();
    // Wait for DOM to be fully ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.bindEvents(), 200);
      });
    } else {
      setTimeout(() => this.bindEvents(), 200);
    }
  },

  toggle() {
    // Prevent multiple rapid calls
    if (this.isToggling) {
      console.log('Toggle already in progress, skipping');
      return;
    }

    this.isToggling = true;
    console.log('Theme toggle started, current:', this.currentTheme);

    try {
      const body = document.body;
      const wasLight = body.classList.contains("light-mode");

      // Force a clean toggle
      if (wasLight) {
        body.classList.remove("light-mode");
        this.currentTheme = 'dark';
        AppState.theme = 'dark';
      } else {
        body.classList.add("light-mode");
        this.currentTheme = 'light';
        AppState.theme = 'light';
      }

      console.log('Theme changed to:', this.currentTheme);

      // Save preference immediately
      this.saveThemePreference();

      // Update meta tag
      this.updateThemeColor();

      // Visual feedback
      this.provideFeedback();

      // Dispatch event
      try {
        document.dispatchEvent(new CustomEvent('themeChanged', {
          detail: {
            theme: this.currentTheme
          }
        }));
      } catch (e) {
        console.warn('Event dispatch failed:', e);
      }

    } catch (error) {
      console.error("Theme toggle error:", error);
    }

    // Reset lock with longer delay for Brave
    setTimeout(() => {
      this.isToggling = false;
      console.log('Toggle lock released');
    }, 600);
  },


  saveThemePreference() {
    try {
      // Multiple fallback methods for saving theme
      const themeValue = this.currentTheme === 'light' ? 'true' : 'false';

      // Method 1: localStorage
      if (typeof Storage !== "undefined") {
        localStorage.setItem("lightMode", themeValue);
        console.log('Theme saved to localStorage:', themeValue);
      }

      // Method 2: sessionStorage as fallback
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("lightMode", themeValue);
      }

      // Method 3: Document cookie as last resort
      document.cookie = `lightMode=${themeValue}; path=/; max-age=31536000`;

    } catch (error) {
      console.warn("Could not save theme preference:", error);
    }
  },

  updateThemeColor(isLight) {
    const themeColorMeta = Utils.$('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', isLight ? '#fafafa' : '#0a0a0f');
    }
  },

  provideFeedback() {
    const button = Utils.$('.light-mode-toggle');
    if (button) {
      button.style.transform = 'scale(0.9)';
      // Use requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        setTimeout(() => {
          button.style.transform = '';
        }, 150);
      });
    }
  },

  loadThemePreference() {
    try {
      let savedTheme = null;

      // Try multiple methods to load theme
      // Method 1: localStorage
      if (typeof Storage !== "undefined") {
        savedTheme = localStorage.getItem("lightMode");
      }

      // Method 2: sessionStorage
      if (!savedTheme && typeof sessionStorage !== "undefined") {
        savedTheme = sessionStorage.getItem("lightMode");
      }

      // Method 3: Document cookie
      if (!savedTheme) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'lightMode') {
            savedTheme = value;
            break;
          }
        }
      }

      console.log('Loaded theme preference:', savedTheme);

      if (savedTheme === "true") {
        document.body.classList.add("light-mode");
        this.currentTheme = 'light';
        AppState.theme = 'light';
        this.updateThemeColor();
      } else {
        this.currentTheme = 'dark';
        AppState.theme = 'dark';
      }

    } catch (error) {
      console.warn("Could not load theme preference:", error);
      this.currentTheme = 'dark';
      AppState.theme = 'dark';
    }
  },
  updateThemeColor() {
    const themeColorMeta = Utils.$('meta[name="theme-color"]');
    if (themeColorMeta) {
      const color = this.currentTheme === 'light' ? '#fafafa' : '#0a0a0f';
      themeColorMeta.setAttribute('content', color);
      console.log('Meta theme color updated to:', color);
    }
  },

  provideFeedback() {
    const button = Utils.$('.light-mode-toggle');
    if (button) {
      // Immediate visual feedback
      button.style.transform = 'scale(0.9)';
      button.style.transition = 'transform 0.1s ease';

      setTimeout(() => {
        button.style.transform = '';
        button.style.transition = 'all 0.3s ease';
      }, 150);
    }
  },

  bindEvents() {
    console.log('Binding theme toggle events');

    const toggleBtn = Utils.$('.light-mode-toggle');
    if (!toggleBtn) {
      console.error('Theme toggle button not found');
      return;
    }

    // Remove all existing event listeners by cloning
    const newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);

    // Bind multiple event types for maximum compatibility
    const events = ['click', 'touchend'];

    events.forEach(eventType => {
      newToggleBtn.addEventListener(eventType, (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        console.log(`Theme toggle triggered by ${eventType}`);

        // Add small delay for touch events on mobile
        if (eventType === 'touchend') {
          setTimeout(() => this.toggle(), 50);
        } else {
          this.toggle();
        }
      }, {
        passive: false,
        capture: true
      });
    });

    // Prevent touchstart to avoid double events
    newToggleBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
    }, {
      passive: false
    });

    // Keyboard support
    newToggleBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        console.log('Theme toggle triggered by keyboard');
        this.toggle();
      }
    });

    // Make globally available
    window.visualmode = () => this.toggle();
    window.toggleVisualMode = () => this.toggle();

    console.log('Theme toggle events bound successfully');
  }
};
// Preloader Management
const PreloaderManager = {
  init() {
    const loader = Utils.$('#preloader');
    if (!loader) return;

    // Hide preloader after window load
    window.addEventListener('load', () => {
      this.hide(loader);
    });

    // Fallback: hide after 3 seconds
    setTimeout(() => {
      if (AppState.isLoading) {
        this.hide(loader);
      }
    }, 3000);
  },

  hide(loader) {
    try {
      loader.style.opacity = "0";
      loader.style.transition = "opacity 0.3s ease";

      setTimeout(() => {
        loader.style.display = "none";
        AppState.isLoading = false;

        // Trigger post-load animations
        this.triggerPostLoadAnimations();
      }, 300);
    } catch (error) {
      console.error("Preloader hide error:", error);
    }
  },

  triggerPostLoadAnimations() {
    const greeting = Utils.$(".hey");
    if (greeting) {
      greeting.classList.add("popup");
    }

    AnimationManager.initJelloAnimations();
    NavigationManager.adjustLandingPadding();
  }
};

// Animation Management
const AnimationManager = {
  init() {
    this.initScrollAnimations();
    this.initIntersectionObserver();
  },

  initScrollAnimations() {
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
  },

  initJelloAnimations() {
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
  },

  initIntersectionObserver() {
    if (!Utils.hasSupport('intersectionObserver')) return;

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
  },

  parallaxEffect() {
    const blob = Utils.$('.blob');
    const footerBlob = Utils.$('.footer-blob');
    const scrolled = window.pageYOffset;

    if (blob) {
      blob.style.transform = `translate(-50%, -50%) translateY(${scrolled * 0.1}px)`;
    }

    if (footerBlob) {
      footerBlob.style.transform = `translate(-50%, -50%) translateY(${scrolled * 0.05}px)`;
    }
  }
};

// Navigation Management - FIXED HAMBURGER MENU
const NavigationManager = {
  init() {
    this.bindSmoothScroll();
    this.bindScrollEvents();
    this.bindHamburgerMenu();
    this.bindBackToTop();
    this.bindMobileMenuLinks();
  },

  bindSmoothScroll() {
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
  },

  smoothScrollTo(target) {
    const navbar = Utils.$('#navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 80;
    const targetPosition = target.offsetTop - navbarHeight - 20;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  },

  bindScrollEvents() {
    const throttledScroll = Utils.throttle(() => {
      this.updateActiveNavigation();
      this.updateBackToTop();
      AnimationManager.parallaxEffect();
    }, 16); // ~60fps

    window.addEventListener('scroll', throttledScroll, {
      passive: true
    });
  },

  updateActiveNavigation() {
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
  },


  bindHamburgerMenu() {
    const hamburgerBtn = Utils.$('#hamburger-button');
    const hamburgerContainer = Utils.$('#hamburger');

    if (hamburgerBtn) {
      // Remove any existing listeners
      hamburgerBtn.replaceWith(hamburgerBtn.cloneNode(true));
      const newHamburgerBtn = Utils.$('#hamburger-button');

      // Add click event
      newHamburgerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMobileMenu();
      });

      // Add touch events for mobile
      newHamburgerBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMobileMenu();
      });
    }

    // Also bind to the container for better touch target
    if (hamburgerContainer) {
      hamburgerContainer.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMobileMenu();
      });
    }

    // Make sure the function is globally available
    window.hamburgerMenu = () => this.toggleMobileMenu();
  },

  bindMobileMenuLinks() {
    const mobileLinks = Utils.$$('.mobile-navbar-tabs-ul li a');
    const mobileListItems = Utils.$$('.mobile-navbar-tabs-ul li');

    mobileLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        console.log('Mobile menu link clicked');
        setTimeout(() => {
          this.closeMobileMenu();
        }, 300);
      });
    });

    // Also bind to list items for better touch targets
    mobileListItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const link = item.querySelector('a');
        if (link && e.target !== link) {
          link.click();
        }
      });
    });

    // Make the close function globally available
    window.hidemenubyli = () => this.closeMobileMenu();
  },

  toggleMobileMenu() {
    try {
      const body = document.body;
      const menu = Utils.$('#mobiletogglemenu');
      const hamburger = Utils.$('#hamburger');

      if (!menu) {
        console.error('Mobile menu not found');
        return;
      }

      // Toggle the state
      AppState.isMobileMenuOpen = !AppState.isMobileMenuOpen;

      console.log('Toggling mobile menu:', AppState.isMobileMenuOpen); // Debug log

      // Toggle body scroll
      if (AppState.isMobileMenuOpen) {
        body.classList.add("stopscrolling");
        menu.classList.add("show-toggle-menu");
      } else {
        body.classList.remove("stopscrolling");
        menu.classList.remove("show-toggle-menu");
      }

      // Animate hamburger bars
      const bars = [{
          id: 'burger-bar1',
          class: 'hamburger-animation1'
        },
        {
          id: 'burger-bar2',
          class: 'hamburger-animation2'
        },
        {
          id: 'burger-bar3',
          class: 'hamburger-animation3'
        }
      ];

      bars.forEach(bar => {
        const element = Utils.$(`#${bar.id}`);
        if (element) {
          if (AppState.isMobileMenuOpen) {
            element.classList.add(bar.class);
          } else {
            element.classList.remove(bar.class);
          }
        }
      });

    } catch (error) {
      console.error("Mobile menu toggle error:", error);
    }
  },

  closeMobileMenu() {
    if (!AppState.isMobileMenuOpen) return;

    const body = document.body;
    const menu = Utils.$('#mobiletogglemenu');
    const bars = [{
        id: 'burger-bar1',
        class: 'hamburger-animation1'
      },
      {
        id: 'burger-bar2',
        class: 'hamburger-animation2'
      },
      {
        id: 'burger-bar3',
        class: 'hamburger-animation3'
      }
    ];

    AppState.isMobileMenuOpen = false;
    body.classList.remove("stopscrolling");

    if (menu) {
      menu.classList.remove("show-toggle-menu");
    }

    bars.forEach(bar => {
      const element = Utils.$(`#${bar.id}`);
      if (element) {
        element.classList.remove(bar.class);
      }
    });
  },

  bindBackToTop() {
    const backToTopBtn = Utils.$('#backtotopbutton');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  },

  updateBackToTop() {
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
  },

  adjustLandingPadding() {
    const navbar = Utils.$('#navbar');
    const landing = Utils.$('.landing-page-container');
    if (navbar && landing) {
      const navbarHeight = navbar.offsetHeight;
      landing.style.paddingTop = `${navbarHeight + 20}px`;
    }
  }
};

// Certificate Modal Management
const ModalManager = {
  init() {
    this.bindCertificateModal();
  },

  bindCertificateModal() {
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
  },

  openModal(modal, modalImg, captionText, link) {
    const certificatePath = link.getAttribute('data-certificate');
    const title = link.closest('.certification-card').querySelector('.cert-title');

    modal.style.display = 'block';
    modalImg.src = certificatePath;
    captionText.textContent = title ? title.textContent : 'Certificate';

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  },

  closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};

// Custom Cursor Management
const CursorManager = {
  init() {
    if (Utils.isMobile() || !Utils.hasSupport('transform') || !Utils.hasSupport('requestAnimationFrame')) {
      return;
    }

    this.initCustomCursor();
  },

  initCustomCursor() {
    const cursorInner = Utils.$('#cursor-inner');
    const cursorOuter = Utils.$('#cursor-outer');
    const interactiveElements = Utils.$$('a, label, button, .tech-stack-box, .project-box, .certification-card');

    if (!cursorInner || !cursorOuter) return;

    // Mouse move handler
    document.addEventListener('mousemove', (e) => {
      const {
        clientX: x,
        clientY: y
      } = e;

      cursorInner.style.left = `${x}px`;
      cursorInner.style.top = `${y}px`;

      // Smooth animation for outer cursor
      cursorOuter.animate({
        left: `${x}px`,
        top: `${y}px`,
      }, {
        duration: 300,
        fill: 'forwards'
      });
    });

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
  }
};

// Performance and Error Management
const PerformanceManager = {
  init() {
    this.bindResizeEvents();
    this.bindVisibilityEvents();
    this.bindErrorHandling();
    this.preventImageRightClick();
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
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
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

  showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--accent-primary);
      color: var(--bg-primary);
      padding: 10px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-family: 'JetBrains Mono', monospace;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s ease;
      pointer-events: none;
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
    }, 2000);
  }
};

// Utility Functions (Global)
function openURL() {
  try {
    const url = "src/resume/resume.pdf";
    window.open(url, "_blank");

    // Analytics (if available)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'download', {
        'event_category': 'Resume',
        'event_label': 'PDF Download'
      });
    }
  } catch (error) {
    console.error("Resume download error:", error);
    PerformanceManager.showNotification("Resume download temporarily unavailable");
  }
}

// Legacy function names for backward compatibility
function toggleVisualMode() {
  ThemeManager.toggle();
}

// Make sure this function is available globally
window.toggleVisualMode = toggleVisualMode;

function hamburgerMenu() {
  NavigationManager.toggleMobileMenu();
}

function hidemenubyli() {
  NavigationManager.closeMobileMenu();
}

function scrolltoTopfunction() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Main Application Initialization
class PortfolioApp {
  constructor() {
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    try {
      document.body.classList.add('loading');

      // Initialize all managers
      ThemeManager.init();
      PreloaderManager.init();
      AnimationManager.init();
      NavigationManager.init();
      ModalManager.init();
      CursorManager.init();
      PerformanceManager.init();

      // Mark as initialized
      this.initialized = true;

      // Post-load setup
      window.addEventListener('load', () => {
        setTimeout(() => {
          document.body.classList.remove('loading');
          document.body.classList.add('loaded');
        }, 500);
      });

      // Console branding
      this.displayConsoleBranding();

    } catch (error) {
      console.error('App initialization error:', error);
    }
  }

  displayConsoleBranding() {
    console.log(
      "%c🚀 Portfolio by Balaganesh S B",
      `background: linear-gradient(90deg, #A5B68D, #C1CFA1);
       color: white;
       font-weight: 900;
       font-size: 1.2rem;
       padding: 20px;
       border-radius: 10px;
       text-shadow: 2px 2px 4px rgba(0,0,0,0.3);`
    );

    console.log(
      "%c💼 Oracle Certified Java Developer",
      `background: linear-gradient(90deg, #000B58, #003161);
       color: white;
       font-weight: 600;
       font-size: 1rem;
       padding: 10px 20px;
       border-radius: 5px;`
    );
  }
}

// Initialize the application
const app = new PortfolioApp();

// DOM Ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Service Worker Registration (optional)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('Service Worker registered'))
      .catch(() => console.log('Service Worker registration failed'));
  });
}
