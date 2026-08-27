// js/data.js
// DevNest Stays - official single-location property registry

export const contactDetails = {
  brand: 'DevNest Stays',
  phone: '+91 7042341195',
  phoneDisplay: '+91 7042341195',
  email: 'Devneststays@gmail.com',
  instagram: 'https://www.instagram.com/devnest.stays?igsi=N2Y5NGR2M3k5bTlk&utm_source=qr',
  instagramDisplay: '@devnest.stays',
  mapsUrl: 'https://share.google/8AvyayTe03vYw3nqk',
  locationLabel: 'DevNest Stays, Delhi NCR'
};

export const properties = [
  {
    id: 'prop01',
    title: 'DevNest 1RK Studio',
    tagline: 'Compact private studio with a clean work-ready setup',
    location: contactDetails.locationLabel,
    country: 'India',
    price: 2200,
    rating: 4.96,
    reviewCount: 142,
    images: [
      'photos-videos/2200/WhatsApp Image 2026-08-26 at 10.49.55 PM.jpeg',
      'photos-videos/2200/WhatsApp Image 2026-08-26 at 10.49.55 PM (1).jpeg',
      'photos-videos/2200/WhatsApp Image 2026-08-26 at 10.49.56 PM.jpeg',
      'photos-videos/2200/WhatsApp Image 2026-08-26 at 10.49.56 PM (1).jpeg',
      'photos-videos/2200/WhatsApp Image 2026-08-26 at 10.49.56 PM (2).jpeg',
      'photos-videos/2200/WhatsApp Image 2026-08-26 at 10.49.57 PM.jpeg',
      'photos-videos/2200/WhatsApp Image 2026-08-26 at 10.49.57 PM (1).jpeg',
      'photos-videos/2200/WhatsApp Image 2026-08-26 at 10.49.57 PM (2).jpeg'
    ],
    videos: [
      'https://res.cloudinary.com/dhqkxejav/video/upload/v1787855895/video_20260828_000527_p8qt5f.mp4'
    ],
    description: 'A private 1RK studio at the DevNest Stays location, prepared for short stays, work trips, and comfortable city breaks. The studio includes a bedroom-style sleeping area, kitchenette, air conditioning, Wi-Fi, a clean washroom, and direct host support for check-in and booking questions.',
    propertyType: 'Studio',
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ['High-Speed WiFi', 'Air Conditioning', 'Kitchenette', 'Smart TV', 'Dedicated Workspace', 'Refrigerator', 'Hot Water', 'Housekeeping on Request', 'Direct Host Support', 'Google Maps Location'],
    host: {
      name: 'DevNest Stays',
      avatar: 'photos-videos/2200/WhatsApp Image 2026-08-26 at 10.49.57 PM (1).jpeg',
      phone: contactDetails.phone,
      email: contactDetails.email,
      superhost: true
    },
    mapsUrl: contactDetails.mapsUrl,
    featured: true,
    availableDates: []
  },
  {
    id: 'prop02',
    title: 'DevNest 1BHK Apartment',
    tagline: 'Spacious apartment option at the same DevNest location',
    location: contactDetails.locationLabel,
    country: 'India',
    price: 2600,
    priceNote: '₹2,600-₹2,800 / night',
    rating: 4.94,
    reviewCount: 98,
    images: [
      'photos-videos/2600/WhatsApp Image 2026-08-26 at 10.50.19 PM.jpeg',
      'photos-videos/2600/WhatsApp Image 2026-08-26 at 10.50.19 PM (1).jpeg',
      'photos-videos/2600/WhatsApp Image 2026-08-26 at 10.50.19 PM (2).jpeg',
      'photos-videos/2600/WhatsApp Image 2026-08-26 at 10.50.20 PM.jpeg',
      'photos-videos/2600/WhatsApp Image 2026-08-26 at 10.50.20 PM (1).jpeg',
      'photos-videos/2600/WhatsApp Image 2026-08-26 at 10.50.20 PM (2).jpeg',
      'photos-videos/2600/WhatsApp Image 2026-08-26 at 10.50.20 PM (3).jpeg',
      'photos-videos/2600/WhatsApp Image 2026-08-26 at 10.50.21 PM.jpeg',
      'photos-videos/2600/WhatsApp Image 2026-08-26 at 10.50.21 PM (1).jpeg',
      'photos-videos/2600/WhatsApp Image 2026-08-26 at 10.50.21 PM (2).jpeg',
      'photos-videos/2600/WhatsApp Image 2026-08-26 at 10.50.21 PM (3).jpeg',
      'photos-videos/2600/WhatsApp Image 2026-08-26 at 10.50.22 PM.jpeg'
    ],
    videos: [
      'https://res.cloudinary.com/dhqkxejav/video/upload/v1787855895/video_20260828_000527_p8qt5f.mp4'
    ],
    description: 'A larger 1BHK stay at the same DevNest Stays location, suited for guests who want a separate bedroom, living area, kitchen convenience, and a little extra room to settle in. Nightly pricing usually ranges from ₹2,600 to ₹2,800 depending on dates and availability.',
    propertyType: 'Apartment',
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    guests: 4,
    amenities: ['High-Speed WiFi', 'Air Conditioning', 'Full Kitchen', 'Smart TV', 'Living Area', 'Refrigerator', 'Hot Water', 'Housekeeping on Request', 'Direct Host Support', 'Google Maps Location'],
    host: {
      name: 'DevNest Stays',
      avatar: 'photos-videos/2600/WhatsApp Image 2026-08-26 at 10.50.21 PM (1).jpeg',
      phone: contactDetails.phone,
      email: contactDetails.email,
      superhost: true
    },
    mapsUrl: contactDetails.mapsUrl,
    featured: true,
    availableDates: []
  }
];

export function getAllProperties() {
  const base = [...properties];
  try {
    const hostProps = JSON.parse(localStorage.getItem('hostProperties') || '[]');
    const publishedHost = hostProps.filter(p => p.published !== false);
    // Add host properties that aren't already in the base set
    publishedHost.forEach(hp => {
      if (!base.find(bp => bp.id === hp.id)) {
        base.push(hp);
      }
    });
  } catch (e) {
    // Ignore localStorage errors
  }
  return base;
}





