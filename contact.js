/**
 * Balaji Granites — Dedicated Contact Page Logic
 * Manages vertical curtain reveal animation, persistent navbar interactions,
 * mobile menu, smooth in-page transitions, interactive form submission,
 * and WhatsApp concierge handoff.
 */

document.addEventListener('DOMContentLoaded', () => {
  const pillNavbar = document.getElementById('pill-navbar');
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const navLinksMenu = document.getElementById('nav-links-menu');
  const curtainOverlay = document.getElementById('contact-curtain-overlay');
  const contentWrap = document.getElementById('contact-content-wrap');

  // 1. Vertical White/Ivory Page Transition Curtain Reveal
  if (curtainOverlay) {
    requestAnimationFrame(() => {
      setTimeout(() => {
        curtainOverlay.classList.add('is-dismissed');
        if (contentWrap) {
          contentWrap.classList.add('is-revealed');
        }
      }, 70);
    });
  }

  // 2. Smooth vertical curtain transition when navigating to other internal pages
  document.querySelectorAll('a[href="/"], a[href^="/#"], a[href^="/index.html"], a[href^="index.html"], a[href^="/about"], a[href^="about"], a[href^="/products"], a[href^="products"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetHref = link.getAttribute('href');
      if (!targetHref || targetHref.startsWith('#') || targetHref.includes('wa.me')) return;
      e.preventDefault();

      if (curtainOverlay) {
        curtainOverlay.style.transition = 'none';
        curtainOverlay.style.transform = 'translate3d(0, 100%, 0)';
        void curtainOverlay.offsetWidth;
        curtainOverlay.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
        curtainOverlay.style.transform = 'translate3d(0, 0, 0)';
      }

      setTimeout(() => {
        window.location.href = targetHref;
      }, 500);
    });
  });

  // 3. Navbar Scroll State
  const updateNavbarScroll = () => {
    if (!pillNavbar) return;
    if (window.scrollY > 40) {
      pillNavbar.classList.add('is-scrolled');
    } else {
      pillNavbar.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', updateNavbarScroll, { passive: true });
  updateNavbarScroll();

  // 4. Mobile Nav Toggle
  if (mobileToggle && navLinksMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      navLinksMenu.classList.toggle('is-open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinksMenu.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 5. Smooth Scroll for Hero Start CTA
  const heroStartCta = document.getElementById('hero-start-cta');
  if (heroStartCta) {
    heroStartCta.addEventListener('click', (e) => {
      e.preventDefault();
      const formSection = document.getElementById('contact-form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
        const nameInput = document.getElementById('contact-name');
        if (nameInput) {
          setTimeout(() => nameInput.focus(), 600);
        }
      }
    });
  }

  // 6. Quick Option Pills on Hero Tablet (inspired by video frames 00:00 - 00:02)
  document.querySelectorAll('.tablet-option-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const typeVal = btn.getAttribute('data-type');
      if (typeVal) {
        const matchingRadio = document.querySelector(`input[name="project_type"][value="${typeVal}"]`);
        if (matchingRadio) {
          matchingRadio.checked = true;
        }
      }
      const formSection = document.getElementById('contact-form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
        const messageInput = document.getElementById('contact-message');
        if (messageInput) {
          setTimeout(() => messageInput.focus(), 600);
        }
      }
    });
  });

  // 7. Interactive Form Handling & Validation
  const contactForm = document.getElementById('architectural-contact-form');
  const formSuccessState = document.getElementById('form-success-state');
  const formSuccessCopy = document.getElementById('success-message-text');
  const successWhatsappBtn = document.getElementById('success-whatsapp-link');
  const formResetBtn = document.getElementById('form-reset-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = (document.getElementById('contact-name')?.value || '').trim();
      const phone = (document.getElementById('contact-phone')?.value || '').trim();
      const email = (document.getElementById('contact-email')?.value || '').trim();
      const selectedType = document.querySelector('input[name="project_type"]:checked')?.value || 'General Architectural';
      const message = (document.getElementById('contact-message')?.value || '').trim();

      if (!name || !email || !message) {
        alert('Please complete the required fields (Name, Email, and Message).');
        return;
      }

      // Generate WhatsApp Direct Pre-filled Text
      const waText = `Hello Balaji Granites team,%0A%0A*New Project Inquiry:*%0A• Name: ${encodeURIComponent(name)}%0A• Phone: ${encodeURIComponent(phone || 'Not specified')}%0A• Email: ${encodeURIComponent(email)}%0A• Project Type: ${encodeURIComponent(selectedType)}%0A%0A*Project Details:*%0A${encodeURIComponent(message)}%0A%0AThank you!`;
      const waUrl = `https://wa.me/919660222886?text=${waText}`;

      if (successWhatsappBtn) {
        successWhatsappBtn.href = waUrl;
      }

      if (formSuccessCopy) {
        formSuccessCopy.textContent = `Thank you, ${name}. Your project details have been received by our stone specialists in Jaipur. We will review your spatial requirements and get in touch within 24 hours.`;
      }

      // Transition to success state
      contactForm.style.display = 'none';
      if (formSuccessState) {
        formSuccessState.classList.add('is-active');
      }

      // Smoothly ensure card is in view
      const formCard = document.getElementById('contact-form-card');
      if (formCard) {
        formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  if (formResetBtn && contactForm && formSuccessState) {
    formResetBtn.addEventListener('click', () => {
      contactForm.reset();
      formSuccessState.classList.remove('is-active');
      contactForm.style.display = 'flex';
      const nameInput = document.getElementById('contact-name');
      if (nameInput) nameInput.focus();
    });
  }
});
