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


});

// --- Libro Interactivo de Eventos ---
const eventBook = document.getElementById('event-book');
const layerCover = document.getElementById('layer-cover');
const layerCeremony = document.getElementById('layer-ceremony');
const instructionText = document.querySelector('.tap-instruction');

let bookState = 0; // 0: Portada, 1: Ceremonia, 2: Recepción

if (eventBook) {
    eventBook.addEventListener('click', () => {
        if (bookState === 0) {
            // Clic 1: Abre la portada (muestra ceremonia)
            if (instructionText) instructionText.style.opacity = '0';
            layerCover.classList.add('flipped');
            bookState = 1;
        } else if (bookState === 1) {
            // Clic 2: Voltea página de ceremonia (muestra recepción)
            layerCeremony.classList.add('flipped');
            bookState = 2;
        } else if (bookState === 2) {
            // Clic 3: Cierra el libro por completo
            layerCover.classList.remove('flipped');
            layerCeremony.classList.remove('flipped');
            if (instructionText) instructionText.style.opacity = '1';
            bookState = 0;
        }
    });
}

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

const splashScreen  = document.getElementById('splash-screen');
const openBtn       = document.querySelector('.envelope'); // El sobre
const instruction   = document.getElementById('open-instruction');
const flap          = document.getElementById('envelope-flap');
const waxSeal       = document.getElementById('wax-seal');
const envelopeScene = document.querySelector('.envelope-scene');

if (openBtn && splashScreen) {
    openBtn.addEventListener('click', () => {
        // 1. Ocultar instrucción y deshabilitar más clics
        if (instruction) instruction.classList.add('hidden');
        openBtn.style.pointerEvents = 'none';

        // Reproducir música y efecto de sonido inmediatamente al tocar el sobre
        const sfxOpen = document.getElementById('sfx-open');
        if (sfxOpen) sfxOpen.play().catch(e => console.log('SFX bloqueado:', e));
        
        if (music && !isPlaying) {
            music.play().then(() => {
                if (musicToggleBtn) musicToggleBtn.classList.add('playing');
                isPlaying = true;
            }).catch(e => console.log('Audio background bloqueado:', e));
        }

        // 2. Romper el sello de cera
        if (waxSeal) waxSeal.classList.add('break');

        // 3. Abrir la solapa (después 400ms)
        setTimeout(() => {
            if (flap) flap.classList.add('open');
        }, 400);

        // 4. Efecto de entrar al sobre (después de abrir solapa)
        setTimeout(() => {
            if (envelopeScene) envelopeScene.classList.add('zoom-in');
        }, 900);

        // 5. Desvanecer todo el splash y habilitar scroll (después 2.4s)
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            document.body.classList.remove('locked');
        }, 2400);
    });
}

// --- Firebase Integración Asistencia ---
const firebaseConfig = {
  apiKey: "AIzaSyCfmmyyScTL1A9TUGD4mjxMFlVjg0WQQoM",
  authDomain: "invitacion-be60d.firebaseapp.com",
  projectId: "invitacion-be60d",
  storageBucket: "invitacion-be60d.firebasestorage.app",
  messagingSenderId: "634606934656",
  appId: "1:634606934656:web:2bafaf3d9d2ce24c3d6465",
  measurementId: "G-E4N3HG6J05"
};

// Initialize Firebase
let app, db;
if (typeof firebase !== 'undefined') {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
}

// Elementos UI Asistencia
const familySelect = document.getElementById('family-select');
const searchStep = document.getElementById('search-step');
const detailsStep = document.getElementById('details-step');
const successStep = document.getElementById('success-step');

const familyNameDisplay = document.getElementById('selected-family-name');
const totalPassesDisplay = document.getElementById('total-passes');
const attendingCountSelect = document.getElementById('attending-count');
const btnConfirmAttendance = document.getElementById('btn-confirm-attendance');
const btnDeclineAttendance = document.getElementById('btn-decline-attendance');
const btnBackToSearch = document.getElementById('btn-back-to-search');
const btnNewSearch = document.getElementById('btn-new-search');

let familiesList = [];
let selectedFamily = null;

// Cargar familias de Firestore
if (db) {
    db.collection('guests').get().then((snapshot) => {
        let arr = [];
        snapshot.forEach(doc => {
            arr.push({ id: doc.id, ...doc.data() });
        });
        
        // Ordenar alfabéticamente
        arr.sort((a, b) => a.name.localeCompare(b.name));
        familiesList = arr;

        if (familySelect) {
            familySelect.innerHTML = '<option value="" disabled selected>Selecciona tu familia...</option>';
            
            // Filtrar las familias que no han confirmado o declinado
            const pendingFamilies = arr.filter(f => !f.status || f.status === 'pending' || f.status === '');
            
            pendingFamilies.forEach(family => {
                const option = document.createElement('option');
                option.value = family.id;
                option.textContent = family.name;
                familySelect.appendChild(option);
            });
            
            if (pendingFamilies.length === 0) {
                familySelect.innerHTML = '<option value="" disabled selected>Todas las invitaciones han sido confirmadas</option>';
                familySelect.disabled = true;
            }
        }
    }).catch(error => console.error("Error al cargar familias:", error));
}

