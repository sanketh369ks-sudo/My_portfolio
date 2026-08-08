/* ==========================================================
   script.js
   PART 1 (Lines 1–150)
   DOM Selection • Hamburger Menu • Mobile Navigation
   Smooth Scrolling • Sticky Navbar
========================================================== */

"use strict";

/* ==========================================================
   DOM ELEMENTS
========================================================== */

const body = document.body;

const header =
    document.querySelector(".navbar");

const navMenu =
    document.querySelector(".nav-links");

const navLinks =
    document.querySelectorAll(".nav-links a");

const hamburger =
    document.querySelector(".hamburger");

const heroSection =
    document.querySelector("#home");

/* ==========================================================
   MOBILE MENU TOGGLE
========================================================== */

if (hamburger && navMenu) {

    hamburger.addEventListener("click", () => {

        hamburger.classList.toggle("active");

        navMenu.classList.toggle("active");

        body.classList.toggle("menu-open");

    });

}

/* ==========================================================
   CLOSE MENU WHEN LINK IS CLICKED
========================================================== */

navLinks.forEach((link) => {

    link.addEventListener("click", () => {

        if (!navMenu || !hamburger) return;

        navMenu.classList.remove("active");

        hamburger.classList.remove("active");

        body.classList.remove("menu-open");

    });

});

/* ==========================================================
   CLOSE MENU WHEN CLICKING OUTSIDE
========================================================== */

document.addEventListener("click", (event) => {

    if (!navMenu || !hamburger) return;

    const insideMenu =
        navMenu.contains(event.target);

    const insideButton =
        hamburger.contains(event.target);

    if (
        !insideMenu &&
        !insideButton &&
        navMenu.classList.contains("active")
    ) {

        navMenu.classList.remove("active");

        hamburger.classList.remove("active");

        body.classList.remove("menu-open");

    }

});

/* ==========================================================
   ESC KEY CLOSE
========================================================== */

document.addEventListener("keydown", (event) => {

    if (event.key !== "Escape") return;

    navMenu?.classList.remove("active");

    hamburger?.classList.remove("active");

    body.classList.remove("menu-open");

});

/* ==========================================================
   SMOOTH SCROLL
========================================================== */

navLinks.forEach((link) => {

    link.addEventListener("click", (event) => {

        const targetId =
            link.getAttribute("href");

        if (
            !targetId ||
            !targetId.startsWith("#")
        ) return;

        const target =
            document.querySelector(targetId);

        if (!target) return;

        event.preventDefault();

        const offset =
            header ? header.offsetHeight : 80;

        const top =
            target.offsetTop - offset;

        window.scrollTo({

            top,

            behavior: "smooth"

        });

    });

});

/* ==========================================================
   STICKY NAVBAR
========================================================== */

function updateNavbar() {

    if (!header) return;

    if (window.scrollY > 80) {

        header.classList.add("sticky");

    } else {

        header.classList.remove("sticky");

    }

}

window.addEventListener(
    "scroll",
    updateNavbar,
    { passive: true }
);

updateNavbar();

/* ==========================================================
   HERO BUTTON SMOOTH SCROLL
========================================================== */

document
    .querySelectorAll("[data-scroll]")
    .forEach((button) => {

        button.addEventListener("click", () => {

            const selector =
                button.dataset.scroll;

            const target =
                document.querySelector(selector);

            if (!target) return;

            target.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        });

    });

/* ==========================================================
   END OF PART 1
========================================================== */
/* ==========================================================
   PART 2 (Lines 151–300)
   Scroll Reveal • Active Navigation
   Scroll Progress • Back To Top
========================================================== */

/* ==========================================================
   SCROLL REVEAL
========================================================== */

const revealElements = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-up, .reveal-scale"
);

function revealOnScroll() {

    const trigger =
        window.innerHeight * 0.85;

    revealElements.forEach((element) => {

        const top =
            element.getBoundingClientRect().top;

        if (top < trigger) {

            element.classList.add("active");

        }

    });

}

window.addEventListener(
    "scroll",
    revealOnScroll,
    { passive: true }
);

revealOnScroll();

/* ==========================================================
   ACTIVE NAVIGATION
========================================================== */

const sections =
    document.querySelectorAll("section[id]");

