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

  // Global fallback logout (page scripts override with their own when loaded)
  if (typeof window.logout !== 'function') {
    window.logout = function () {
      try {
        localStorage.removeItem('hirenova_token');
        sessionStorage.removeItem('hirenova_token');
      } catch (e) { }
      window.location.href = '../login.html';
    };
  }
})();
