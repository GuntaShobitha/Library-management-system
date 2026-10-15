/**
 * Athenaeum Central Library
 * User Dashboard Controller: Active Loans, Returns, Renewals, Reservations, History & Profile Sync
 */

(function () {
  'use strict';

  let currentUser = null;

  function init() {
    // Guard route: ensure logged in as member
    if (window.checkRouteAuth) {
      currentUser = window.checkRouteAuth('member');
      if (!currentUser) return;
    } else {
      currentUser = window.LibraryDB.getCurrentUser();
    }

    renderUserProfileHeader();
    bindSidebarNavigation();
    bindMobileSidebar();
    loadDashboardOverview();
    loadBorrowedBooksTab();
    loadReservationsTab();
    loadHistoryTab();
    loadDueDatesTab();
    loadNotificationsTab();
    bindProfileForm();
    bindSettingsForm();
    bindLogout();
  }

  /* -------------------------------------------------------------
   * USER PROFILE & TOPBAR SYNC
   * -----------------------------------------------------------*/
  function renderUserProfileHeader() {
    if (!currentUser) return;

    const userNames = document.querySelectorAll('.js-user-name');
    userNames.forEach(el => el.textContent = currentUser.name);

    const userEmails = document.querySelectorAll('.js-user-email');
    userEmails.forEach(el => el.textContent = currentUser.email);

    const userMembershipIds = document.querySelectorAll('.js-user-membership-id');
    userMembershipIds.forEach(el => el.textContent = currentUser.membershipId);

    const userAvatars = document.querySelectorAll('.js-user-avatar');
    userAvatars.forEach(img => {
      img.src = currentUser.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200';
    });

    // Populate profile inputs
    const profileNameInput = document.getElementById('profileNameInput');
    if (profileNameInput) profileNameInput.value = currentUser.name;

    const profileEmailInput = document.getElementById('profileEmailInput');
    if (profileEmailInput) profileEmailInput.value = currentUser.email;

    const profilePhoneInput = document.getElementById('profilePhoneInput');
    if (profilePhoneInput) profilePhoneInput.value = currentUser.phone || '';
  }

  /* -------------------------------------------------------------
   * SIDEBAR TABS SWITCHING
   * -----------------------------------------------------------*/
  function bindSidebarNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav-item[data-tab]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const tabId = item.getAttribute('data-tab');
        if (!tabId) return;

        e.preventDefault();

        // Update active class on nav
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        // Show matching pane
        const panes = document.querySelectorAll('.dashboard-tab-pane');
        panes.forEach(pane => pane.classList.remove('active'));

        const targetPane = document.getElementById(tabId);
        if (targetPane) {
          targetPane.classList.add('active');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Close sidebar on mobile if open
        const sidebar = document.getElementById('dashboardSidebar');
        if (sidebar && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
        }
      });
    });
  }

  function bindMobileSidebar() {
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.getElementById('dashboardSidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Close on click outside sidebar on mobile
    document.addEventListener('click', (e) => {
      if (sidebar && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      }
    });
  }

  /* -------------------------------------------------------------
   * OVERVIEW TAB: SUMMARY METRICS & RECENT LOANS
   * -----------------------------------------------------------*/
  function loadDashboardOverview() {
    if (!currentUser || !window.LibraryDB) return;

    const userLoans = window.LibraryDB.getLoansByMember(currentUser.id);
    const activeLoans = userLoans.filter(l => l.status === 'Borrowed' || l.status === 'Overdue');
    const overdueLoans = userLoans.filter(l => l.status === 'Overdue');
    const reservations = window.LibraryDB.getReservationsByMember(currentUser.id);
    const activeRes = reservations.filter(r => r.status === 'Pending' || r.status === 'Ready for Pickup');

    // Due in 7 days count
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const dueSoonLoans = activeLoans.filter(l => l.dueDate >= today && l.dueDate <= nextWeekStr);

    // Update Summary Metric Cards
    const elActiveCount = document.getElementById('statActiveLoans');
    if (elActiveCount) elActiveCount.textContent = activeLoans.length;

    const elReservations = document.getElementById('statActiveReservations');
    if (elReservations) elReservations.textContent = activeRes.length;

    const elOverdue = document.getElementById('statOverdueCount');
    if (elOverdue) elOverdue.textContent = overdueLoans.length;

    const elDueSoon = document.getElementById('statDueSoonCount');
    if (elDueSoon) elDueSoon.textContent = dueSoonLoans.length;

    // Render active books in overview table
    renderOverviewActiveTable(activeLoans);
  }

  function renderOverviewActiveTable(activeLoans) {
    const container = document.getElementById('overviewActiveLoansTbody');
    if (!container) return;

    if (activeLoans.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 36px 16px;">
            <div class="empty-state">
              <span class="material-symbols-outlined empty-state-icon">menu_book</span>
              <div class="empty-state-title">No Currently Borrowed Books</div>
              <div class="empty-state-desc">You don't have any books checked out right now. Ready to discover your next story?</div>
              <a href="books.html" class="btn btn-sm btn-gold">Explore Catalog</a>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = activeLoans.map(loan => {
      const isOverdue = loan.status === 'Overdue';
      const statusPillClass = isOverdue ? 'status-overdue' : 'status-borrowed';

      return `
        <tr>
          <td>
            <div class="table-book-cell">
              <img src="${loan.bookCover}" alt="${loan.bookTitle}" class="table-book-thumb" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100'">
              <div>
                <strong style="color:var(--color-navy-900);">${loan.bookTitle}</strong>
                <div style="font-size:0.8rem; color:var(--color-text-muted);">By ${loan.bookAuthor}</div>
              </div>
            </div>
          </td>
          <td>${window.formatShortDate(loan.borrowDate)}</td>
          <td>
            <span style="font-weight:600; color:${isOverdue ? 'var(--color-danger)' : 'inherit'};">
              ${window.formatShortDate(loan.dueDate)}
            </span>
          </td>
          <td>
            <span class="status-pill ${statusPillClass}">
              ${isOverdue ? 'Overdue' : 'Active Loan'}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button type="button" class="btn btn-sm btn-outline js-action-return" data-loan-id="${loan.id}">
                <span class="material-symbols-outlined" style="font-size:16px;">keyboard_return</span>
                Return
              </button>
              <button type="button" class="btn btn-sm btn-secondary js-action-renew" data-loan-id="${loan.id}" ${isOverdue ? 'disabled title="Cannot renew overdue book"' : ''}>
                <span class="material-symbols-outlined" style="font-size:16px;">update</span>
                Renew
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    bindLoanActions(container);
  }

  /* -------------------------------------------------------------
   * MY BORROWED BOOKS TAB
   * -----------------------------------------------------------*/
  function loadBorrowedBooksTab() {
    const container = document.getElementById('myBorrowedBooksList');
    if (!container || !currentUser) return;

    const userLoans = window.LibraryDB.getLoansByMember(currentUser.id);
    const activeLoans = userLoans.filter(l => l.status === 'Borrowed' || l.status === 'Overdue');

    if (activeLoans.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-outlined empty-state-icon">library_books</span>
          <h4 class="empty-state-title">No Active Borrowing Records</h4>
          <p class="empty-state-desc">You are free to borrow up to ${currentUser.maxBorrowLimit || 4} volumes from our stacks.</p>
          <a href="books.html" class="btn btn-sm btn-primary">Browse Catalog</a>
        </div>
      `;
      return;
    }

    container.innerHTML = activeLoans.map(loan => {
      const isOverdue = loan.status === 'Overdue';
      const today = new Date();
      const due = new Date(loan.dueDate);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let timeBadge = '';
      if (diffDays < 0) {
        timeBadge = `<span style="color:var(--color-danger); font-weight:700;">Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}</span>`;
      } else if (diffDays === 0) {
        timeBadge = `<span style="color:var(--color-warning); font-weight:700;">Due today!</span>`;
      } else {
        timeBadge = `<span style="color:var(--color-green-700); font-weight:600;">Due in ${diffDays} day${diffDays === 1 ? '' : 's'}</span>`;
      }

      return `
        <div class="dashboard-card" style="margin-bottom: 20px;">
          <div class="dashboard-card-body" style="display:flex; gap:24px; align-items:center; flex-wrap:wrap;">
            <img src="${loan.bookCover}" alt="${loan.bookTitle}" style="width:70px; height:100px; object-fit:cover; border-radius:6px; box-shadow:var(--shadow-sm);" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100'">
            <div style="flex:1; min-width:220px;">
              <h4 style="margin-bottom:4px; font-size:1.15rem;">${loan.bookTitle}</h4>
              <div style="color:var(--color-text-muted); font-size:0.9rem; margin-bottom:8px;">By ${loan.bookAuthor}</div>
              <div style="font-size:0.85rem; display:flex; gap:16px; flex-wrap:wrap; color:var(--color-text-light);">
                <span>Loan ID: <strong>#${loan.id}</strong></span>
                <span>Borrowed: <strong>${window.formatShortDate(loan.borrowDate)}</strong></span>
                <span>Due Date: <strong>${window.formatShortDate(loan.dueDate)}</strong></span>
              </div>
              <div style="margin-top:6px; font-size:0.85rem;">${timeBadge}</div>
            </div>
            <div style="display:flex; gap:10px;">
              <button type="button" class="btn btn-outline js-action-return" data-loan-id="${loan.id}">
                <span class="material-symbols-outlined">keyboard_return</span>
                Return Book
              </button>
              <button type="button" class="btn btn-secondary js-action-renew" data-loan-id="${loan.id}" ${isOverdue ? 'disabled title="Cannot renew overdue book"' : ''}>
                <span class="material-symbols-outlined">update</span>
                Renew Loan
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    bindLoanActions(container);
  }

  function bindLoanActions(parentElement) {
    // Return action
    parentElement.querySelectorAll('.js-action-return').forEach(btn => {
      btn.addEventListener('click', () => {
        const loanId = btn.getAttribute('data-loan-id');
        if (confirm('Confirm return of this volume to the library stacks?')) {
          const res = window.LibraryDB.returnBook(loanId);
          if (res.success) {
            window.showToast(res.message, 'success');
            refreshAllUserViews();
          } else {
            window.showToast(res.message, 'error');
          }
        }
      });
    });

    // Renew action
    parentElement.querySelectorAll('.js-action-renew').forEach(btn => {
      btn.addEventListener('click', () => {
        const loanId = btn.getAttribute('data-loan-id');
        const res = window.LibraryDB.renewLoan(loanId);
        if (res.success) {
          window.showToast(res.message, 'success');
          refreshAllUserViews();
        } else {
          window.showToast(res.message, 'error');
        }
      });
    });
  }

  /* -------------------------------------------------------------
   * RESERVATIONS TAB
   * -----------------------------------------------------------*/
  function loadReservationsTab() {
    const container = document.getElementById('userReservationsList');
    if (!container || !currentUser) return;

    const reservations = window.LibraryDB.getReservationsByMember(currentUser.id);

    if (reservations.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-outlined empty-state-icon">bookmark</span>
          <h4 class="empty-state-title">No Active Reservations</h4>
          <p class="empty-state-desc">When a high-demand book is currently on loan to another reader, you can place a reservation to be notified as soon as it is returned.</p>
          <a href="books.html" class="btn btn-sm btn-outline">Find Books to Reserve</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Book Title</th>
              <th>Reservation Date</th>
              <th>Queue Position</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${reservations.map(res => `
              <tr>
                <td>
                  <div class="table-book-cell">
                    <img src="${res.bookCover}" alt="${res.bookTitle}" class="table-book-thumb" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100'">
                    <div>
                      <strong style="color:var(--color-navy-900);">${res.bookTitle}</strong>
                      <div style="font-size:0.8rem; color:var(--color-text-muted);">By ${res.bookAuthor}</div>
                    </div>
                  </div>
                </td>
                <td>${window.formatShortDate(res.requestDate)}</td>
                <td><strong>Queue #${res.priorityQueue || 1}</strong></td>
                <td>
                  <span class="status-pill ${res.status === 'Ready for Pickup' ? 'status-active' : (res.status === 'Cancelled' ? 'status-overdue' : 'status-pending')}">
                    ${res.status}
                  </span>
                </td>
                <td>
                  ${(res.status === 'Pending' || res.status === 'Ready for Pickup') ? `
                    <button type="button" class="btn btn-sm btn-outline js-cancel-res" data-res-id="${res.id}">
                      Cancel
                    </button>
                  ` : `
                    <span style="color:var(--color-text-light); font-size:0.85rem;">Archived</span>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.querySelectorAll('.js-cancel-res').forEach(btn => {
      btn.addEventListener('click', () => {
        const resId = btn.getAttribute('data-res-id');
        if (confirm('Cancel this book reservation?')) {
          const res = window.LibraryDB.cancelReservation(resId);
          if (res.success) {
            window.showToast(res.message, 'info');
            refreshAllUserViews();
          }
        }
      });
    });
  }

  /* -------------------------------------------------------------
   * BORROWING HISTORY TAB
   * -----------------------------------------------------------*/
  function loadHistoryTab() {
    const container = document.getElementById('userHistoryTbody');
    if (!container || !currentUser) return;

    const userLoans = window.LibraryDB.getLoansByMember(currentUser.id);

    if (userLoans.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 32px 16px;">
            <div class="empty-state-title">No Transaction History</div>
            <div class="empty-state-desc">Your past borrowing records will appear here automatically.</div>
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = userLoans.map(loan => `
      <tr>
        <td>
          <div class="table-book-cell">
            <img src="${loan.bookCover}" alt="${loan.bookTitle}" class="table-book-thumb" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100'">
            <div>
              <strong>${loan.bookTitle}</strong>
              <div style="font-size:0.8rem; color:var(--color-text-muted);">${loan.bookAuthor}</div>
            </div>
          </div>
        </td>
        <td>${window.formatShortDate(loan.borrowDate)}</td>
        <td>${window.formatShortDate(loan.dueDate)}</td>
        <td>${loan.returnDate ? window.formatShortDate(loan.returnDate) : '<span style="color:var(--color-warning);">Still Active</span>'}</td>
        <td>
          <span class="status-pill ${loan.status === 'Returned' ? 'status-returned' : (loan.status === 'Overdue' ? 'status-overdue' : 'status-borrowed')}">
            ${loan.status}
          </span>
        </td>
      </tr>
    `).join('');
  }

  /* -------------------------------------------------------------
   * DUE DATES TAB
   * -----------------------------------------------------------*/
  function loadDueDatesTab() {
    const container = document.getElementById('userDueDatesList');
    if (!container || !currentUser) return;

    const userLoans = window.LibraryDB.getLoansByMember(currentUser.id);
    const activeLoans = userLoans.filter(l => l.status === 'Borrowed' || l.status === 'Overdue');

    if (activeLoans.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-outlined empty-state-icon">event_available</span>
          <h4 class="empty-state-title">No Pending Due Dates</h4>
          <p class="empty-state-desc">All borrowed items are in good standing or returned.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = activeLoans.map(loan => {
      const isOverdue = loan.status === 'Overdue';
      return `
        <div style="padding: 18px; border-radius: var(--radius-md); background: ${isOverdue ? 'var(--color-danger-bg)' : 'var(--color-white)'}; border: 1px solid ${isOverdue ? 'var(--color-danger)' : 'var(--color-parchment-300)'}; margin-bottom: 14px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight: 700; font-size: 1.05rem; color: ${isOverdue ? 'var(--color-danger)' : 'var(--color-navy-900)'};">
              ${loan.bookTitle}
            </div>
            <div style="font-size: 0.85rem; color: var(--color-text-muted);">
              Borrowed: ${window.formatShortDate(loan.borrowDate)} &bull; Due: <strong>${window.formatShortDate(loan.dueDate)}</strong>
            </div>
          </div>
          <span class="status-pill ${isOverdue ? 'status-overdue' : 'status-borrowed'}">
            ${isOverdue ? 'Overdue' : 'Due Soon'}
          </span>
        </div>
      `;
    }).join('');
  }

  /* -------------------------------------------------------------
   * NOTIFICATIONS TAB
   * -----------------------------------------------------------*/
  function loadNotificationsTab() {
    const container = document.getElementById('userNotificationsList');
    const badge = document.getElementById('userNotificationBadge');
    if (!container || !currentUser) return;

    const notifs = window.LibraryDB.getNotifications(currentUser.id);
    const unreadCount = notifs.filter(n => !n.read).length;

    if (badge) {
      badge.textContent = unreadCount;
      badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }

    if (notifs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-outlined empty-state-icon">notifications_off</span>
          <h4 class="empty-state-title">No New Notifications</h4>
          <p class="empty-state-desc">You are completely up to date with library messages.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = notifs.map(n => `
      <div style="padding: 16px 20px; border-radius: var(--radius-md); background: ${n.read ? 'var(--color-white)' : 'var(--color-gold-light)'}; border: 1px solid var(--color-parchment-300); margin-bottom: 12px; display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <div style="font-weight: 700; color: var(--color-navy-900); margin-bottom: 4px;">${n.title}</div>
          <div style="font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.5;">${n.message}</div>
          <div style="font-size: 0.78rem; color: var(--color-text-light); margin-top: 6px;">${window.formatShortDate(n.date)}</div>
        </div>
        ${!n.read ? `
          <button type="button" class="btn btn-sm btn-outline js-mark-read" data-id="${n.id}" style="font-size: 0.78rem; padding: 4px 8px;">
            Mark read
          </button>
        ` : ''}
      </div>
    `).join('');

    container.querySelectorAll('.js-mark-read').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.LibraryDB.markNotificationAsRead(id);
        loadNotificationsTab();
      });
    });
  }

  /* -------------------------------------------------------------
   * PROFILE & SETTINGS SYNC
   * -----------------------------------------------------------*/
  function bindProfileForm() {
    const form = document.getElementById('userProfileForm');
    if (!form || !currentUser) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = document.getElementById('profileNameInput').value.trim();
      const newEmail = document.getElementById('profileEmailInput').value.trim();
      const newPhone = document.getElementById('profilePhoneInput').value.trim();
      const newPass = document.getElementById('profilePasswordInput').value;

      if (!newName || !newEmail) {
        window.showToast('Name and email are required fields.', 'warning');
        return;
      }

      const updateData = {
        name: newName,
        email: newEmail,
        phone: newPhone
      };

      if (newPass && newPass.trim() !== '') {
        updateData.password = newPass;
      }

      const res = window.LibraryDB.updateMember(currentUser.id, updateData);
      if (res.success) {
        currentUser = res.member;
        renderUserProfileHeader();
        window.showToast('Profile updated successfully!', 'success');
      } else {
        window.showToast(res.message, 'error');
      }
    });
  }

  function bindSettingsForm() {
    const form = document.getElementById('userSettingsForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      window.showToast('Notification and circulation preferences saved.', 'success');
    });
  }

  function bindLogout() {
    const logoutBtns = document.querySelectorAll('.js-logout-btn');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to end your library session?')) {
          window.LibraryDB.logout();
          window.showToast('Logged out successfully.', 'info');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 600);
        }
      });
    });
  }

  function refreshAllUserViews() {
    currentUser = window.LibraryDB.getCurrentUser();
    loadDashboardOverview();
    loadBorrowedBooksTab();
    loadReservationsTab();
    loadHistoryTab();
    loadDueDatesTab();
    loadNotificationsTab();
  }

  document.addEventListener('DOMContentLoaded', init);

})();
