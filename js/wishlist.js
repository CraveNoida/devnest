import { getWishlist, getPropertyById, renderPropertyCard, initScrollReveal } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  const wishlistGrid = document.getElementById('wishlistGrid');
  if (!wishlistGrid) return;

  function renderWishlist() {
    const wishlistIds = getWishlist();
    const wishlistProps = wishlistIds.map(id => getPropertyById(id)).filter(p => p !== null);

    if (wishlistProps.length === 0) {
      wishlistGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">❤️</div>
          <h2>Your Wishlist is Empty</h2>
          <p>Tap the heart icon on any stay to save your favorite luxury studios, apartments, or villas here.</p>
          <a href="search.html" class="btn btn-primary" style="margin-top: 1.25rem; display: inline-block;">Browse Available Stays</a>
        </div>
      `;
      return;
    }

    wishlistGrid.innerHTML = wishlistProps.map(prop => renderPropertyCard(prop)).join('');
    initScrollReveal();
  }

  renderWishlist();

  wishlistGrid.addEventListener('click', (e) => {
    if (e.target.closest('.wishlist-btn')) {
      setTimeout(renderWishlist, 150);
    }
  });
});