// Búsqueda de familias - Cambiado a Select
if (familySelect) {
    familySelect.addEventListener('change', (e) => {
        const familyId = e.target.value;
        const family = familiesList.find(f => f.id === familyId);
        if (family) {
            selectFamily(family);
        }
    });
}

function selectFamily(family) {
    selectedFamily = family;
    
    // Configurar Paso 2
    familyNameDisplay.textContent = family.name;
    const count = parseInt(family.count) || 0;
    totalPassesDisplay.textContent = count;
    
    // Generar opciones del select
    attendingCountSelect.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i === 1 ? '1 persona' : `${i} personas`;
        attendingCountSelect.appendChild(option);
    }
    
    // Seleccionar por defecto la cantidad máxima o la previamente seleccionada
    if (family.attendingCount) {
        attendingCountSelect.value = family.attendingCount;
    } else {
        attendingCountSelect.value = count;
    }
    
    searchStep.classList.add('hidden');
    detailsStep.classList.remove('hidden');
}

// Confirmar Asistencia
if (btnConfirmAttendance) {
    btnConfirmAttendance.addEventListener('click', () => {
        if (!selectedFamily || !db) return;
        
        const attendingCount = parseInt(attendingCountSelect.value) || 0;
        
        // Deshabilitar botones mientras se guarda
        btnConfirmAttendance.disabled = true;
        btnConfirmAttendance.textContent = 'Guardando...';
        btnDeclineAttendance.disabled = true;
        
        db.collection('guests').doc(selectedFamily.id).update({
            status: 'confirmed',
            attendingCount: attendingCount,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            // Actualizar local
            selectedFamily.status = 'confirmed';
            selectedFamily.attendingCount = attendingCount;
            
            // Remover del select en vivo
            if (familySelect) {
                const option = familySelect.querySelector(`option[value="${selectedFamily.id}"]`);
                if (option) option.remove();
                
                if (familySelect.options.length <= 1) { // Solo queda el placeholder
                    familySelect.innerHTML = '<option value="" disabled selected>Todas las invitaciones han sido confirmadas</option>';
                    familySelect.disabled = true;
                }
            }
            
            // Mostrar éxito
            showSuccess('¡Gracias por confirmar!', 'Los esperamos con mucha emoción.');
        }).catch(err => {
            console.error("Error al confirmar:", err);
            alert("Hubo un error al confirmar. Por favor, intenta de nuevo.");
        }).finally(() => {
            btnConfirmAttendance.disabled = false;
            btnConfirmAttendance.textContent = 'Confirmar Asistencia';
            btnDeclineAttendance.disabled = false;
        });
    });
}

// No asistiremos
if (btnDeclineAttendance) {
    btnDeclineAttendance.addEventListener('click', () => {
        if (!selectedFamily || !db) return;
        
        if (confirm('¿Estás seguro que deseas declinar la invitación?')) {
            btnDeclineAttendance.disabled = true;
            btnDeclineAttendance.textContent = 'Guardando...';
            btnConfirmAttendance.disabled = true;
            
            db.collection('guests').doc(selectedFamily.id).update({
                status: 'declined',
                attendingCount: 0,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                selectedFamily.status = 'declined';
                selectedFamily.attendingCount = 0;
                
                // Remover del select en vivo
                if (familySelect) {
                    const option = familySelect.querySelector(`option[value="${selectedFamily.id}"]`);
                    if (option) option.remove();
                    
                    if (familySelect.options.length <= 1) {
                        familySelect.innerHTML = '<option value="" disabled selected>Todas las invitaciones han sido confirmadas</option>';
                        familySelect.disabled = true;
                    }
                }
                
                // Mostrar éxito
                const icon = document.querySelector('.success-icon');
                if (icon) icon.textContent = '♡';
                showSuccess('Entendemos', 'Lamentamos que no puedan asistir. Gracias por avisarnos.');
            }).catch(err => {
                console.error("Error al declinar:", err);
                alert("Hubo un error al guardar. Por favor, intenta de nuevo.");
            }).finally(() => {
                btnDeclineAttendance.disabled = false;
                btnDeclineAttendance.textContent = 'No asistiremos';
                btnConfirmAttendance.disabled = false;
            });
        }
    });
}

function showSuccess(title, msg) {
    document.getElementById('success-title').textContent = title;
    document.getElementById('success-message').textContent = msg;
    
    detailsStep.classList.add('hidden');
    successStep.classList.remove('hidden');
}

// Controles de navegación de vuelta
if (btnBackToSearch) {
    btnBackToSearch.addEventListener('click', () => {
        detailsStep.classList.add('hidden');
        searchStep.classList.remove('hidden');
        selectedFamily = null;
        if (familySelect) familySelect.value = '';
    });
}

if (btnNewSearch) {
    btnNewSearch.addEventListener('click', () => {
        successStep.classList.add('hidden');
        searchStep.classList.remove('hidden');
        selectedFamily = null;
        if (familySelect) familySelect.value = '';
        // Reset logic para icon success
        const icon = document.querySelector('.success-icon');
        if (icon) icon.textContent = '✓';
    });
}
