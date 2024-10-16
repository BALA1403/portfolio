var audio = document.getElementById("audioPlayer"),
  loader = document.getElementById("preloader");

// Toggles the settings container and related buttons
function settingtoggle() {
  const settingContainer = document.getElementById("setting-container");
  const visualToggle = document.getElementById("visualmodetogglebuttoncontainer");
  const soundToggle = document.getElementById("soundtogglebuttoncontainer");

  if (settingContainer && visualToggle && soundToggle) {
    settingContainer.classList.toggle("settingactivate");
    visualToggle.classList.toggle("visualmodeshow");
    soundToggle.classList.toggle("soundmodeshow");
  }
}

// Play or pause audio based on sound switch
function playpause() {
  if (document.getElementById("switchforsound")) {
    !document.getElementById("switchforsound").checked ? audio.pause() : audio.play();
  }
}

// Toggle light/dark mode
function visualmode() {
  document.body.classList.toggle("light-mode");
  document.querySelectorAll(".needtobeinvert").forEach(function (element) {
    element.classList.toggle("invertapplied");
  });
}

// Hide loader on window load
window.addEventListener("load", function () {
  loader.style.display = "none";
  document.querySelector(".hey").classList.add("popup");
});

// Hamburger menu toggle
function hamburgerMenu() {
  document.body.classList.toggle("stopscrolling");
  const menu = document.getElementById("mobiletogglemenu");
  const bars = ["burger-bar1", "burger-bar2", "burger-bar3"];

  if (menu) {
    menu.classList.toggle("show-toggle-menu");
    bars.forEach(bar => document.getElementById(bar).classList.toggle(`hamburger-animation${bars.indexOf(bar) + 1}`));
  }
}

// Hide mobile menu when a list item is clicked
function hidemenubyli() {
  document.body.classList.toggle("stopscrolling");
  const menu = document.getElementById("mobiletogglemenu");
  const bars = ["burger-bar1", "burger-bar2", "burger-bar3"];

  if (menu) {
    menu.classList.remove("show-toggle-menu");
    bars.forEach(bar => document.getElementById(bar).classList.remove(`hamburger-animation${bars.indexOf(bar) + 1}`));
  }
}

// Highlight active section in navigation
const sections = document.querySelectorAll("section");
const navLi = document.querySelectorAll(".navbar .navbar-tabs .navbar-tabs-ul li");
const mobilenavLi = document.querySelectorAll(".mobiletogglemenu .mobile-navbar-tabs-ul li");

window.addEventListener("scroll", () => {
  let activeId = "";
  sections.forEach(section => {
    if (pageYOffset >= section.offsetTop - 200) {
      activeId = section.getAttribute("id");
    }
  });

  // Highlight mobile and desktop navigation links
  mobilenavLi.forEach(item => {
    item.classList.toggle("activeThismobiletab", item.classList.contains(activeId));
  });
  navLi.forEach(item => {
    item.classList.toggle("activeThistab", item.classList.contains(activeId));
  });
});

// Scroll to top functionality
let mybutton = document.getElementById("backtotopbutton");

function scrollFunction() {
  mybutton.style.display = (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) ? "block" : "none";
}

function scrolltoTopfunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

window.onscroll = function () {
  scrollFunction();
};

// Prevent right-click on images
document.addEventListener("contextmenu", function (e) {
  if (e.target.nodeName === "IMG") {
    e.preventDefault();
  }
});

// Log developer message
console.log("%c Designed and Developed by Balaganesh.", "background-image: linear-gradient(90deg,#124E66,#8697C4); color: white; font-weight: 900; font-size: 1rem; padding: 20px;");
