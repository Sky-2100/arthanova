/**
 * Arthanova Enterprise - Main Application Engine
 * Integrates Native Smooth Scrolling, Editorial Animations, Anti-Bot Traps & Fast Web3Forms Delivery
 */

(function () {
  'use strict';

  // ==========================================
  // 1. FAST NATIVE SCROLLING & SMOOTH ANCHORS
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#!') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 78;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ==========================================
  // 2. MOBILE NAVIGATION DRAWER
  // ==========================================
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav-menu');

  if (menuBtn && mobileNav) {
    const iconMenu = menuBtn.querySelector('.icon-menu');
    const iconClose = menuBtn.querySelector('.icon-close');

    menuBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      if (iconMenu && iconClose) {
        iconMenu.style.display = isOpen ? 'none' : 'block';
        iconClose.style.display = isOpen ? 'block' : 'none';
      }
      menuBtn.setAttribute('aria-expanded', isOpen);
    });

    document.querySelectorAll('.mobile-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        if (iconMenu && iconClose) {
          iconMenu.style.display = 'block';
          iconClose.style.display = 'none';
        }
      });
    });
  }

  // ==========================================
  // 3. EDITORIAL SCROLL REVEAL OBSERVER
  // ==========================================
  const revealItems = document.querySelectorAll('.reveal-item');
  if ('IntersectionObserver' in window && revealItems.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealItems.forEach((el) => observer.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('is-revealed'));
  }

  // ==========================================
  // 4. SERVICE PRE-SELECT TRIGGER [data-service]
  // ==========================================
  document.querySelectorAll('[data-service]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const targetService = trigger.getAttribute('data-service');
      const serviceSelect = document.querySelector('select[name="service"]');
      if (serviceSelect && targetService) {
        serviceSelect.value = targetService;
      }
    });
  });

  // ==========================================
  // 5. INPUT SANITIZATION UTILITY
  // ==========================================
  function sanitizeInput(str) {
    if (!str) return '';
    return str
      .replace(/<[^>]*>?/gm, '')
      .replace(/[&<>"'/]/g, (s) => {
        const entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;' };
        return entityMap[s] || s;
      })
      .trim();
  }

  // ==========================================
  // 6. ENHANCED FORM SUBMISSION & WEB3FORMS ENGINE
  // ==========================================
  const form = document.getElementById('contact-form');
  const errorEl = document.getElementById('contact-error');
  const submitBtn = document.getElementById('contact-submit-btn');
  const successEl = document.getElementById('contact-success');
  const sendAnotherBtn = document.getElementById('send-another-btn');
  const loadTimeInput = document.getElementById('contact_load_time');

  if (loadTimeInput) {
    loadTimeInput.value = Date.now().toString();
  }

  // De-obfuscate Web3Forms access key & endpoint at runtime
  const getSubmissionConfig = () => {
    return {
      endpoint: atob('aHR0cHM6Ly9hcGkud2ViM2Zvcm1zLmNvbS9zdWJtaXQ='),
      key: atob('YmQ3MjliOTQtNWFkOC00ODYyLWExOTEtMzkxMzdiNmIyNzk4')
    };
  };

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
      }

      // 1. Check honeypot traps (invisible to real human users)
      const honey1 = form.querySelector('input[name="_honey"]')?.value;
      const honey2 = form.querySelector('input[name="website"]')?.value;
      const honey3 = form.querySelector('input[name="website_url_verify"]')?.value;
      if (honey1 || honey2 || honey3) {
        console.warn('Bot trap triggered. Submission ignored.');
        form.reset();
        return;
      }

      // 2. Velocity Timing Verification (prevents instant bot scripts)
      const loadTime = parseInt(loadTimeInput?.value || '0', 10);
      const elapsed = Date.now() - loadTime;
      if (elapsed < 1400) {
        if (errorEl) {
          errorEl.textContent = 'Please take a moment to review your details before submitting.';
          errorEl.style.display = 'block';
        }
        return;
      }

      // 3. Rate limiting: 20s cooldown between submissions
      const lastSubmit = localStorage.getItem('arthanova_last_submit');
      if (lastSubmit) {
        const cooldown = Date.now() - parseInt(lastSubmit, 10);
        if (cooldown < 20000) {
          const remaining = Math.ceil((20000 - cooldown) / 1000);
          if (errorEl) {
            errorEl.textContent = `Please wait ${remaining} seconds before submitting another enquiry.`;
            errorEl.style.display = 'block';
          }
          return;
        }
      }

      // 4. Collect & Sanitize Form Fields
      const rawName = form.querySelector('input[name="name"]')?.value || '';
      const rawEmail = form.querySelector('input[name="email"]')?.value || '';
      const rawPhone = form.querySelector('input[name="phone"]')?.value || '';
      const rawService = form.querySelector('select[name="service"]')?.value || '';
      const rawMsg = form.querySelector('textarea[name="message"]')?.value || '';

      const name = sanitizeInput(rawName);
      const email = sanitizeInput(rawEmail);
      const phone = sanitizeInput(rawPhone);
      const service = sanitizeInput(rawService);
      const message = sanitizeInput(rawMsg);

      // Name, Email, Service, and Message are required; Phone is optional
      if (!name || !email || !service || !message) {
        if (errorEl) {
          errorEl.textContent = 'Please provide your name, email, service of interest, and message.';
          errorEl.style.display = 'block';
        }
        return;
      }

      // Basic email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (errorEl) {
          errorEl.textContent = 'Please enter a valid email address.';
          errorEl.style.display = 'block';
        }
        return;
      }

      // 5. Update Button State to Sending
      const btnSpan = submitBtn?.querySelector('span');
      const origText = btnSpan ? btnSpan.textContent : 'Send enquiry';
      if (btnSpan) btnSpan.textContent = 'Sending enquiry...';
      if (submitBtn) submitBtn.disabled = true;

      const { endpoint, key } = getSubmissionConfig();
      const payload = {
        access_key: key,
        name,
        email,
        phone: phone || 'Not provided',
        service,
        message,
        from_name: 'Arthanova Enterprise Portal',
        subject: `New Lead: ${name} (${service})`
      };

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
          localStorage.setItem('arthanova_last_submit', Date.now().toString());

          // Save lead locally to private lead store for backup
          try {
            const leads = JSON.parse(localStorage.getItem('arthanova_leads') || '[]');
            leads.unshift({
              id: Date.now().toString(),
              name,
              email,
              phone: phone || 'N/A',
              service,
              message,
              created_at: new Date().toISOString()
            });
            localStorage.setItem('arthanova_leads', JSON.stringify(leads));
          } catch (storageErr) {
            console.warn('Local lead storage notice:', storageErr);
          }

          // Instant in-place confirmation without page reload
          form.style.display = 'none';
          if (successEl) successEl.style.display = 'block';
          form.reset();
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      } catch (err) {
        console.error('Submission error:', err);
        if (errorEl) {
          errorEl.textContent = 'Message delivery encountered a temporary delay. Please message us directly via WhatsApp (+91 8902131993).';
          errorEl.style.display = 'block';
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnSpan) btnSpan.textContent = origText;
      }
    });
  }

  if (sendAnotherBtn && form && successEl) {
    sendAnotherBtn.addEventListener('click', () => {
      successEl.style.display = 'none';
      form.style.display = 'block';
      if (loadTimeInput) loadTimeInput.value = Date.now().toString();
    });
  }


  // ==========================================
  // 7. TECH STACK EXPANDABLE PANELS & PROXIMITY GLOW
  // ==========================================
  const techCards = document.querySelectorAll('.tech-card');

  techCards.forEach((card) => {
    // Proximity Glow coordinates tracking
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    // Expand on hover for desktop
    card.addEventListener('mouseenter', function () {
      const parentRow = this.closest('.tech-stack-row');
      if (parentRow && window.innerWidth > 992) {
        parentRow.querySelectorAll('.tech-card').forEach((c) => c.classList.remove('is-expanded'));
        this.classList.add('is-expanded');
      }
    });

    // Expand on click / tap for touch & mobile
    card.addEventListener('click', function (e) {
      if (e.target.closest('.tech-card-action')) return;
      const parentRow = this.closest('.tech-stack-row');
      if (parentRow) {
        parentRow.querySelectorAll('.tech-card').forEach((c) => c.classList.remove('is-expanded'));
        this.classList.add('is-expanded');
      }
    });
  });
})();
