// js/booking.js
// DevNest Stays - Direct Reservation Controller

import { getPropertyById, formatPrice, formatDate, generateBookingId, saveBooking, showToast } from './app.js';
import { sendBookingEmail, isEmailConfigured } from './email.js';

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id') || 'prop01';
  const checkin = urlParams.get('checkin');
  const checkout = urlParams.get('checkout');
  const guests = parseInt(urlParams.get('guests'), 10) || 1;
  
  const container = document.getElementById('bookingPage');
  if (!container) return;
  
  if (!id || !checkin || !checkout) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h2>Missing Reservation Information</h2>
        <p>Please select your check-in and check-out dates on the property page.</p>
        <a href="search.html" class="btn btn-primary" style="margin-top: 1rem; display: inline-block;">Browse Stays</a>
      </div>
    `;
    return;
  }
  
  const property = getPropertyById(id);
  if (!property) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏠</div>
        <h2>Property Not Found</h2>
        <p>This property is no longer available.</p>
        <a href="search.html" class="btn btn-primary" style="margin-top: 1rem; display: inline-block;">Browse Stays</a>
      </div>
    `;
    return;
  }
  
  const inDate = new Date(checkin);
  const outDate = new Date(checkout);
  let nights = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
  
  if (nights <= 0) nights = 1;
  
  const nightlyTotal = property.price * nights;
  const cleaningFee = Math.round(property.price * 0.05);
  const serviceFee = 0; // Free direct booking
  const taxes = Math.round(nightlyTotal * 0.12);
  const grandTotal = nightlyTotal + cleaningFee + taxes;
  
  renderBookingForm(property, checkin, checkout, guests, nights, nightlyTotal, cleaningFee, serviceFee, taxes, grandTotal, container);
});

