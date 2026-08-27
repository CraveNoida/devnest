// js/host.js
// DevNest Stays - Host Dashboard Controller

import { formatPrice, showToast } from './app.js';
import { properties } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  const hostPropertiesGrid = document.getElementById('hostPropertiesGrid');
  const addPropertyBtn = document.getElementById('addPropertyBtn');
  const addPropertyHeaderBtn = document.getElementById('addPropertyHeaderBtn');
  const propertyModal = document.getElementById('propertyModal');
  const modalClose = document.getElementById('modalClose');
  const propertyForm = document.getElementById('propertyForm');
  const modalTitle = document.getElementById('modalTitle');
  const propertySubmitBtn = document.getElementById('propertySubmitBtn');

  let hostProperties = JSON.parse(localStorage.getItem('hostProperties') || '[]');
  let editingId = null;

  // If no host properties exist in localStorage yet, initialize with the top DevNest signature stays
  if (hostProperties.length === 0) {
    hostProperties = properties.slice(0, 2).map(p => ({
      ...p,
      published: true
    }));
    localStorage.setItem('hostProperties', JSON.stringify(hostProperties));
  }

  function saveProperties() {
    localStorage.setItem('hostProperties', JSON.stringify(hostProperties));
  }

  function renderHostProperties() {
    if (hostProperties.length === 0) {
      hostPropertiesGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🏢</div>
          <h2>No properties listed yet</h2>
          <p>Click "List New Property" above to add your first studio, apartment, or villa.</p>
        </div>
      `;
      return;
    }

    hostPropertiesGrid.innerHTML = hostProperties.map(p => {
      const img = (p.images && p.images.length > 0 && p.images[0]) 
        ? p.images[0] 
        : 'photos-videos/2600/WhatsApp Image 2026-08-26 at 10.50.20 PM.jpeg';
      const statusText = p.published !== false ? 'Published' : 'Draft';
      const toggleText = p.published !== false ? 'Unpublish' : 'Publish';

      return `
        <div class="card" data-id="${p.id}">
          <div class="card-img-wrap" style="height: 200px;">
            <img src="${img}" alt="${p.title}" class="card-img" loading="lazy">
            <span class="superhost-badge">${statusText}</span>
          </div>
          <div class="card-body">
            <h3 class="card-title">${p.title}</h3>
            <p class="card-location">${p.location} · ${p.propertyType}</p>
            <p class="card-price"><strong>${formatPrice(p.price)}</strong> / night</p>
            
            <div class="flex" style="gap: 8px; margin-top: 1rem;">
              <button class="btn btn-outline btn-small edit-btn" style="flex: 1;" data-id="${p.id}">Edit</button>
              <button class="btn btn-outline btn-small toggle-btn" style="flex: 1;" data-id="${p.id}">${toggleText}</button>
              <button class="btn btn-danger btn-small delete-btn" data-id="${p.id}">✕</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderHostProperties();

  function openAddModal() {
    editingId = null;
    propertyForm.reset();
    modalTitle.textContent = 'List a New Property';
    propertySubmitBtn.textContent = 'Save Property Listing';
    propertyModal.classList.remove('hidden');
    document.querySelectorAll('.form-error').forEach(e => e.classList.remove('visible'));
  }

  addPropertyBtn?.addEventListener('click', openAddModal);
  addPropertyHeaderBtn?.addEventListener('click', openAddModal);

  modalClose?.addEventListener('click', () => {
    propertyModal.classList.add('hidden');
  });

  propertyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('visible'));
    
    const title = document.getElementById('propTitle').value.trim();
    const location = document.getElementById('propLocation').value.trim();
    const desc = document.getElementById('propDescription').value.trim();
    const price = parseInt(document.getElementById('propPrice').value, 10);
    
    let isValid = true;
    if (!title) { document.getElementById('propTitleError').classList.add('visible'); isValid = false; }
    if (!location) { document.getElementById('propLocationError').classList.add('visible'); isValid = false; }
    if (!desc) { document.getElementById('propDescError').classList.add('visible'); isValid = false; }
    if (isNaN(price) || price < 500) { document.getElementById('propPriceError').classList.add('visible'); isValid = false; }
    
    if (!isValid) return;

    const imagesInput = document.getElementById('propImages').value.trim();
    const images = imagesInput ? imagesInput.split(',').map(s => s.trim()) : ['photos-videos/2200/WhatsApp Image 2026-08-26 at 10.49.55 PM.jpeg'];
    
    const amenitiesInput = document.getElementById('propAmenities').value.trim();
    const amenities = amenitiesInput ? amenitiesInput.split(',').map(s => s.trim()) : ['High-Speed WiFi', 'Air Conditioning', 'Kitchenette'];

    const propData = {
      title,
      location,
      country: 'India',
      price,
      description: desc,
      propertyType: document.getElementById('propType').value,
      bedrooms: parseInt(document.getElementById('propBedrooms').value, 10) || 1,
      beds: parseInt(document.getElementById('propBeds').value, 10) || 1,
      bathrooms: parseInt(document.getElementById('propBathrooms').value, 10) || 1,
      guests: parseInt(document.getElementById('propGuests').value, 10) || 2,
      amenities,
      images,
      host: { 
        name: 'DevNest Host', 
        avatar: 'photos-videos/2200/WhatsApp Image 2026-08-26 at 10.49.57 PM (1).jpeg',
        phone: '+91 7042341195',
        email: 'Devneststays@gmail.com'
      },
      latitude: 28.6139,
      longitude: 77.2090,
      published: true
    };

    if (editingId) {
      const idx = hostProperties.findIndex(p => p.id === editingId);
      if (idx !== -1) {
        hostProperties[idx] = { ...hostProperties[idx], ...propData };
        showToast('Property updated successfully!', 'success');
      }
    } else {
      propData.id = 'prop_' + Date.now();
      propData.rating = 5.0;
      propData.reviewCount = 1;
      hostProperties.unshift(propData);
      showToast('New property published!', 'success');
    }

    saveProperties();
    renderHostProperties();
    propertyModal.classList.add('hidden');
  });

  hostPropertiesGrid.addEventListener('click', (e) => {
    const id = e.target.dataset.id || e.target.closest('button')?.dataset.id;
    if (!id) return;

    if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
      if (confirm('Are you sure you want to delete this listing?')) {
        hostProperties = hostProperties.filter(p => p.id !== id);
        saveProperties();
        renderHostProperties();
        showToast('Property removed', 'info');
      }
    } else if (e.target.classList.contains('toggle-btn') || e.target.closest('.toggle-btn')) {
      const prop = hostProperties.find(p => p.id === id);
      if (prop) {
        prop.published = (prop.published === false) ? true : false;
        saveProperties();
        renderHostProperties();
        showToast(`Listing ${prop.published ? 'published' : 'unpublished'}`, 'success');
      }
    } else if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
      const prop = hostProperties.find(p => p.id === id);
      if (prop) {
        editingId = id;
        document.getElementById('propTitle').value = prop.title;
        document.getElementById('propLocation').value = prop.location;
        document.getElementById('propDescription').value = prop.description;
        document.getElementById('propPrice').value = prop.price;
        document.getElementById('propType').value = prop.propertyType;
        document.getElementById('propBedrooms').value = prop.bedrooms || 1;
        document.getElementById('propBeds').value = prop.beds || 1;
        document.getElementById('propBathrooms').value = prop.bathrooms || 1;
        document.getElementById('propGuests').value = prop.guests || 2;
        document.getElementById('propAmenities').value = (prop.amenities || []).join(', ');
        document.getElementById('propImages').value = (prop.images || []).join(', ');
        
        modalTitle.textContent = 'Edit Property Listing';
        propertySubmitBtn.textContent = 'Save Changes';
        document.querySelectorAll('.form-error').forEach(el => el.classList.remove('visible'));
        propertyModal.classList.remove('hidden');
      }
    }
  });
});

