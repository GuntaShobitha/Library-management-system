/**
 * Athenaeum Central Library
 * Books Catalog Controller: Search, Multi-Filter, Sorting, Pagination & Checkout Logic
 */

(function () {
  'use strict';

  // State
  let currentPage = 1;
  const itemsPerPage = 8;
  let activeCategory = 'all';
  let activeAvailability = 'all';
  let activeSort = 'popular';
  let searchQuery = '';

  // DOM Elements
  const catalogGrid = document.getElementById('catalogBooksGrid');
  const searchInput = document.getElementById('catalogSearchInput');
  const categoryFilter = document.getElementById('categoryFilterSelect');
  const availabilityFilter = document.getElementById('availabilityFilterSelect');
  const sortSelect = document.getElementById('sortFilterSelect');
  const resultsCount = document.getElementById('resultsCount');
  const paginationContainer = document.getElementById('paginationControls');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');

  function init() {
    if (!window.LibraryDB) return;

    // Read URL query parameters
    const params = new URLSearchParams(window.location.search);
    if (params.has('q')) {
      searchQuery = params.get('q').trim();
      if (searchInput) searchInput.value = searchQuery;
    }
    if (params.has('category')) {
      activeCategory = params.get('category').trim();
      if (categoryFilter) categoryFilter.value = activeCategory;
    }
    if (params.has('availability')) {
      activeAvailability = params.get('availability').trim();
      if (availabilityFilter) availabilityFilter.value = activeAvailability;
    }
    if (params.has('sort')) {
      activeSort = params.get('sort').trim();
      if (sortSelect) sortSelect.value = activeSort;
    }

    populateCategoryOptions();
    bindEvents();
    renderCatalog();
  }

  function populateCategoryOptions() {
    if (!categoryFilter) return;
    const categories = window.LibraryDB.getCategories();
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      if (cat.id === activeCategory) opt.selected = true;
      categoryFilter.appendChild(opt);
    });
  }

  function bindEvents() {
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        currentPage = 1;
        renderCatalog();
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        activeCategory = e.target.value;
        currentPage = 1;
        updateUrlParams();
        renderCatalog();
      });
    }

    if (availabilityFilter) {
      availabilityFilter.addEventListener('change', (e) => {
        activeAvailability = e.target.value;
        currentPage = 1;
        updateUrlParams();
        renderCatalog();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        activeSort = e.target.value;
        currentPage = 1;
        renderCatalog();
      });
    }

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        searchQuery = '';
        activeCategory = 'all';
        activeAvailability = 'all';
        activeSort = 'popular';
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        if (availabilityFilter) availabilityFilter.value = 'all';
        if (sortSelect) sortSelect.value = 'popular';
        currentPage = 1;
        updateUrlParams();
        renderCatalog();
      });
    }
  }

  function updateUrlParams() {
    const url = new URL(window.location);
    if (searchQuery) url.searchParams.set('q', searchQuery); else url.searchParams.delete('q');
    if (activeCategory !== 'all') url.searchParams.set('category', activeCategory); else url.searchParams.delete('category');
    if (activeAvailability !== 'all') url.searchParams.set('availability', activeAvailability); else url.searchParams.delete('availability');
    window.history.replaceState({}, '', url);
  }

  function renderCatalog() {
    if (!catalogGrid) return;

    const filtered = window.LibraryDB.searchBooks(searchQuery, {
      category: activeCategory,
      availability: activeAvailability,
      sort: activeSort
    });

    if (resultsCount) {
      resultsCount.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? 'book' : 'books'} in catalog`;
    }

    if (filtered.length === 0) {
      catalogGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 60px 20px; text-align: center;">
          <div class="empty-state">
            <span class="material-symbols-outlined empty-state-icon">search_off</span>
            <h3 class="empty-state-title">No Books Match Your Search</h3>
            <p class="empty-state-desc">We couldn't find any books matching your selected filters or keywords. Try resetting your search filters.</p>
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('resetFiltersBtn')?.click();">
              <span class="material-symbols-outlined">restart_alt</span>
              Reset Search & Filters
            </button>
          </div>
        </div>
      `;
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    // Pagination slice
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBooks = filtered.slice(startIndex, startIndex + itemsPerPage);

    catalogGrid.innerHTML = paginatedBooks.map(book => {
      const isAvailable = book.availableCopies > 0;
      const statusClass = isAvailable ? 'badge-available' : 'badge-borrowed';
      const statusText = isAvailable ? `${book.availableCopies} Copies Available` : 'All Out / Reserve';

      return `
        <div class="book-card" data-id="${book.id}">
          <div class="book-card-cover-wrap">
            <img src="${book.coverImage}" alt="${book.title} cover" class="book-card-cover" loading="lazy" onerror="this.src='assets/images/book-cover-fallback.webp'">
            <span class="book-badge-status ${statusClass}">${statusText}</span>
            <span class="book-category-pill">${book.categoryName}</span>
          </div>
          <div class="book-card-content">
            <h3 class="book-card-title" title="${book.title}">${book.title}</h3>
            <div class="book-card-author">By ${book.author}</div>
            
            <div class="book-card-meta">
              <span><span class="material-symbols-outlined" style="font-size:15px; vertical-align:text-bottom;">calendar_today</span> ${book.year}</span>
              <span><span class="material-symbols-outlined" style="font-size:15px; vertical-align:text-bottom;">star</span> ${book.rating} (${book.reviewsCount})</span>
              <span><span class="material-symbols-outlined" style="font-size:15px; vertical-align:text-bottom;">menu_book</span> ${book.pages}p</span>
            </div>

            <div class="book-card-actions">
              <a href="./404.html" class="btn btn-sm btn-outline">
                <span class="material-symbols-outlined" style="font-size:16px;">visibility</span>
                Details
              </a>
              ${isAvailable ? `
                <button type="button" class="btn btn-sm btn-gold js-borrow-action" data-id="${book.id}">
                  <span class="material-symbols-outlined" style="font-size:16px;">local_library</span>
                  Borrow
                </button>
              ` : `
                <button type="button" class="btn btn-sm btn-secondary js-reserve-action" data-id="${book.id}">
                  <span class="material-symbols-outlined" style="font-size:16px;">bookmark_add</span>
                  Reserve
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');

    renderPagination(totalPages);
    bindActionButtons();
    if (window.triggerScrollReveals) {
      window.triggerScrollReveals();
    }
  }

  function renderPagination(totalPages) {
    if (!paginationContainer) return;
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let buttonsHtml = '';

    // Prev Button
    buttonsHtml += `
      <button type="button" class="btn btn-sm btn-secondary" ${currentPage === 1 ? 'disabled style="opacity:0.5; pointer-events:none;"' : ''} data-page="${currentPage - 1}">
        &larr; Previous
      </button>
    `;

    // Page Number Buttons
    for (let i = 1; i <= totalPages; i++) {
      const isActive = i === currentPage;
      buttonsHtml += `
        <button type="button" class="btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}" data-page="${i}" style="min-width: 38px; padding: 8px 12px;">
          ${i}
        </button>
      `;
    }

    // Next Button
    buttonsHtml += `
      <button type="button" class="btn btn-sm btn-secondary" ${currentPage === totalPages ? 'disabled style="opacity:0.5; pointer-events:none;"' : ''} data-page="${currentPage + 1}">
        Next &rarr;
      </button>
    `;

    paginationContainer.innerHTML = buttonsHtml;

    paginationContainer.querySelectorAll('button[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.getAttribute('data-page'), 10);
        renderCatalog();
        window.scrollTo({ top: catalogGrid.offsetTop - 120, behavior: 'smooth' });
      });
    });
  }

  function bindActionButtons() {
    // Borrow buttons
    document.querySelectorAll('.js-borrow-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const bookId = btn.getAttribute('data-id');
        handleBorrowClick(bookId);
      });
    });

    // Reserve buttons
    document.querySelectorAll('.js-reserve-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const bookId = btn.getAttribute('data-id');
        handleReserveClick(bookId);
      });
    });
  }

  function handleBorrowClick(bookId) {
    const user = window.LibraryDB.getCurrentUser();
    if (!user) {
      window.showToast('Please sign in or register to borrow library books.', 'warning');
      setTimeout(() => {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
      }, 1200);
      return;
    }

    const res = window.LibraryDB.borrowBook(user.id, bookId, 14);
    if (res.success) {
      window.showToast(res.message, 'success');
      renderCatalog();
    } else {
      window.showToast(res.message, 'error');
    }
  }

  function handleReserveClick(bookId) {
    const user = window.LibraryDB.getCurrentUser();
    if (!user) {
      window.showToast('Please sign in to place a book reservation.', 'warning');
      setTimeout(() => {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
      }, 1200);
      return;
    }

    const res = window.LibraryDB.reserveBook(user.id, bookId);
    if (res.success) {
      window.showToast(res.message, 'success');
      renderCatalog();
    } else {
      window.showToast(res.message, 'error');
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
