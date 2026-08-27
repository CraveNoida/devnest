// js/app.js
// DevNest Stays - Core Application Utilities & Components

import { getAllProperties } from './data.js';

export function getPropertyById(id) {
  const properties = getAllProperties();
  return properties.find(p => p.id === id) || null;
}

export function formatPrice(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ'}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Close notification">×</button>
    <div class="toast-progress"></div>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  const removeToast = () => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 300);
  };

  closeBtn.addEventListener('click', removeToast);
  container.appendChild(toast);

  setTimeout(removeToast, 3500);
}

export function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal:not(.visible)');
  if (!reveals.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver not supported
    reveals.forEach(el => el.classList.add('visible'));
  }
}

export function initPageLoader() {
  const loader = document.getElementById('siteLoader');
  if (!loader) return;

  document.body.classList.add('is-loading');

  const hideLoader = () => {
    window.setTimeout(() => {
      loader.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
    }, 450);
  };

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader, { once: true });
    window.setTimeout(hideLoader, 1800);
  }
}

export function initNavigation() {
  initPageLoader();
  initMobileMenu();
  initScrollReveal();
}

export function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  if (menuBtn && !menuBtn.dataset.initialized) {
    menuBtn.addEventListener('click', () => {
      document.body.classList.toggle('mobile-menu-open');
    });
    menuBtn.dataset.initialized = 'true';
  }
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser'));
  } catch (e) {
    return null;
  }
}

export function isLoggedIn() {
  return getCurrentUser() !== null;
}

export function getWishlist() {
  const stored = localStorage.getItem('wishlist');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export function isInWishlist(propertyId) {
  const wishlist = getWishlist();
  return wishlist.includes(propertyId);
}

export function toggleWishlist(propertyId) {
  let wishlist = getWishlist();
  let added = false;
  if (wishlist.includes(propertyId)) {
    wishlist = wishlist.filter(id => id !== propertyId);
  } else {
    wishlist.push(propertyId);
    added = true;
  }
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  if (added) {
    showToast('Saved to your wishlist', 'success');
  } else {
    showToast('Removed from wishlist', 'info');
  }
  return added;
}

export function showSkeleton(containerId, count = 6) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let skeletonHTML = '';
  for (let i = 0; i < count; i++) {
    skeletonHTML += `
      <article class="card skeleton-card">
        <div class="card-img-wrap skeleton-img"></div>
        <div class="card-body">
          <div class="skeleton" style="height: 20px; width: 75%; border-radius: 4px; margin-bottom: 8px;"></div>
          <div class="skeleton" style="height: 14px; width: 45%; border-radius: 4px; margin-bottom: 12px;"></div>
          <div class="skeleton" style="height: 24px; width: 35%; border-radius: 4px;"></div>
        </div>
      </article>
    `;
  }
  container.innerHTML = skeletonHTML;
}

export function renderPropertyCard(property) {
  const isWished = isInWishlist(property.id);
  const activeClass = isWished ? 'active' : '';
  const isSuperhost = property.rating >= 4.9;
  const superhostBadge = isSuperhost 
    ? '<span class="superhost-badge">★ Superhost</span>' 
    : `<span class="superhost-badge">${property.propertyType}</span>`;
  
  const imgSrc = (property.images && property.images.length > 0) 
    ? property.images[0] 
    : 'photos-videos/WhatsApp Image 2026-08-26 at 10.50.20 PM.jpeg';

  const priceLabel = property.priceNote || `${formatPrice(property.price)} / night`;

  return `
    <article class="card" data-id="${property.id}">
      <div class="card-img-wrap">
        <a href="property.html?id=${property.id}">
          <img src="${imgSrc}" alt="${property.title}" class="card-img" loading="lazy">
        </a>
        <button class="wishlist-btn ${activeClass}" data-id="${property.id}" aria-label="Save to wishlist">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
        ${superhostBadge}
      </div>
      <div class="card-body">
        <div class="card-header">
          <h3 class="card-title"><a href="property.html?id=${property.id}">${property.title}</a></h3>
          <span class="card-rating">★ ${property.rating}</span>
        </div>
        <p class="card-location">${property.location} · ${property.propertyType}</p>
        <p class="card-price"><strong>${priceLabel}</strong></p>
        <a href="index.html#booking" class="btn btn-primary btn-small room-book-btn" data-room="${property.id}">Book Now</a>
      </div>
    </article>
  `;
}

export function renderProperties(containerId, propertiesArray) {
  const container = document.getElementById(containerId);
  if (!container) return;
  showSkeleton(containerId, propertiesArray.length || 6);
  setTimeout(() => {
    container.innerHTML = propertiesArray.map(p => renderPropertyCard(p)).join('');
    initScrollReveal();
  }, 200);
}

export function generateBookingId() {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `DNS-2026-${randomDigits}`;
}

export function getBookings() {
  const stored = localStorage.getItem('bookings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export function saveBooking(booking) {
  const bookings = getBookings();
  bookings.unshift(booking);
  localStorage.setItem('bookings', JSON.stringify(bookings));
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
});

// Event delegation for wishlist toggle buttons
document.body.addEventListener('click', (e) => {
  const btn = e.target.closest('.wishlist-btn');
  if (btn) {
    e.preventDefault();
    e.stopPropagation();
    const propertyId = btn.dataset.id;
    const isAdded = toggleWishlist(propertyId);
    if (isAdded) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }
});
