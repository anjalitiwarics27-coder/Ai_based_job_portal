/* ==========================================
        AI JOB PORTAL
        RESUME ANALYSIS JS
========================================== */





// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    animateOverallScore();

    animateProgressBars();

    initializeDragDrop();

});







// ==========================================
// SMOOTH SCROLL
// ==========================================

function scrollToUpload() {

    const section = document.getElementById("uploadSection");

    if (section) {

        section.scrollIntoView({

            behavior: "smooth"

        });

    }

}







// ==========================================
// RESUME UPLOAD
// ==========================================

function uploadResume() {

    const fileInput = document.getElementById("resumeFile");

    if (!fileInput.files.length) {

        showToast("Please select a resume.");

        return;

    }

    const file = fileInput.files[0];

    const allowed = [

        "application/pdf",

        "application/msword",

        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    ];

    if (!allowed.includes(file.type)) {

        showToast("Only PDF, DOC or DOCX files are allowed.");

        return;

    }

    localStorage.setItem("resumeName", file.name);

    showLoading();

    setTimeout(() => {

        hideLoading();

        showToast("Resume analyzed successfully!");

    }, 2500);

}







// ==========================================
// DRAG & DROP
// ==========================================

function initializeDragDrop() {

    const box = document.querySelector(".upload-box");

    const input = document.getElementById("resumeFile");

    if (!box || !input) return;

    box.addEventListener("dragover", (e) => {

        e.preventDefault();

        box.style.borderColor = "#16a34a";

    });

    box.addEventListener("dragleave", () => {

        box.style.borderColor = "#2563eb";

    });

    box.addEventListener("drop", (e) => {

        e.preventDefault();

        box.style.borderColor = "#2563eb";

        input.files = e.dataTransfer.files;

        showToast("Resume selected successfully.");

    });

}







// ==========================================
// OVERALL SCORE
// ==========================================

function animateOverallScore() {

    const score = document.getElementById("overallScore");

    if (!score) return;

    let value = 0;

    const target = 91;

    const timer = setInterval(() => {

        value++;

        score.innerHTML = value + "%";

        if (value >= target) {

            clearInterval(timer);

        }

    }, 20);

}







// ==========================================
// PROGRESS BAR
// ==========================================

function animateProgressBars() {

    const bars = document.querySelectorAll("progress");

    bars.forEach(bar => {

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







// ==========================================
// SAMPLE RESUME
// ==========================================

function downloadSampleResume() {

    alert("Sample Resume download will be available after backend integration.");

}







// ==========================================
// DOWNLOAD REPORT
// ==========================================

function downloadReport() {

    alert("AI Report downloaded successfully.");

}







// ==========================================
// ANALYZE AGAIN
// ==========================================

function analyzeAgain() {

    location.reload();

}







// ==========================================
// LOGOUT
// ==========================================

function logout(){ if(window.hirenovaLogout) return window.hirenovaLogout(); if(window.hirenovaApi&&window.hirenovaApi.logout) return window.hirenovaApi.logout(); try{["hirenova_access_token","hirenova_refresh_token","hirenova_token","user"].forEach(function(k){localStorage.removeItem(k);sessionStorage.removeItem(k);});}catch(e){} window.location.href="../login.html"; }







// ==========================================
// LOADING
// ==========================================

function showLoading() {

    let loader = document.createElement("div");

    loader.id = "loader";

    loader.innerHTML =

        "<h2>🤖 AI is analyzing your resume...</h2>";

    loader.style.position = "fixed";

    loader.style.top = "0";

    loader.style.left = "0";

    loader.style.width = "100%";

    loader.style.height = "100%";

    loader.style.background = "rgba(255,255,255,.95)";

    loader.style.display = "flex";

    loader.style.justifyContent = "center";

    loader.style.alignItems = "center";

    loader.style.fontSize = "28px";

    loader.style.fontWeight = "700";

    loader.style.zIndex = "9999";

    document.body.appendChild(loader);

}





function hideLoading() {

    const loader = document.getElementById("loader");

    if (loader) {

        loader.remove();

    }

}







// ==========================================
// TOAST MESSAGE
// ==========================================

function showToast(message) {

    const toast = document.createElement("div");

    toast.innerHTML = message;

    toast.style.position = "fixed";

    toast.style.bottom = "30px";

    toast.style.right = "30px";

    toast.style.background = "#2563eb";

    toast.style.color = "#ffffff";

    toast.style.padding = "15px 25px";

    toast.style.borderRadius = "10px";

    toast.style.boxShadow = "0 10px 25px rgba(0,0,0,.2)";

    toast.style.zIndex = "9999";

    toast.style.fontWeight = "600";

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);

}







// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

document.addEventListener("keydown", (event) => {

    if (event.ctrlKey && event.key.toLowerCase() === "u") {

        event.preventDefault();

        scrollToUpload();

    }

});