// js/trips.js
// DevNest Stays - Bookings Controller

import { getBookings, formatPrice, formatDate, showToast } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  const tripsGrid = document.getElementById('tripsGrid');
  const tabs = document.querySelectorAll('.trip-tab');
  
  function renderTrips(category = 'upcoming') {
    const bookings = getBookings();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = bookings.filter(b => {
      const checkinDateStr = b.checkin || b.checkIn;
      const checkoutDateStr = b.checkout || b.checkOut;
      const checkin = new Date(checkinDateStr);
      const checkout = new Date(checkoutDateStr);
      
      if (category === 'upcoming') {
        return checkin >= today && b.status !== 'cancelled';
      } else if (category === 'past') {
        return checkout < today && b.status !== 'cancelled';
      } else if (category === 'cancelled') {
        return b.status === 'cancelled';
      }
      return false;
    });

    if (filtered.length === 0) {
      let emptyMsg = '';
      if (category === 'upcoming') {
        emptyMsg = `
          <div class="empty-state-icon">🧳</div>
          <h2>No upcoming reservations</h2>
          <p>When you book a stay with DevNest Stays, your reservation details will appear here.</p>
          <a href="search.html" class="btn btn-primary" style="margin-top: 1.25rem; display: inline-block;">Explore & Book Stays</a>
        `;
      } else if (category === 'past') {
        emptyMsg = `
          <div class="empty-state-icon">🕒</div>
          <h2>No past stays yet</h2>
          <p>Your completed stays will be archived here for easy re-booking.</p>
        `;
      } else {
        emptyMsg = `
          <div class="empty-state-icon">✕</div>
          <h2>No cancelled reservations</h2>
        `;
      }
      tripsGrid.innerHTML = `<div class="empty-state">${emptyMsg}</div>`;
      return;
    }

    tripsGrid.innerHTML = filtered.map(b => {
      const checkinStr = b.checkin || b.checkIn;
      const checkoutStr = b.checkout || b.checkOut;
      const total = b.totalAmount || b.totalPrice;
      const bId = b.bookingId || b.id;
      const img = b.propertyImage || 'photos-videos/2600/WhatsApp Image 2026-08-26 at 10.50.20 PM.jpeg';

      const whatsappText = encodeURIComponent(
        `Hi DevNest Stays, I'm reaching out regarding my booking ${bId} for ${b.propertyTitle} (${formatDate(checkinStr)}).`
      );

      const statusBadge = b.status === 'cancelled'
        ? '<span class="superhost-badge" style="position:static; border-color: rgba(239, 68, 68, 0.4); color: #991b1b; background: #fef2f2;">Cancelled</span>'
        : (category === 'upcoming' 
            ? '<span class="superhost-badge" style="position:static; border-color: rgba(34, 197, 94, 0.4); color: #166534; background: #f0fdf4;">✓ Confirmed</span>' 
            : '<span class="superhost-badge" style="position:static; border-color: var(--color-border); color: var(--color-gray-dark); background: var(--color-bg-subtle);">Completed</span>');

      return `
        <div class="trip-card reveal visible">
          <a href="property.html?id=${b.propertyId}">
            <img class="trip-card-img" src="${img}" alt="${b.propertyTitle}" loading="lazy">
          </a>
          <div class="trip-card-info" style="flex: 1;">
            <div class="flex-between">
              <h3 style="font-family: var(--font-serif); font-size: 1.3rem;">
                <a href="property.html?id=${b.propertyId}">${b.propertyTitle}</a>
              </h3>
              ${statusBadge}
            </div>
            <p style="color: var(--color-gray-dark); font-size: 0.9rem; margin-top: 2px;">📍 ${b.propertyLocation}</p>
            <p style="font-size: 0.92rem; margin-top: 6px;"><strong>Dates:</strong> ${formatDate(checkinStr)} → ${formatDate(checkoutStr)} (${b.nights} night${b.nights > 1 ? 's' : ''})</p>
            <p style="font-size: 0.92rem;"><strong>Guests:</strong> ${b.guests} | <strong>Guest Name:</strong> ${b.guestName || 'Guest'}</p>
            <p style="font-size: 1.1rem; font-weight: 800; margin-top: 8px;">${formatPrice(total)}</p>
            <p style="font-size: 0.8rem; color: var(--color-gray-mid); margin-top: 2px;">Booking Reference: ${bId}</p>
            
            <div class="flex" style="gap: 10px; margin-top: 1rem; flex-wrap: wrap;">
              <a href="https://wa.me/917042341195?text=${whatsappText}" target="_blank" class="btn btn-whatsapp btn-small">
                💬 WhatsApp Host
              </a>
              <a href="property.html?id=${b.propertyId}" class="btn btn-outline btn-small">
                View Property
              </a>
              ${b.status !== 'cancelled' ? `
                <button class="btn btn-small cancel-booking-btn" data-id="${bId}" style="color: #dc2626; border: 1px solid #dc2626;">
                  Cancel Booking
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach cancel booking listeners
    document.querySelectorAll('.cancel-booking-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idToCancel = e.target.dataset.id;
        if (confirm('Are you sure you want to cancel this booking?')) {
          const allBookings = getBookings();
          const target = allBookings.find(item => (item.id === idToCancel || item.bookingId === idToCancel));
          if (target) {
            target.status = 'cancelled';
            localStorage.setItem('bookings', JSON.stringify(allBookings));
            showToast('Booking cancelled', 'info');
            renderTrips(category);
          }
        }
      });
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      renderTrips(e.target.dataset.tab);
    });
  });

  renderTrips('upcoming');
});

