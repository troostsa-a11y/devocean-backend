/**
 * Lightweight Gallery Lightbox for Accommodation Detail Pages
 * - Click on gallery images to view fullscreen
 * - Navigate with arrows or keyboard (left/right, ESC to close)
 * - Touch-friendly for mobile
 * - Accessible with ARIA labels
 */
(function() {
  'use strict';

  var lightbox = null;
  var lightboxImg = null;
  var lightboxCounter = null;
  var images = [];
  var currentIndex = 0;

  function init() {
    var gallery = document.querySelector('.dl-gallery');
    if (!gallery) return;

    images = Array.from(gallery.querySelectorAll('.dl-gallery-frame img'));
    if (images.length === 0) return;

    createLightbox();
    attachClickHandlers();
    attachKeyboardHandler();
  }

  function createLightbox() {
    lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Image gallery viewer');
    lightbox.innerHTML = [
      '<div class="lightbox-overlay" data-testid="lightbox-overlay"></div>',
      '<button class="lightbox-close" aria-label="Close gallery" data-testid="button-lightbox-close">',
      '  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
      '    <path d="M18 6L6 18M6 6l12 12"/>',
      '  </svg>',
      '</button>',
      '<button class="lightbox-nav lightbox-prev" aria-label="Previous image" data-testid="button-lightbox-prev">',
      '  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
      '    <path d="M15 18l-6-6 6-6"/>',
      '  </svg>',
      '</button>',
      '<div class="lightbox-content">',
      '  <img class="lightbox-img" src="" alt="" data-testid="img-lightbox">',
      '</div>',
      '<button class="lightbox-nav lightbox-next" aria-label="Next image" data-testid="button-lightbox-next">',
      '  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
      '    <path d="M9 18l6-6-6-6"/>',
      '  </svg>',
      '</button>',
      '<div class="lightbox-counter" data-testid="text-lightbox-counter"></div>'
    ].join('');

    document.body.appendChild(lightbox);

    lightboxImg = lightbox.querySelector('.lightbox-img');
    lightboxCounter = lightbox.querySelector('.lightbox-counter');

    lightbox.querySelector('.lightbox-overlay').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', function(e) {
      e.stopPropagation();
      navigate(-1);
    });
    lightbox.querySelector('.lightbox-next').addEventListener('click', function(e) {
      e.stopPropagation();
      navigate(1);
    });

    var startX = 0;
    var endX = 0;
    lightbox.addEventListener('touchstart', function(e) {
      startX = e.changedTouches[0].screenX;
    }, { passive: true });
    lightbox.addEventListener('touchend', function(e) {
      endX = e.changedTouches[0].screenX;
      var diff = startX - endX;
      if (Math.abs(diff) > 50) {
        navigate(diff > 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  function attachClickHandlers() {
    images.forEach(function(img, index) {
      var frame = img.closest('.dl-gallery-frame');
      frame.style.cursor = 'zoom-in';
      frame.setAttribute('role', 'button');
      frame.setAttribute('tabindex', '0');
      frame.setAttribute('aria-label', 'View image ' + (index + 1) + ' of ' + images.length + ' in fullscreen');
      frame.setAttribute('data-testid', 'button-gallery-image-' + (index + 1));

      frame.addEventListener('click', function() {
        openLightbox(index);
      });

      frame.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });
  }

  function attachKeyboardHandler() {
    document.addEventListener('keydown', function(e) {
      if (!lightbox.classList.contains('active')) return;

      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          navigate(-1);
          break;
        case 'ArrowRight':
          navigate(1);
          break;
      }
    });
  }

  function openLightbox(index) {
    currentIndex = index;
    updateImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox-close').focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    images[currentIndex].closest('.dl-gallery-frame').focus();
  }

  function navigate(direction) {
    currentIndex = (currentIndex + direction + images.length) % images.length;
    updateImage();
  }

  function updateImage() {
    var img = images[currentIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || 'Gallery image ' + (currentIndex + 1);
    lightboxCounter.textContent = (currentIndex + 1) + ' / ' + images.length;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
