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
    slideInterval = setInterval(nextSlide, 6000); // 6 seconds
}

// Initial display and auto-play
showSlides(slideIndex);
slideInterval = setInterval(nextSlide, 6000);

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
const instructionText = document.querySelector('.tap-instruction');

let bookState = 0; // 0: Portada, 1: Recepción

if (eventBook) {
    eventBook.addEventListener('click', () => {
        if (bookState === 0) {
            // Clic 1: Abre la portada (muestra recepción)
            if (instructionText) instructionText.style.opacity = '0';
            layerCover.classList.add('flipped');
            bookState = 1;
        } else {
            // Clic 2: Cierra el libro por completo
            layerCover.classList.remove('flipped');
            if (instructionText) instructionText.style.opacity = '1';
            bookState = 0;
        }
    });
}

// --- Music Toggle Logic ---
const music = document.getElementById('bg-music');
const carouselMusic = document.getElementById('carousel-music');
const musicToggleBtn = document.getElementById('music-toggle');
let isPlaying = false;
let activeAudio = music; // Pista que suena (o que debe sonar) actualmente

let audioActivationCounter = 0;

function stopFade(el) {
    if (el && el._fadeInterval) {
        clearInterval(el._fadeInterval);
        el._fadeInterval = null;
    }
}

function fadeAudio(el, from, to, duration, onDone) {
    if (!el) return;
    stopFade(el);
    const steps = 20;
    const stepTime = duration / steps;
    let step = 0;
    el.volume = from;
    const intervalId = setInterval(() => {
        step++;
        el.volume = Math.max(0, Math.min(1, from + (to - from) * (step / steps)));
        if (step >= steps) {
            clearInterval(intervalId);
            if (el._fadeInterval === intervalId) el._fadeInterval = null;
            if (onDone) onDone();
        }
    }, stepTime);
    el._fadeInterval = intervalId;
}

// Reproduce `el` con fade-in, cancelando cualquier fundido/reproducción pendiente sobre
// ese mismo elemento para que una activación más reciente siempre gane (evita que un
// play() o pause() disparado por un cambio anterior llegue tarde y deje el audio "trabado").
function activateAudio(el, onStarted) {
    if (!el) return;
    stopFade(el);
    el.volume = 0;
    const token = ++audioActivationCounter;
    el._activationToken = token;
    el.play().then(() => {
        if (el._activationToken !== token) return; // Un cambio posterior ya invalidó esta activación
        fadeAudio(el, 0, 1, 600);
        if (onStarted) onStarted();
    }).catch(error => console.log('Audio bloqueado:', error));
}

// Fade-out + pausa de `el`, invalidando cualquier activación pendiente sobre el mismo elemento.
function deactivateAudio(el) {
    if (!el) return;
    el._activationToken = ++audioActivationCounter;
    stopFade(el);
    fadeAudio(el, el.volume, 0, 600, () => el.pause());
}

function playActive() {
    if (!activeAudio) return;
    activateAudio(activeAudio, () => {
        if (musicToggleBtn) musicToggleBtn.classList.add('playing');
        isPlaying = true;
    });
}

function pauseActive() {
    if (!activeAudio) return;
    deactivateAudio(activeAudio);
    if (musicToggleBtn) musicToggleBtn.classList.remove('playing');
    isPlaying = false;
}

// Cambia la pista activa (con crossfade) cuando el usuario entra/sale del carrusel de fotos
function switchTrack(nextAudio) {
    if (!nextAudio || activeAudio === nextAudio) return;
    const previous = activeAudio;
    activeAudio = nextAudio;

    if (!isPlaying) return; // Solo se recuerda cuál pista debe sonar al reanudar

    deactivateAudio(previous);
    activateAudio(nextAudio);
}

if (musicToggleBtn && music) {
    musicToggleBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseActive();
        } else {
            playActive();
        }
    });

    // Optional: Attempt to play on first scroll interaction (some browsers allow this)
    const playOnInteraction = () => {
        if (!isPlaying) {
            playActive();
            document.removeEventListener('scroll', playOnInteraction);
        }
    };

    document.addEventListener('scroll', playOnInteraction, { once: true });
}

