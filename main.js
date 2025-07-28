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

// Theme Management
const ThemeManager = {
  init() {
    this.loadThemePreference();
    this.bindEvents();
  },

  toggle() {
    try {
      const body = document.body;
      const isLight = body.classList.toggle("light-mode");

      AppState.theme = isLight ? 'light' : 'dark';

      // Save preference
      if (Utils.hasSupport('localStorage')) {
        localStorage.setItem("lightMode", isLight);
      }

      // Update theme color meta tag
      const themeColorMeta = Utils.$('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', isLight ? '#EDE8DC' : '#000B58');
      }

      // Visual feedback for mobile
      const button = Utils.$('.light-mode-toggle');
      if (button) {
        button.style.transform = 'scale(0.9)';
        setTimeout(() => {
          button.style.transform = '';
        }, 150);
      }

      // Dispatch custom event
      document.dispatchEvent(new CustomEvent('themeChanged', {
        detail: {
          theme: AppState.theme
        }
      }));

    } catch (error) {
      console.error("Theme toggle error:", error);
    }
  },

  loadThemePreference() {
    if (Utils.hasSupport('localStorage')) {
      const isLightMode = localStorage.getItem("lightMode");
      if (isLightMode === "true") {
        document.body.classList.add("light-mode");
        AppState.theme = 'light';
        const themeColorMeta = Utils.$('meta[name="theme-color"]');
        if (themeColorMeta) {
          themeColorMeta.setAttribute('content', '#EDE8DC');
        }
      }
    }
  },

  bindEvents() {
    const toggleBtn = Utils.$('.light-mode-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', this.toggle.bind(this));

      // Add keyboard support
      toggleBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggle();
        }
      });
    }
  }
};
// Load saved theme preference
function loadThemePreference() {
  if (typeof(Storage) !== "undefined") {
    const isLightMode = localStorage.getItem("lightMode");
    if (isLightMode === "true") {
      document.body.classList.add("light-mode");
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      themeColorMeta.setAttribute('content', '#EDE8DC');
    }
  }
}
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

// Navigation Management
const NavigationManager = {
  init() {
    this.bindSmoothScroll();
    this.bindScrollEvents();
    this.bindHamburgerMenu();
    this.bindBackToTop();
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
    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', this.toggleMobileMenu.bind(this));
    }
  },

  toggleMobileMenu() {
    try {
      const body = document.body;
      const menu = Utils.$('#mobiletogglemenu');
      const bars = ["burger-bar1", "burger-bar2", "burger-bar3"];

      if (!menu) return;

      AppState.isMobileMenuOpen = !AppState.isMobileMenuOpen;

      body.classList.toggle("stopscrolling", AppState.isMobileMenuOpen);
      menu.classList.toggle("show-toggle-menu", AppState.isMobileMenuOpen);

      bars.forEach((barId, index) => {
        const bar = Utils.$(`#${barId}`);
        if (bar) {
          bar.classList.toggle(`hamburger-animation${index + 1}`, AppState.isMobileMenuOpen);
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
    const bars = ["burger-bar1", "burger-bar2", "burger-bar3"];

    AppState.isMobileMenuOpen = false;
    body.classList.remove("stopscrolling");

    if (menu) {
      menu.classList.remove("show-toggle-menu");
    }

    bars.forEach((barId, index) => {
      const bar = Utils.$(`#${barId}`);
      if (bar) {
        bar.classList.remove(`hamburger-animation${index + 1}`);
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
// Replace the existing visualmode() function with this:
function toggleVisualMode() {
  try {
    document.body.classList.toggle("light-mode");

    // Save preference to localStorage
    if (typeof(Storage) !== "undefined") {
      localStorage.setItem("lightMode", document.body.classList.contains("light-mode"));
    }

    // Update theme color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (document.body.classList.contains("light-mode")) {
      themeColorMeta.setAttribute('content', '#EDE8DC');
    } else {
      themeColorMeta.setAttribute('content', '#000B58');
    }

    // Add visual feedback for mobile
    const button = document.querySelector('.light-mode-toggle');
    if (button) {
      button.style.transform += ' scale(0.9)';
      setTimeout(() => {
        button.style.transform = button.style.transform.replace(' scale(0.9)', '');
      }, 150);
    }
  } catch (error) {
    console.error("Error in toggleVisualMode:", error);
  }
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
