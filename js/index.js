import { renderPropertyCard, formatPrice, generateBookingId, saveBooking, showToast, initScrollReveal } from './app.js';
import { getAllProperties } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  const properties = getAllProperties();
  const propertyGrid = document.getElementById('propertyGrid');
  const homeSearchForm = document.getElementById('homeSearchForm');
  const trendingTags = document.querySelectorAll('.trending-tag');
  const bookingForm = document.getElementById('homeBookingForm');
  const bookingRoom = document.getElementById('homeBookingRoom');
  const checkinInput = document.getElementById('homeCheckin');
  const checkoutInput = document.getElementById('homeCheckout');
  const guestsInput = document.getElementById('homeGuests');
  const estimateEl = document.getElementById('homeBookingEstimate');
  const messageEl = document.getElementById('homeBookingMessage');

  const getSelectedProperty = () => {
    return properties.find(property => property.id === bookingRoom?.value) || properties[0];
  };

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(`${dateStr}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const calculateNights = () => {
    const checkin = parseLocalDate(checkinInput?.value);
    const checkout = parseLocalDate(checkoutInput?.value);
    if (!checkin || !checkout || checkout <= checkin) return 0;
    return Math.round((checkout - checkin) / (1000 * 60 * 60 * 24));
  };

  const formatDisplayDate = (dateStr) => {
    const date = parseLocalDate(dateStr);
    if (!date) return dateStr;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);

  const updateEstimate = () => {
    if (!estimateEl) return;
    const property = getSelectedProperty();
    const nights = calculateNights();
    const guests = Math.max(1, Number(guestsInput?.value) || 1);

    if (!nights) {
      estimateEl.textContent = 'Select valid check-in and check-out dates to see your estimated total.';
      return;
    }

    const extraGuestFee = Math.max(0, guests - 1) * 500;
    const guestSurcharge = extraGuestFee * nights;
    const nightlyTotal = (property.price * nights) + guestSurcharge;
    const cleaningFee = Math.round(property.price * 0.05);
    const taxes = Math.round(nightlyTotal * 0.12);
    const total = nightlyTotal + cleaningFee + taxes;
    const surchargeLabel = guestSurcharge ? ` · Extra guest fee ${formatPrice(guestSurcharge)}` : '';
    estimateEl.textContent = `${property.title} · ${nights} night${nights > 1 ? 's' : ''} · ${guests} guest${guests > 1 ? 's' : ''}${surchargeLabel} · Estimated total ${formatPrice(total)}`;
  };

  // Render initial handpicked stays. HTML fallbacks remain available if JS is blocked.
  if (propertyGrid) {
    propertyGrid.innerHTML = properties.slice(0, 6).map(p => renderPropertyCard(p)).join('');
    initScrollReveal();
  }

  document.querySelectorAll('.room-book-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (bookingRoom && btn.dataset.room) {
        bookingRoom.value = btn.dataset.room;
        updateEstimate();
      }
    });
  });

  [bookingRoom, checkinInput, checkoutInput, guestsInput].forEach(input => {
    input?.addEventListener('input', updateEstimate);
    input?.addEventListener('change', updateEstimate);
  });

  if (checkinInput && checkoutInput) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    checkinInput.min = todayStr;
    checkoutInput.min = todayStr;
    checkinInput.addEventListener('change', () => {
      checkoutInput.min = checkinInput.value || todayStr;
      if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
        checkoutInput.value = '';
      }
      updateEstimate();
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const property = getSelectedProperty();
      const nights = calculateNights();
      const guests = Math.max(1, Number(guestsInput.value) || 1);
      const guestName = document.getElementById('homeGuestName').value.trim();
      const guestPhone = document.getElementById('homeGuestPhone').value.trim();
      const guestEmail = document.getElementById('homeGuestEmail').value.trim();
      const notes = document.getElementById('homeGuestNotes').value.trim();

      if (!guestName || guestName.length < 2) {
        messageEl.textContent = 'Please enter your full name.';
        return;
      }

      if (!guestPhone || guestPhone.replace(/\D/g, '').length < 10) {
        messageEl.textContent = 'Please enter a valid phone or WhatsApp number.';
        return;
      }

      if (!guestEmail || !guestEmail.includes('@')) {
        messageEl.textContent = 'Please enter a valid email address.';
        return;
      }

      if (!nights) {
        messageEl.textContent = 'Please choose a check-out date after your check-in date.';
        return;
      }

      const extraGuestFee = Math.max(0, guests - 1) * 500;
      const guestSurcharge = extraGuestFee * nights;
      const nightlyTotal = (property.price * nights) + guestSurcharge;
      const cleaningFee = Math.round(property.price * 0.05);
      const serviceFee = 0;
      const taxes = Math.round(nightlyTotal * 0.12);
      const totalPrice = nightlyTotal + cleaningFee + serviceFee + taxes;
      const bookingId = generateBookingId();
      const booking = {
        id: bookingId,
        bookingId,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyLocation: property.location,
        propertyImage: property.images?.[0] || '',
        checkIn: checkinInput.value,
        checkOut: checkoutInput.value,
        checkInDate: checkinInput.value,
        checkOutDate: checkoutInput.value,
        guests,
        nights,
        guestName,
        guestPhone,
        guestEmail,
        specialRequests: notes,
        pricePerNight: property.price + extraGuestFee,
        basePricePerNight: property.price,
        extraGuestFeePerNight: extraGuestFee,
        guestSurcharge,
        cleaningFee,
        serviceFee,
        taxes,
        totalPrice,
        total: totalPrice,
        status: 'upcoming',
        bookingDate: new Date().toISOString()
      };

      saveBooking(booking);
      showToast('Booking saved. Check My Bookings anytime.', 'success');

      const whatsappText = [
        'Hi DevNest Stays, I requested a booking from the website.',
        `Booking ID: ${bookingId}`,
        `Stay: ${property.title}`,
        `Check-in: ${formatDisplayDate(checkinInput.value)}`,
        `Check-out: ${formatDisplayDate(checkoutInput.value)}`,
        `Guests: ${guests}`,
        `Total: ${formatPrice(totalPrice)}`,
        `Name: ${guestName}`,
        `Phone: ${guestPhone}`,
        notes ? `Notes: ${notes}` : ''
      ].filter(Boolean).join('\n');

      messageEl.innerHTML = `
        <strong>Booking saved: ${escapeHtml(bookingId)}</strong>
        <span>${escapeHtml(property.title)} for ${escapeHtml(guestName)} · ${escapeHtml(formatPrice(totalPrice))}</span>
        <a class="btn btn-whatsapp btn-small" href="https://wa.me/917042341195?text=${encodeURIComponent(whatsappText)}" target="_blank">Send to Host on WhatsApp</a>
        <a class="section-link" href="trips.html">View My Bookings</a>
      `;
      bookingForm.reset();
      if (bookingRoom) bookingRoom.value = property.id;
      updateEstimate();
    });
  }

  // Handle Hero Search Form Submission
  if (homeSearchForm) {
    homeSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const location = document.getElementById('searchLocation').value.trim();
      const checkin = document.getElementById('searchCheckin').value;
      const checkout = document.getElementById('searchCheckout').value;
      const guests = document.getElementById('searchGuests').value;

      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (checkin) params.append('checkin', checkin);
      if (checkout) params.append('checkout', checkout);
      if (guests) params.append('guests', guests);

      window.location.href = `search.html?${params.toString()}`;
    });
  }

  // Handle Trending Tag Clicks
  trendingTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const loc = tag.dataset.loc || tag.textContent.trim();
      const locationInput = document.getElementById('searchLocation');
      if (locationInput) {
        locationInput.value = loc;
        homeSearchForm.dispatchEvent(new Event('submit'));
      }
    });
  });

  // Legacy marketplace filters are intentionally absent on the refreshed homepage.
});



