/* HireNova AI — Shared UI helpers */
(function () {
  // Mobile public navbar
  var burger = document.querySelector('.hamburger');
  var menu = document.querySelector('.mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () { menu.classList.toggle('open'); });
  }

  // Dashboard drawer
  var openBtns = document.querySelectorAll('[data-open-sidebar]');
  var sidebar = document.querySelector('.sidebar');
  var scrim = document.querySelector('.scrim');
  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (scrim) scrim.classList.remove('show');
    document.body.style.overflow = '';
  }
  openBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      if (sidebar) sidebar.classList.add('open');
      if (scrim) scrim.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });
  if (scrim) scrim.addEventListener('click', closeSidebar);
  var closeBtn = document.querySelector('.sidebar-close');
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSidebar(); });

  // Toast helper (window.toast(msg))
  var toastEl = document.querySelector('.toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }
  var timer = null;
  window.toast = function (msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  };

  // Global logout (clears JWT + legacy keys). Page scripts may override, but should call hirenovaApi.logout() when available.
  function clearAuthAndRedirect() {
    try {
      ['hirenova_access_token', 'hirenova_refresh_token', 'hirenova_token', 'user'].forEach(function (k) {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
    } catch (e) { }
    var p = window.location.pathname || '';
    window.location.href = (p.indexOf('/job_seeker/') !== -1 || p.indexOf('/Employer/') !== -1 || p.indexOf('/admin/') !== -1) ? '../login.html' : 'login.html';
  }
  window.hirenovaLogout = function (e) { if (e && e.preventDefault) e.preventDefault(); if (window.hirenovaApi && window.hirenovaApi.logout) return window.hirenovaApi.logout(); clearAuthAndRedirect(); };
  if (typeof window.logout !== 'function') {
    window.logout = function () { window.hirenovaLogout(); };
  }

  // Lightweight auth guard for protected consoles (progressive; API 401 handling also applies)
  try {
    var p = window.location.pathname || '';
    var protected = p.indexOf('/job_seeker/') !== -1 || p.indexOf('/Employer/') !== -1 || p.indexOf('/admin/') !== -1;
    if (protected) {
      var has = !!(localStorage.getItem('hirenova_access_token') || (window.hirenovaApi && window.hirenovaApi.hasToken && window.hirenovaApi.hasToken()));
      if (!has) window.location.href = '../login.html';
    }
  } catch (e) { }
})();
