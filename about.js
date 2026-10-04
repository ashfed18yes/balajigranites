/**
 * Balaji Granites — Dedicated About Us Page Logic
 * Manages vertical curtain reveal animation, persistent navbar interactions,
 * mobile menu, and smooth page navigation transitions.
 */

document.addEventListener('DOMContentLoaded', () => {
  const pillNavbar = document.getElementById('pill-navbar');
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const navLinksMenu = document.getElementById('nav-links-menu');
  const curtainOverlay = document.getElementById('about-curtain-overlay');
  const contentWrap = document.getElementById('about-content-wrap');

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

  // 2. Smooth vertical curtain transition when navigating back to homepage, products or contact
  document.querySelectorAll('a[href^="/index.html"], a[href^="index.html"], a[href^="/products"], a[href^="products"], a[href^="/contact"], a[href^="contact"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetHref = link.getAttribute('href');
      if (!targetHref) return;
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
  if (mobileToggle && pillNavbar) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = pillNavbar.classList.toggle('menu-open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (pillNavbar.classList.contains('menu-open') && !pillNavbar.contains(e.target)) {
        pillNavbar.classList.remove('menu-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on link click inside dropdown
    if (navLinksMenu) {
      navLinksMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          pillNavbar.classList.remove('menu-open');
          mobileToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  // 5. Subtle image reveal / intersection observer
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    });

    document.querySelectorAll('.approach-image-frame, .architecture-cinematic-stage, .editorial-principle-row, .about-tile-card').forEach(el => {
      observer.observe(el);
    });
  }
});
