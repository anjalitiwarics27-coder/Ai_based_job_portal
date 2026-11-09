/*==================================================
            AI JOB PORTAL
                UPLOAD PAGE
            JAVASCRIPT - PART 1
==================================================*/


// ==========================================
// PAGE INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    initializeUploadPage();

});

function initializeUploadPage() {

    showWelcomeMessage();

    initializeResumeUpload();

    initializePhotoPreview();

}



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
// FILE VALIDATION
// ==========================================

function validateFile(file, maxSizeMB, allowedTypes) {

    if (!file) {

        showToast("⚠ Please select a file.");

        return false;

    }

    const fileSize = file.size / (1024 * 1024);

    if (fileSize > maxSizeMB) {

        showToast(`❌ File size should be less than ${maxSizeMB} MB.`);

        return false;

    }

    const extension = file.name.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(extension)) {

        showToast("❌ Unsupported file format.");

        return false;

    }

    return true;

}



// ==========================================
// RESUME UPLOAD
// ==========================================

function initializeResumeUpload() {

    const resumeInput = document.getElementById("resumeUpload");

    if (!resumeInput) return;

    resumeInput.addEventListener("change", () => {

        const file = resumeInput.files[0];

        if (!validateFile(file, 5, ["pdf", "doc", "docx"])) {

            resumeInput.value = "";

            return;

        }

        showToast("📄 Resume selected successfully.");

    });

}

function uploadResume() {

    const input = document.getElementById("resumeUpload");

    if (!input || input.files.length === 0) {

        showToast("⚠ Please select a resume.");

        return;

    }

    const file = input.files[0];

    localStorage.setItem("resumeName", file.name);

    showLoading("Uploading Resume...");

    setTimeout(() => {

        hideLoading();

        showToast("✅ Resume uploaded successfully.");

    }, 1800);

}



// ==========================================
// PROFILE PHOTO PREVIEW
// ==========================================

function initializePhotoPreview() {

    const photoInput = document.getElementById("profilePhoto");

    if (!photoInput) return;

    photoInput.addEventListener("change", () => {

        const file = photoInput.files[0];

        if (!validateFile(file, 2, ["jpg", "jpeg", "png"])) {

            photoInput.value = "";

            return;

        }

        const reader = new FileReader();

        reader.onload = function (event) {

            let preview = document.getElementById("photoPreview");

            if (!preview) {

                preview = document.createElement("img");

                preview.id = "photoPreview";

                preview.style.width = "140px";

                preview.style.height = "140px";

                preview.style.borderRadius = "50%";

                preview.style.objectFit = "cover";

                preview.style.marginTop = "20px";

                photoInput.parentElement.appendChild(preview);

            }

            preview.src = event.target.result;

        };

        reader.readAsDataURL(file);

    });

}



// ==========================================
// PROFILE PHOTO UPLOAD
// ==========================================

function uploadPhoto() {

    const input = document.getElementById("profilePhoto");

    if (!input || input.files.length === 0) {

        showToast("⚠ Please select a profile photo.");

        return;

    }

    showLoading("Uploading Profile Photo...");

    setTimeout(() => {

        hideLoading();

        localStorage.setItem(

            "profilePhoto",

            input.files[0].name

        );

        showToast("📸 Profile photo uploaded successfully.");

    }, 1500);

}



// ==========================================
// WELCOME MESSAGE
// ==========================================

function showWelcomeMessage() {

    setTimeout(() => {

        showToast("📁 Welcome to the Upload Center!");

    }, 800);

}
/*==================================================
            AI JOB PORTAL
                UPLOAD PAGE
            JAVASCRIPT - PART 2
==================================================*/


// ==========================================
// COVER LETTER UPLOAD
// ==========================================

