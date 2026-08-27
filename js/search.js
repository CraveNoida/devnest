import { renderPropertyCard, showSkeleton, initScrollReveal } from './app.js';
import { getAllProperties } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  const searchResults = document.getElementById('searchResults');
  const resultsCount = document.getElementById('resultsCount');
  
  // Search bar inputs
  const searchInput = document.getElementById('searchInput');
  const checkinInput = document.getElementById('checkinInput');
  const checkoutInput = document.getElementById('checkoutInput');
  const guestsInput = document.getElementById('guestsInput');
  const searchForm = document.getElementById('searchForm');

  // Filter inputs
  const minPrice = document.getElementById('minPrice');
  const maxPrice = document.getElementById('maxPrice');
  const propTypeChecks = document.querySelectorAll('input[name="propType"]');
  const bedroomsFilter = document.getElementById('bedroomsFilter');
  const ratingFilter = document.getElementById('ratingFilter');
  const amenityChecks = document.querySelectorAll('input[name="amenity"]');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  const sortSelect = document.getElementById('sortSelect');

  // Read URL params
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('location')) searchInput.value = urlParams.get('location');
  if (urlParams.has('checkin')) checkinInput.value = urlParams.get('checkin');
  if (urlParams.has('checkout')) checkoutInput.value = urlParams.get('checkout');
  if (urlParams.has('guests')) guestsInput.value = urlParams.get('guests');

  // Initial render
  showSkeleton('searchResults', 6);
  setTimeout(filterAndDisplay, 200);

  function filterAndDisplay() {
    let properties = getAllProperties();

    // Location & Title Search
    const loc = searchInput.value.toLowerCase().trim();
    if (loc) {
      properties = properties.filter(p => 
        p.location.toLowerCase().includes(loc) || 
        p.title.toLowerCase().includes(loc) ||
        (p.tagline && p.tagline.toLowerCase().includes(loc)) ||
        (p.description && p.description.toLowerCase().includes(loc))
      );
    }

    // Price Range Filter
    const minP = parseFloat(minPrice.value);
    const maxP = parseFloat(maxPrice.value);
    if (!isNaN(minP)) properties = properties.filter(p => p.price >= minP);
    if (!isNaN(maxP)) properties = properties.filter(p => p.price <= maxP);

    // Property Type Filter
    const checkedTypes = Array.from(propTypeChecks).filter(cb => cb.checked).map(cb => cb.value.toLowerCase());
    if (checkedTypes.length > 0) {
      properties = properties.filter(p => checkedTypes.includes(p.propertyType.toLowerCase()));
    }

    // Bedrooms Filter
    const beds = parseInt(bedroomsFilter.value, 10);
    if (!isNaN(beds) && beds > 0) {
      properties = properties.filter(p => p.bedrooms >= beds);
    }

    // Guests Capacity Filter
    const gVal = parseInt(guestsInput.value, 10);
    if (!isNaN(gVal) && gVal > 1) {
      properties = properties.filter(p => p.guests >= gVal);
    }

    // Rating Filter
    const rating = ratingFilter.value;
    if (rating && rating !== 'Any') {
      properties = properties.filter(p => p.rating >= parseFloat(rating));
    }

    // Amenities Filter (Must match all checked keywords)
    const checkedAmens = Array.from(amenityChecks).filter(cb => cb.checked).map(cb => cb.value.toLowerCase());
    if (checkedAmens.length > 0) {
      properties = properties.filter(p => {
        const pAmens = (p.amenities || []).map(a => a.toLowerCase());
        return checkedAmens.every(term => pAmens.some(pa => pa.includes(term)));
      });
    }

    // Sort
    const sortVal = sortSelect.value;
    if (sortVal === 'price_asc') {
      properties.sort((a, b) => a.price - b.price);
    } else if (sortVal === 'price_desc') {
      properties.sort((a, b) => b.price - a.price);
    } else if (sortVal === 'rating_desc') {
      properties.sort((a, b) => b.rating - a.rating);
    }

    // Results Header Count
    if (resultsCount) {
      resultsCount.innerHTML = `<strong>${properties.length}</strong> ${properties.length === 1 ? 'Room' : 'Rooms'} Available`;
    }

    // Render results
    if (properties.length === 0) {
      searchResults.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🔍</div>
          <h2>No stays found matching your criteria</h2>
          <p>Try clearing filters, then choose either the 1RK studio or the 1BHK apartment at the DevNest Stays location.</p>
          <button id="resetFromEmptyBtn" class="btn btn-primary" style="margin-top: 1rem;">Reset All Filters</button>
        </div>
      `;
      document.getElementById('resetFromEmptyBtn')?.addEventListener('click', resetFilters);
    } else {
      searchResults.innerHTML = properties.map(p => renderPropertyCard(p)).join('');
      initScrollReveal();
    }
  }

  // Event Listeners
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput.value) params.append('location', searchInput.value);
    if (checkinInput.value) params.append('checkin', checkinInput.value);
    if (checkoutInput.value) params.append('checkout', checkoutInput.value);
    if (guestsInput.value) params.append('guests', guestsInput.value);
    window.history.replaceState({}, '', `search.html?${params.toString()}`);
    filterAndDisplay();
  });

  const filterInputs = [minPrice, maxPrice, bedroomsFilter, ratingFilter, sortSelect];
  filterInputs.forEach(el => el && el.addEventListener('change', filterAndDisplay));
  [...propTypeChecks, ...amenityChecks].forEach(cb => cb.addEventListener('change', filterAndDisplay));

  function resetFilters() {
    minPrice.value = '';
    maxPrice.value = '';
    bedroomsFilter.value = '';
    ratingFilter.value = 'Any';
    sortSelect.value = '';
    propTypeChecks.forEach(cb => cb.checked = false);
    amenityChecks.forEach(cb => cb.checked = false);
    searchInput.value = '';
    checkinInput.value = '';
    checkoutInput.value = '';
    guestsInput.value = '1';
    window.history.replaceState({}, '', 'search.html');
    filterAndDisplay();
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', resetFilters);
  }
});
