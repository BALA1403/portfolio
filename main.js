// Modern Portfolio JavaScript - Fixed Version
'use strict';

// Application State Management
const AppState = {
  isLoading: true,
  isMobileMenuOpen: false,
  activeSection: 'home',
  theme: 'dark',
  isScrolling: false,
  lastScrollY: 0,
  animationFrameId: null
};

// Utility Functions
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

  // Safe element selection
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

    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  },

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

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
      max-width: 300px;
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
    }, 3000);
  }
};

// Theme Management
const ThemeManager = {
  init() {
    this.loadTheme();
    this.bindEvents();
    this.updateToggleStates();
  },

  loadTheme() {
    try {
      const savedTheme = localStorage.getItem('portfolioTheme') || 'dark';
      this.setTheme(savedTheme);
    } catch (error) {
      console.warn('Could not load theme preference:', error);
      this.setTheme('dark');
    }
  },

  setTheme(theme) {
    AppState.theme = theme;
    document.body.classList.toggle('light-theme', theme === 'light');
    this.updateMetaThemeColor();
    this.updateToggleStates();

    try {
      localStorage.setItem('portfolioTheme', theme);
    } catch (error) {
      console.warn('Could not save theme preference:', error);
    }
  },

  updateToggleStates() {
    const allToggleButtons = Utils.$$('.theme-toggle');
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
    if (themeColorMeta) {
      const color = AppState.theme === 'light' ? '#fafafa' : '#0a0a0f';
      themeColorMeta.setAttribute('content', color);
    }
  },

  bindEvents() {
  // Handle all theme toggles
  document.addEventListener('click', (e) => {
    const themeToggle = e.target.closest('.theme-toggle');
    if (themeToggle) {
      e.preventDefault();
      this.toggleTheme();
    }
  });

  // Keyboard accessibility
  document.addEventListener('keydown', (e) => {
    const themeToggle = document.activeElement.closest('.theme-toggle');
    if (themeToggle && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      this.toggleTheme();
    }
  });

  // Sync both toggles when theme changes
  document.addEventListener('themeChanged', () => {
    this.updateToggleStates();
  });
}
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
      // Fallback timer - CRITICAL: This ensures preloader always hides
      setTimeout(hidePreloader, 3000);
    }
  },

  hide(preloader) {
    console.log('Hiding preloader...');
    preloader.style.opacity = '0';

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
  }
};

// Animation Management
const AnimationManager = {
  init() {
    this.initScrollAnimations();
    this.initIntersectionObserver();
  },

  initJelloAnimations() {
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
      // Fallback for browsers without IntersectionObserver
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

  parallaxEffect() {
    if (Utils.isMobile()) return; // Skip parallax on mobile for performance

    const scrolled = window.pageYOffset;
    const heroBackground = Utils.$('.hero-background');
    const footerBlob = Utils.$('.footer-blob');

    if (heroBackground) {
      heroBackground.style.transform = `translate(-50%, -50%) translateY(${scrolled * 0.1}px)`;
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
    this.bindMobileMenu();
    this.bindBackToTop();
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
      AnimationManager.parallaxEffect();
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
    });

    // Update mobile navigation
    Utils.$$('.mobile-nav-link').forEach(link => {
      const isActive = link.getAttribute('data-section') === activeId;
      link.classList.toggle('active', isActive);
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
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
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
    if (!backToTop) return;

    const scrollPosition = window.pageYOffset;
    const shouldShow = scrollPosition > 400;

    if (shouldShow) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  },

  adjustHeroPadding() {
    const navbar = Utils.$('.navbar');
    const hero = Utils.$('.hero-section');

    if (navbar && hero) {
      const navbarHeight = navbar.offsetHeight;
      hero.style.paddingTop = `${navbarHeight + 20}px`;
    }
  }
};

// Modal Management
const ModalManager = {
  init() {
    this.bindCertificateModal();
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

  openModal(modal, modalImg, modalCaption, button) {
    const certificatePath = button.getAttribute('data-certificate');
    const card = button.closest('.certification-card');
    const title = card ? card.querySelector('.cert-title') : null;

    modal.style.display = 'block';
    modalImg.src = certificatePath;
    modalCaption.textContent = title ? title.textContent : 'Certificate';

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
    if (Utils.isMobile() || !Utils.supportsFeature('transform')) {
      return;
    }
    this.initCustomCursor();
  },

  initCustomCursor() {
    const cursorInner = Utils.$('.cursor-inner');
    const cursorOuter = Utils.$('.cursor-outer');
    const interactiveElements = Utils.$$('a, button, .tech-item, .project-card, .certification-card');

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
      });

      element.addEventListener('mouseleave', () => {
        cursorInner.classList.remove('hover');
        cursorOuter.classList.remove('hover');
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
      if (e.target.nodeName === 'IMG') {
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
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }
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
         font-weight: 900;         padding: 5px 15px;
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
