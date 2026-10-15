/**
 * Athenaeum Central Library
 * Authentication Controller: Login, Registration, Password Toggle, Demo Switcher & Route Guard
 */

(function () {
  'use strict';

  // DOM Elements - Login
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginRoleTabs = document.querySelectorAll('.js-role-tab');
  const togglePasswordBtns = document.querySelectorAll('.js-toggle-password');
  const fillMemberDemoBtn = document.getElementById('fillMemberDemoBtn');
  const fillAdminDemoBtn = document.getElementById('fillAdminDemoBtn');

  // DOM Elements - Register
  const registerForm = document.getElementById('registerForm');
  const regName = document.getElementById('regName');
  const regEmail = document.getElementById('regEmail');
  const regPhone = document.getElementById('regPhone');
  const regPassword = document.getElementById('regPassword');
  const regConfirmPassword = document.getElementById('regConfirmPassword');
  const passwordStrengthMeter = document.getElementById('passwordStrengthMeter');
  const passwordStrengthLabel = document.getElementById('passwordStrengthLabel');

  let activeLoginRole = 'member'; // 'member' or 'admin'

  function init() {
    bindRoleTabs();
    bindPasswordToggles();
    bindDemoFillers();
    bindLoginForm();
    bindRegisterForm();
    bindForgotPasswordModal();
  }

  /* -------------------------------------------------------------
   * ROLE SELECTION TABS
   * -----------------------------------------------------------*/
  function bindRoleTabs() {
    if (!loginRoleTabs.length) return;
    loginRoleTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        loginRoleTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeLoginRole = tab.getAttribute('data-role');

        const roleTitle = document.getElementById('loginRoleTitle');
        if (roleTitle) {
          roleTitle.textContent = activeLoginRole === 'admin' ? 'Administrator Portal' : 'Member Sign In';
        }
      });
    });
  }

  /* -------------------------------------------------------------
   * PASSWORD VISIBILITY TOGGLE
   * -----------------------------------------------------------*/
  function bindPasswordToggles() {
    togglePasswordBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (!input) return;

        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        
        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) {
          icon.textContent = isPassword ? 'visibility_off' : 'visibility';
        }
      });
    });
  }

  /* -------------------------------------------------------------
   * ONE-CLICK DEMO ACCOUNT FILLERS
   * -----------------------------------------------------------*/
  function bindDemoFillers() {
    if (fillMemberDemoBtn) {
      fillMemberDemoBtn.addEventListener('click', () => {
        if (loginEmail) loginEmail.value = 'elena.rostova@athenaeum.lib';
        if (loginPassword) loginPassword.value = 'password123';
        // Select member tab
        const memberTab = document.querySelector('.js-role-tab[data-role="member"]');
        if (memberTab) memberTab.click();
        if (window.showToast) window.showToast('Elena Rostova (Member) credentials loaded.', 'info');
      });
    }

    if (fillAdminDemoBtn) {
      fillAdminDemoBtn.addEventListener('click', () => {
        if (loginEmail) loginEmail.value = 'admin@athenaeum.lib';
        if (loginPassword) loginPassword.value = 'password123';
        // Select admin tab
        const adminTab = document.querySelector('.js-role-tab[data-role="admin"]');
        if (adminTab) adminTab.click();
        if (window.showToast) window.showToast('Dr. Julian Sterling (Administrator) credentials loaded.', 'info');
      });
    }
  }

  /* -------------------------------------------------------------
   * LOGIN SUBMISSION & VALIDATION
   * -----------------------------------------------------------*/
  function bindLoginForm() {
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearFormErrors(loginForm);

      const email = loginEmail.value.trim();
      const password = loginPassword.value;
      let hasError = false;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        showFieldError(loginEmail, 'Email address is required.');
        hasError = true;
      } else if (!emailRegex.test(email)) {
        showFieldError(loginEmail, 'Please enter a valid email address.');
        hasError = true;
      }

      // Validate password
      if (!password) {
        showFieldError(loginPassword, 'Password is required.');
        hasError = true;
      }

      if (hasError) return;

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Sign In';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span>
          Authenticating...
        `;
      }

      setTimeout(() => {
        const result = window.LibraryDB.login(email, password, activeLoginRole);

        if (!result.success) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
          const errorAlert = document.getElementById('loginErrorAlert');
          if (errorAlert) {
            errorAlert.textContent = result.message;
            errorAlert.style.display = 'block';
          }
          if (window.showToast) window.showToast(result.message, 'error');
        } else {
          if (window.showToast) window.showToast(`Welcome back, ${result.user.name}!`, 'success');
          
          // Check query redirect
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect');

          setTimeout(() => {
            if (redirect && !redirect.includes('login') && !redirect.includes('register')) {
              window.location.href = redirect;
            } else if (result.user.role === 'admin') {
              window.location.href = 'admin-dashboard.html';
            } else {
              window.location.href = 'user-dashboard.html';
            }
          }, 800);
        }
      }, 500);
    });
  }

  /* -------------------------------------------------------------
   * REGISTRATION SUBMISSION & REAL-TIME STRENGTH METER
   * -----------------------------------------------------------*/
  function bindRegisterForm() {
    if (!registerForm) return;

    if (regPassword && passwordStrengthMeter && passwordStrengthLabel) {
      regPassword.addEventListener('input', () => {
        const val = regPassword.value;
        const strength = calculatePasswordStrength(val);
        
        passwordStrengthMeter.style.width = strength.pct + '%';
        passwordStrengthMeter.style.backgroundColor = strength.color;
        passwordStrengthLabel.textContent = strength.label;
        passwordStrengthLabel.style.color = strength.color;
      });
    }

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearFormErrors(registerForm);

      const name = regName ? regName.value.trim() : '';
      const email = regEmail ? regEmail.value.trim() : '';
      const phone = regPhone ? regPhone.value.trim() : '';
      const password = regPassword ? regPassword.value : '';
      const confirmPassword = regConfirmPassword ? regConfirmPassword.value : '';
      const termsAccepted = document.getElementById('termsAcceptCheckbox');

      let hasError = false;

      if (!name || name.length < 2) {
        showFieldError(regName, 'Please enter your full legal name.');
        hasError = true;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showFieldError(regEmail, 'Please provide a valid email address.');
        hasError = true;
      }

      if (!password || password.length < 6) {
        showFieldError(regPassword, 'Password must be at least 6 characters long.');
        hasError = true;
      }

      if (password !== confirmPassword) {
        showFieldError(regConfirmPassword, 'Passwords do not match. Please re-type.');
        hasError = true;
      }

      if (termsAccepted && !termsAccepted.checked) {
        if (window.showToast) window.showToast('Please agree to library terms and borrowing regulations.', 'warning');
        hasError = true;
      }

      if (hasError) return;

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `Creating Membership...`;

      setTimeout(() => {
        const result = window.LibraryDB.register(name, email, phone, password, 'member');

        if (!result.success) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          if (window.showToast) window.showToast(result.message, 'error');
          showFieldError(regEmail, result.message);
        } else {
          if (window.showToast) window.showToast('Membership created successfully! Logging you in...', 'success');
          // Automatically set user session
          window.LibraryDB.setCurrentUser(result.member);
          setTimeout(() => {
            window.location.href = 'user-dashboard.html';
          }, 1000);
        }
      }, 600);
    });
  }

  function calculatePasswordStrength(pass) {
    if (!pass) return { pct: 0, label: '', color: '#ccc' };
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 10) score += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 25;

    if (score <= 25) return { pct: 25, label: 'Weak', color: '#c53030' };
    if (score <= 50) return { pct: 50, label: 'Fair', color: '#dd6b20' };
    if (score <= 75) return { pct: 75, label: 'Good', color: '#319795' };
    return { pct: 100, label: 'Strong', color: '#276749' };
  }

  /* -------------------------------------------------------------
   * FORGOT PASSWORD INTERACTIVE MODAL
   * -----------------------------------------------------------*/
  function bindForgotPasswordModal() {
    const forgotLink = document.getElementById('forgotPasswordLink');
    const forgotModal = document.getElementById('forgotPasswordModal');
    const forgotForm = document.getElementById('forgotPasswordForm');

    if (forgotLink && forgotModal) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.openModal('forgotPasswordModal');
      });
    }

    if (forgotForm) {
      forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const resetEmail = document.getElementById('resetEmailInput').value.trim();
        if (!resetEmail) {
          if (window.showToast) window.showToast('Please enter your registered email address.', 'warning');
          return;
        }

        const member = window.LibraryDB.getMemberById(resetEmail);
        if (!member) {
          if (window.showToast) window.showToast('No account found with this email in our circulation directory.', 'error');
          return;
        }

        window.showToast(`Demonstration Recovery: Password for ${member.name} is "${member.password}". In production, a secure reset token would be emailed.`, 'success', 6000);
        window.closeModal('forgotPasswordModal');
      });
    }
  }

  function showFieldError(inputEl, msg) {
    if (!inputEl) return;
    const parent = inputEl.closest('.form-group');
    if (parent) {
      parent.classList.add('has-error');
      let errSpan = parent.querySelector('.form-error');
      if (!errSpan) {
        errSpan = document.createElement('div');
        errSpan.className = 'form-error';
        parent.appendChild(errSpan);
      }
      errSpan.textContent = msg;
    }
  }

  function clearFormErrors(formEl) {
    if (!formEl) return;
    formEl.querySelectorAll('.has-error').forEach(g => g.classList.remove('has-error'));
    const errorAlert = document.getElementById('loginErrorAlert');
    if (errorAlert) errorAlert.style.display = 'none';
  }

  /* -------------------------------------------------------------
   * ROUTE GUARD UTILITY FOR DASHBOARDS
   * -----------------------------------------------------------*/
  window.checkRouteAuth = function (requiredRole = null) {
    if (!window.LibraryDB) return null;
    const user = window.LibraryDB.getCurrentUser();

    if (!user) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
      return null;
    }

    if (requiredRole && user.role !== requiredRole) {
      // If user tries to access admin but is member
      if (requiredRole === 'admin' && user.role === 'member') {
        window.showToast('Admin authorization required. Redirecting to Member portal...', 'warning');
        setTimeout(() => {
          window.location.href = 'user-dashboard.html';
        }, 1200);
        return null;
      }
    }

    return user;
  };

  document.addEventListener('DOMContentLoaded', init);

})();
