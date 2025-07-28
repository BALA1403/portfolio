// Global variables
const loader = document.getElementById("preloader");
let animationId;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  initializeAnimations();
  initializeNavigation();
  initializeCertificateModal();
  loadThemePreference();
});

// Initialize animations for page elements
function initializeAnimations() {
  const elements = document.querySelectorAll('[data-aos]');
  elements.forEach(element => {
    element.classList.add('loading');
  });

  setTimeout(() => {
    elements.forEach(element => {
      element.classList.remove('loading');
      element.classList.add('loaded');
    });
  }, 500);
}

// Initialize navigation functionality
function initializeNavigation() {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        if (document.getElementById("mobiletogglemenu").classList.contains("show-toggle-menu")) {
          hidemenubyli();
        }
      }
    });
  });
}

// Initialize certificate modal functionality
function initializeCertificateModal() {
  const modal = document.getElementById("certificateModal");
  const modalImg = document.getElementById("modalImage");
  const captionText = document.getElementById("caption");
  const certLinks = document.querySelectorAll(".view-certificate");
  const closeBtn = document.querySelector('.close');

  certLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      modal.style.display = "block";
      modalImg.src = this.getAttribute('data-certificate');
      captionText.innerHTML = this.parentElement.querySelector('.cert-title').textContent;
    });
  });

  closeBtn.addEventListener('click', function() {
    modal.style.display = "none";
  });

  window.addEventListener('click', function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
}

// Enhanced visual mode toggle
function visualmode() {
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
  } catch (error) {
    console.error("Error in visualmode:", error);
  }
}

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

// Enhanced preloader handling
window.addEventListener("load", function() {
  try {
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
      }, 300);
    }

    const greeting = document.querySelector(".hey");
    if (greeting) {
      greeting.classList.add("popup");
    }

    initializeJelloAnimations();
    adjustLandingPadding();

  } catch (error) {
    console.error("Error in window load handler:", error);
  }
});

// Initialize jello animations
function initializeJelloAnimations() {
  const jelloElements = document.querySelectorAll('.jello');
  jelloElements.forEach((element, index) => {
    element.style.setProperty('--i', index);
    element.style.animation = 'jello 3s ease-in-out infinite';
    element.style.animationDelay = `${index * 0.15}s`;

    element.addEventListener('click', function() {
      this.style.animation = 'none';
      setTimeout(() => {
        this.style.animation = 'jello 3s ease-in-out infinite';
        this.style.animationDelay = `${index * 0.15}s`;
      }, 10);
    });
  });
}

// Adjust padding dynamically based on navbar height
function adjustLandingPadding() {
  const navbar = document.getElementById('navbar');
  const landing = document.querySelector('.landing-page-container');
  if (navbar && landing) {
    const navbarHeight = navbar.offsetHeight;
    landing.style.paddingTop = `${navbarHeight + 20}px`;
  }
}

// Enhanced hamburger menu with animation
function hamburgerMenu() {
  try {
    document.body.classList.toggle("stopscrolling");
    const menu = document.getElementById("mobiletogglemenu");
    const bars = ["burger-bar1", "burger-bar2", "burger-bar3"];

    if (menu) {
      const isMenuOpen = menu.classList.contains("show-toggle-menu");

      if (isMenuOpen) {
        menu.classList.remove("show-toggle-menu");
        menu.classList.add("hide-toggle-menu");
      } else {
        menu.classList.add("show-toggle-menu");
        menu.classList.remove("hide-toggle-menu");
      }

      bars.forEach((bar, index) => {
        const barElement = document.getElementById(bar);
        if (barElement) {
          barElement.classList.toggle(`hamburger-animation${index + 1}`);
        }
      });
    }
  } catch (error) {
    console.error("Error in hamburgerMenu:", error);
  }
}

// Hide mobile menu when navigation item is clicked
function hidemenubyli() {
  try {
    document.body.classList.remove("stopscrolling");
    const menu = document.getElementById("mobiletogglemenu");
    const bars = ["burger-bar1", "burger-bar2", "burger-bar3"];

    if (menu) {
      menu.classList.remove("show-toggle-menu");
      menu.classList.add("hide-toggle-menu");

      bars.forEach((bar, index) => {
        const barElement = document.getElementById(bar);
        if (barElement) {
          barElement.classList.remove(`hamburger-animation${index + 1}`);
        }
      });
    }
  } catch (error) {
    console.error("Error in hidemenubyli:", error);
  }
}

// Enhanced navigation highlighting
const sections = document.querySelectorAll("section[id]");
const navLi = document.querySelectorAll(".navbar .navbar-tabs .navbar-tabs-ul li");
const mobilenavLi = document.querySelectorAll(".mobiletogglemenu .mobile-navbar-tabs-ul li");

function updateActiveNavigation() {
  let activeId = "";
  const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      activeId = section.getAttribute("id");
    }
  });

  // Update desktop navigation
  navLi.forEach(item => {
    const isActive = item.classList.contains(activeId);
    item.classList.toggle("activeThistab", isActive);
  });

  // Update mobile navigation
  mobilenavLi.forEach(item => {
    const isActive = item.classList.contains(activeId);
    item.classList.toggle("activeThismobiletab", isActive);
  });
}

// Throttled scroll handler for better performance
let scrollTimeout;
window.addEventListener("scroll", () => {
  if (scrollTimeout) {
    cancelAnimationFrame(scrollTimeout);
  }
  scrollTimeout = requestAnimationFrame(() => {
    updateActiveNavigation();
    scrollFunction();
    parallaxEffect();
  });
});

