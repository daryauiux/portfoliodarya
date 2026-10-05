// Header scroll state
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.style.display === 'flex';
    nav.style.display = isOpen ? 'none' : 'flex';
    nav.style.flexDirection = 'column';
    nav.style.position = 'absolute';
    nav.style.top = '72px';
    nav.style.right = '4%';
    nav.style.background = 'var(--white)';
    nav.style.padding = '1.2rem';
    nav.style.borderRadius = '12px';
    nav.style.boxShadow = 'var(--shadow-hover)';
    nav.style.gap = '1rem';
  });
}

// ========== Before/After comparison sliders ==========
function initComparisons() {
  document.querySelectorAll('[data-comparison]').forEach(comp => {
    const beforeWrap = comp.querySelector('.comp-before-wrap');
    const beforeImg = comp.querySelector('.comp-before');
    const handle = comp.querySelector('.comp-handle');
    if (!beforeWrap || !beforeImg || !handle) return;

    let pos = 50; // percent
    let dragging = false;
    let moved = false;
    let startX = 0;

    function setSize() {
      const w = comp.offsetWidth;
      beforeImg.style.width = w + 'px';
    }

    function setPos(percent) {
      pos = Math.max(2, Math.min(98, percent));
      beforeWrap.style.width = pos + '%';
      handle.style.left = pos + '%';
    }

    function getPercent(clientX) {
      const rect = comp.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    setSize();
    setPos(50);

    // Mouse
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      dragging = true;
      moved = false;
      startX = e.clientX;
    });

    comp.addEventListener('mousedown', (e) => {
      if (e.target.closest('.comp-handle') || e.target.closest('.comp-knob')) return;
      // allow clicking anywhere to jump
      dragging = true;
      moved = false;
      startX = e.clientX;
      setPos(getPercent(e.clientX));
    });

    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      if (Math.abs(e.clientX - startX) > 3) moved = true;
      setPos(getPercent(e.clientX));
    });

    window.addEventListener('mouseup', () => {
      dragging = false;
    });

    // Touch
    handle.addEventListener('touchstart', (e) => {
      dragging = true;
      moved = false;
      startX = e.touches[0].clientX;
    }, { passive: true });

    comp.addEventListener('touchstart', (e) => {
      if (e.target.closest('.comp-handle')) return;
      dragging = true;
      moved = false;
      startX = e.touches[0].clientX;
      setPos(getPercent(e.touches[0].clientX));
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      const x = e.touches[0].clientX;
      if (Math.abs(x - startX) > 3) moved = true;
      setPos(getPercent(x));
    }, { passive: true });

    window.addEventListener('touchend', () => {
      dragging = false;
    });

    // Resize
    window.addEventListener('resize', setSize);

    // Click without drag → open lightbox on after image
    comp.addEventListener('click', (e) => {
      if (moved) return;
      // open lightbox with after image
      const beforeSrc = beforeImg.src;
      const afterSrc = comp.querySelector('.comp-after')?.src;
      openLightboxFromPair(beforeSrc, afterSrc);
    });
  });
}

// ========== Lightbox ==========
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.lightbox-close');
const prevBtn = document.querySelector('.lightbox-prev');
const nextBtn = document.querySelector('.lightbox-next');

let gallery = [];
let currentIndex = 0;

function collectImages() {
  gallery = [];
  const heroImg = document.querySelector('.hero-photo img');
  if (heroImg) {
    gallery.push({ src: heroImg.src, alt: heroImg.alt || '' });
  }
  // All comparison images (before + after)
  document.querySelectorAll('.comp-before, .comp-after').forEach(img => {
    gallery.push({ src: img.src, alt: img.alt || '' });
  });
  // Single images
  document.querySelectorAll('.img-wrap img').forEach(img => {
    gallery.push({ src: img.src, alt: img.alt || '' });
  });
}

function openLightbox(index) {
  collectImages();
  if (!gallery.length) return;
  currentIndex = ((index % gallery.length) + gallery.length) % gallery.length;
  lightboxImg.src = gallery[currentIndex].src;
  lightboxImg.alt = gallery[currentIndex].alt;
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function openLightboxFromPair(beforeSrc, afterSrc) {
  collectImages();
  // Prefer showing after image
  let idx = gallery.findIndex(g => g.src === afterSrc);
  if (idx < 0) idx = gallery.findIndex(g => g.src === beforeSrc);
  if (idx < 0) idx = 0;
  openLightbox(idx);
}

function closeLightbox() {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function showPrev() {
  currentIndex = (currentIndex - 1 + gallery.length) % gallery.length;
  lightboxImg.src = gallery[currentIndex].src;
  lightboxImg.alt = gallery[currentIndex].alt;
}

function showNext() {
  currentIndex = (currentIndex + 1) % gallery.length;
  lightboxImg.src = gallery[currentIndex].src;
  lightboxImg.alt = gallery[currentIndex].alt;
}

// Single image click (pilot etc.)
document.querySelectorAll('.img-wrap').forEach((wrap) => {
  wrap.addEventListener('click', () => {
    collectImages();
    const img = wrap.querySelector('img');
    const idx = gallery.findIndex(g => g.src === img.src);
    openLightbox(idx >= 0 ? idx : 0);
  });
});

// Hero photo
const heroPhoto = document.querySelector('.hero-photo');
if (heroPhoto) {
  heroPhoto.addEventListener('click', () => {
    openLightbox(0);
  });
}

if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

if (prevBtn) prevBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  showPrev();
});

if (nextBtn) nextBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  showNext();
});

if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
}

document.addEventListener('keydown', (e) => {
  if (!lightbox || !lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPrev();
  if (e.key === 'ArrowRight') showNext();
});

// Init comparisons after DOM ready
initComparisons();
window.addEventListener("load", () => {
  document.querySelectorAll("[data-comparison]").forEach(comp => {
    const beforeImg = comp.querySelector(".comp-before");
    if (beforeImg) beforeImg.style.width = comp.offsetWidth + "px";
  });
});
