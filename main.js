// Global variables

const loader = document.getElementById("preloader");

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeNavigation();
});

// Initialize animations for page elements
function initializeAnimations() {
    // Add loading animation to elements
    const elements = document.querySelectorAll('[data-aos]');
    elements.forEach(element => {
        element.classList.add('loading');
    });

    // Trigger animations after a short delay
    setTimeout(() => {
        elements.forEach(element => {
            element.classList.remove('loading');
            element.classList.add('loaded');
        });
    }, 500);
}

// Initialize navigation functionality
function initializeNavigation() {
    // Add smooth scrolling to navigation links
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
                // Close mobile menu if open
                if (document.getElementById("mobiletogglemenu").classList.contains("show-toggle-menu")) {
                    hidemenubyli();
                }
            }
        });
    });
}

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


// Initialize with proper error handling and feature detection
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if not on mobile and browser supports required features
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const supportsTransform = 'transform' in document.documentElement.style;
    const supportsRequestAnimationFrame = 'requestAnimationFrame' in window;

    if (!isMobile && supportsTransform && supportsRequestAnimationFrame) {
        try {
        } catch (error) {
            console.warn('Cursor initialization failed:', error);
            // Fallback to default cursor
            document.body.style.cursor = 'auto';
        }
    }
});
// Settings container toggle with improved error handling
function settingtoggle() {
    try {
        const settingContainer = document.getElementById("setting-container");
        const visualToggle = document.getElementById("visualmodetogglebuttoncontainer");
        const soundToggle = document.getElementById("soundtogglebuttoncontainer");

        if (settingContainer && visualToggle && soundToggle) {
            settingContainer.classList.toggle("settingactivate");
            visualToggle.classList.toggle("visualmodeshow");
            soundToggle.classList.toggle("soundmodeshow");
        }
    } catch (error) {
        console.error("Error in settingtoggle:", error);
    }
}



// Enhanced visual mode toggle
function visualmode() {
  try {
    document.body.classList.toggle("light-mode");

    // Save preference to localStorage
    if (typeof(Storage) !== "undefined") {
      localStorage.setItem("darkMode", !document.body.classList.contains("light-mode"));
    }
  } catch (error) {
    console.error("Error in visualmode:", error);
  }
}


// Load saved theme preference
function loadThemePreference() {
    if (typeof(Storage) !== "undefined") {
        const isDarkMode = localStorage.getItem("darkMode");
        if (isDarkMode === "false") {
            visualmode();
        }
    }
}

// Enhanced preloader handling
window.addEventListener("load", function() {
    try {
        // Hide loader with fade effect
        if (loader) {
            loader.style.opacity = "0";
            setTimeout(() => {
                loader.style.display = "none";
            }, 300);
        }

        // Add popup animation to greeting
        const greeting = document.querySelector(".hey");
        if (greeting) {
            greeting.classList.add("popup");
        }

        // Load theme preference
        loadThemePreference();

        // Initialize jello animations
        initializeJelloAnimations();

    } catch (error) {
        console.error("Error in window load handler:", error);
    }
});

// Initialize jello animations for text
function initializeJelloAnimations() {
    const jelloElements = document.querySelectorAll('.jello');
    jelloElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;

        // Add click interaction
        element.addEventListener('click', function() {
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = 'jello 2s ease-in-out infinite';
            }, 10);
        });
    });
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

            // Animate hamburger bars
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

        // Optional: Show a custom message
        const notification = document.createElement('div');
        notification.textContent = 'Image download is disabled';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: var(--secondary-color);
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-family: 'Orbitron', monospace;
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
    // ESC key closes mobile menu
    if (e.key === 'Escape') {
        const menu = document.getElementById("mobiletogglemenu");
        if (menu && menu.classList.contains("show-toggle-menu")) {
            hidemenubyli();
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

    // Observe all sections and project boxes
    document.querySelectorAll('section, .project-box, .tech-stack-box').forEach(el => {
        observer.observe(el);
    });
}

// Resume download function
function openURL() {
    try {
        const url = "src/resume/resume.pdf";
        window.open(url, "_blank");

        // Optional: Track download analytics
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
        // Recalculate positions if needed
        updateActiveNavigation();
    }, 250);
});

// Console styling (enhanced)
console.log(
    "%c🚀 Designed and Developed by Balaganesh S B",
    `background: linear-gradient(90deg, #00ff88, #007acc);
     color: white;
     font-weight: 900;
     font-size: 1.2rem;
     padding: 20px;
     border-radius: 10px;
     text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
     box-shadow: 0 4px 15px rgba(0,255,136,0.3);`
);

console.log(
    "%c💼 Portfolio: Oracle Certified Java Developer",
    `background: linear-gradient(90deg, #124E66, #8697C4);
     color: white;
     font-weight: 600;
     font-size: 1rem;
     padding: 10px 20px;
     border-radius: 5px;`
);

// Error handling for global errors
window.addEventListener('error', function(e) {
    console.error('Global error caught:', e.error);
    // Could send to analytics or error reporting service
});

// Service worker registration (if you add one later)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('SW registered'))
            .catch(() => console.log('SW registration failed'));
    });
}

document.addEventListener('DOMContentLoaded', function() {
  // Get the modal
  const modal = document.getElementById("certificateModal");
  const modalImg = document.getElementById("modalImage");
  const captionText = document.getElementById("caption");

  // Get all elements with class "view-certificate"
  const certLinks = document.querySelectorAll(".view-certificate");

  // When the user clicks on a certificate link, open the modal
  certLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      modal.style.display = "block";
      modalImg.src = this.getAttribute('data-certificate');
      captionText.innerHTML = this.parentElement.querySelector('.cert-title').textContent;
    });
  });

  // When the user clicks on the close button, close the modal
  document.querySelector('.close').addEventListener('click', function() {
    modal.style.display = "none";
  });

  // When the user clicks anywhere outside of the modal, close it
  window.addEventListener('click', function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
});

// Toggle mobile menu
const hamburger = document.getElementById('hamburger');
const navbar = document.getElementById('navbar');

hamburger.addEventListener('click', () => {
  navbar.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.navbar-tabs-ul li a').forEach(link => {
  link.addEventListener('click', () => {
    navbar.classList.remove('active');
  });
});
