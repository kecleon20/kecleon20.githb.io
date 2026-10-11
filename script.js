/* =========================================================================
   1. CARRUSEL PRINCIPAL
   ========================================================================= */
const carousel = document.querySelector('#carousel');
const slides = [...document.querySelectorAll('.slide')];
const dots = document.querySelector('#dots');
const next = document.querySelector('#next');
const prev = document.querySelector('#prev');
const pauseCarousel = document.querySelector('#pauseCarousel');
const jumpButtons = [...document.querySelectorAll('[data-jump]')];

let current = 0;
let timer;
let isPaused = false;
const AUTOPLAY_DELAY = 9000;

function getNextSlideIndex(index, total) {
  return total <= 0 ? 0 : (index + 1) % total;
}

function getPreviousSlideIndex(index, total) {
  return total <= 0 ? 0 : (index - 1 + total) % total;
}

function renderDots() {
  if (!dots) return;
  dots.innerHTML = '';
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Ir al slide ${index + 1}`);
    dot.addEventListener('click', () => goTo(index));
    dots.appendChild(dot);
  });
}

function update() {
  if (!carousel) return;
  carousel.style.transform = `translate3d(-${current * 100}%, 0, 0)`;
  slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
  if (dots) {
    [...dots.children].forEach((dot, i) =>
      dot.classList.toggle('active', i === current)
    );
  }
}

function restartAutoplay() {
  clearInterval(timer);
  if (isPaused) return;
  timer = setInterval(() => {
    current = getNextSlideIndex(current, slides.length);
    update();
  }, AUTOPLAY_DELAY);
}

function setPaused(value) {
  isPaused = value;
  if (!pauseCarousel) return;
  pauseCarousel.setAttribute('aria-pressed', String(isPaused));
  pauseCarousel.setAttribute(
    'aria-label',
    isPaused ? 'Reanudar carrusel' : 'Pausar carrusel'
  );
  pauseCarousel.textContent = isPaused ? '▶' : 'Ⅱ';
  restartAutoplay();
}

function goTo(index) {
  current = Math.max(0, Math.min(index, slides.length - 1));
  update();
  restartAutoplay();
}

if (next) {
  next.addEventListener('click', () => {
    current = getNextSlideIndex(current, slides.length);
    update();
    restartAutoplay();
  });
}

if (prev) {
  prev.addEventListener('click', () => {
    current = getPreviousSlideIndex(current, slides.length);
    update();
    restartAutoplay();
  });
}

if (pauseCarousel) {
  pauseCarousel.addEventListener('click', () => setPaused(!isPaused));
}

if (carousel) {
  carousel.addEventListener('mouseenter', () => setPaused(true));
  carousel.addEventListener('mouseleave', () => setPaused(false));
}

jumpButtons.forEach((button) => {
  button.addEventListener('click', () => goTo(Number(button.dataset.jump)));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' && next) next.click();
  if (event.key === 'ArrowLeft' && prev) prev.click();
});

/* =========================================================================
   2. SWIPE TÁCTIL PARA EL CARRUSEL
   ========================================================================= */
let touchStartX = 0;
let touchStartY = 0;
let touchDeltaX = 0;
let touchDeltaY = 0;
let isSwiping = false;

document.addEventListener(
  'touchstart',
  (e) => {
    if (e.target.closest('.certificates-track, .pdf-modal, .image-lightbox'))
      return;
    const t = e.changedTouches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchDeltaX = 0;
    touchDeltaY = 0;
    isSwiping = false;
    setPaused(true);
  },
  { passive: true }
);

document.addEventListener(
  'touchmove',
  (e) => {
    const t = e.changedTouches[0];
    touchDeltaX = t.clientX - touchStartX;
    touchDeltaY = t.clientY - touchStartY;
    if (
      !isSwiping &&
      Math.abs(touchDeltaX) > Math.abs(touchDeltaY) &&
      Math.abs(touchDeltaX) > 12
    ) {
      isSwiping = true;
    }
  },
  { passive: true }
);

document.addEventListener(
  'touchend',
  () => {
    if (isSwiping && Math.abs(touchDeltaX) > 55) {
      if (touchDeltaX < 0) {
        current = getNextSlideIndex(current, slides.length);
      } else {
        current = getPreviousSlideIndex(current, slides.length);
      }
      update();
    }
    isSwiping = false;
    setPaused(false);
  },
  { passive: true }
);

/* =========================================================================
   3. BOTÓN MATERIAS PROMOCIONADAS
   ========================================================================= */
const subjectsButton = document.querySelector('#subjectsButton');
const skillsPanel = document.querySelector('#skillsPanel');
const subjectsPanel = document.querySelector('#subjectsPanel');

if (subjectsButton && skillsPanel && subjectsPanel) {
  subjectsButton.addEventListener('click', () => {
    skillsPanel.classList.toggle('hidden');
    subjectsPanel.classList.toggle('hidden');

    const showingSubjects = !subjectsPanel.classList.contains('hidden');

    subjectsButton.textContent = showingSubjects
      ? 'Ver habilidades'
      : 'Materias promocionadas';

    restartAutoplay();
  });
}

/* =========================================================================
   4. INICIALIZAR CARRUSEL + TESTS
   ========================================================================= */
renderDots();
update();
restartAutoplay();

function runTests() {
  console.assert(getNextSlideIndex(0, 6) === 1, 'next from 0 to 1');
  console.assert(getNextSlideIndex(5, 6) === 0, 'next loops last to first');
  console.assert(getPreviousSlideIndex(0, 6) === 5, 'previous loops first to last');
  console.assert(getPreviousSlideIndex(3, 6) === 2, 'previous moves back');
}
runTests();

/* =========================================================================
   5. CERTIFICADOS — FLECHAS IZQ/DER
   ========================================================================= */
const certificatesTrack = document.querySelector('#certificatesTrack');
const certNext = document.querySelector('#certNext');
const certPrev = document.querySelector('#certPrev');

if (certificatesTrack && certNext && certPrev) {
  certNext.addEventListener('click', () => {
    certificatesTrack.scrollBy({
      left: certificatesTrack.clientWidth * 0.85,
      behavior: 'smooth',
    });
  });

  certPrev.addEventListener('click', () => {
    certificatesTrack.scrollBy({
      left: -certificatesTrack.clientWidth * 0.85,
      behavior: 'smooth',
    });
  });
}

/* =========================================================================
   6. FALLBACKS DE IMÁGENES DE CERTIFICADOS
   ========================================================================= */
document.querySelectorAll('img[data-fallbacks]').forEach((img) => {
  const fallbacks = img.dataset.fallbacks
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  img.addEventListener('error', () => {
    if (!fallbacks.length) return;
    img.src = fallbacks.shift();
    img.dataset.fallbacks = fallbacks.join(',');
  });
});

/* =========================================================================
   7. LIGHTBOX DE CERTIFICADOS CON ZOOM
   ========================================================================= */
const lightbox = document.querySelector('#imageLightbox');
const lightboxImage = document.querySelector('#lightboxImage');
const lightboxCanvas = document.querySelector('#lightboxCanvas');
const closeLightbox = document.querySelector('#closeLightbox');
const zoomIn = document.querySelector('#zoomIn');
const zoomOut = document.querySelector('#zoomOut');
const zoomReset = document.querySelector('#zoomReset');
const openFullImage = document.querySelector('#openFullImage');

let currentZoom = 1;

function setLightboxZoom(value) {
  if (!lightboxImage || !zoomReset) return;
  currentZoom = Math.min(3, Math.max(0.55, value));
  lightboxImage.style.transform = `scale(${currentZoom})`;
  zoomReset.textContent = `${Math.round(currentZoom * 100)}%`;
}

function openCertificate(src, alt) {
  if (!lightbox || !lightboxImage || !openFullImage) return;
  lightboxImage.src = src;
  lightboxImage.alt = alt || 'Certificado ampliado';
  openFullImage.href = src;
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setLightboxZoom(1);
}

function closeCertificate() {
  if (!lightbox) return;
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('.certificate-open img').forEach((img) => {
  img.addEventListener('click', () =>
    openCertificate(img.currentSrc || img.src, img.alt)
  );
});

if (closeLightbox) closeLightbox.addEventListener('click', closeCertificate);
if (zoomIn) zoomIn.addEventListener('click', () => setLightboxZoom(currentZoom + 0.2));
if (zoomOut) zoomOut.addEventListener('click', () => setLightboxZoom(currentZoom - 0.2));
if (zoomReset) zoomReset.addEventListener('click', () => setLightboxZoom(1));

if (lightbox) {
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeCertificate();
  });
}

if (lightboxCanvas) {
  lightboxCanvas.addEventListener(
    'wheel',
    (event) => {
      if (!lightbox || !lightbox.classList.contains('active')) return;
      event.preventDefault();
      setLightboxZoom(currentZoom + (event.deltaY < 0 ? 0.12 : -0.12));
    },
    { passive: false }
  );
}

/* =========================================================================
   8. MODAL PDF (Ver CV / Descargar CV)
   ========================================================================= */
const pdfModal = document.querySelector('#pdfModal');
const pdfFrame = document.querySelector('#pdfFrame');
const pdfClose = document.querySelector('#pdfClose');
const pdfOpenTab = document.querySelector('#pdfOpenTab');
const pdfDownload = document.querySelector('#pdfDownload');
const previewButtons = document.querySelectorAll('[data-pdf]');

function openPdfModal(src) {
  if (!pdfModal || !pdfFrame) return;
  pdfFrame.src = src;
  if (pdfOpenTab) pdfOpenTab.href = src;
  if (pdfDownload) pdfDownload.href = src;
  pdfModal.classList.add('active');
  pdfModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closePdfModal() {
  if (!pdfModal) return;
  pdfModal.classList.remove('active');
  pdfModal.setAttribute('aria-hidden', 'true');
  if (pdfFrame) pdfFrame.src = '';
  document.body.style.overflow = '';
}

previewButtons.forEach((btn) => {
  btn.addEventListener('click', () => openPdfModal(btn.dataset.pdf));
});

if (pdfClose) pdfClose.addEventListener('click', closePdfModal);

if (pdfModal) {
  pdfModal.addEventListener('click', (e) => {
    if (e.target === pdfModal) closePdfModal();
  });
}

/* =========================================================================
   9. TEMA CLARO / OSCURO
   ========================================================================= */
const themeToggle = document.querySelector('#themeToggle');
const themeIcon = themeToggle?.querySelector('.theme-icon');
const STORAGE_KEY = 'portfolio-theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeIcon) themeIcon.textContent = theme === 'light' ? '☀️' : '🌙';
  if (themeToggle) {
    themeToggle.setAttribute(
      'aria-label',
      theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'
    );
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (_) {
    /* localStorage puede fallar en modo privado, ignorar */
  }
}

let savedTheme = null;
try {
  savedTheme = localStorage.getItem(STORAGE_KEY);
} catch (_) {
  savedTheme = null;
}

const systemPrefersLight = window.matchMedia(
  '(prefers-color-scheme: light)'
).matches;
const initialTheme = savedTheme || (systemPrefersLight ? 'light' : 'dark');
applyTheme(initialTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme =
      document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });
}

/* =========================================================================
   10. ATAJOS GLOBALES DE TECLADO
   ========================================================================= */
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeCertificate();
    closePdfModal();
  }
});