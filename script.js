const carousel = document.querySelector('#carousel');
const slides = [...document.querySelectorAll('.slide')];
const dots = document.querySelector('#dots');
const next = document.querySelector('#next');
const prev = document.querySelector('#prev');
const jumpButtons = [...document.querySelectorAll('[data-jump]')];
let current = 0;
let timer;

function getNextSlideIndex(index, total) {
  return total <= 0 ? 0 : (index + 1) % total;
}

function getPreviousSlideIndex(index, total) {
  return total <= 0 ? 0 : (index - 1 + total) % total;
}

function renderDots() {
  dots.innerHTML = '';
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Ir al slide ${index + 1}`);
    dot.addEventListener('click', () => goTo(index));
    dots.appendChild(dot);
  });
}

function update() {
  carousel.style.transform = `translateX(-${current * 100}vw)`;
  slides.forEach((slide, index) => slide.classList.toggle('active', index === current));
  [...dots.children].forEach((dot, index) => dot.classList.toggle('active', index === current));
}

function restartAutoplay() {
  clearInterval(timer);
  timer = setInterval(() => {
    current = getNextSlideIndex(current, slides.length);
    update();
  }, 6500);
}

function goTo(index) {
  current = Math.max(0, Math.min(index, slides.length - 1));
  update();
  restartAutoplay();
}

next.addEventListener('click', () => {
  current = getNextSlideIndex(current, slides.length);
  update();
  restartAutoplay();
});

prev.addEventListener('click', () => {
  current = getPreviousSlideIndex(current, slides.length);
  update();
  restartAutoplay();
});

jumpButtons.forEach((button) => {
  button.addEventListener('click', () => goTo(Number(button.dataset.jump)));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') next.click();
  if (event.key === 'ArrowLeft') prev.click();
});

function runTests() {
  console.assert(getNextSlideIndex(0, 7) === 1, 'next from 0 to 1');
  console.assert(getNextSlideIndex(6, 7) === 0, 'next loops last to first');
  console.assert(getPreviousSlideIndex(0, 7) === 6, 'previous loops first to last');
  console.assert(getPreviousSlideIndex(3, 7) === 2, 'previous moves back');
}
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
renderDots();
update();
restartAutoplay();
runTests();
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


/* =========================
   CERTIFICADOS: FALLBACKS + LIGHTBOX CON ZOOM
========================= */
document.querySelectorAll('img[data-fallbacks]').forEach((img) => {
  const fallbacks = img.dataset.fallbacks.split(',').map((item) => item.trim()).filter(Boolean);

  img.addEventListener('error', () => {
    if (!fallbacks.length) return;
    img.src = fallbacks.shift();
    img.dataset.fallbacks = fallbacks.join(',');
  });
});

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
  img.addEventListener('click', () => openCertificate(img.currentSrc || img.src, img.alt));
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
  lightboxCanvas.addEventListener('wheel', (event) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    event.preventDefault();
    setLightboxZoom(currentZoom + (event.deltaY < 0 ? 0.12 : -0.12));
  }, { passive: false });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeCertificate();
});
