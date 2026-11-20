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
      const rawBudget = form.querySelector('select[name="budget"]')?.value || '';
      const rawTimeline = form.querySelector('select[name="timeline"]')?.value || '';
      const rawMsg = form.querySelector('textarea[name="message"]')?.value || '';

      const name = sanitizeInput(rawName);
      const email = sanitizeInput(rawEmail);
      const phone = sanitizeInput(rawPhone);
      const service = sanitizeInput(rawService);
      const budget = sanitizeInput(rawBudget);
      const timeline = sanitizeInput(rawTimeline);
      const message = sanitizeInput(rawMsg);

      // Name, Email, Service, and Message are required; Phone, Budget, Timeline are optional
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
        budget: budget || 'Not specified',
        timeline: timeline || 'Not specified',
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
              budget: budget || 'N/A',
              timeline: timeline || 'N/A',
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
  // 7. PRIVATE ADMIN DRAWER (Direct #admin access only)
  // ==========================================
  const adminDrawer = document.getElementById('admin-drawer');
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
      leadsListEl.innerHTML = '<div style="padding:40px;text-align:center;color:#6b7c96;background:#0d1a33;border:1px solid #1c2e4f;border-radius:10px;">No enquiries recorded yet. New submissions will appear here automatically.</div>';
      return;
    }

    leadsListEl.innerHTML = leads
      .map(
        (lead) => `
      <div style="background:#0d1a33;border:1px solid #1c2e4f;border-radius:10px;padding:22px;display:grid;grid-template-columns:1.5fr 1.5fr 1fr;gap:18px;align-items:start;">
        <div>
          <div style="font-weight:700;font-size:16px;color:#fff;">${lead.name}</div>
          <div style="font-family:'DM Mono';font-size:11px;color:#8598b5;margin-top:4px;">${new Date(lead.created_at).toLocaleString()}</div>
        </div>
        <div>
          <div style="color:#d0ddec;font-size:13px;">${lead.email}</div>
          <div style="color:#a0b2cc;font-size:12px;margin-top:2px;">${lead.phone}</div>
        </div>
        <div>
          <span style="background:var(--blue);color:#fff;padding:4px 8px;font-family:'DM Mono';font-size:10px;text-transform:uppercase;border-radius:4px;">${lead.service}</span>
          ${lead.budget ? `<div style="font-size:11px;color:#e0b45a;margin-top:4px;">Budget: ${lead.budget}</div>` : ''}
          ${lead.timeline ? `<div style="font-size:11px;color:#9fd0ff;margin-top:2px;">Time: ${lead.timeline}</div>` : ''}
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

  // Support #admin in URL to open drawer privately
  if (window.location.hash === '#admin' && adminDrawer) {
    adminDrawer.classList.add('is-active');
    updateAdminView();
  }

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#admin' && adminDrawer) {
      adminDrawer.classList.add('is-active');
      updateAdminView();
    }
  });

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
      const headers = ['ID', 'Date', 'Name', 'Email', 'Phone', 'Service', 'Budget', 'Timeline', 'Message'];
      const rows = leads.map((l) => [
        l.id,
        `"${new Date(l.created_at).toLocaleString().replace(/"/g, '""')}"`,
        `"${(l.name || '').replace(/"/g, '""')}"`,
        `"${(l.email || '').replace(/"/g, '""')}"`,
        `"${(l.phone || '').replace(/"/g, '""')}"`,
        `"${(l.service || '').replace(/"/g, '""')}"`,
        `"${(l.budget || '').replace(/"/g, '""')}"`,
        `"${(l.timeline || '').replace(/"/g, '""')}"`,
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
