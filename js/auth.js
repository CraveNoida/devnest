import { showToast, initNavigation } from './app.js';

export function signup(name, email, password) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  
  if (users.find(u => u.email === email)) {
    throw new Error('Email already exists');
  }
  
  const newUser = {
    name,
    email,
    password,
    phone: '',
    joinDate: new Date().toISOString()
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  const currentUser = { ...newUser };
  delete currentUser.password;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  return currentUser;
}

export function login(email, password) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  const currentUser = { ...user };
  delete currentUser.password;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  return currentUser;
}

export function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Login Page Logic
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const emailInput = document.getElementById('loginEmail');
      const passwordInput = document.getElementById('loginPassword');
      const emailError = document.getElementById('loginEmailError');
      const passwordError = document.getElementById('loginPasswordError');
      const generalError = document.getElementById('loginGeneralError');
      
      // Reset errors
      emailInput.classList.remove('error');
      passwordInput.classList.remove('error');
      emailError.classList.remove('visible');
      passwordError.classList.remove('visible');
      generalError.classList.remove('visible');
      
      let isValid = true;
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      
      if (!email || !emailRegex.test(email)) {
        emailInput.classList.add('error');
        emailError.textContent = 'Please enter a valid email address.';
        emailError.classList.add('visible');
        isValid = false;
      }
      
      if (!password) {
        passwordInput.classList.add('error');
        passwordError.textContent = 'Please enter your password.';
        passwordError.classList.add('visible');
        isValid = false;
      }
      
      if (isValid) {
        try {
          login(email, password);
          showToast('Welcome back!', 'success');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 500);
        } catch (error) {
          generalError.textContent = error.message;
          generalError.classList.add('visible');
        }
      }
    });
  }
  
  // Signup Page Logic
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('signupName');
      const emailInput = document.getElementById('signupEmail');
      const passwordInput = document.getElementById('signupPassword');
      const confirmInput = document.getElementById('signupConfirm');
      
      const nameError = document.getElementById('signupNameError');
      const emailError = document.getElementById('signupEmailError');
      const passwordError = document.getElementById('signupPasswordError');
      const confirmError = document.getElementById('signupConfirmError');
      const generalError = document.getElementById('signupGeneralError');
      
      // Reset errors
      [nameInput, emailInput, passwordInput, confirmInput].forEach(i => i?.classList.remove('error'));
      [nameError, emailError, passwordError, confirmError, generalError].forEach(e => e?.classList.remove('visible'));
      
      let isValid = true;
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const confirm = confirmInput.value;
      
      if (!name || name.length < 2) {
        nameInput.classList.add('error');
        nameError.textContent = 'Please enter your full name (at least 2 characters).';
        nameError.classList.add('visible');
        isValid = false;
      }
      
      if (!email || !emailRegex.test(email)) {
        emailInput.classList.add('error');
        emailError.textContent = 'Please enter a valid email address.';
        emailError.classList.add('visible');
        isValid = false;
      }
      
      if (!password || password.length < 6) {
        passwordInput.classList.add('error');
        passwordError.textContent = 'Password must be at least 6 characters.';
        passwordError.classList.add('visible');
        isValid = false;
      }
      
      if (password !== confirm) {
        confirmInput.classList.add('error');
        confirmError.textContent = 'Passwords do not match.';
        confirmError.classList.add('visible');
        isValid = false;
      }
      
      if (isValid) {
        try {
          signup(name, email, password);
          showToast('Account created!', 'success');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 500);
        } catch (error) {
          generalError.textContent = error.message;
          generalError.classList.add('visible');
        }
      }
    });
  }
  
  // Handle Logout clicks
  const navLogout = document.getElementById('navLogout');
  if (navLogout) {
    navLogout.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
  
  document.querySelectorAll('.mobile-nav-logout').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  });
});
