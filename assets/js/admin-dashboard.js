/**
 * Athenaeum Central Library
 * Administrator Portal Controller: Book CRUD, Member Management, Circulation, Overdue, Reservations & Reports
 */

(function () {
  'use strict';

  let currentAdmin = null;

  function init() {
    // Guard route: ensure logged in as admin
    if (window.checkRouteAuth) {
      currentAdmin = window.checkRouteAuth('admin');
      if (!currentAdmin) return;
    } else if (window.LibraryDB) {
      currentAdmin = window.LibraryDB.getCurrentUser();
      if (!currentAdmin) {
        window.location.href = 'login.html';
        return;
      }
    }

    renderAdminHeader();
    bindSidebarNavigation();
    bindMobileSidebar();
    loadOverviewMetrics();
    loadManageBooksTab();
    loadManageMembersTab();
    loadBorrowingRecordsTab();
    loadReturnsTab();
    loadOverdueTab();
    loadReservationsTab();
    loadStaffTab();
    bindAddBookModal();
    bindRecordLoanModal();
    bindLogout();
  }

  /* -------------------------------------------------------------
   * ADMIN PROFILE HEADER
   * -----------------------------------------------------------*/
  function renderAdminHeader() {
    if (!currentAdmin) return;
    document.querySelectorAll('.js-admin-name').forEach(el => el.textContent = currentAdmin.name);
    document.querySelectorAll('.js-admin-email').forEach(el => el.textContent = currentAdmin.email);
    document.querySelectorAll('.js-admin-avatar').forEach(img => {
      img.src = currentAdmin.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';
    });
  }

  /* -------------------------------------------------------------
   * SIDEBAR NAVIGATION
   * -----------------------------------------------------------*/
  function bindSidebarNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav-item[data-tab]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const tabId = item.getAttribute('data-tab');
        if (!tabId) return;

        e.preventDefault();
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        const panes = document.querySelectorAll('.dashboard-tab-pane');
        panes.forEach(p => p.classList.remove('active'));

        const targetPane = document.getElementById(tabId);
        if (targetPane) {
          targetPane.classList.add('active');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Close mobile drawer
        const sidebar = document.getElementById('adminSidebar');
        if (sidebar && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
        }
      });
    });
  }

  function bindMobileSidebar() {
    const toggleBtn = document.getElementById('adminSidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    document.addEventListener('click', (e) => {
      if (sidebar && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      }
    });
  }

  /* -------------------------------------------------------------
   * OVERVIEW METRICS & ACTIVITY LOGS
   * -----------------------------------------------------------*/
  function loadOverviewMetrics() {
    if (!window.LibraryDB) return;
    const stats = window.LibraryDB.getStatistics();

    const elTotalTitles = document.getElementById('statAdminTitles');
    if (elTotalTitles) elTotalTitles.textContent = stats.totalBookTitles || 0;

    const elPhysicalCopies = document.getElementById('statAdminPhysicalCopies');
    if (elPhysicalCopies) elPhysicalCopies.textContent = stats.totalPhysicalCopies || 0;

    const elAvailableCopies = document.getElementById('statAdminAvailableCopies');
    if (elAvailableCopies) elAvailableCopies.textContent = stats.availableCopies || 0;

    const elActiveLoans = document.getElementById('statAdminActiveLoans');
    if (elActiveLoans) elActiveLoans.textContent = stats.activeLoansCount || 0;

    const elOverdueCount = document.getElementById('statAdminOverdue');
    if (elOverdueCount) elOverdueCount.textContent = stats.overdueCount || 0;

    const elTotalMembers = document.getElementById('statAdminMembers');
    if (elTotalMembers) elTotalMembers.textContent = stats.registeredMembers || 0;

    const elReservations = document.getElementById('statAdminReservations');
    if (elReservations) elReservations.textContent = stats.pendingReservationsCount || 0;

    // Load recent activity logs
    const activityContainer = document.getElementById('adminActivityLogsList');
    if (activityContainer) {
      const logs = window.LibraryDB.getActivityLogs().slice(0, 6);
      activityContainer.innerHTML = logs.map(log => `
        <div style="display: flex; align-items: flex-start; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--color-parchment-200);">
          <div style="width:34px; height:34px; border-radius:50%; background:var(--color-parchment-100); color:var(--color-navy-900); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <span class="material-symbols-outlined" style="font-size:18px;">${log.icon || 'info'}</span>
          </div>
          <div style="flex:1;">
            <div style="font-size:0.9rem; color:var(--color-navy-900); font-weight:600;">${log.text}</div>
            <div style="font-size:0.75rem; color:var(--color-text-light);">${log.time}</div>
          </div>
        </div>
      `).join('');
    }
  }

  /* -------------------------------------------------------------
   * MANAGE BOOKS TAB (CRUD)
   * -----------------------------------------------------------*/
  function loadManageBooksTab() {
    const tbody = document.getElementById('manageBooksTbody');
    if (!tbody || !window.LibraryDB) return;

    const books = window.LibraryDB.getBooks();

    tbody.innerHTML = books.map(book => {
      const isAvailable = book.availableCopies > 0;
      return `
        <tr>
          <td>
            <div class="table-book-cell">
              <img src="${book.coverImage}" alt="${book.title}" class="table-book-thumb" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100'">
              <div>
                <strong style="color:var(--color-navy-900);">${book.title}</strong>
                <div style="font-size:0.8rem; color:var(--color-text-muted);">ISBN: ${book.isbn}</div>
              </div>
            </div>
          </td>
          <td>${book.author}</td>
          <td><span class="status-pill status-borrowed">${book.categoryName}</span></td>
          <td><strong>${book.totalCopies}</strong></td>
          <td>
            <span class="status-pill ${isAvailable ? 'status-available' : 'status-suspended'}">
              ${book.availableCopies} Copies
            </span>
          </td>
          <td>${book.shelfLocation || 'General'}</td>
          <td>
            <div class="table-actions">
              <button onclick="window.location.href = './404.html';" type="button" class="btn btn-sm btn-outline js-edit-book" title="Edit book metadata">
                <span class="material-symbols-outlined" style="font-size:16px;">edit</span>
              </button>
              <button onclick="window.location.href = './404.html';" type="button" class="btn btn-sm btn-secondary js-delete-book" title="Remove from catalog" style="color:var(--color-danger);">
                <span class="material-symbols-outlined" style="font-size:16px;">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Bind Edit Book
    tbody.querySelectorAll('.js-edit-book').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditBookModal(id);
      });
    });

    // Bind Delete Book
    tbody.querySelectorAll('.js-delete-book').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const book = window.LibraryDB.getBookById(id);
        if (confirm(`Are you sure you want to remove "${book.title}" from the library catalog?`)) {
          const res = window.LibraryDB.deleteBook(id);
          if (res.success) {
            window.showToast('Book removed from catalog.', 'success');
            refreshAllAdminViews();
          } else {
            window.showToast(res.message, 'error');
          }
        }
      });
    });

    // Search filter inside books table
    const bookSearchInput = document.getElementById('adminBookSearchInput');
    if (bookSearchInput) {
      bookSearchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(r => {
          const text = r.textContent.toLowerCase();
          r.style.display = text.includes(term) ? '' : 'none';
        });
      });
    }
  }

  function bindAddBookModal() {
    const form = document.getElementById('addBookForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newBookData = {
        title: document.getElementById('newBookTitle').value,
        author: document.getElementById('newBookAuthor').value,
        isbn: document.getElementById('newBookIsbn').value,
        publisher: document.getElementById('newBookPublisher').value,
        year: document.getElementById('newBookYear').value,
        category: document.getElementById('newBookCategory').value,
        totalCopies: document.getElementById('newBookCopies').value,
        shelfLocation: document.getElementById('newBookShelf').value,
        pages: document.getElementById('newBookPages').value,
        coverImage: document.getElementById('newBookCover').value,
        description: document.getElementById('newBookDescription').value
      };

      const res = window.LibraryDB.addBook(newBookData);
      if (res.success) {
        window.showToast(`"${res.book.title}" added to catalog!`, 'success');
        window.closeModal('addBookModal');
        form.reset();
        refreshAllAdminViews();
      } else {
        window.showToast(res.message, 'error');
      }
    });
  }

  function openEditBookModal(id) {
    const book = window.LibraryDB.getBookById(id);
    if (!book) return;

    let editModal = document.getElementById('editBookModal');
    if (!editModal) {
      editModal = document.createElement('div');
      editModal.id = 'editBookModal';
      editModal.className = 'modal-overlay';
      editModal.innerHTML = `
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">Edit Catalog Record</h3>
            <button type="button" class="modal-close-btn" onclick="window.closeModal('editBookModal')">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <form id="editBookForm">
            <input type="hidden" id="editBookId">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Book Title</label>
                <input type="text" id="editBookTitle" class="form-control" required>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                <div class="form-group">
                  <label class="form-label">Author</label>
                  <input type="text" id="editBookAuthor" class="form-control" required>
                </div>
                <div class="form-group">
                  <label class="form-label">ISBN</label>
                  <input type="text" id="editBookIsbn" class="form-control" required>
                </div>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                <div class="form-group">
                  <label class="form-label">Total Inventory Copies</label>
                  <input type="number" id="editBookCopies" class="form-control" min="1" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Shelf Location</label>
                  <input type="text" id="editBookShelf" class="form-control">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Cover Image URL</label>
                <input type="url" id="editBookCover" class="form-control">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="window.closeModal('editBookModal')">Cancel</button>
              <button type="submit" class="btn btn-gold">Save Changes</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(editModal);

      document.getElementById('editBookForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const bookId = document.getElementById('editBookId').value;
        const updateData = {
          title: document.getElementById('editBookTitle').value,
          author: document.getElementById('editBookAuthor').value,
          isbn: document.getElementById('editBookIsbn').value,
          totalCopies: document.getElementById('editBookCopies').value,
          shelfLocation: document.getElementById('editBookShelf').value,
          coverImage: document.getElementById('editBookCover').value
        };

        const res = window.LibraryDB.updateBook(bookId, updateData);
        if (res.success) {
          window.showToast('Book record updated successfully.', 'success');
          window.closeModal('editBookModal');
          refreshAllAdminViews();
        } else {
          window.showToast(res.message, 'error');
        }
      });
    }

    document.getElementById('editBookId').value = book.id;
    document.getElementById('editBookTitle').value = book.title;
    document.getElementById('editBookAuthor').value = book.author;
    document.getElementById('editBookIsbn').value = book.isbn;
    document.getElementById('editBookCopies').value = book.totalCopies;
    document.getElementById('editBookShelf').value = book.shelfLocation || '';
    document.getElementById('editBookCover').value = book.coverImage || '';

    window.openModal('editBookModal');
  }

  /* -------------------------------------------------------------
   * MANAGE MEMBERS TAB
   * -----------------------------------------------------------*/
  function loadManageMembersTab() {
    const tbody = document.getElementById('manageMembersTbody');
    if (!tbody || !window.LibraryDB) return;

    const members = window.LibraryDB.getMembers();

    tbody.innerHTML = members.map(m => {
      const isSuspended = m.status === 'Suspended';
      const activeLoans = window.LibraryDB.getLoansByMember(m.id).filter(l => l.status === 'Borrowed' || l.status === 'Overdue').length;

      return `
        <tr>
          <td>
            <div class="table-user-cell">
              <img src="${m.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" alt="${m.name}" class="table-user-avatar">
              <div>
                <strong>${m.name}</strong>
                <div style="font-size:0.8rem; color:var(--color-text-muted);">${m.membershipId}</div>
              </div>
            </div>
          </td>
          <td>${m.email}</td>
          <td>${m.phone || 'N/A'}</td>
          <td><span class="status-pill status-borrowed">${m.role.toUpperCase()}</span></td>
          <td><strong>${activeLoans}</strong> / ${m.maxBorrowLimit || 4}</td>
          <td>
            <span class="status-pill ${isSuspended ? 'status-suspended' : 'status-active'}">
              ${m.status}
            </span>
          </td>
          <td>
            <button type="button" class="btn btn-sm ${isSuspended ? 'btn-gold' : 'btn-outline'} js-toggle-member" data-id="${m.id}">
              ${isSuspended ? 'Activate' : 'Suspend'}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.js-toggle-member').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const res = window.LibraryDB.toggleMemberStatus(id);
        if (res.success) {
          window.showToast(`Member status updated to ${res.status}.`, 'info');
          refreshAllAdminViews();
        }
      });
    });

    const memberSearchInput = document.getElementById('adminMemberSearchInput');
    if (memberSearchInput) {
      memberSearchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        tbody.querySelectorAll('tr').forEach(r => {
          r.style.display = r.textContent.toLowerCase().includes(term) ? '' : 'none';
        });
      });
    }
  }

  /* -------------------------------------------------------------
   * BORROWING RECORDS TAB & RECORD LOAN MODAL
   * -----------------------------------------------------------*/
  function loadBorrowingRecordsTab() {
    const tbody = document.getElementById('manageLoansTbody');
    if (!tbody || !window.LibraryDB) return;

    const loans = window.LibraryDB.getLoans();

    tbody.innerHTML = loans.map(loan => {
      const isReturned = loan.status === 'Returned';
      const isOverdue = loan.status === 'Overdue';

      return `
        <tr>
          <td><strong>#${loan.id}</strong></td>
          <td>${loan.bookTitle}</td>
          <td>${loan.memberName} (${loan.memberEmail})</td>
          <td>${window.formatShortDate(loan.borrowDate)}</td>
          <td><strong style="color:${isOverdue ? 'var(--color-danger)' : 'inherit'};">${window.formatShortDate(loan.dueDate)}</strong></td>
          <td>
            <span class="status-pill ${isReturned ? 'status-returned' : (isOverdue ? 'status-overdue' : 'status-borrowed')}">
              ${loan.status}
            </span>
          </td>
          <td>
            ${!isReturned ? `
              <button type="button" class="btn btn-sm btn-outline js-quick-return" data-id="${loan.id}">
                Process Return
              </button>
            ` : `<span style="font-size:0.85rem; color:var(--color-text-light);">Returned on ${window.formatShortDate(loan.returnDate)}</span>`}
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.js-quick-return').forEach(btn => {
      btn.addEventListener('click', () => {
        const loanId = btn.getAttribute('data-id');
        const res = window.LibraryDB.returnBook(loanId);
        if (res.success) {
          window.showToast(res.message, 'success');
          refreshAllAdminViews();
        }
      });
    });
  }

  function bindRecordLoanModal() {
    const form = document.getElementById('recordLoanForm');
    const memberSelect = document.getElementById('loanMemberSelect');
    const bookSelect = document.getElementById('loanBookSelect');

    if (!form || !memberSelect || !bookSelect) return;

    // Populate selects
    const members = window.LibraryDB.getMembers().filter(m => m.status === 'Active');
    memberSelect.innerHTML = '<option value="">Select Active Member</option>' + members.map(m => `
      <option value="${m.id}">${m.name} (${m.membershipId})</option>
    `).join('');

    const books = window.LibraryDB.getBooks().filter(b => b.availableCopies > 0);
    bookSelect.innerHTML = '<option value="">Select Book (${books.length} Available)</option>' + books.map(b => `
      <option value="${b.id}">${b.title} (${b.availableCopies} available)</option>
    `).join('');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const memberId = memberSelect.value;
      const bookId = bookSelect.value;
      const days = parseInt(document.getElementById('loanDaysInput').value, 10) || 14;

      if (!memberId || !bookId) {
        window.showToast('Please select both a member and a book.', 'warning');
        return;
      }

      const res = window.LibraryDB.borrowBook(memberId, bookId, days);
      if (res.success) {
        // window.showToast(res.message, 'success');
        // window.closeModal('recordLoanModal');
        window.location.href = './404.html';
        form.reset();
        refreshAllAdminViews();
      } else {
        window.showToast(res.message, 'error');
      }
    });
  }

  /* -------------------------------------------------------------
   * RETURNS MANAGEMENT TAB
   * -----------------------------------------------------------*/
  function loadReturnsTab() {
    const returnInput = document.getElementById('returnBarcodeOrLoanInput');
    const returnBtn = document.getElementById('processReturnBtn');

    if (returnBtn && returnInput) {
      returnBtn.addEventListener('click', () => {
        const query = returnInput.value.trim();
        if (!query) {
          window.showToast('Please enter a Loan ID or ISBN.', 'warning');
          return;
        }

        const loans = window.LibraryDB.getLoans();
        const found = loans.find(l => (l.id === query || l.id === 'loan-' + query || l.bookTitle.toLowerCase().includes(query.toLowerCase())) && l.status !== 'Returned');

        if (!found) {
          window.showToast('No active loan matching that ID or title was found.', 'error');
          return;
        }

        const res = window.LibraryDB.returnBook(found.id);
        if (res.success) {
          window.showToast(res.message, 'success');
          returnInput.value = '';
          refreshAllAdminViews();
        }
      });
    }
  }

  /* -------------------------------------------------------------
   * OVERDUE BOOKS TAB
   * -----------------------------------------------------------*/
  function loadOverdueTab() {
    const tbody = document.getElementById('adminOverdueTbody');
    if (!tbody || !window.LibraryDB) return;

    const overdueLoans = window.LibraryDB.getLoans({ status: 'Overdue' });

    if (overdueLoans.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:32px;">
            <div style="color:var(--color-success); font-weight:700;">No Overdue Items!</div>
            <div style="color:var(--color-text-muted); font-size:0.85rem;">All active loans are within their checkout terms.</div>
          </td>
        </tr>
      `;
      return;
    }

    const today = new Date();

    tbody.innerHTML = overdueLoans.map(loan => {
      const due = new Date(loan.dueDate);
      const diffDays = Math.max(1, Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
      const fine = (diffDays * 0.50).toFixed(2); // sample fine

      return `
        <tr>
          <td><strong>#${loan.id}</strong></td>
          <td>${loan.bookTitle}</td>
          <td>${loan.memberName}</td>
          <td>${window.formatShortDate(loan.dueDate)}</td>
          <td><strong style="color:var(--color-danger);">${diffDays} Days</strong></td>
          <td>$${fine} <span style="font-size:0.75rem; color:var(--color-text-light);">(Demo Policy)</span></td>
          <td>
            <button type="button" class="btn btn-sm btn-gold js-send-notice" onclick="window.location.href = './404.html';" data-book="${loan.bookTitle}">
              Send Reminder
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.js-send-notice').forEach(btn => {
      btn.addEventListener('click', () => {
        const book = btn.getAttribute('data-book');
        window.showToast(`Overdue reminder notification dispatched for "${book}".`, 'info');
      });
    });
  }

  /* -------------------------------------------------------------
   * RESERVATIONS QUEUE TAB
   * -----------------------------------------------------------*/
  function loadReservationsTab() {
    const tbody = document.getElementById('adminReservationsTbody');
    if (!tbody || !window.LibraryDB) return;

    const reservations = window.LibraryDB.getReservations();

    tbody.innerHTML = reservations.map(res => {
      const isPending = res.status === 'Pending' || res.status === 'Ready for Pickup';
      return `
        <tr>
          <td><strong>#${res.id}</strong></td>
          <td>${res.bookTitle}</td>
          <td>${res.memberName}</td>
          <td>${window.formatShortDate(res.requestDate)}</td>
          <td>Queue #${res.priorityQueue || 1}</td>
          <td>
            <span class="status-pill ${res.status === 'Ready for Pickup' ? 'status-active' : (res.status === 'Fulfilled' ? 'status-returned' : 'status-pending')}">
              ${res.status}
            </span>
          </td>
          <td>
            ${isPending ? `
              <button type="button" class="btn btn-sm btn-gold js-fulfill-res" data-id="${res.id}">
                Check Out Loan
              </button>
            ` : `<span style="font-size:0.85rem; color:var(--color-text-light);">Completed</span>`}
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.js-fulfill-res').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const res = window.LibraryDB.fulfillReservation(id);
        if (res.success) {
          window.showToast(res.message, 'success');
          refreshAllAdminViews();
        } else {
          window.showToast(res.message, 'error');
        }
      });
    });
  }

  /* -------------------------------------------------------------
   * STAFF TAB
   * -----------------------------------------------------------*/
  function loadStaffTab() {
    const container = document.getElementById('adminStaffList');
    if (!container) return;

    const staffMembers = [
      { name: 'Dr. Julian Sterling', role: 'Chief Librarian & Director', email: 'j.sterling@athenaeum.lib', phone: '+1 (555) 019-2834', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' },
      { name: 'Alistair Finch, Ph.D.', role: 'Head of Rare Manuscripts & Archives', email: 'a.finch@athenaeum.lib', phone: '+1 (555) 019-3321', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
      { name: 'Miriam Vance, MLIS', role: 'Lead Cataloger & Metadata Specialist', email: 'm.vance@athenaeum.lib', phone: '+1 (555) 019-4820', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200' },
      { name: 'Marcus Sterling', role: 'Circulation & Patron Services Officer', email: 'm.sterling@athenaeum.lib', phone: '+1 (555) 019-7412', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' }
    ];

    container.innerHTML = staffMembers.map(s => `
      <div style="background:var(--color-white); border:1px solid var(--color-parchment-300); border-radius:var(--radius-md); padding:20px; display:flex; gap:16px; align-items:center;">
        <img src="${s.avatar}" alt="${s.name}" style="width:54px; height:54px; border-radius:50%; object-fit:cover; border:2px solid var(--color-gold-500);">
        <div>
          <h4 style="font-size:1.05rem; margin-bottom:2px;">${s.name}</h4>
          <div style="color:var(--color-gold-600); font-size:0.85rem; font-weight:600; margin-bottom:4px;">${s.role}</div>
          <div style="font-size:0.8rem; color:var(--color-text-muted);">${s.email} &bull; ${s.phone}</div>
        </div>
      </div>
    `).join('');
  }

  /* -------------------------------------------------------------
   * LOGOUT
   * -----------------------------------------------------------*/
  function bindLogout() {
    document.querySelectorAll('.js-admin-logout').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.LibraryDB.logout();
        if (window.showToast) window.showToast('Administrator session concluded.', 'info');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 300);
      });
    });
  }

  function refreshAllAdminViews() {
    loadOverviewMetrics();
    loadManageBooksTab();
    loadManageMembersTab();
    loadBorrowingRecordsTab();
    loadOverdueTab();
    loadReservationsTab();
  }

  document.addEventListener('DOMContentLoaded', init);

})();
