import { getCurrentUser, isLoggedIn, showToast, initNavigation } from './app.js';
import { logout } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  
  const profilePage = document.getElementById('profilePage');
  if (!profilePage) return;

  if (!isLoggedIn()) {
    profilePage.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem;">
        <h2>Please log in to view your profile</h2>
        <a href="login.html" class="btn btn-primary" style="margin-top: 1rem; display: inline-block;">Log In</a>
      </div>
    `;
    return;
  }

  const user = getCurrentUser();
  const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
  const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  
  // Filter for this user's stats if needed, or just total array length
  const bookingsCount = bookings.length;
  const wishlistCount = wishlist.length;

  profilePage.innerHTML = `
    <div class="profile-layout" style="display: grid; grid-template-columns: 300px 1fr; gap: 3rem; margin-top: 2rem; margin-bottom: 4rem;">
      
      <div class="profile-sidebar" style="background: var(--light-gray, #f7f7f7); padding: 2rem; border-radius: 12px; text-align: center;">
        <div class="profile-avatar-large" style="width: 100px; height: 100px; background: #000; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: bold; margin: 0 auto 1rem;">
          ${user.name.charAt(0).toUpperCase()}
        </div>
        <h3 class="profile-name" style="margin-bottom: 0.5rem;">${user.name}</h3>
        <p class="profile-email" style="color: #666; margin-bottom: 2rem;">${user.email}</p>
        
        <div class="profile-quick-links" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; text-align: left;">
          <a href="wishlist.html" style="text-decoration: none; color: inherit; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">❤ My Wishlist</a>
          <a href="trips.html" style="text-decoration: none; color: inherit; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">🧳 My Trips</a>
          <a href="host.html" style="text-decoration: none; color: inherit; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">🏠 Host Dashboard</a>
        </div>
        
        <button id="profileLogoutBtn" class="btn btn-outline" style="width: 100%;">Logout</button>
      </div>

      <div class="profile-content">
        <h2 style="margin-bottom: 1.5rem;">Account Settings</h2>
        
        <form id="profileForm" novalidate style="max-width: 500px;">
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label class="form-label" for="profileName">Name</label>
            <input class="form-input" type="text" id="profileName" value="${user.name}" required>
          </div>
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label class="form-label" for="profileEmail">Email</label>
            <input class="form-input" type="email" id="profileEmail" value="${user.email}" readonly title="Email cannot be changed" style="background-color: #f0f0f0; cursor: not-allowed;">
            <small style="color: #666; display: block; margin-top: 0.25rem;">Email cannot be changed</small>
          </div>
          <div class="form-group" style="margin-bottom: 2rem;">
            <label class="form-label" for="profilePhone">Phone</label>
            <input class="form-input" type="tel" id="profilePhone" value="${user.phone || ''}">
          </div>
          
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>

        <h2 style="margin-top: 3rem; margin-bottom: 1.5rem;">Account Statistics</h2>
        <div class="profile-stats" style="display: flex; gap: 2rem; background: #f7f7f7; padding: 1.5rem; border-radius: 12px;">
          <div>
            <span style="font-size: 2rem; font-weight: bold; display: block; color: #000;">${bookingsCount}</span>
            <span style="color: #666;">Bookings</span>
          </div>
          <div>
            <span style="font-size: 2rem; font-weight: bold; display: block; color: #000;">${wishlistCount}</span>
            <span style="color: #666;">Wishlist Items</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  const profileLogoutBtn = document.getElementById('profileLogoutBtn');
  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener('click', () => {
      logout();
    });
  }

  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newName = document.getElementById('profileName').value.trim();
      const newPhone = document.getElementById('profilePhone').value.trim();
      
      if (!newName) {
        showToast('Name is required', 'error');
        return;
      }
      
      // Update in users array
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const userIndex = users.findIndex(u => u.email === user.email);
      
      if (userIndex !== -1) {
        users[userIndex].name = newName;
        users[userIndex].phone = newPhone;
        localStorage.setItem('users', JSON.stringify(users));
      }
      
      // Update in currentUser
      user.name = newName;
      user.phone = newPhone;
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Update UI
      const nameDisplays = document.querySelectorAll('.profile-name');
      nameDisplays.forEach(el => el.textContent = newName);
      
      const avatarDisplays = document.querySelectorAll('.profile-avatar-large');
      avatarDisplays.forEach(el => el.textContent = newName.charAt(0).toUpperCase());
      
      showToast('Profile updated', 'success');
    });
  }
});