// Add parallax effect to blob
function parallaxEffect() {
  const blob = document.querySelector('.blob');
  const footerBlob = document.querySelector('.footer-blob');
  const scrolled = window.pageYOffset;

  if (blob) {
    blob.style.transform = `translate(-50%, -50%) translateY(${scrolled * 0.1}px)`;
  }

  if (footerBlob) {
    footerBlob.style.transform = `translateX(-50%) translateY(${scrolled * 0.05}px)`;
  }
}

// Enhanced back to top functionality
const backToTopButton = document.getElementById("backtotopbutton");

function scrollFunction() {
  if (backToTopButton) {
    const scrollPosition = document.body.scrollTop || document.documentElement.scrollTop;

    if (scrollPosition > 400) {
      backToTopButton.style.display = "block";
      backToTopButton.style.opacity = "1";
    } else {
      backToTopButton.style.opacity = "0";
      setTimeout(() => {
        if (backToTopButton.style.opacity === "0") {
          backToTopButton.style.display = "none";
        }
      }, 300);
    }
  }
}

function scrolltoTopfunction() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Enhanced image protection
document.addEventListener("contextmenu", function(e) {
  if (e.target.nodeName === "IMG") {
    e.preventDefault();

    const notification = document.createElement('div');
    notification.textContent = 'Image download is disabled';
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
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  }
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const menu = document.getElementById("mobiletogglemenu");
    if (menu && menu.classList.contains("show-toggle-menu")) {
      hidemenubyli();
    }

    // Close certificate modal
    const modal = document.getElementById("certificateModal");
    if (modal && modal.style.display === "block") {
      modal.style.display = "none";
    }
  }
});

// Add intersection observer for animations
function setupIntersectionObserver() {
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

  document.querySelectorAll('section, .project-box, .tech-stack-box').forEach(el => {
    observer.observe(el);
  });
}

// Resume download function
function openURL() {
  try {
    const url = "src/resume/resume.pdf";
    window.open(url, "_blank");

    if (typeof gtag !== 'undefined') {
      gtag('event', 'download', {
        'event_category': 'Resume',
        'event_label': 'PDF Download'
      });
    }
  } catch (error) {
    console.error("Error opening resume:", error);
    alert("Resume download temporarily unavailable. Please try again later.");
  }
}

// Initialize intersection observer when DOM is loaded
document.addEventListener('DOMContentLoaded', setupIntersectionObserver);

// Performance optimization: Debounce resize events
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    updateActiveNavigation();
    adjustLandingPadding();
  }, 250);
});

// Handle page visibility changes
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }
});

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});

// Custom cursor functionality for desktop
document.addEventListener('DOMContentLoaded', function() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const supportsTransform = 'transform' in document.documentElement.style;
  const supportsRequestAnimationFrame = 'requestAnimationFrame' in window;

  if (!isMobile && supportsTransform && supportsRequestAnimationFrame) {
    try {
      const cursorInner = document.getElementById("cursor-inner");
      const cursorOuter = document.getElementById("cursor-outer");
      const links = document.querySelectorAll("a, label, button, .tech-stack-box, .project-box");

      if (cursorInner && cursorOuter) {
        document.addEventListener("mousemove", function(e) {
          const posX = e.clientX;
          const posY = e.clientY;

          cursorInner.style.left = `${posX}px`;
          cursorInner.style.top = `${posY}px`;

          cursorOuter.animate({
            left: `${posX}px`,
            top: `${posY}px`,
          }, {
            duration: 300,
            fill: "forwards"
          });
        });

        links.forEach((link) => {
          link.addEventListener("mouseenter", () => {
            cursorInner.classList.add("hover");
            cursorOuter.classList.add("hover");
          });
          link.addEventListener("mouseleave", () => {
            cursorInner.classList.remove("hover");
            cursorOuter.classList.remove("hover");
          });
        });
      }
    } catch (error) {
      console.warn('Cursor initialization failed:', error);
      document.body.style.cursor = 'auto';
    }
  }
});

// Console styling
console.log(
  "%c🚀 Designed and Developed by Balaganesh S B",
  `background: linear-gradient(90deg, #A5B68D, #C1CFA1);
   color: white;
   font-weight: 900;
   font-size: 1.2rem;
   padding: 20px;
   border-radius: 10px;
   text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
   box-shadow: 0 4px 15px rgba(165,182,141,0.3);`
);

console.log(
  "%c💼 Portfolio: Oracle Certified Java Developer",
  `background: linear-gradient(90deg, #000B58, #003161);
   color: white;
   font-weight: 600;
   font-size: 1rem;
   padding: 10px 20px;
   border-radius: 5px;`
);

// Error handling for global errors
window.addEventListener('error', function(e) {
  console.error('Global error caught:', e.error);
});

// Service worker registration (optional for future use)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW registered'))
      .catch(() => console.log('SW registration failed'));
  });
}

// Additional mobile menu functionality
const hamburger = document.getElementById('hamburger');
const navbar = document.getElementById('navbar');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navbar.classList.toggle('active');
  });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.navbar-tabs-ul li a, .mobile-navbar-tabs-ul li a').forEach(link => {
  link.addEventListener('click', () => {
    if (navbar) {
      navbar.classList.remove('active');
    }
  });
});

// Smooth scroll behavior for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const navbarHeight = document.getElementById('navbar').offsetHeight;
      const targetPosition = target.offsetTop - navbarHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Add loading class to body initially
document.body.classList.add('loading');

// Remove loading class after page load
window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
  }, 500);
});