// Suena "Serenata" mientras el carrusel de fotos está visible; vuelve a la música normal al salir
const carouselContainerEl = document.querySelector('.carousel-container');
if (carouselMusic && carouselContainerEl) {
    const musicObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            switchTrack(entry.isIntersecting ? carouselMusic : music);
        });
    }, { threshold: 0.5 });

    musicObserver.observe(carouselContainerEl);
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
        
        if (!isPlaying) {
            playActive();
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

// --- API Integración Asistencia ---
const API_URL = 'https://backinvitacionc.vercel.app/guests';

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

// Cargar familias desde la API
fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        let arr = data.data || [];
        
        // Ordenar alfabéticamente
        arr.sort((a, b) => a.name.localeCompare(b.name));
        familiesList = arr;

        if (familySelect) {
            familySelect.innerHTML = '<option value="" disabled selected>Selecciona tu familia...</option>';
            
            // Mostrar todas las familias sin filtrar
            arr.forEach(family => {
                const option = document.createElement('option');
                option.value = family.id;
                option.textContent = family.name;
                familySelect.appendChild(option);
            });
            
            if (arr.length === 0) {
                familySelect.innerHTML = '<option value="" disabled selected>No se encontraron familias</option>';
                familySelect.disabled = true;
            }
        }
    })
    .catch(error => console.error("Error al cargar familias:", error));

