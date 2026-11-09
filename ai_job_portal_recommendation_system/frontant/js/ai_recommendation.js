// HireNova AI — AI Recommendation page (progressive enhancement)
document.addEventListener("DOMContentLoaded", function () {
  console.log("HireNova AI Recommendation page loaded");

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function toast(msg) {
    if (window.toast) window.toast(msg);
  }

  function renderLiveRecommendations(recs) {
    var container = document.querySelector(".recommended-jobs .job-container");
    if (!container || !recs || !recs.length) return;
    container.innerHTML = "";
    recs.forEach(function (rec) {
      var j = rec.job || {};
      var score = rec.match_score != null ? Math.round(rec.match_score) : null;
      var skills = (j.skills || []).slice(0, 6);
      var reasons = (rec.reasons || []).slice(0, 2).join(" • ");
      var card = document.createElement("div");
      card.className = "job-card";
      card.innerHTML =
        '<div class="company">' +
          '<img src="../images/ai.png" alt="' + esc(j.company || "Company") + '" onerror="this.src=\'../images/profile.png\'">' +
          '<div><h3>' + esc(j.title || "Role") + '</h3><p>' + esc(j.company || "") + " • " + esc(j.location || "Remote") + '</p></div>' +
        '</div>' +
        '<div class="match"><span>' + (score != null ? esc(score) + "% Match" : "AI Match") + '</span></div>' +
        '<div class="job-info">' +
          '<span><i class="fa-solid fa-money-bill-wave"></i> ' + esc(j.salary || "Competitive") + '</span>' +
          '<span><i class="fa-solid fa-clock"></i> ' + esc(j.job_type || "Full-time") + '</span>' +
          '<span><i class="fa-solid fa-location-dot"></i> ' + esc(j.experience || "Open") + '</span>' +
        '</div>' +
        (reasons ? '<p style="margin:10px 0 0;color:#475569;font-size:13px;line-height:1.45;">' + esc(reasons) + '</p>' : '') +
        '<div class="skills">' + skills.map(function (s) { return '<span>' + esc(s) + '</span>'; }).join("") + '</div>' +
        '<div class="buttons">' +
          '<button class="apply" data-job-id="' + esc(j.id) + '">Apply Now</button>' +
          '<button class="save" data-job-id="' + esc(j.id) + '">Save</button>' +
          '<a class="save" style="text-decoration:none;display:inline-flex;align-items:center;justify-content:center;" href="job_details.html?id=' + encodeURIComponent(j.id) + '">Details</a>' +
        '</div>';
      container.appendChild(card);
    });

    // Update visible match score summary if present
    var topScore = scoreFromRecs(recs);
    if (topScore != null) {
      var cards = document.querySelectorAll(".card h2");
      cards.forEach(function (el) {
        if ((el.textContent || "").indexOf("%") !== -1 && /match/i.test((el.parentElement && el.parentElement.textContent) || "")) {
          el.textContent = topScore + "%";
        }
      });
    }
  }

  function scoreFromRecs(recs) {
    if (!recs || !recs.length) return null;
    var s = recs[0].match_score;
    return s == null ? null : Math.round(s);
  }

  function setCardValue(labelMatch, value) {
    document.querySelectorAll('.card, .stat-card, .summary-card').forEach(function (card) {
      var t = (card.textContent || '');
      if (labelMatch.test(t)) {
        var h = card.querySelector('h2, h3, .value, strong');
        if (h) h.textContent = value;
      }
    });
  }

  function loadInsights() {
    if (!window.hirenovaApi || !window.hirenovaApi.hasToken()) return;
    window.hirenovaApi.seekerDashboard().then(function (d) {
      if (!d) return;
      var stats = d.stats || {};
      var recs = d.recommendations || [];
      var top = scoreFromRecs(recs);
      if (stats.resume_score != null) setCardValue(/resume\s*score/i, Math.round(stats.resume_score) + '%');
      if (top != null) setCardValue(/ai\s*match\s*score|match\s*score/i, top + '%');
      if (d.user) {
        var completeness = 40;
        ['full_name','headline','skills','location','experience','bio'].forEach(function(k){ var v=d.user[k]; if(v && (Array.isArray(v)?v.length:String(v).trim())) completeness += 10; });
        if (stats.resume_score) completeness = Math.min(100, completeness);
        setCardValue(/profile\s*strength/i, Math.min(100, completeness) + '%');
      }
      var bars = document.querySelectorAll('.progress-bar');
      if (bars[0] && (d.user || top != null)) bars[0].style.width = Math.min(100, (top || 70)) + '%';
      var list = document.querySelector('.ai-suggestions ul, .ai-suggestions');
      if (list && recs[0] && recs[0].reasons && recs[0].reasons.length) {
        var ul = list.tagName === 'UL' ? list : list.querySelector('ul');
        if (ul) ul.innerHTML = recs[0].reasons.slice(0,4).map(function(r){ return '<li>' + String(r).replace(/</g,'&lt;') + '</li>'; }).join('');
      }
    }).catch(function(){});
  }

  function loadRecommendations() {
    if (!window.hirenovaApi) return;
    var api = window.hirenovaApi;
    var loader = api.hasToken() ? api.recommended(8, true) : api.recommended(8, false);
    loader.then(function (data) {
      var recs = (data && data.recommendations) ? data.recommendations : (Array.isArray(data) ? data : []);
      if (recs.length) renderLiveRecommendations(recs);
    }).catch(function () { /* keep static demo content */ });
    loadInsights();
  }

  // Delegated actions for live/static cards
  document.addEventListener("click", function (e) {
    var apply = e.target.closest && e.target.closest(".apply");
    var save = e.target.closest && e.target.closest(".save[data-job-id], button.save");
    if (apply && apply.getAttribute("data-job-id")) {
      e.preventDefault();
      if (!window.hirenovaApi || !window.hirenovaApi.hasToken()) {
        toast("Please sign in to apply");
        window.location.href = "../login.html";
        return;
      }
      var btn = apply;
      btn.disabled = true;
      btn.textContent = "Applying…";
      window.hirenovaApi.apply(btn.getAttribute("data-job-id")).then(function () {
        btn.textContent = "Applied ✓";
        toast("Application submitted!");
      }).catch(function (err) {
        btn.disabled = false;
        btn.textContent = "Apply Now";
        toast((err && err.message) || "Could not apply");
      });
      return;
    }
    if (save && save.getAttribute && save.getAttribute("data-job-id")) {
      e.preventDefault();
      if (!window.hirenovaApi || !window.hirenovaApi.hasToken()) {
        toast("Please sign in to save jobs");
        window.location.href = "../login.html";
        return;
      }
      window.hirenovaApi.save(save.getAttribute("data-job-id")).then(function () {
        save.textContent = "Saved ✓";
        toast("Job saved!");
      }).catch(function (err) { toast((err && err.message) || "Could not save"); });
      return;
    }
    // Static demo buttons (no data-job-id)
    if (apply) {
      toast("Please sign in to apply to live jobs");
      window.location.href = "../login.html";
    }
    if (save && !save.getAttribute("data-job-id") && save.tagName === "BUTTON") {
      if (save.textContent.trim() === "Save") { save.textContent = "Saved ✓"; }
    }
  });

  // Search within visible cards
  var searchInput = document.querySelector(".search-box input");
  if (searchInput) {
    searchInput.addEventListener("keyup", function () {
      var value = searchInput.value.toLowerCase();
      document.querySelectorAll(".job-card").forEach(function (job) {
        job.style.display = (job.innerText || "").toLowerCase().indexOf(value) !== -1 ? "" : "none";
      });
    });
  }

  // Progress bar animation
  document.querySelectorAll(".progress-bar").forEach(function (bar) {
    var width = bar.style.width;
    bar.style.width = "0";
    setTimeout(function () { bar.style.width = width; }, 500);
  });

  // Notification bell fallback
  var bell = document.querySelector(".notification");
  if (bell && !bell.__hirenovaBound) {
    bell.addEventListener("click", function () { toast("Notifications are up to date"); });
  }

  loadRecommendations();
});