function uploadCoverLetter() {

    const input = document.getElementById("coverLetter");

    if (!input || input.files.length === 0) {

        showToast("⚠ Please select a cover letter.");

        return;

    }

    const file = input.files[0];

    if (!validateFile(file, 5, ["pdf", "doc", "docx"])) {

        return;

    }

    showLoading("Uploading Cover Letter...");

    setTimeout(() => {

        hideLoading();

        localStorage.setItem(

            "coverLetter",

            file.name

        );

        showToast("📄 Cover Letter uploaded successfully.");

        updateProgress();

    }, 1800);

}





// ==========================================
// CERTIFICATE UPLOAD
// ==========================================

function uploadCertificates() {

    const input = document.getElementById("certificateUpload");

    if (!input || input.files.length === 0) {

        showToast("⚠ Please select certificate files.");

        return;

    }

    const files = [...input.files];

    for (const file of files) {

        if (

            !validateFile(

                file,

                5,

                ["pdf", "jpg", "jpeg", "png"]

            )

        ) {

            return;

        }

    }

    showLoading("Uploading Certificates...");

    setTimeout(() => {

        hideLoading();

        const names = files.map(file => file.name);

        localStorage.setItem(

            "certificates",

            JSON.stringify(names)

        );

        showToast("🏆 Certificates uploaded successfully.");

        updateProgress();

    }, 2000);

}





// ==========================================
// SAVE PORTFOLIO LINKS
// ==========================================

function savePortfolioLinks() {

    const urls = document.querySelectorAll(

        'input[type="url"]'

    );

    const portfolio = {

        github: urls[0]?.value || "",

        linkedin: urls[1]?.value || "",

        website: urls[2]?.value || ""

    };

    localStorage.setItem(

        "portfolioLinks",

        JSON.stringify(portfolio)

    );

    showToast("💼 Portfolio links saved successfully.");

}





// ==========================================
// UPDATE PROGRESS
// ==========================================

function updateProgress() {

    const progressBars = document.querySelectorAll("progress");

    if (progressBars.length === 0) return;

    progressBars.forEach((bar) => {

        const target = Number(bar.value);

        let current = 0;

        bar.value = 0;

        const animation = setInterval(() => {

            current++;

            bar.value = current;

            if (current >= target) {

                clearInterval(animation);

            }

        }, 12);

    });

}





// ==========================================
// CLOUD SYNC
// ==========================================

function syncFiles() {

    showLoading("Synchronizing with cloud...");

    setTimeout(() => {

        hideLoading();

        const lastSync = new Date().toLocaleString();

        localStorage.setItem(

            "lastCloudSync",

            lastSync

        );

        showToast("☁️ Files synced successfully.");

    }, 2200);

}





// ==========================================
// RECENT UPLOADS
// ==========================================

function loadRecentUploads() {

    console.log("Recent Uploads");

    console.log(

        "Resume:",

        localStorage.getItem("resumeName")

    );

    console.log(

        "Cover Letter:",

        localStorage.getItem("coverLetter")

    );

    console.log(

        "Profile Photo:",

        localStorage.getItem("profilePhoto")

    );

    console.log(

        "Certificates:",

        localStorage.getItem("certificates")

    );

}

document.addEventListener(

    "DOMContentLoaded",

    loadRecentUploads

);
/*==================================================
            AI JOB PORTAL
                UPLOAD PAGE
            JAVASCRIPT - PART 3
==================================================*/


// ==========================================
// LOADING OVERLAY
// ==========================================

