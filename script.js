// Configuration: Set the date of the event
const eventDate = new Date('September 19, 2026 16:00:00').getTime();

// Inicializar paneles de eventos
const _pRecepcion = document.getElementById('panel-recepcion');
if (_pRecepcion) { _pRecepcion.style.opacity = '0'; _pRecepcion.style.transform = 'translateY(40px)'; }

function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) {
        document.getElementById('countdown').innerHTML = "<h3>¡El gran día ha llegado!</h3>";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = days.toString().padStart(2, '0');
    document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
    document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
}

// Initial call
updateCountdown();

// Update every second
const timerInterval = setInterval(updateCountdown, 1000);

// Simple reveal animation on scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
        }
    });
}, observerOptions);

document.querySelectorAll('.section, .card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.8s ease-out';
    observer.observe(el);
});

// Add a CSS class dynamically for reveal effects
const style = document.createElement('style');
style.textContent = `
    .reveal {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// --- Carousel Logic ---
let slideIndex = 1;
let slideInterval;

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("carousel-slide");
    let dots = document.getElementsByClassName("dot");
    
    if (!slides.length) return;
    
    if (n > slides.length) {slideIndex = 1}    
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "block";  
    if (dots.length > 0) {
        dots[slideIndex-1].className += " active";
    }
}

function changeSlide(n) {
    showSlides(slideIndex += n);
    resetInterval();
}

function currentSlide(n) {
    showSlides(slideIndex = n);
    resetInterval();
}

function nextSlide() {
    showSlides(slideIndex += 1);
}

function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 3500); // 3.5 seconds
}

// Initial display and auto-play
showSlides(slideIndex);
slideInterval = setInterval(nextSlide, 3000);

// --- Story Scroll Animation ---
document.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // The background elements fade out between 0 and 400px of scroll
    const fadeOutProgress = Math.min(scrollY / 400, 1);
    const elementsToFadeOut = document.querySelectorAll('#rueda-left, #rueda-right, #horse-img, #flowers-img, .text-info');
    
    elementsToFadeOut.forEach(el => {
        el.style.opacity = 1 - fadeOutProgress;
        el.style.transform = `translateY(-${fadeOutProgress * 50}px)`;
        // Restore float animation if at top, but realistically the float is lost once transformed
        // It's a trade-off for the scroll effect.
    });
    
    // Subtle scale effect on the Quinceañera
    const persona = document.getElementById('persona-img');
    if (persona) {
        const progress = Math.min(scrollY / 600, 1);
        const scale = 1 + (progress * 0.1);
        persona.style.transform = `scale(${scale})`;
    }

    // Fade IN the new text above and below the girl
    const fadeInProgress = Math.max(0, Math.min((scrollY - 200) / 400, 1));
    const storyTexts = document.querySelectorAll('.story-text');
    storyTexts.forEach(el => {
        el.style.opacity = fadeInProgress;
        el.style.transform = `translateY(${30 - (fadeInProgress * 30)}px)`;
    });


    // --- Transición Ceremonia → Recepción ---
    const eventsSection = document.getElementById('events-scroll');
    const panelCeremonia = document.getElementById('panel-ceremonia');
    const panelRecepcion = document.getElementById('panel-recepcion');

    if (eventsSection && panelCeremonia && panelRecepcion) {
        const top = eventsSection.offsetTop;
        const height = eventsSection.offsetHeight;
        const progress = Math.min(Math.max((scrollY - top) / (height * 0.5), 0), 1);

        panelCeremonia.style.opacity = 1 - progress;
        panelCeremonia.style.transform = `translateY(${-progress * 40}px)`;

        panelRecepcion.style.opacity = progress;
        panelRecepcion.style.transform = `translateY(${(1 - progress) * 40}px)`;
    }
});

// --- Music Toggle Logic ---
const music = document.getElementById('bg-music');
const musicToggleBtn = document.getElementById('music-toggle');
let isPlaying = false;

if (musicToggleBtn && music) {
    musicToggleBtn.addEventListener('click', () => {
        if (isPlaying) {
            music.pause();
            musicToggleBtn.classList.remove('playing');
            isPlaying = false;
        } else {
            music.play().then(() => {
                musicToggleBtn.classList.add('playing');
                isPlaying = true;
            }).catch(error => {
                console.log("Audio play failed:", error);
            });
        }
    });

    // Optional: Attempt to play on first scroll interaction (some browsers allow this)
    const playOnInteraction = () => {
        if (!isPlaying) {
            music.play().then(() => {
                musicToggleBtn.classList.add('playing');
                isPlaying = true;
                document.removeEventListener('scroll', playOnInteraction);
            }).catch(e => {
                // Autoplay blocked, wait for explicit click
            });
        }
    };
    
    document.addEventListener('scroll', playOnInteraction, { once: true });
}

// --- Envelope / Splash Screen Logic ---
document.body.classList.add('locked'); // Lock scroll initially

const splashScreen = document.getElementById('splash-screen');
const openBtn      = document.getElementById('open-invitation');
const flap         = document.getElementById('envelope-flap');
const waxSeal      = document.getElementById('wax-seal');
const letterCard   = document.getElementById('letter-card');

if (openBtn && splashScreen) {
    openBtn.addEventListener('click', () => {
        // 1. Ocultar botón
        openBtn.classList.add('clicked');

        // 2. Romper el sello de cera
        if (waxSeal) waxSeal.classList.add('break');

        // 3. Abrir la solapa (después 400ms)
        setTimeout(() => {
            if (flap) flap.classList.add('open');
        }, 400);

        // 4. Hacer emerger la carta del sobre (después 900ms)
        setTimeout(() => {
            if (letterCard) letterCard.classList.add('emerge');
        }, 900);

        // 5. Desvanecer todo el splash y habilitar scroll (después 2.4s)
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            document.body.classList.remove('locked');

            // Auto-play música al entrar
            if (music && !isPlaying) {
                music.play().then(() => {
                    if (musicToggleBtn) musicToggleBtn.classList.add('playing');
                    isPlaying = true;
                }).catch(e => console.log('Audio play failed:', e));
            }
        }, 2400);
    });
}