// Búsqueda de familias - Cambiado a Select
if (familySelect) {
    familySelect.addEventListener('change', (e) => {
        const familyId = e.target.value;
        
        // Deshabilitar temporalmente mientras se hace la petición
        familySelect.disabled = true;
        
        fetch(`${API_URL}/${familyId}`)
            .then(response => response.json())
            .then(data => {
                // Asumiendo que la API devuelve los datos directamente o en 'data'
                const family = data.data || data;
                if (family) {
                    selectFamily(family);
                }
            })
            .catch(error => {
                console.error("Error al obtener detalles de la familia:", error);
                alert("Hubo un error al cargar los datos. Intenta de nuevo.");
            })
            .finally(() => {
                familySelect.disabled = false;
            });
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
        if (!selectedFamily) return;
        
        const attendingCount = parseInt(attendingCountSelect.value) || 0;
        
        // Deshabilitar botones mientras se guarda
        btnConfirmAttendance.disabled = true;
        btnConfirmAttendance.textContent = 'Guardando...';
        btnDeclineAttendance.disabled = true;
        
        // Petición de actualización a la API (Asumiendo método PATCH al endpoint del invitado)
        fetch(`${API_URL}/${selectedFamily.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'confirmed',
                attendingCount: attendingCount
            })
        }).then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
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
        if (!selectedFamily) return;
        
        if (confirm('¿Estás seguro que deseas declinar la invitación?')) {
            btnDeclineAttendance.disabled = true;
            btnDeclineAttendance.textContent = 'Guardando...';
            btnConfirmAttendance.disabled = true;
            
            // Petición de actualización a la API
            fetch(`${API_URL}/${selectedFamily.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'declined',
                    attendingCount: 0
                })
            }).then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
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
                showSuccess('Entendemos', 'Lamentamos que no puedan asistir. Gracias por avisarnos.', false);
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

// --- API Integración Amigos (RSVP sin familia) ---
const FRIEND_API_URL = 'https://backinvitacionc.vercel.app/amigos/confirmar';

const btnFriendToggle = document.getElementById('btn-friend-toggle');
const friendOptionsStep = document.getElementById('friend-options-step');
const friendNameStep = document.getElementById('friend-name-step');
const friendSuccessStep = document.getElementById('friend-success-step');
const friendNameInput = document.getElementById('friend-name-input');
const friendNameError = document.getElementById('friend-name-error');
const friendSuccessIcon = document.getElementById('friend-success-icon');
const friendSuccessMessage = document.getElementById('friend-success-message');
const btnFriendYes = document.getElementById('btn-friend-yes');
const btnFriendNo = document.getElementById('btn-friend-no');
const btnFriendBack = document.getElementById('btn-friend-back');
const btnFriendSubmit = document.getElementById('btn-friend-submit');

function hideFriendSteps() {
    friendOptionsStep.classList.add('hidden');
    friendNameStep.classList.add('hidden');
    friendSuccessStep.classList.add('hidden');
}

function showFriendResult(icon, message, showGiftModal = false) {
    hideFriendSteps();
    friendSuccessIcon.textContent = icon;
    friendSuccessMessage.textContent = message;
    friendSuccessStep.classList.remove('hidden');

    if (showGiftModal) {
        setTimeout(openGiftModal, 900);
    }
}

if (btnFriendToggle) {
    btnFriendToggle.addEventListener('click', () => {
        const isHidden = friendOptionsStep.classList.contains('hidden');
        hideFriendSteps();
        if (isHidden) {
            friendOptionsStep.classList.remove('hidden');
        }
    });
}

if (btnFriendYes) {
    btnFriendYes.addEventListener('click', () => {
        hideFriendSteps();
        friendNameStep.classList.remove('hidden');
        friendNameInput.focus();
    });
}

if (btnFriendNo) {
    btnFriendNo.addEventListener('click', () => {
        showFriendResult('♡', 'Gracias por avisarnos, ¡te extrañaremos!');
    });
}

if (btnFriendBack) {
    btnFriendBack.addEventListener('click', () => {
        friendNameInput.value = '';
        friendNameError.classList.add('hidden');
        hideFriendSteps();
        friendOptionsStep.classList.remove('hidden');
    });
}

if (btnFriendSubmit) {
    btnFriendSubmit.addEventListener('click', () => {
        const name = friendNameInput.value.trim();

        if (!name) {
            friendNameError.classList.remove('hidden');
            return;
        }
        friendNameError.classList.add('hidden');

        btnFriendSubmit.disabled = true;
        btnFriendSubmit.textContent = 'Guardando...';

        fetch(FRIEND_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        }).then(async response => {
            if (response.status === 201) {
                showFriendResult('✓', `¡Gracias ${name}, te esperamos!`, true);
            } else {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Hubo un error al confirmar. Intenta de nuevo.');
            }
        }).catch(err => {
            console.error('Error al confirmar amigo:', err);
            alert(err.message || 'Hubo un error al confirmar. Intenta de nuevo.');
        }).finally(() => {
            btnFriendSubmit.disabled = false;
            btnFriendSubmit.textContent = 'Confirmar Asistencia';
        });
    });
}

function showSuccess(title, msg, showGiftModal = true) {
    document.getElementById('success-title').textContent = title;
    document.getElementById('success-message').textContent = msg;

    detailsStep.classList.add('hidden');
    successStep.classList.remove('hidden');

    if (showGiftModal) {
        setTimeout(openGiftModal, 900);
    }
}

// --- Modal: Nota de Regalos ---
const giftModalOverlay = document.getElementById('gift-modal-overlay');
const giftModalClose = document.getElementById('gift-modal-close');
const giftModalBtn = document.getElementById('gift-modal-btn');

function openGiftModal() {
    if (!giftModalOverlay) return;
    giftModalOverlay.classList.remove('hidden');
    requestAnimationFrame(() => giftModalOverlay.classList.add('show'));
}

function closeGiftModal() {
    if (!giftModalOverlay) return;
    giftModalOverlay.classList.remove('show');
    setTimeout(() => giftModalOverlay.classList.add('hidden'), 350);
}

if (giftModalOverlay) {
    giftModalClose.addEventListener('click', closeGiftModal);
    giftModalBtn.addEventListener('click', closeGiftModal);
    giftModalOverlay.addEventListener('click', (e) => {
        if (e.target === giftModalOverlay) closeGiftModal();
    });
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
