const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

export function isEmailConfigured() {
  return EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' &&
         EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID' &&
         EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID';
}

export function loadEmailJS() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load EmailJS SDK'));
    document.head.appendChild(script);
  });
}

export async function sendBookingEmail(bookingData) {
  if (!isEmailConfigured()) {
    return { success: false, message: 'EmailJS not configured' };
  }

  try {
    await loadEmailJS();
    emailjs.init(EMAILJS_PUBLIC_KEY);

    const templateParams = {
      booking_id: bookingData.id,
      guest_name: bookingData.guestName,
      guest_email: bookingData.guestEmail,
      guest_phone: bookingData.guestPhone,
      property_title: bookingData.propertyTitle,
      property_location: bookingData.propertyLocation,
      checkin_date: bookingData.checkIn,
      checkout_date: bookingData.checkOut,
      guests: bookingData.guests,
      num_nights: bookingData.nights,
      price_per_night: bookingData.pricePerNight,
      cleaning_fee: bookingData.cleaningFee,
      service_fee: bookingData.serviceFee,
      taxes: bookingData.taxes,
      total_amount: bookingData.totalPrice,
      booking_date: bookingData.bookingDate || bookingData.createdAt
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    if (response.status === 200) {
      return { success: true };
    } else {
      return { success: false, message: 'Email failed to send' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'An error occurred while sending email' };
  }
}
