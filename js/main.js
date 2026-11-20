/**
 * Arthanova Enterprise - Main Application Engine
 * Integrates Lenis Smooth Scroll, Editorial Animations, Anti-Bot Fortress & Lead Management
 */

(function () {
  'use strict';

  // ==========================================
  // 1. FAST NATIVE SCROLLING & SMOOTH ANCHORS
  // ==========================================
  // Fast, responsive native wheel & touch scrolling
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
  // 4. MULTI-LAYER ANTI-BOT FORTRESS & CAPTCHA
  // ==========================================
  let expectedCaptcha = 0;
  const num1El = document.getElementById('contact-c-num1');
  const num2El = document.getElementById('contact-c-num2');
  const refreshBtn = document.getElementById('contact-captcha-refresh');
  const loadTimeInput = document.getElementById('contact_load_time');

  function generateCaptcha() {
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 1;
    expectedCaptcha = n1 + n2;
    if (num1El && num2El) {
      num1El.textContent = n1;
      num2El.textContent = n2;
    }
    const answerInput = document.getElementById('contact-captcha-answer');
    if (answerInput) answerInput.value = '';
  }

  if (loadTimeInput) {
    loadTimeInput.value = Date.now().toString();
  }
  generateCaptcha();

  if (refreshBtn) {
    refreshBtn.addEventListener('click', generateCaptcha);
  }

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
  // 5. SECURED FORM SUBMISSION WITH OBFUSCATION
  // ==========================================
  const form = document.getElementById('contact-form');
  const errorEl = document.getElementById('contact-error');
  const submitBtn = document.getElementById('contact-submit-btn');
  const successEl = document.getElementById('contact-success');
  const sendAnotherBtn = document.getElementById('send-another-btn');
  const nextUrlInput = document.getElementById('contact_next_url');
  const subjectInput = document.getElementById('contact_subject');

  // Check if returning from a successful native submission
  if (window.location.search.includes('submitted=true')) {
    if (form && successEl) {
      form.style.display = 'none';
      successEl.style.display = 'block';
      try {
        const cleanPath = window.location.pathname + '#contact';
        window.history.replaceState(null, '', cleanPath);
      } catch (e) {}
    }
  }

  // De-obfuscate submission endpoint at runtime only (FormSubmit standard gateway)
  const getSecureEndpoint = () => {
    const p1 = atob('aHR0cHM6Ly9mb3Jtc3VibWl0LmNvLw==');
    const p2 = atob('YXJ0aGFub3ZhZW50ZXJwcmlzZUBnbWFpbC5jb20=');
    return p1 + p2;
  };

  if (form) {
    form.addEventListener('submit', function (e) {
      if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
      }

      // Check honeypot traps
      const honey1 = form.querySelector('input[name="_honey"]')?.value;
      const honey2 = form.querySelector('input[name="website_url_verify"]')?.value;
      if (honey1 || honey2) {
        e.preventDefault();
        console.warn('Bot trap triggered. Submission ignored.');
        form.reset();
        return;
      }

      // Check velocity timing
      const loadTime = parseInt(loadTimeInput?.value || '0', 10);
      const elapsed = Date.now() - loadTime;
      if (elapsed < 1600) {
        e.preventDefault();
        if (errorEl) {
          errorEl.textContent = 'Submission was too fast. Please verify details.';
          errorEl.style.display = 'block';
        }
        return;
      }

      // Rate limiting: 30s cooldown
      const lastSubmit = localStorage.getItem('arthanova_last_submit');
      if (lastSubmit) {
        const cooldown = Date.now() - parseInt(lastSubmit, 10);
        if (cooldown < 30000) {
          e.preventDefault();
          const remaining = Math.ceil((30000 - cooldown) / 1000);
          if (errorEl) {
            errorEl.textContent = `Please wait ${remaining} seconds before submitting again.`;
            errorEl.style.display = 'block';
          }
          return;
        }
      }

      // Verify human Math CAPTCHA
      const answerVal = parseInt(document.getElementById('contact-captcha-answer')?.value || '', 10);
      if (isNaN(answerVal) || answerVal !== expectedCaptcha) {
        e.preventDefault();
        if (errorEl) {
          errorEl.textContent = 'Security math verification answer is incorrect. Please try again.';
          errorEl.style.display = 'block';
        }
        generateCaptcha();
        return;
      }

      // Collect & sanitize fields
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

      if (!name || !email || !phone || !service || !message) {
        e.preventDefault();
        if (errorEl) {
          errorEl.textContent = 'Please fill out all required fields.';
          errorEl.style.display = 'block';
        }
        return;
      }

      // Set target return redirect for FormSubmit
      if (nextUrlInput) {
        const returnUrl = window.location.href.split('?')[0].split('#')[0] + '?submitted=true#contact';
        nextUrlInput.value = returnUrl;
      }

      if (subjectInput) {
        subjectInput.value = `New Lead: ${name} (${service})`;
      }

      // Update button state
      const btnSpan = submitBtn?.querySelector('span');
      if (btnSpan) btnSpan.textContent = 'Sending...';
      if (submitBtn) submitBtn.disabled = true;

      // Save lead locally to private lead inbox
      localStorage.setItem('arthanova_last_submit', Date.now().toString());
      try {
        const leads = JSON.parse(localStorage.getItem('arthanova_leads') || '[]');
        leads.unshift({
          id: Date.now().toString(),
          name,
          email,
          phone,
          service,
          message,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('arthanova_leads', JSON.stringify(leads));
      } catch (storageErr) {
        console.warn('Local lead archiving notice:', storageErr);
      }

      // Set hydrated endpoint for native form dispatch (100% deliverability, bypasses AJAX timeouts)
      form.action = getSecureEndpoint();
    });
  }

  if (sendAnotherBtn && form && successEl) {
    sendAnotherBtn.addEventListener('click', () => {
      successEl.style.display = 'none';
      form.style.display = 'block';
      if (loadTimeInput) loadTimeInput.value = Date.now().toString();
      generateCaptcha();
    });
  }

  // ==========================================
  // 6. PRIVATE ADMIN LEAD INBOX & CSV EXPORT
  // ==========================================
  const adminDrawer = document.getElementById('admin-drawer');
  const openAdminBtn = document.getElementById('open-admin-btn');
  const closeAdminBtn = document.getElementById('close-admin-btn');
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminLoginView = document.getElementById('admin-login-view');
  const adminDashView = document.getElementById('admin-dashboard-view');
  const adminError = document.getElementById('admin-error');
  const leadsCountEl = document.getElementById('admin-leads-count');
  const leadsListEl = document.getElementById('admin-leads-list');
  const adminLogoutBtn = document.getElementById('admin-logout-btn');
  const adminExportBtn = document.getElementById('admin-export-btn');

  function checkAdminSession() {
    return localStorage.getItem('arthanova_admin_token') === 'authenticated';
  }

  function renderAdminLeads() {
    const leads = JSON.parse(localStorage.getItem('arthanova_leads') || '[]');
    if (leadsCountEl) leadsCountEl.textContent = `${leads.length} enquiries`;
    if (!leadsListEl) return;

    if (leads.length === 0) {
      leadsListEl.innerHTML = '<div style="padding:40px;text-align:center;color:#6b7c96;background:#0d1a33;border:1px solid #1c2e4f;">No enquiries recorded yet. New submissions will appear here automatically.</div>';
      return;
    }

    leadsListEl.innerHTML = leads
      .map(
        (lead) => `
      <div style="background:#0d1a33;border:1px solid #1c2e4f;padding:22px;display:grid;grid-template-columns:1.5fr 1.5fr 1fr;gap:18px;align-items:start;">
        <div>
          <div style="font-weight:700;font-size:16px;color:#fff;">${lead.name}</div>
          <div style="font-family:'DM Mono';font-size:11px;color:#8598b5;margin-top:4px;">${new Date(lead.created_at).toLocaleString()}</div>
        </div>
        <div>
          <div style="color:#d0ddec;font-size:13px;">${lead.email}</div>
          <div style="color:#a0b2cc;font-size:12px;margin-top:2px;">${lead.phone}</div>
        </div>
        <div>
          <span style="background:var(--blue);color:#fff;padding:4px 8px;font-family:'DM Mono';font-size:10px;text-transform:uppercase;">${lead.service}</span>
        </div>
        <div style="grid-column:1/-1;border-top:1px solid #162642;padding-top:12px;color:#cbd7e8;font-size:13px;line-height:1.6;">
          ${lead.message}
        </div>
      </div>
    `
      )
      .join('');
  }

  function updateAdminView() {
    if (checkAdminSession()) {
      if (adminLoginView) adminLoginView.style.display = 'none';
      if (adminDashView) adminDashView.style.display = 'block';
      renderAdminLeads();
    } else {
      if (adminLoginView) adminLoginView.style.display = 'block';
      if (adminDashView) adminDashView.style.display = 'none';
    }
  }

  if (openAdminBtn && adminDrawer) {
    openAdminBtn.addEventListener('click', () => {
      adminDrawer.classList.add('is-active');
      updateAdminView();
    });
  }

  // Also support #admin in URL
  if (window.location.hash === '#admin' && adminDrawer) {
    adminDrawer.classList.add('is-active');
    updateAdminView();
  }

  if (closeAdminBtn && adminDrawer) {
    closeAdminBtn.addEventListener('click', () => {
      adminDrawer.classList.remove('is-active');
      if (window.location.hash === '#admin') history.replaceState(null, '', ' ');
    });
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = document.getElementById('admin-pass')?.value;
      if (pass === 'admin' || pass === 'arthanova2026') {
        localStorage.setItem('arthanova_admin_token', 'authenticated');
        if (adminError) adminError.style.display = 'none';
        updateAdminView();
      } else {
        if (adminError) {
          adminError.textContent = 'Incorrect credentials. Please try again.';
          adminError.style.display = 'block';
        }
      }
    });
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      localStorage.removeItem('arthanova_admin_token');
      updateAdminView();
    });
  }

  if (adminExportBtn) {
    adminExportBtn.addEventListener('click', () => {
      const leads = JSON.parse(localStorage.getItem('arthanova_leads') || '[]');
      if (leads.length === 0) {
        alert('No enquiries to export.');
        return;
      }
      const headers = ['ID', 'Date', 'Name', 'Email', 'Phone', 'Service', 'Message'];
      const rows = leads.map((l) => [
        l.id,
        `"${new Date(l.created_at).toLocaleString().replace(/"/g, '""')}"`,
        `"${(l.name || '').replace(/"/g, '""')}"`,
        `"${(l.email || '').replace(/"/g, '""')}"`,
        `"${(l.phone || '').replace(/"/g, '""')}"`,
        `"${(l.service || '').replace(/"/g, '""')}"`,
        `"${(l.message || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `arthanova-leads-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }
})();