function updateActiveLink() {

    const scroll =
        window.scrollY + 140;

    sections.forEach((section) => {

        const top = section.offsetTop;

        const height = section.offsetHeight;

        const id = section.id;

        if (
            scroll >= top &&
            scroll < top + height
        ) {

            navLinks.forEach((link) =>
                link.classList.remove("active")
            );

            const active =
                document.querySelector(
                    `.nav-links a[href="#${id}"]`
                );

            active?.classList.add("active");

        }

    });

}

window.addEventListener(
    "scroll",
    updateActiveLink,
    { passive: true }
);

updateActiveLink();

/* ==========================================================
   SCROLL PROGRESS BAR
========================================================== */

const progressBar =
    document.querySelector(".scroll-progress");

function updateProgressBar() {

    if (!progressBar) return;

    const totalHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

    const progress =
        (window.scrollY / totalHeight) * 100;

    progressBar.style.width =
        `${progress}%`;

}

window.addEventListener(
    "scroll",
    updateProgressBar,
    { passive: true }
);

updateProgressBar();

/* ==========================================================
   BACK TO TOP BUTTON
========================================================== */

const backToTop =
    document.querySelector(".back-to-top");

function toggleBackToTop() {

    if (!backToTop) return;

    if (window.scrollY > 500) {

        backToTop.classList.add("show");

    } else {

        backToTop.classList.remove("show");

    }

}

window.addEventListener(
    "scroll",
    toggleBackToTop,
    { passive: true }
);

toggleBackToTop();

backToTop?.addEventListener("click", () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});

/* ==========================================================
   HEADER SHADOW ON SCROLL
========================================================== */

window.addEventListener(
    "scroll",
    () => {

        if (!header) return;

        header.classList.toggle(
            "navbar-shadow",
            window.scrollY > 20
        );

    },
    { passive: true }
);

/* ==========================================================
   END OF PART 2
========================================================== */
/* ==========================================================
   PART 3 (Lines 301–450)
   Achievement Lightbox • Certificate Modal
   Image Viewer • Close Functionality
========================================================== */

"use strict";

/* ==========================================================
   DOM ELEMENTS
========================================================== */

const lightbox =
    document.querySelector(".lightbox");

const lightboxImage =
    document.querySelector(".lightbox-image");

const closeLightbox =
    document.querySelector(".close-lightbox");

const achievementImages =
    document.querySelectorAll(".achievement-image img");

const certificateModal =
    document.querySelector(".certificate-modal");

const modalImage =
    document.querySelector(".modal-image");

const closeModal =
    document.querySelector(".close-modal");

const certificateImages =
    document.querySelectorAll(".certificate-card img");

const viewButtons =
    document.querySelectorAll(".view-btn");

/* ==========================================================
   ACHIEVEMENT LIGHTBOX
========================================================== */

function openLightbox(src, alt = "") {

    if (!lightbox || !lightboxImage) return;

    lightboxImage.src = src;

    lightboxImage.alt = alt;

    lightbox.classList.add("active");

    document.body.style.overflow = "hidden";

}

achievementImages.forEach((image) => {

    image.addEventListener("click", () => {

        openLightbox(image.src, image.alt);

    });

});

/* ==========================================================
   CLOSE LIGHTBOX
========================================================== */

function closeAchievementLightbox() {

    if (!lightbox) return;

    lightbox.classList.remove("active");

    document.body.style.overflow = "";

}

closeLightbox?.addEventListener(
    "click",
    closeAchievementLightbox
);

lightbox?.addEventListener("click", (event) => {

    if (event.target === lightbox) {

        closeAchievementLightbox();

    }

});

/* ==========================================================
   CERTIFICATE MODAL
========================================================== */

function openCertificateModal(src, alt = "") {

    if (!certificateModal || !modalImage) return;

    modalImage.src = src;

    modalImage.alt = alt;

    certificateModal.classList.add("active");

    document.body.style.overflow = "hidden";

}

certificateImages.forEach((image) => {

    image.addEventListener("click", () => {

        openCertificateModal(image.src, image.alt);

    });

});

viewButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const card =
            button.closest(".certificate-card");

        const image =
            card?.querySelector("img");

        if (!image) return;

        openCertificateModal(image.src, image.alt);

    });

});

/* ==========================================================
   CLOSE CERTIFICATE MODAL
========================================================== */

function closeCertificateViewer() {

    if (!certificateModal) return;

    certificateModal.classList.remove("active");

    document.body.style.overflow = "";

}

