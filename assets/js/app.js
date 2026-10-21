/**
 * Athenaeum Central Library
 * Main Application Script: Navigation, Search Suggestions, Modals, Toasts & Global Interactions
 */

(function () {
  'use strict';

  // DOM Elements
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const mobileBackdrop = document.getElementById('mobileNavBackdrop');
  const mobileClose = document.getElementById('mobileDrawerClose');
  const toastContainer = document.getElementById('toastContainer');

  /* -------------------------------------------------------------
   * TOAST NOTIFICATION SYSTEM
   * -----------------------------------------------------------*/
  window.showToast = function (message, type = 'info', duration = 3500) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check_circle';
    if (type === 'error') iconName = 'error';
    if (type === 'warning') iconName = 'warning';

    toast.innerHTML = `
      <span class="material-symbols-outlined">${iconName}</span>
      <div style="flex: 1; line-height: 1.4;">${message}</div>
      <button type="button" style="color: rgba(255,255,255,0.7); display:flex; align-items:center;" aria-label="Close notification">&times;</button>
    `;

    container.appendChild(toast);

    // Close button click
    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => {
      removeToast(toast);
    });

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto dismiss
    const timeout = setTimeout(() => {
      removeToast(toast);
    }, duration);

    function removeToast(el) {
      clearTimeout(timeout);
      el.classList.remove('show');
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 300);
    }
  };

  /* -------------------------------------------------------------
   * MOBILE NAVIGATION DRAWER
   * -----------------------------------------------------------*/
  function openMobileNav() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    if (mobileBackdrop) mobileBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    mobileDrawer.setAttribute('aria-hidden', 'false');
  }

  function closeMobileNav() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    if (mobileBackdrop) mobileBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    mobileDrawer.setAttribute('aria-hidden', 'true');
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', openMobileNav);
  }
  if (mobileClose) {
    mobileClose.addEventListener('click', closeMobileNav);
  }
  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', closeMobileNav);
  }

  // Close mobile nav on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeMobileNav();
    }
  });

  /* -------------------------------------------------------------
   * ACTIVE LINK HIGHLIGHTING
   * -----------------------------------------------------------*/
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-links a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });

  /* -------------------------------------------------------------
   * AUTH STATUS SYNC IN NAVBAR
   * -----------------------------------------------------------*/
  function syncNavAuth() {
    if (!window.LibraryDB) return;
    const currentUser = window.LibraryDB.getCurrentUser();
    const navAuthContainer = document.getElementById('navAuthContainer');
    const mobileAuthContainer = document.getElementById('mobileAuthContainer');

    if (!navAuthContainer) return;

    if (currentUser) {
      const isMember = currentUser.role === 'member';
      const dashboardUrl = isMember ? 'user-dashboard.html' : 'admin-dashboard.html';
      const dashboardLabel = isMember ? 'Dashboard' : 'Admin Console';

      // navAuthContainer.innerHTML = `
      //   <div style="display: flex; align-items: center; gap: 8px;">
      //     <a href="${dashboardUrl}" class="btn btn-sm btn-primary" title="Logged in as ${currentUser.email}">
      //       <span class="material-symbols-outlined" style="font-size: 18px;">dashboard</span>
      //       <span>${dashboardLabel}</span>
      //     </a>
      //     <button type="button" class="btn btn-sm btn-outline js-nav-logout" title="Sign Out (${currentUser.email})" style="padding: 8px 10px;">
      //       <span class="material-symbols-outlined" style="font-size: 18px;">logout</span>
      //     </button>
      //   </div>
      // `;

      const logoutBtn = navAuthContainer.querySelector('.js-nav-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.LibraryDB.logout();
          if (window.showToast) window.showToast('Signed out successfully.', 'info');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 300);
        });
      }

      if (mobileAuthContainer) {
        mobileAuthContainer.innerHTML = `
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
            
          </div>
        `;

        const mobileLogoutBtn = mobileAuthContainer.querySelector('.js-mobile-logout');
        if (mobileLogoutBtn) {
          mobileLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.LibraryDB.logout();
            setTimeout(() => {
              window.location.href = 'login.html';
            }, 300);
          });
        }
      }
    } else {
      navAuthContainer.innerHTML = `
        <a href="login.html" class="btn btn-sm btn-outline">Login</a>
        <a href="register.html" class="btn btn-sm btn-gold">Join Library</a>
      `;

      if (mobileAuthContainer) {
        mobileAuthContainer.innerHTML = `
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 10px;">
            <a href="login.html" class="btn btn-sm btn-outline" style="color:#fff; border-color: rgba(255,255,255,0.3); justify-content: center;">Login</a>
            <a href="register.html" class="btn btn-sm btn-gold" style="justify-content: center;">Join Library</a>
          </div>
        `;
      }
    }
  }

  /* -------------------------------------------------------------
   * LIVE SEARCH SUGGESTIONS IN HERO / SEARCH BAR
   * -----------------------------------------------------------*/
  function setupSearchSuggestions() {
    const searchInputs = document.querySelectorAll('.js-search-suggest-input');
    if (!searchInputs.length || !window.LibraryDB) return;

    searchInputs.forEach(input => {
      const dropdown = input.closest('.search-form-wrap')?.querySelector('.search-suggestions-dropdown') ||
                       document.getElementById('searchSuggestionsDropdown');
      if (!dropdown) return;

      input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        if (query.length < 2) {
          dropdown.innerHTML = '';
          dropdown.classList.remove('active');
          return;
        }

        const results = window.LibraryDB.searchBooks(query).slice(0, 5);
        if (results.length === 0) {
          dropdown.innerHTML = `
            <div style="padding: 16px; text-align: center; color: var(--color-text-muted); font-size: 0.9rem;">
              No titles or authors matching "<strong>${query}</strong>"
            </div>
          `;
          dropdown.classList.add('active');
          return;
        }

        dropdown.innerHTML = results.map(book => `
          <a href="book-details.html?id=${book.id}" class="suggestion-item">
            <img src="${book.coverImage}" alt="${book.title}" class="suggestion-thumb" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100'">
            <div class="suggestion-meta">
              <div class="suggestion-title">${book.title}</div>
              <div class="suggestion-author">${book.author} &bull; <span style="color:var(--color-gold-600);">${book.categoryName}</span></div>
            </div>
            <span class="status-pill ${book.availableCopies > 0 ? 'status-available' : 'status-borrowed'}">
              ${book.availableCopies > 0 ? `${book.availableCopies} Available` : 'Reserved'}
            </span>
          </a>
        `).join('') + `
          <a href="books.html?q=${encodeURIComponent(query)}" style="display:block; text-align:center; padding:10px; background:var(--color-parchment-100); font-weight:700; font-size:0.85rem; color:var(--color-navy-900);">
            View all matching results &rarr;
          </a>
        `;
        dropdown.classList.add('active');
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.remove('active');
        }
      });
    });
  }

  /* -------------------------------------------------------------
   * ANIMATED STATISTIC COUNTERS
   * -----------------------------------------------------------*/
  function initStatCounters() {
    const counters = document.querySelectorAll('.js-counter');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
          const suffix = counter.getAttribute('data-suffix') || '';
          let count = 0;
          const speed = Math.ceil(target / 45);

          const updateCounter = () => {
            count += speed;
            if (count < target) {
              counter.textContent = count.toLocaleString() + suffix;
              requestAnimationFrame(updateCounter);
            } else {
              counter.textContent = target.toLocaleString() + suffix;
            }
          };

          updateCounter();
          obs.unobserve(counter);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(counter => observer.observe(counter));
  }

  /* -------------------------------------------------------------
   * REUSABLE MODAL HELPERS
   * -----------------------------------------------------------*/
  window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      const focusable = modal.querySelector('button, input, select, textarea');
      if (focusable) focusable.focus();
    }
  };

  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Close modals on overlay backdrop click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) {
        activeModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });

  /* -------------------------------------------------------------
   * DATABASE RESET HELPER FOR TESTING
   * -----------------------------------------------------------*/
  window.resetLibraryDemo = function () {
    if (confirm('Are you sure you want to restore the Athenaeum Library demonstration database to factory default? Any custom added loans or books will be reset.')) {
      if (window.LibraryDB) {
        window.LibraryDB.resetDatabase();
        window.showToast('Demo database restored successfully!', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    }
  };

  /* -------------------------------------------------------------
   * HERO VIDEO CROSSFADE & AUTOPLAY (FLUXORA SYSTEM)
   * -----------------------------------------------------------*/
  function initHeroVideo() {
    const video = document.getElementById('heroBgVideo');
    if (!video) return;

    const setReady = () => {
      video.classList.add('is-ready');
    };

    if (video.readyState >= 3) {
      setReady();
    } else {
      video.addEventListener('canplay', setReady, { once: true });
    }

    // Explicit autoplay nudge for strict browser policies
    const playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(() => {});
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      setReady();
    }
  }

  /* -------------------------------------------------------------
   * SCROLL REVEAL & STAGGER OBSERVER (FLUXORA-INSPIRED)
   * -----------------------------------------------------------*/
  window.triggerScrollReveals = function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const gridContainers = document.querySelectorAll(
      '.books-grid, .categories-grid, .services-grid, .pillars-grid, .testimonials-grid, .archives-grid, .sanctuary-grid, .reading-lists-grid'
    );
    gridContainers.forEach(container => {
      Array.from(container.children).forEach((card, idx) => {
        if (!card.classList.contains('reveal-on-scroll')) {
          card.classList.add('reveal-on-scroll');
          card.style.transitionDelay = `${(idx % 4) * 0.08}s`;
        }
      });
    });

    const staticSections = document.querySelectorAll(
      '.section-header:not(.reveal-on-scroll), .cta-banner:not(.reveal-on-scroll), .stats-banner-section:not(.reveal-on-scroll), .policy-table-wrap:not(.reveal-on-scroll)'
    );
    staticSections.forEach(sec => sec.classList.add('reveal-on-scroll'));

    const unrevealed = document.querySelectorAll('.reveal-on-scroll:not(.is-revealed)');
    if (!unrevealed.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    unrevealed.forEach(el => observer.observe(el));
  };

  /* -------------------------------------------------------------
   * INTERACTIVE FAQ ACCORDIONS
   * -----------------------------------------------------------*/
  function initAccordions() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq-question');
      if (!btn) return;
      const item = btn.closest('.faq-item');
      if (!item) return;
      const wasActive = item.classList.contains('active');
      const accordion = item.closest('.faq-accordion');
      if (accordion) {
        accordion.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      }
      if (!wasActive) {
        item.classList.add('active');
      }
    });
  }

  // Run on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    syncNavAuth();
    setupSearchSuggestions();
    initStatCounters();
    initHeroVideo();
    initAccordions();
    window.triggerScrollReveals();
  });

})();
