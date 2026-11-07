/* HireNova AI — Live API wiring (progressive enhancement).
   Loads real data when backend is online; leaves mock/demo UI untouched otherwise.
   Safe to include on every page — it self-detects the current page. */
(function () {
  if (!window.hirenovaApi) return;
  var api = window.hirenovaApi;
  var path = window.location.pathname || '';

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s == null ? '' : s);
    return d.innerHTML;
  }
  function toast(msg) { if (window.toast) window.toast(msg); }

  /* ---------- index.html : live jobs ---------- */
  if (path.endsWith('index.html') || path === '/' || path.endsWith('/frontant/')) {
    var list = document.getElementById('jobList');
    if (list) {
      api.jobs('?per_page=5').then(function (data) {
        if (!data || !data.jobs || !data.jobs.length) return;
        list.innerHTML = '';
        data.jobs.forEach(function (j) {
          var el = document.createElement('div');
          el.className = 'job-row';
          el.innerHTML =
            '<div><div class="role">' + esc(j.title) + '</div>' +
            '<div class="meta"><span><strong>' + esc(j.company) + '</strong></span>' +
            '<span>' + esc(j.location || '') + '</span><span>' + esc(j.job_type || '') + '</span>' +
            (j.salary ? '<span>' + esc(j.salary) + '</span>' : '') +
            '</div></div>' +
            '<div class="match-score">' +
            '<a href="login.html" class="btn btn-outline btn-sm">View role</a></div>';
          list.appendChild(el);
        });
      }).catch(function () { /* keep demo jobs */ });
    }
  }

  /* ---------- jobs.html : replace static cards with API jobs ---------- */
  if (path.indexOf('jobs.html') !== -1) {
    var container = document.querySelector('.job-cards-container');
    if (container) {
      var qEl = document.getElementById('searchJob');
      function load(q) {
        var qs = q ? '?q=' + encodeURIComponent(q) + '&per_page=20' : '?per_page=20';
        api.jobs(qs).then(function (data) {
          if (!data || !data.jobs || !data.jobs.length) return;
          container.innerHTML = '';
          data.jobs.forEach(function (j) {
            var card = document.createElement('div');
            card.className = 'job-card';
            var skills = (j.skills || []).map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('');
            card.innerHTML =
              '<div class="job-header"><h2>' + esc(j.title) + '</h2><span>Live</span></div>' +
              '<h3>' + esc(j.company) + '</h3>' +
              '<p>📍 ' + esc(j.location || '') + ' | 💼 ' + esc(j.job_type || '') + (j.salary ? ' | ' + esc(j.salary) : '') + '</p>' +
              '<p>' + esc((j.description || '').slice(0, 140)) + '</p>' +
              '<div class="job-skills">' + skills + '</div>' +
              '<div class="job-actions">' +
              '<a href="job_details.html?id=' + j.id + '" class="btn btn-sm" style="padding:12px 20px;border-radius:30px;background:#eff6ff;color:#2563eb;font-weight:600;">View Details</a>' +
              '<button class="apply-btn" data-apply="' + j.id + '">Apply Now</button>' +
              '<button data-save="' + j.id + '" style="padding:12px 20px;border-radius:30px;background:#fff;border:1px solid var(--border);font-weight:600;cursor:pointer;">Save</button>' +
              '</div>';
            container.appendChild(card);
          });
          container.querySelectorAll('[data-apply]').forEach(function (btn) {
            btn.addEventListener('click', function () {
              if (!api.hasToken()) { toast('Please sign in to apply'); window.location.href = '../login.html'; return; }
              btn.disabled = true; btn.textContent = 'Applying…';
              api.apply(btn.getAttribute('data-apply')).then(function () {
                btn.textContent = 'Applied ✓'; toast('Application submitted!');
              }).catch(function (e) { btn.disabled = false; btn.textContent = 'Apply Now'; toast(e.message || 'Could not apply'); });
            });
          });
          container.querySelectorAll('[data-save]').forEach(function (btn) {
            btn.addEventListener('click', function () {
              if (!api.hasToken()) { toast('Please sign in to save jobs'); window.location.href = '../login.html'; return; }
              api.save(btn.getAttribute('data-save')).then(function () { toast('Job saved!'); }).catch(function (e) { toast(e.message || 'Could not save'); });
            });
          });
        }).catch(function () { /* offline — keep mock */ });
      }
      load('');
      var searchBtn = document.querySelector('.search-box button');
      if (searchBtn && qEl) {
        searchBtn.addEventListener('click', function () { load(qEl.value.trim()); });
      }
    }
  }

  /* ---------- dashboard.html : live stats ---------- */
  if (path.indexOf('job_seeker/dashboard.html') !== -1 || path.indexOf('dashboard.html') !== -1) {
    api.seekerDashboard().then(function (data) {
      if (!data || !data.stats) return;
      var cards = document.querySelectorAll('.stat-card h2');
      if (cards.length >= 4) {
        cards[0].textContent = data.stats.available_jobs + '+';
        cards[1].textContent = data.stats.applications;
        cards[2].textContent = data.stats.saved_jobs;
        cards[3].textContent = data.stats.resume_score + '%';
      }
      // nav greeting
      if (data.user && data.user.full_name) {
        var h = document.querySelector('.nav-left h2');
        if (h) h.textContent = 'Welcome Back, ' + data.user.full_name.split(' ')[0];
      }
    }).catch(function () { /* demo mode */ });
  }

  /* ---------- chatbot.html : call backend first ---------- */
  if (path.indexOf('chatbot.html') !== -1) {
    var origSend = window.sendMessage;
    window.sendMessage = function () {
      var input = document.getElementById('chatInput') || document.getElementById('messageInput');
      var msg = input ? input.value.trim() : '';
      if (!msg) return;
      input.value = '';
      // let page botReply handle it after API returns; fall back to local if offline
      if (window.hirenovaApi.hasToken()) {
        window.hirenovaApi.chatbot(msg).then(function (data) {
          if (typeof window.botReply === 'function') window.botReply(data.reply || msg);
          else if (typeof window.addUserMessage === 'function') { window.addBotMessage(data.reply); }
        }).catch(function () { if (typeof origSend === 'function') origSend(); else if (typeof window.botReply === 'function') window.botReply('Hi! How can I help you with jobs, resume or interviews?'); });
      } else if (typeof origSend === 'function') {
        origSend();
      }
    };
  }

  /* ---------- resume_analysis.html : be ready (page JS also enhanced) ---------- */
  if (path.indexOf('resume_analysis.html') !== -1) {
    var fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.addEventListener('change', function () {
        var f = fileInput.files[0];
        if (!f || !api.hasToken()) return;
        api.resumeAnalyzeFile(f).then(function (data) {
          toast('Resume score: ' + data.score + '%');
          var scoreEl = document.querySelector('.score-value, .resume-score, h1');
          if (scoreEl && data.score) scoreEl.textContent = data.score + '%';
          if (data.skills && data.skills.length) {
            toast('Skills found: ' + data.skills.slice(0, 4).join(', '));
          }
        }).catch(function (e) { toast(e.message || 'Resume analysis failed'); });
      });
    }
  }

  /* ---------- contact.html : send to backend ---------- */
  if (path.indexOf('contact.html') !== -1) {
    var cForm = document.getElementById('contactForm');
    if (cForm) {
      cForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!cForm.checkValidity()) { cForm.reportValidity(); return; }
        var roleEl = cForm.querySelector('input[name="role"]:checked');
        api.contact({
          name: (document.getElementById('name') || {}).value || '',
          email: (document.getElementById('email') || {}).value || '',
          subject: (document.getElementById('subject') || {}).value || '',
          message: (document.getElementById('message') || {}).value || '',
          role: roleEl ? roleEl.value : 'candidate'
        }).then(function () { /* success view handled by page */ }).catch(function () { });
      }, true);
    }
  }

  /* ---------- Employer/post_job.html + Employer/dashboard: post a job live ---------- */
  if (path.indexOf('Employer/post_job.html') !== -1) {
    var pj = document.getElementById('postJobForm');
    if (pj) {
      pj.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!pj.checkValidity()) { pj.reportValidity(); return; }
        var skillsRaw = (document.getElementById('skills') || {}).value || '';
        var payload = {
          title: (document.getElementById('title') || {}).value || '',
          location: (document.getElementById('location') || {}).value || 'Remote',
          job_type: (document.getElementById('type') || {}).value || 'Full-time',
          skills: skillsRaw.split(',').map(function (s) { return s.trim(); }).filter(Boolean),
          description: (document.getElementById('desc') || {}).value || ''
        };
        api.createJob(payload).then(function () {
          var b = document.getElementById('successBanner');
          if (b) b.classList.add('show');
          toast('Job published successfully!');
          pj.reset();
        }).catch(function (err) {
          if (!api.hasToken()) { toast('Please sign in as employer to post a job'); }
          else { toast(err.message || 'Could not publish job'); }
        });
      }, true);
    }
  }

  /* ---------- employer dashboard ---------- */
  if (path.indexOf('Employer/dashboard.html') !== -1) {
    api.employerDashboard().then(function (data) {
      if (!data || !data.stats) return;
      var cards = document.querySelectorAll('.stat-card h2');
      if (cards.length >= 4) {
        cards[0].textContent = data.stats.active_jobs;
        cards[1].textContent = data.stats.total_applications;
        cards[2].textContent = data.stats.interviews;
        cards[3].textContent = data.stats.shortlisted;
      }
    }).catch(function () { });
  }

  /* ---------- admin dashboard ---------- */
  if (path.indexOf('admin/dashboard.html') !== -1) {
    api.adminDashboard().then(function (data) {
      if (!data || !data.stats) return;
      var cards = document.querySelectorAll('.stat-card h2');
      if (cards.length >= 4) {
        cards[0].textContent = data.stats.users;
        cards[1].textContent = data.stats.jobs;
        cards[2].textContent = data.stats.candidates + data.stats.employers;
        cards[3].textContent = data.stats.applications;
      }
    }).catch(function () { });
  }
})();