closeModal?.addEventListener(
    "click",
    closeCertificateViewer
);

certificateModal?.addEventListener(
    "click",
    (event) => {

        if (event.target === certificateModal) {

            closeCertificateViewer();

        }

    }
);

/* ==========================================================
   ESCAPE KEY SUPPORT
========================================================== */

document.addEventListener("keydown", (event) => {

    if (event.key !== "Escape") return;

    closeAchievementLightbox();

    closeCertificateViewer();

});

/* ==========================================================
   IMAGE PRELOAD
========================================================== */

[
    ...achievementImages,
    ...certificateImages
].forEach((image) => {

    const preload = new Image();

    preload.src = image.src;

});

/* ==========================================================
   END OF PART 3
========================================================== */
/* ==========================================================
   PART 4 (Lines 451–600)
   Floating Particles • Typing Effect
   Utility Functions • Performance • Initialization
========================================================== */

"use strict";

/* ==========================================================
   FLOATING PARTICLES
========================================================== */

const particlesContainer =
    document.querySelector(".bg-effects");

function createParticle() {

    if (!particlesContainer) return;

    const particle =
        document.createElement("span");

    particle.className = "particle";

    if (Math.random() > 0.5) {

        particle.classList.add("orange");

    }

    const size =
        Math.random() * 8 + 4;

    particle.style.width =
        `${size}px`;

    particle.style.height =
        `${size}px`;

    particle.style.left =
        `${Math.random() * 100}%`;

    particle.style.animationDuration =
        `${10 + Math.random() * 10}s`;

    particle.style.animationDelay =
        `${Math.random() * 3}s`;

    particlesContainer.appendChild(particle);

    particle.addEventListener(
        "animationend",
        () => particle.remove()
    );

}

setInterval(createParticle, 500);

/* ==========================================================
   OPTIONAL TYPING EFFECT
========================================================== */

const typingElement =
    document.querySelector(".typing");

const typingTexts = [

    "Full Stack Developer",

    "Java Developer",

    "Python Developer",

    "Web Designer"

];

let textIndex = 0;

let charIndex = 0;

let deleting = false;

function typingEffect() {

    if (!typingElement) return;

    const current =
        typingTexts[textIndex];

    if (!deleting) {

        typingElement.textContent =
            current.substring(
                0,
                charIndex++
            );

        if (charIndex > current.length) {

            deleting = true;

            setTimeout(
                typingEffect,
                1200
            );

            return;

        }

    } else {

        typingElement.textContent =
            current.substring(
                0,
                charIndex--
            );

        if (charIndex < 0) {

            deleting = false;

            textIndex =
                (textIndex + 1) %
                typingTexts.length;

        }

    }

    setTimeout(
        typingEffect,
        deleting ? 45 : 90
    );

}

typingEffect();

/* ==========================================================
   DEBOUNCE
========================================================== */

function debounce(fn, delay = 200) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            fn(...args);

        }, delay);

    };

}

/* ==========================================================
   WINDOW RESIZE
========================================================== */

window.addEventListener(

    "resize",

    debounce(() => {

        revealOnScroll?.();

        updateNavbar?.();

        updateActiveLink?.();

    }, 200)

);

/* ==========================================================
   LAZY LOAD IMAGES
========================================================== */

const lazyImages =
    document.querySelectorAll("img[data-src]");

if ("IntersectionObserver" in window) {

    const observer =
        new IntersectionObserver(

            (entries, obs) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting)
                        return;

                    const img =
                        entry.target;

                    img.src =
                        img.dataset.src;

                    img.removeAttribute(
                        "data-src"
                    );

                    obs.unobserve(img);

                });

            },

            {
                threshold: 0.15
            }

        );

    lazyImages.forEach((img) =>
        observer.observe(img)
    );

}

/* ==========================================================
   PAGE LOADED
========================================================== */

window.addEventListener("load", () => {

    document.body.classList.add(
        "loaded"
    );

    revealOnScroll?.();

    updateNavbar?.();

    updateActiveLink?.();

    updateProgressBar?.();

});

/* ==========================================================
   CONSOLE MESSAGE
========================================================== */

console.log(
    "%cPortfolio Loaded Successfully 🚀",
    "color:#F27D13;font-size:16px;font-weight:bold;"
);

console.log(
    "Designed & Developed by Shashidhar K"
);

/* ==========================================================
   END OF SCRIPT.JS
========================================================== */