function showLoading(message = "Uploading...") {

    if (document.getElementById("loader")) return;

    const loader = document.createElement("div");

    loader.id = "loader";

    loader.innerHTML = `
        <div class="loader-box">
            <div class="loader-spinner"></div>
            <p>${message}</p>
        </div>
    `;

    loader.style.position = "fixed";
    loader.style.top = "0";
    loader.style.left = "0";
    loader.style.width = "100%";
    loader.style.height = "100%";
    loader.style.display = "flex";
    loader.style.justifyContent = "center";
    loader.style.alignItems = "center";
    loader.style.background = "rgba(255,255,255,.92)";
    loader.style.zIndex = "99999";

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

    const oldToast = document.getElementById("toast");

    if (oldToast) {

        oldToast.remove();

    }

    const toast = document.createElement("div");

    toast.id = "toast";

    toast.innerHTML = message;

    toast.style.position = "fixed";
    toast.style.right = "25px";
    toast.style.bottom = "25px";
    toast.style.background = "#2563eb";
    toast.style.color = "#ffffff";
    toast.style.padding = "16px 24px";
    toast.style.borderRadius = "12px";
    toast.style.fontWeight = "600";
    toast.style.boxShadow = "0 10px 25px rgba(0,0,0,.20)";
    toast.style.opacity = "0";
    toast.style.transition = ".4s";
    toast.style.zIndex = "999999";

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = "1";

    }, 50);

    setTimeout(() => {

        toast.style.opacity = "0";

        setTimeout(() => {

            toast.remove();

        }, 400);

    }, 3000);

}



// ==========================================
// BACK TO TOP BUTTON
// ==========================================

const topButton = document.createElement("button");

topButton.innerHTML = "⬆";

topButton.id = "topButton";

topButton.style.position = "fixed";
topButton.style.bottom = "25px";
topButton.style.right = "25px";
topButton.style.width = "50px";
topButton.style.height = "50px";
topButton.style.borderRadius = "50%";
topButton.style.border = "none";
topButton.style.background = "#2563eb";
topButton.style.color = "#ffffff";
topButton.style.fontSize = "20px";
topButton.style.cursor = "pointer";
topButton.style.display = "none";
topButton.style.zIndex = "9999";

document.body.appendChild(topButton);

window.addEventListener("scroll", () => {

    if (window.scrollY > 250) {

        topButton.style.display = "block";

    } else {

        topButton.style.display = "none";

    }

});

topButton.addEventListener("click", () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});



// ==========================================
// KEYBOARD SHORTCUT
// ==========================================

document.addEventListener("keydown", (event) => {

    if (event.ctrlKey && event.key.toLowerCase() === "u") {

        event.preventDefault();

        uploadResume();

    }

});



// ==========================================
// ONLINE / OFFLINE STATUS
// ==========================================

window.addEventListener("online", () => {

    showToast("🟢 Internet Connected");

});

window.addEventListener("offline", () => {

    showToast("🔴 Internet Disconnected");

});



// ==========================================
// SCROLL REVEAL ANIMATION
// ==========================================

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";

        }

    });

}, {

    threshold: 0.15

});

document.querySelectorAll(

    ".upload-card, .recent-card, .ai-card, .help-card"

).forEach(card => {

    card.style.opacity = "0";
    card.style.transform = "translateY(35px)";
    card.style.transition = ".6s ease";

    observer.observe(card);

});



// ==========================================
// AI CAREER TIPS
// ==========================================

const uploadTips = [

    "📄 Keep your resume updated every month.",

    "🏆 Upload your latest certifications regularly.",

    "📸 Use a professional profile photo.",

    "💼 Add your GitHub and LinkedIn profile links.",

    "🤖 Analyze your resume before applying."

];

function showRandomTip() {

    const index = Math.floor(

        Math.random() * uploadTips.length

    );

    setTimeout(() => {

        showToast(uploadTips[index]);

    }, 2500);

}

showRandomTip();



// ==========================================
// LOGOUT
// ==========================================

function logout(){ if(window.hirenovaLogout) return window.hirenovaLogout(); if(window.hirenovaApi&&window.hirenovaApi.logout) return window.hirenovaApi.logout(); try{["hirenova_access_token","hirenova_refresh_token","hirenova_token","user"].forEach(function(k){localStorage.removeItem(k);sessionStorage.removeItem(k);});}catch(e){} window.location.href="../login.html"; }



// ==========================================
// PAGE LOAD
// ==========================================

window.addEventListener("load", () => {

    console.log("Upload Page Loaded Successfully.");

    updateProgress();

});