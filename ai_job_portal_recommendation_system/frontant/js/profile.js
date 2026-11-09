// ==========================================
// AI JOB PORTAL
// profile.js
// ==========================================

// ==============================
// PAGE LOAD
// ==============================

document.addEventListener("DOMContentLoaded", () => {

    loadProfile();

    animateResumeScore();

    animateProfileProgress();

    animateSkillProgress();

    showWelcomeMessage();

});





// ==============================
// LOAD PROFILE DATA
// ==============================

function loadProfile() {

    const profile = JSON.parse(localStorage.getItem("profile"));

    if (!profile) {

        return;

    }

    if (document.getElementById("userName")) {

        document.getElementById("userName").innerText =
            profile.name || "User";

    }

}





// ==============================
// EDIT PROFILE
// ==============================

function editProfile() {

    window.location.href = "edit_profile.html";

}





// ==============================
// RESUME UPLOAD
// ==============================

function uploadResume() {

    const fileInput =
        document.querySelector('input[type="file"]');

    if (!fileInput || fileInput.files.length === 0) {

        alert("Please select a resume first.");

        return;

    }

    const file = fileInput.files[0];

    const allowedTypes = [

        "application/pdf",

        "application/msword",

        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    ];

    if (!allowedTypes.includes(file.type)) {

        alert("Upload only PDF or DOC/DOCX files.");

        return;

    }

    localStorage.setItem("resumeName", file.name);

    alert("Resume uploaded successfully!");
}





// ==============================
// DOWNLOAD RESUME
// ==============================

function downloadResume() {

    const resumeName = localStorage.getItem("resumeName");

    if (!resumeName) {

        alert("No uploaded resume found.");

        return;

    }

    alert("Resume: " + resumeName);

}





// ==============================
// PROFILE COMPLETION BAR
// ==============================

function animateProfileProgress() {

    const progress = document.getElementById("progressBar");

    if (!progress) return;

    let value = 0;

    const target = 85;

    const timer = setInterval(() => {

        value++;

        progress.style.width = value + "%";

        progress.innerText = value + "%";

        if (value >= target) {

            clearInterval(timer);

        }

    }, 20);

}





// ==============================
// RESUME SCORE ANIMATION
// ==============================

function animateResumeScore() {

    const scoreElement = document.querySelector(".ai-score h1");

    if (!scoreElement) return;

    let score = 0;

    const target = 91;

    const timer = setInterval(() => {

        score++;

        scoreElement.innerText = score + "%";

        if (score >= target) {

            clearInterval(timer);

        }

    }, 20);

}





// ==============================
// SKILL PROGRESS
// ==============================

function animateSkillProgress() {

    const progressBars =
        document.querySelectorAll(".progress-item progress");

    progressBars.forEach(bar => {

        const target = Number(bar.value);

        bar.value = 0;

        let current = 0;

        const timer = setInterval(() => {

            current++;

            bar.value = current;

            if (current >= target) {

                clearInterval(timer);

            }

        }, 15);

    });

}





// ==============================
// START INTERVIEW PREPARATION
// ==============================

function startPreparation() {

    window.location.href = "interview_prep.html";

}





// ==============================
// WELCOME MESSAGE
// ==============================

function showWelcomeMessage() {

    console.log("Welcome to your AI Job Portal Profile.");

}





// ==============================
// LOGOUT
// ==============================

function logout(){ if(window.hirenovaLogout) return window.hirenovaLogout(); if(window.hirenovaApi&&window.hirenovaApi.logout) return window.hirenovaApi.logout(); try{["hirenova_access_token","hirenova_refresh_token","hirenova_token","user"].forEach(function(k){localStorage.removeItem(k);sessionStorage.removeItem(k);});}catch(e){} window.location.href="../login.html"; }





// ==============================
// KEYBOARD SHORTCUTS
// ==============================

document.addEventListener("keydown", (event) => {

    if (event.ctrlKey && event.key.toLowerCase() === "e") {

        event.preventDefault();

        editProfile();

    }

});