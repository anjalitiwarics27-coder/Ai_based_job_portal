/* HireNova AI — API client (JWT aware). Falls back gracefully when backend is offline. */
(function () {
  var API_BASE = window.HIRENOVA_API_BASE || ''; // '' = same origin (Flask serves frontend)

  function getToken() {
    try { return localStorage.getItem('hirenova_access_token') || ''; } catch (e) { return ''; }
  }
  function getRefreshToken() {
    try { return localStorage.getItem('hirenova_refresh_token') || ''; } catch (e) { return ''; }
  }
  function setToken(token, refresh) {
    try {
      if (token) localStorage.setItem('hirenova_access_token', token);
      if (refresh) localStorage.setItem('hirenova_refresh_token', refresh);
    } catch (e) { }
  }
  function setUser(user) {
    try { if (user) localStorage.setItem('user', JSON.stringify(user)); } catch (e) { }
  }
  function clearAuth() {
    try {
      ['hirenova_access_token', 'hirenova_refresh_token', 'hirenova_token', 'user'].forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) { }
  }
  function hasToken() { return !!getToken(); }
  function loginRedirect() {
    try {
      var p = window.location.pathname || '';
      var base = p.indexOf('/job_seeker/') !== -1 || p.indexOf('/Employer/') !== -1 || p.indexOf('/admin/') !== -1 ? '../login.html' : 'login.html';
      if (p.indexOf('login.html') === -1 && p.indexOf('register.html') === -1) window.location.href = base;
    } catch (e) { }
  }
  function parseBody(res) {
    return res.json().catch(function () { return { success: false, message: 'Invalid response' }; });
  }
  function request(path, options, _retry) {
    options = options || {};
    var headers = Object.assign({}, options.headers || {});
    var isForm = options.body instanceof FormData;
    if (!isForm && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    var token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return fetch(API_BASE + path, Object.assign({}, options, { headers: headers }))
      .then(function (res) {
        return parseBody(res).then(function (body) {
          if (res.status === 401 && !_retry && getRefreshToken() && path.indexOf('/api/auth/refresh') === -1 && path.indexOf('/api/auth/login') === -1) {
            return fetch(API_BASE + '/api/auth/refresh', { method: 'POST', headers: { 'Authorization': 'Bearer ' + getRefreshToken(), 'Content-Type': 'application/json' } })
              .then(parseBody).then(function (rb) {
                if (rb && rb.success && rb.data && rb.data.access_token) {
                  setToken(rb.data.access_token);
                  return request(path, options, true);
                }
                clearAuth(); loginRedirect();
                var err = new Error((body && body.message) || 'Session expired'); err.status = 401; err.body = body; throw err;
              }).catch(function () { clearAuth(); loginRedirect(); var err = new Error('Session expired'); err.status = 401; throw err; });
          }
          if (!res.ok || body.success === false) {
            if (res.status === 401) { clearAuth(); loginRedirect(); }
            var err = new Error(body.message || ('HTTP ' + res.status));
            err.status = res.status; err.body = body;
            throw err;
          }
          return body.data;
        });
      });
  }

  var api = {
    base: API_BASE,
    hasToken: hasToken,
    clearAuth: clearAuth,
    logout: function (redirect) {
      clearAuth();
      if (redirect !== false) {
        try {
          var p = window.location.pathname || '';
          window.location.href = (p.indexOf('/job_seeker/') !== -1 || p.indexOf('/Employer/') !== -1 || p.indexOf('/admin/') !== -1) ? '../login.html' : 'login.html';
        } catch (e) { }
      }
    },
    login: function (email, password) {
      return request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: email, password: password }) })
        .then(function (data) {
          setToken(data.access_token, data.refresh_token);
          setUser(data.user);
          return data;
        });
    },
    register: function (payload) {
      return request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) })
        .then(function (data) {
          setToken(data.access_token, data.refresh_token);
          setUser(data.user);
          return data;
        });
    },
    me: function () { return request('/api/auth/me'); },
    forgot: function (email) { return request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: email }) }); },
    resetPassword: function (token, password) { return request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token: token, password: password }) }); },
    changePassword: function (currentPassword, newPassword) { return request('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }) }); },
    contact: function (payload) { return request('/api/public/contact', { method: 'POST', body: JSON.stringify(payload) }); },
    health: function () { return request('/api/public/health'); },
    stats: function () { return request('/api/public/stats'); },

    jobs: function (qs) { return request('/api/jobs' + (qs || '')); },
    job: function (id) { return request('/api/jobs/' + id); },
    createJob: function (payload) { return request('/api/jobs', { method: 'POST', body: JSON.stringify(payload) }); },
    updateJob: function (id, payload) { return request('/api/jobs/' + id, { method: 'PUT', body: JSON.stringify(payload) }); },
    deleteJob: function (id) { return request('/api/jobs/' + id, { method: 'DELETE' }); },
    recommended: function (limit, useSeeker) {
      var path = useSeeker ? '/api/seeker/recommendations?limit=' + (limit || 10) : '/api/jobs/recommended?limit=' + (limit || 10);
      return request(path);
    },
    apply: function (jobId, coverLetter) {
      return request('/api/jobs/' + jobId + '/apply', { method: 'POST', body: JSON.stringify({ cover_letter: coverLetter || '' }) });
    },
    save: function (jobId) { return request('/api/jobs/' + jobId + '/save', { method: 'POST', body: '{}' }); },
    unsave: function (jobId) { return request('/api/jobs/' + jobId + '/save', { method: 'DELETE' }); },

    seekerDashboard: function () { return request('/api/seeker/dashboard'); },
    profile: function () { return request('/api/seeker/profile'); },
    updateProfile: function (payload) { return request('/api/seeker/profile', { method: 'PUT', body: JSON.stringify(payload) }); },
    applications: function (qs) { return request('/api/seeker/applications' + (qs || '')); },
    withdraw: function (id) { return request('/api/seeker/applications/' + id, { method: 'DELETE' }); },
    saved: function () { return request('/api/seeker/saved'); },
    resumeAnalyzeText: function (text) { return request('/api/seeker/resume/analyze', { method: 'POST', body: JSON.stringify({ text: text }) }); },
    resumeAnalyzeFile: function (file) {
      var fd = new FormData();
      fd.append('file', file);
      return request('/api/seeker/resume/analyze', { method: 'POST', body: fd });
    },
    resumeLatest: function () { return request('/api/seeker/resume/latest'); },
    coverLetter: function (jobId) { return request('/api/seeker/cover-letter', { method: 'POST', body: JSON.stringify({ job_id: jobId }) }); },
    chatbot: function (message) { return request('/api/seeker/chatbot', { method: 'POST', body: JSON.stringify({ message: message }) }); },
    interview: function (topic, count) { return request('/api/seeker/interview/generate', { method: 'POST', body: JSON.stringify({ topic: topic || 'default', count: count || 5 }) }); },

    employerDashboard: function () { return request('/api/employer/dashboard'); },
    employerProfile: function () { return request('/api/employer/profile'); },
    updateEmployerProfile: function (payload) { return request('/api/employer/profile', { method: 'PUT', body: JSON.stringify(payload) }); },
    employerJobs: function () { return request('/api/employer/jobs'); },
    applicants: function (jobId) { return request('/api/employer/jobs/' + jobId + '/applicants'); },
    ranking: function (jobId) { return request('/api/employer/jobs/' + jobId + '/ranking'); },
    setApplicationStatus: function (id, status) {
      return request('/api/employer/applications/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status: status }) });
    },

    adminDashboard: function () { return request('/api/admin/dashboard'); },
    adminAnalytics: function () { return request('/api/admin/analytics'); },
    adminAudit: function (qs) { return request('/api/admin/audit' + (qs || '')); },
    adminUsers: function (qs) { return request('/api/admin/users' + (qs || '')); },
    adminVerifyUser: function (id) { return request('/api/admin/users/' + id + '/verify', { method: 'PATCH', body: '{}' }); },
    adminSuspendUser: function (id) { return request('/api/admin/users/' + id + '/suspend', { method: 'PATCH', body: '{}' }); },
    adminJobs: function (qs) { return request('/api/admin/jobs' + (qs || '')); },
    aiSettings: function () { return request('/api/admin/ai-settings'); },
    updateAISettings: function (key, value) { return request('/api/admin/ai-settings', { method: 'PUT', body: JSON.stringify({ key: key, value: String(value) }) }); },
    notifications: function (qs) { return request('/api/public/notifications' + (qs || '')); },
    markNotificationRead: function (id) { return request('/api/public/notifications/' + id + '/read', { method: 'PATCH', body: '{}' }); },
    markAllNotificationsRead: function () { return request('/api/public/notifications/read-all', { method: 'POST', body: '{}' }); },

    sendOtp: function (email, purpose) { return request('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ email: email, purpose: purpose || 'verify' }) }); },
    verifyOtp: function (email, otp, purpose) { return request('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email: email, otp: String(otp), purpose: purpose || 'verify' }) }); },
    plans: function () { return request('/api/payments/plans'); },
    createCheckout: function (plan) { return request('/api/payments/create-checkout', { method: 'POST', body: JSON.stringify({ plan: plan || 'pro' }) }); },
    verifyPayment: function (payload) { return request('/api/payments/verify', { method: 'POST', body: JSON.stringify(payload) }); },
    paymentHistory: function () { return request('/api/payments/history'); },

    isOnline: function () {
      return api.health().then(function () { return true; }).catch(function () { return false; });
    }
  };

  window.hirenovaApi = api;
})();