function renderBookingForm(property, checkin, checkout, guests, nights, nightlyTotal, cleaningFee, serviceFee, taxes, grandTotal, container) {
  const imgSrc = (property.images && property.images.length > 0) ? property.images[0] : '';
  
  container.innerHTML = `
    <div class="booking-page-layout">
      <!-- Left Column: Guest Details Form -->
      <div class="booking-form-col">
        <a href="property.html?id=${property.id}" style="display:inline-flex; align-items:center; gap:6px; font-size:0.9rem; font-weight:600; color:var(--color-gray-dark); margin-bottom:1.5rem;">
          ← Back to property
        </a>
        
        <h1>Confirm your stay</h1>
        
        <form id="bookingForm" novalidate>
          <div class="form-group">
            <label class="form-label" for="guestName">Full Name *</label>
            <input type="text" id="guestName" class="form-input" placeholder="e.g. Rahul Sharma" required minlength="2">
            <div class="form-error" id="nameError">Please enter your full name.</div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="guestPhone">Mobile Phone Number (WhatsApp) *</label>
            <input type="tel" id="guestPhone" class="form-input" placeholder="e.g. +91 9876543210" required minlength="10">
            <div class="form-error" id="phoneError">Please enter a valid 10-digit mobile number.</div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="guestEmail">Email Address *</label>
            <input type="email" id="guestEmail" class="form-input" placeholder="e.g. rahul@example.com" required>
            <div class="form-error" id="emailError">Please enter a valid email address.</div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="specialRequests">Estimated Arrival Time / Notes (Optional)</label>
            <textarea id="specialRequests" class="form-input" placeholder="e.g. Arriving around 2 PM, requesting parking spot..." rows="3" style="resize:vertical;"></textarea>
          </div>

          <div style="background: var(--color-bg-light); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 2rem;">
            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem;">💳 Payment Preference</h4>
            <p style="font-size: 0.85rem; color: var(--color-gray-dark); margin-bottom: 0.75rem;">Pay directly to the host at check-in via Cash, UPI (GPay/PhonePe/Paytm), or Bank Transfer. Zero cancellation fee up to 24h prior to check-in.</p>
            <label style="display:flex; align-items:center; gap:8px; font-size:0.9rem; font-weight:600; cursor:pointer;">
              <input type="radio" name="paymentMethod" value="pay_at_checkin" checked style="accent-color: var(--color-black);">
              Pay at Check-in / UPI on Arrival
            </label>
          </div>
          
          <button type="submit" class="btn btn-primary btn-large" style="width: 100%; font-size: 1.05rem;">
            Confirm Reservation (₹${Number(grandTotal).toLocaleString('en-IN')})
          </button>

          <p style="text-align: center; font-size: 0.8rem; color: var(--color-gray-mid); margin-top: 1rem;">
            🔒 By clicking confirm, your stay details will be sent directly to the DevNest Host team.
          </p>
        </form>
      </div>
      
      <!-- Right Column: Summary Card -->
      <div class="booking-summary-col">
        <div class="booking-summary-card">
          <div class="booking-property-preview">
            <img src="${imgSrc}" alt="${property.title}">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 2px;">${property.title}</h3>
              <p style="font-size: 0.85rem; color: var(--color-gray-dark);">${property.location}, ${property.country}</p>
              <div style="font-size: 0.82rem; font-weight: 700; margin-top: 4px;">★ ${property.rating} Superhost</div>
            </div>
          </div>
          
          <div class="booking-details-box">
            <div class="detail-row"><span>Check-in:</span> <strong>${formatDate(checkin)}</strong></div>
            <div class="detail-row"><span>Check-out:</span> <strong>${formatDate(checkout)}</strong></div>
            <div class="detail-row"><span>Duration:</span> <strong>${nights} night${nights > 1 ? 's' : ''}</strong></div>
            <div class="detail-row"><span>Guests:</span> <strong>${guests} guest${guests > 1 ? 's' : ''}</strong></div>
          </div>
          
          <div class="price-breakdown">
            <div class="price-line">
              <span>${formatPrice(property.price)} × ${nights} night${nights > 1 ? 's' : ''}</span>
              <span>${formatPrice(nightlyTotal)}</span>
            </div>
            <div class="price-line">
              <span>Cleaning & Sanitization</span>
              <span>${formatPrice(cleaningFee)}</span>
            </div>
            <div class="price-line">
              <span>DevNest Direct Booking Fee</span>
              <span style="color: #16a34a; font-weight: 600;">FREE (₹0)</span>
            </div>
            <div class="price-line">
              <span>Taxes & GST (12%)</span>
              <span>${formatPrice(taxes)}</span>
            </div>
            <div class="price-line total-line">
              <span>Total Amount</span>
              <span>${formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  const form = document.getElementById('bookingForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('visible'));
    
    const name = document.getElementById('guestName').value.trim();
    const phone = document.getElementById('guestPhone').value.trim();
    const email = document.getElementById('guestEmail').value.trim();
    const notes = document.getElementById('specialRequests').value.trim();
    
    let isValid = true;
    if (name.length < 2) {
      document.getElementById('nameError').classList.add('visible');
      isValid = false;
    }
    if (phone.length < 10) {
      document.getElementById('phoneError').classList.add('visible');
      isValid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('emailError').classList.add('visible');
      isValid = false;
    }
    
    if (!isValid) return;
    
    const bookingId = generateBookingId();
    const booking = {
      id: bookingId,
      bookingId: bookingId,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyLocation: `${property.location}, ${property.country}`,
      propertyImage: imgSrc,
      checkin: checkin,
      checkIn: checkin,
      checkout: checkout,
      checkOut: checkout,
      guests: guests,
      nights: nights,
      pricePerNight: property.price,
      cleaningFee: cleaningFee,
      serviceFee: serviceFee,
      taxes: taxes,
      totalAmount: grandTotal,
      totalPrice: grandTotal,
      guestName: name,
      guestEmail: email,
      guestPhone: phone,
      notes: notes,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      bookingDate: new Date().toISOString()
    };
    
    saveBooking(booking);
    
    if (isEmailConfigured()) {
      try {
        await sendBookingEmail(booking);
        showToast('Reservation confirmed! Email sent to host.', 'success');
      } catch (err) {
        showToast('Reservation saved locally.', 'info');
      }
    } else {
      showToast('Reservation saved locally. Confirmation ready!', 'success');
    }
    
    renderConfirmationScreen(booking, property, container);
  });
}

function renderConfirmationScreen(booking, property, container) {
  const whatsappMsg = encodeURIComponent(
    `Hello DevNest Stays, I have confirmed my booking on your website!\n\n` +
    `📌 Booking ID: ${booking.id}\n` +
    `🏠 Stay: ${booking.propertyTitle}\n` +
    `📅 Check-in: ${formatDate(booking.checkIn)}\n` +
    `📅 Check-out: ${formatDate(booking.checkOut)}\n` +
    `👥 Guests: ${booking.guests}\n` +
    `💰 Total: ${formatPrice(booking.totalPrice)}\n` +
    `👤 Guest Name: ${booking.guestName}\n` +
    `📞 Phone: ${booking.guestPhone}\n\n` +
    `Looking forward to checking in!`
  );

  container.innerHTML = `
    <div class="confirmation-screen">
      <div class="success-icon">✓</div>
      <h1>Reservation Confirmed!</h1>
      <p style="color: var(--color-gray-dark); font-size: 1.05rem;">
        Thank you, <strong>${booking.guestName}</strong>. Your stay with DevNest Stays has been successfully recorded.
      </p>
      
      <div class="confirmation-details">
        <div class="detail-row"><span>Booking Reference:</span> <strong>${booking.id}</strong></div>
        <div class="detail-row"><span>Property:</span> <strong>${booking.propertyTitle}</strong></div>
        <div class="detail-row"><span>Location:</span> <strong>${booking.propertyLocation}</strong></div>
        <div class="detail-row"><span>Check-in Date:</span> <strong>${formatDate(booking.checkIn)}</strong></div>
        <div class="detail-row"><span>Check-out Date:</span> <strong>${formatDate(booking.checkOut)}</strong></div>
        <div class="detail-row"><span>Guests:</span> <strong>${booking.guests} Guest${booking.guests > 1 ? 's' : ''} (${booking.nights} night${booking.nights > 1 ? 's' : ''})</strong></div>
        <div class="detail-row"><span>Total Payable:</span> <strong>${formatPrice(booking.totalPrice)}</strong></div>
        <div class="detail-row"><span>Confirmation Sent To:</span> <strong>${booking.guestEmail}</strong></div>
        <div class="detail-row"><span>Primary Contact:</span> <strong>${booking.guestPhone}</strong></div>
      </div>
      
      <div style="margin-bottom: 2rem;">
        <a href="https://wa.me/917042341195?text=${whatsappMsg}" target="_blank" class="btn btn-whatsapp btn-large" style="width: 100%; max-width: 440px;">
          💬 Send Confirmation to Host on WhatsApp
        </a>
      </div>
      
      <div class="confirmation-actions">
        <a href="trips.html" class="btn btn-primary">
          View My Bookings
        </a>
        <a href="index.html" class="btn btn-outline">
          Back to Home
        </a>
      </div>
    </div>
  `;
}
