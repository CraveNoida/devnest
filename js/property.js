import { getPropertyById, formatPrice, formatDate, renderPropertyCard, isInWishlist, toggleWishlist, showToast, initScrollReveal } from './app.js';
import { getAllProperties } from './data.js';

let currentImageIndex = 0;
let currentProperty = null;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id') || 'prop01';
  
  const propertyPage = document.getElementById('propertyPage');
  if (!propertyPage) return;
  
  const property = getPropertyById(id);
  
  if (!property) {
    propertyPage.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏠</div>
        <h2>Property not found</h2>
        <p>The stay you are looking for is no longer available or the link is incorrect.</p>
        <a href="search.html" class="btn btn-primary" style="margin-top: 1rem; display: inline-block;">Explore Other Stays</a>
      </div>
    `;
    return;
  }
  
  currentProperty = property;
  renderPropertyDetails(property, propertyPage);
});


function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function getReviewInitials(name) {
  return String(name || 'Guest')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || 'G';
}

function getStoredReviews(propertyId) {
  try {
    const reviews = JSON.parse(localStorage.getItem('devnestReviews') || '{}');
    return Array.isArray(reviews[propertyId]) ? reviews[propertyId] : [];
  } catch (error) {
    return [];
  }
}

function saveStoredReview(propertyId, review) {
  let reviews = {};
  try {
    reviews = JSON.parse(localStorage.getItem('devnestReviews') || '{}');
  } catch (error) {
    reviews = {};
  }
  const propertyReviews = Array.isArray(reviews[propertyId]) ? reviews[propertyId] : [];
  reviews[propertyId] = [review, ...propertyReviews];
  localStorage.setItem('devnestReviews', JSON.stringify(reviews));
}

function renderReviewCard(review) {
  const name = escapeHtml(review.name);
  const initials = escapeHtml(getReviewInitials(review.name));
  const stayDate = escapeHtml(review.stayDate || 'Recent stay');
  const text = escapeHtml(review.text);
  const rating = Math.min(5, Math.max(1, Number(review.rating) || 5));

  return [
    '<div class="review-card">',
    '<div class="review-author">',
    '<span class="review-avatar" aria-hidden="true">' + initials + '</span>',
    '<div>',
    '<strong>' + name + '</strong>',
    '<div style="font-size: 0.8rem; color: #777;">' + stayDate + ' · ' + '★'.repeat(rating) + '</div>',
    '</div>',
    '</div>',
    '<p class="review-text">"' + text + '"</p>',
    '</div>'
  ].join('');
}

function getDefaultReviews() {
  return [
    {
      name: 'Kunal Verma',
      stayDate: 'Stayed in August 2026',
      rating: 5,
      text: 'Outstanding stay! The apartment is exactly as shown in the photos and video tour. Ultra-clean, super fast WiFi, and the host responded within minutes.'
    },
    {
      name: 'Ananya Sen',
      stayDate: 'Stayed in July 2026',
      rating: 5,
      text: 'Quiet, peaceful, and stylishly decorated. The kitchen was stocked with everything needed. Booking directly was effortless and saved us money.'
    }
  ];
}

function renderReviewsHtml(property) {
  const reviews = [...getStoredReviews(property.id), ...getDefaultReviews()];
  return reviews.map(renderReviewCard).join('');
}

function renderPropertyDetails(property, container) {
  const isSuperhost = property.rating >= 4.9;
  const allAmenities = property.amenities || [];
  const visibleAmenities = allAmenities.slice(0, 8);
  const isWished = isInWishlist(property.id);
  const hasVideo = property.videos && property.videos.length > 0;
  
  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['photos-videos/2600/WhatsApp Image 2026-08-26 at 10.50.20 PM.jpeg'];

  // Default dates: tomorrow to day after tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);
  
  const defaultCheckin = tomorrow.toISOString().split('T')[0];
  const defaultCheckout = dayAfter.toISOString().split('T')[0];

  let galleryItemsHtml = '';
  for (let i = 1; i < 5; i++) {
    const imgUrl = images[i] || images[0];
    galleryItemsHtml += `<div class="gallery-item" style="background-image: url('${imgUrl}')" data-index="${i}"></div>`;
  }

  let videoButtonHtml = hasVideo ? `
    <button class="action-btn" id="watchVideoTourBtn" style="background: var(--color-black); color: #fff;">
      ▶ Watch Video Tour
    </button>
  ` : '';

  const priceLabel = property.priceNote || `${formatPrice(property.price)} / night`;
  const mapsLink = property.mapsUrl || 'https://share.google/8AvyayTe03vYw3nqk';

  container.innerHTML = `
    <div class="breadcrumb">
      <a href="index.html">Home</a> &gt; 
      <a href="${mapsLink}" target="_blank">Verified Location</a> &gt; 
      <span>${property.title}</span>
    </div>
    
    <div class="property-title-header">
      <h1>${property.title}</h1>
      <div class="property-meta-row">
        <div class="property-meta-left">
          <span>★ <strong>${property.rating}</strong> (${property.reviewCount} verified reviews)</span> · 
          <span>📍 ${property.location}, ${property.country}</span> · 
          <span>${property.propertyType}</span>
          ${isSuperhost ? '· <span class="superhost-badge" style="position:static; display:inline-block;">★ Superhost</span>' : ''}
        </div>
        <div class="property-meta-actions">
          ${videoButtonHtml}
          <a class="action-btn" href="#reviews" id="addReviewTopBtn">
            Add Review
          </a>
          <button class="action-btn" id="shareStayBtn">
            🔗 Share
          </button>
          <a class="action-btn" href="${mapsLink}" target="_blank">
            📍 Maps
          </a>
          <button class="action-btn" id="saveWishlistBtn">
            ${isWished ? '❤️ Saved' : '🤍 Save'}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Image Gallery -->
    <div class="property-gallery">
      <div class="gallery-main" style="background-image: url('${images[0]}')" data-index="0"></div>
      ${galleryItemsHtml}
      <button class="gallery-show-all" id="showAllPhotosBtn">
        📷 Show all ${images.length} photos
      </button>
    </div>
    
    <!-- 2-Column Main Layout -->
    <div class="property-layout">
      <!-- Left Column: Details -->
      <div class="property-main">
        
        <div class="host-bar">
          <img src="${property.host?.avatar || images[0]}" alt="${property.host?.name}" class="host-avatar">
          <div class="host-info">
            <h3>Hosted by ${property.host?.name || 'DevNest Stays'}</h3>
            <p>Superhost · 100% Response Rate · Direct Verified Host</p>
          </div>
        </div>
        
        <div class="property-specs">
          <div class="spec-item">👥 Up to ${property.guests} guests</div>
          <div class="spec-item">🛏 ${property.bedrooms} bedroom${property.bedrooms > 1 ? 's' : ''}</div>
          <div class="spec-item">🛌 ${property.beds} bed${property.beds > 1 ? 's' : ''}</div>
          <div class="spec-item">🚿 ${property.bathrooms} bathroom${property.bathrooms > 1 ? 's' : ''}</div>
          <div class="spec-item">📶 High-Speed WiFi</div>
        </div>
        
        <div class="description-section">
          <h2>About this stay</h2>
          <p class="desc-text">${property.description}</p>
        </div>
        
        <div class="amenities-section">
          <h2>What this place offers</h2>
          <div class="amenities-grid">
            ${visibleAmenities.map(am => `
              <div class="amenity-item">
                <span style="font-weight:700; color:var(--color-black);">✓</span> ${am}
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Reviews Section -->
        <div class="reviews-section" id="reviews">
          <h2 class="reviews-header">★ ${property.rating} · ${property.reviewCount} Guest Reviews</h2>
          
          <div class="rating-bars">
            <div class="rating-bar-item">
              <span>Cleanliness</span>
              <div class="rating-progress-bg"><div class="rating-progress-fg" style="width: 98%"></div></div>
              <span>4.9</span>
            </div>
            <div class="rating-bar-item">
              <span>Accuracy</span>
              <div class="rating-progress-bg"><div class="rating-progress-fg" style="width: 100%"></div></div>
              <span>5.0</span>
            </div>
            <div class="rating-bar-item">
              <span>Communication</span>
              <div class="rating-progress-bg"><div class="rating-progress-fg" style="width: 100%"></div></div>
              <span>5.0</span>
            </div>
            <div class="rating-bar-item">
              <span>Location</span>
              <div class="rating-progress-bg"><div class="rating-progress-fg" style="width: 96%"></div></div>
              <span>4.8</span>
            </div>
            <div class="rating-bar-item">
              <span>Check-in</span>
              <div class="rating-progress-bg"><div class="rating-progress-fg" style="width: 100%"></div></div>
              <span>5.0</span>
            </div>
            <div class="rating-bar-item">
              <span>Value</span>
              <div class="rating-progress-bg"><div class="rating-progress-fg" style="width: 98%"></div></div>
              <span>4.9</span>
            </div>
          </div>

          <div class="reviews-grid" id="reviewsGrid">
            ${renderReviewsHtml(property)}
          </div>

          <form class="review-form" id="reviewForm" novalidate>
            <h3>Add your review</h3>
            <div class="review-form-grid">
              <div class="form-group">
                <label class="form-label" for="reviewName">Name</label>
                <input class="form-input" type="text" id="reviewName" placeholder="Your name" required minlength="2">
              </div>
              <div class="form-group">
                <label class="form-label" for="reviewRating">Rating</label>
                <select class="form-input" id="reviewRating" required>
                  <option value="5">5 stars</option>
                  <option value="4">4 stars</option>
                  <option value="3">3 stars</option>
                  <option value="2">2 stars</option>
                  <option value="1">1 star</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="reviewText">Review</label>
              <textarea class="form-input" id="reviewText" rows="4" placeholder="Share your experience" required minlength="10"></textarea>
            </div>
            <button class="btn btn-primary btn-small" type="submit">Submit Review</button>
            <p class="dn-form-note" id="reviewMessage" aria-live="polite"></p>
          </form>
        </div>

        <!-- Host Direct Contact Section -->
        <div style="padding: 2rem; background: var(--color-bg-light); border-radius: var(--radius-lg); border: 1px solid var(--color-border); margin-top: 2rem;">
          <h3 style="font-family: var(--font-serif); font-size: 1.4rem; margin-bottom: 0.5rem;">Have questions about this property?</h3>
          <p style="color: var(--color-gray-dark); margin-bottom: 1.25rem;">Contact the DevNest host team directly via WhatsApp or phone call for immediate assistance or custom stay requests.</p>
          <div class="flex" style="gap: 1rem; flex-wrap: wrap;">
            <a href="https://wa.me/917042341195?text=Hi%20DevNest%20Stays,%20I'm%20inquiring%20about%20${encodeURIComponent(property.title)}" target="_blank" class="btn btn-whatsapp">
              💬 WhatsApp Host
            </a>
            <a href="tel:+917042341195" class="btn btn-outline">
              📞 Call: +91 7042341195
            </a>
            <a href="${mapsLink}" target="_blank" class="btn btn-outline">
              📍 Open Location
            </a>
          </div>
        </div>
      </div>
      
      <!-- Right Column: Sticky Booking Widget -->
      <div class="property-sidebar">
        <div class="booking-card">
          <div class="booking-price">
            <div>
              <span>${priceLabel}</span>
            </div>
            <div style="font-size: 0.95rem; font-weight: 700;">
              ★ ${property.rating}
            </div>
          </div>
          
          <div class="booking-inputs">
            <div class="date-inputs">
              <div class="input-group">
                <label for="checkinInput">CHECK-IN</label>
                <input type="date" id="checkinInput" value="${defaultCheckin}" min="${new Date().toISOString().split('T')[0]}">
              </div>
              <div class="input-group">
                <label for="checkoutInput">CHECK-OUT</label>
                <input type="date" id="checkoutInput" value="${defaultCheckout}">
              </div>
            </div>
            <div class="input-group">
              <label for="guestsInput">GUESTS</label>
              <select id="guestsInput">
                ${Array.from({length: property.guests}, (_, i) => `
                  <option value="${i+1}">${i+1} Guest${i > 0 ? 's' : ''}</option>
                `).join('')}
              </select>
            </div>
          </div>
          
          <button class="btn btn-primary btn-large booking-reserve-btn" id="reserveBtn">
            Reserve Instant Stay
          </button>

          <a href="https://wa.me/917042341195?text=Hi%20DevNest%20Stays,%20I'm%20interested%20in%20booking%20${encodeURIComponent(property.title)}" target="_blank" class="btn btn-whatsapp booking-whatsapp-inquiry">
            💬 Inquire on WhatsApp
          </a>
          
          <p class="booking-note">Direct host booking · Confirm details on WhatsApp</p>
          
          <div class="price-breakdown" id="priceBreakdown">
            <div class="price-line">
              <span id="nightlyCalcLabel">${formatPrice(property.price)} × 2 nights</span>
              <span id="nightlyTotalVal">${formatPrice(property.price * 2)}</span>
            </div>
            <div class="price-line">
              <span>Cleaning & Sanitization</span>
              <span id="cleaningFeeVal">${formatPrice(Math.round(property.price * 0.05))}</span>
            </div>
            <div class="price-line">
              <span>DevNest Service Fee</span>
              <span id="serviceFeeVal" style="color: #16a34a; font-weight: 600;">FREE (₹0)</span>
            </div>
            <div class="price-line">
              <span>Taxes & GST (12%)</span>
              <span id="taxesFeeVal">${formatPrice(Math.round(property.price * 2 * 0.12))}</span>
            </div>
            <div class="price-line total-line">
              <span>Total Amount</span>
              <span id="grandTotalVal">${formatPrice(property.price * 2 + Math.round(property.price * 0.05) + Math.round(property.price * 2 * 0.12))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations Section -->
    <div style="padding: 3rem 0; border-top: 1px solid var(--color-border);">
      <h2 style="font-family: var(--font-serif); font-size: 2rem; margin-bottom: 1.5rem;">Other Option at This Location</h2>
      <div class="property-grid" id="recommendationsGrid"></div>
    </div>
  `;

  // Render similar recommendations
  const allProps = getAllProperties().filter(p => p.id !== property.id);
  const recs = allProps.slice(0, 3);
  const recGrid = document.getElementById('recommendationsGrid');
  if (recGrid) {
    recGrid.innerHTML = recs.map(p => renderPropertyCard(p)).join('');
  }

  // Booking Calculator Logic
  const checkinInput = document.getElementById('checkinInput');
  const checkoutInput = document.getElementById('checkoutInput');
  const guestsInput = document.getElementById('guestsInput');
  const reserveBtn = document.getElementById('reserveBtn');
  
  function updatePricing() {
    if (!checkinInput.value || !checkoutInput.value) return;
    
    const inDate = new Date(checkinInput.value);
    const outDate = new Date(checkoutInput.value);
    
    let nights = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
    if (nights <= 0) {
      nights = 1;
      let nextDay = new Date(inDate);
      nextDay.setDate(nextDay.getDate() + 1);
      checkoutInput.value = nextDay.toISOString().split('T')[0];
    }
    
    const guests = Math.max(1, Number(guestsInput.value) || 1);
    const extraGuestFee = Math.max(0, guests - 1) * 500;
    const guestSurcharge = extraGuestFee * nights;
    const nightlyTotal = (property.price * nights) + guestSurcharge;
    const cleaningFee = Math.round(property.price * 0.05);
    const taxes = Math.round(nightlyTotal * 0.12);
    const grandTotal = nightlyTotal + cleaningFee + taxes;
    
    document.getElementById('nightlyCalcLabel').textContent = extraGuestFee ? formatPrice(property.price) + ' + ' + formatPrice(extraGuestFee) + ' extra guest/night × ' + nights + ' night' + (nights > 1 ? 's' : '') : formatPrice(property.price) + ' × ' + nights + ' night' + (nights > 1 ? 's' : '');
    document.getElementById('nightlyTotalVal').textContent = formatPrice(nightlyTotal);
    document.getElementById('cleaningFeeVal').textContent = formatPrice(cleaningFee);
    document.getElementById('taxesFeeVal').textContent = formatPrice(taxes);
    document.getElementById('grandTotalVal').textContent = formatPrice(grandTotal);
  }

  checkinInput.addEventListener('change', () => {
    let inDate = new Date(checkinInput.value);
    let nextDay = new Date(inDate);
    nextDay.setDate(nextDay.getDate() + 1);
    checkoutInput.min = nextDay.toISOString().split('T')[0];
    if (new Date(checkoutInput.value) <= inDate) {
      checkoutInput.value = nextDay.toISOString().split('T')[0];
    }
    updatePricing();
  });

  checkoutInput.addEventListener('change', updatePricing);
  guestsInput.addEventListener('change', updatePricing);

  reserveBtn.addEventListener('click', () => {
    if (!checkinInput.value || !checkoutInput.value) {
      showToast('Please select check-in and check-out dates', 'warning');
      return;
    }
    window.location.href = `booking.html?id=${property.id}&checkin=${checkinInput.value}&checkout=${checkoutInput.value}&guests=${guestsInput.value}`;
  });

  // Save Wishlist Button in Header
  const saveWishlistBtn = document.getElementById('saveWishlistBtn');
  if (saveWishlistBtn) {
    saveWishlistBtn.addEventListener('click', () => {
      const added = toggleWishlist(property.id);
      saveWishlistBtn.innerHTML = added ? '❤️ Saved' : '🤍 Save';
    });
  }

  // Share Button
  const shareStayBtn = document.getElementById('shareStayBtn');
  if (shareStayBtn) {
    shareStayBtn.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!', 'success');
      } else {
        showToast('Link ready to share', 'info');
      }
    });
  }

  // Watch Video Tour Button
  const watchVideoTourBtn = document.getElementById('watchVideoTourBtn');
  if (watchVideoTourBtn && hasVideo) {
    watchVideoTourBtn.addEventListener('click', () => {
      openVideo(property.videos[0], `${property.title} - Video Tour`);
    });
  }

  // Lightbox functionality
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCounter = document.getElementById('lightboxCounter');

  function openLightbox(index) {
    currentImageIndex = index;
    updateLightbox();
    lightbox.classList.remove('hidden');
  }

  function updateLightbox() {
    if (currentImageIndex < 0) currentImageIndex = images.length - 1;
    if (currentImageIndex >= images.length) currentImageIndex = 0;
    lightboxImg.style.opacity = '0.3';
    lightboxImg.style.transform = 'scale(0.98)';
    setTimeout(() => {
      lightboxImg.src = images[currentImageIndex];
      lightboxImg.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }, 120);
    lightboxCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;
  }

  document.querySelector('.gallery-main')?.addEventListener('click', () => openLightbox(0));
  document.querySelectorAll('.gallery-item').forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx + 1));
  });

  document.getElementById('showAllPhotosBtn')?.addEventListener('click', () => openLightbox(0));
  document.getElementById('lightboxClose')?.addEventListener('click', () => lightbox.classList.add('hidden'));
  document.getElementById('lightboxPrev')?.addEventListener('click', () => { currentImageIndex--; updateLightbox(); });
  document.getElementById('lightboxNext')?.addEventListener('click', () => { currentImageIndex++; updateLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('hidden')) {
      if (e.key === 'Escape') lightbox.classList.add('hidden');
      if (e.key === 'ArrowLeft') { currentImageIndex--; updateLightbox(); }
      if (e.key === 'ArrowRight') { currentImageIndex++; updateLightbox(); }
    }
  });


  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const nameInput = document.getElementById('reviewName');
      const ratingInput = document.getElementById('reviewRating');
      const textInput = document.getElementById('reviewText');
      const messageEl = document.getElementById('reviewMessage');
      const name = nameInput.value.trim();
      const text = textInput.value.trim();
      const rating = Number(ratingInput.value) || 5;

      if (name.length < 2 || text.length < 10) {
        messageEl.textContent = 'Please add your name and a review of at least 10 characters.';
        return;
      }

      const review = {
        id: 'review-' + Date.now(),
        name,
        rating,
        text,
        stayDate: 'Just now',
        createdAt: new Date().toISOString()
      };
      saveStoredReview(property.id, review);
      document.getElementById('reviewsGrid').insertAdjacentHTML('afterbegin', renderReviewCard(review));
      reviewForm.reset();
      ratingInput.value = '5';
      messageEl.textContent = 'Thanks, your review has been added.';
      showToast('Review added', 'success');
    });
  }

  initScrollReveal();
}

function openVideo(videoSrc, title) {
  const modal = document.getElementById('videoModal');
  const player = document.getElementById('videoPlayer');
  const titleEl = document.getElementById('videoModalTitle');
  if (!modal || !player) return;
  titleEl.textContent = title;
  player.src = videoSrc;
  modal.classList.remove('hidden');
  player.play().catch(e => console.log('Autoplay blocked'));
}

document.getElementById('videoModalClose')?.addEventListener('click', () => {
  const modal = document.getElementById('videoModal');
  const player = document.getElementById('videoPlayer');
  if (player) {
    player.pause();
    player.src = '';
  }
  modal?.classList.add('hidden');
});








