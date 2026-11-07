/* HireNova AI — API client (JWT aware). Falls back gracefully when backend is offline. */
(function () {
  var API_BASE = window.HIRENOVA_API_BASE || ''; // '' = same origin (Flask serves frontend)

  function getToken() {
    try { return localStorage.getItem('hirenova_access_token') || ''; } catch (e) { return ''; }
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
  function hasToken() { return !!getToken(); }
  function request(path, options) {
    options = options || {};
    var headers = Object.assign({}, options.headers || {});
    var isForm = options.body instanceof FormData;
    if (!isForm && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    var token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return fetch(API_BASE + path, Object.assign({}, options, { headers: headers }))
      .then(function (res) {
        return res.json().catch(function () { return { success: false, message: 'Invalid response' }; }).then(function (body) {
          if (!res.ok || body.success === false) {
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
    contact: function (payload) { return request('/api/public/contact', { method: 'POST', body: JSON.stringify(payload) }); },
    health: function () { return request('/api/public/health'); },
    stats: function () { return request('/api/public/stats'); },

    jobs: function (qs) { return request('/api/jobs' + (qs || '')); },
    job: function (id) { return request('/api/jobs/' + id); },
    createJob: function (payload) { return request('/api/jobs', { method: 'POST', body: JSON.stringify(payload) }); },
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
    employerJobs: function () { return request('/api/employer/jobs'); },
    applicants: function (jobId) { return request('/api/employer/jobs/' + jobId + '/applicants'); },
    ranking: function (jobId) { return request('/api/employer/jobs/' + jobId + '/ranking'); },
    setApplicationStatus: function (id, status) {
      return request('/api/employer/applications/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status: status }) });
    },

    adminDashboard: function () { return request('/api/admin/dashboard'); },
    adminAnalytics: function () { return request('/api/admin/analytics'); },
    adminUsers: function () { return request('/api/admin/users'); },
    adminJobs: function () { return request('/api/admin/jobs'); },
    aiSettings: function () { return request('/api/admin/ai-settings'); },
    notifications: function () { return request('/api/public/notifications'); },

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
