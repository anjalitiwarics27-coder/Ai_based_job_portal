/*==================================================
        AI JOB PORTAL
            SETTINGS PAGE
            JAVASCRIPT - PART 1
==================================================*/


// ==========================================
// PAGE INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    initializeSettings();

});



function initializeSettings() {

    restoreSettings();

    applySavedTheme();

    showWelcomeMessage();

}



// ==========================================
// SMOOTH SCROLL
// ==========================================

function scrollToSettings() {

    const section = document.getElementById("settingsSection");

    if (section) {

        section.scrollIntoView({

            behavior: "smooth"

        });

    }

}



// ==========================================
// SAVE SETTINGS
// ==========================================

function saveSettings() {

    const settings = {

        fullName: getInputValue(0),

        email: getInputValue(1),

        phone: getInputValue(2),

        location: getInputValue(3),

        theme: getSelectValue(0),

        language: getSelectValue(1),

        timezone: getSelectValue(2),

        resumeVisibility: getSelectValue(3)

    };

    localStorage.setItem(

        "userSettings",

        JSON.stringify(settings)

    );

    applyTheme(settings.theme);

    showToast("✅ Settings saved successfully!");

}



// ==========================================
// RESTORE SETTINGS
// ==========================================

function restoreSettings() {

    const data = JSON.parse(

        localStorage.getItem("userSettings")

    );

    if (!data) return;

    setInputValue(0, data.fullName);

    setInputValue(1, data.email);

    setInputValue(2, data.phone);

    setInputValue(3, data.location);

    setSelectValue(0, data.theme);

    setSelectValue(1, data.language);

    setSelectValue(2, data.timezone);

    setSelectValue(3, data.resumeVisibility);

}



// ==========================================
// THEME
// ==========================================

function applyTheme(theme) {

    if (theme === "Dark Theme") {

        document.body.style.background = "#0f172a";

        document.body.style.color = "#ffffff";

    }

    else {

        document.body.style.background = "#f5f7fb";

        document.body.style.color = "#1e293b";

    }

}



function applySavedTheme() {

    const data = JSON.parse(

        localStorage.getItem("userSettings")

    );

    if (data && data.theme) {

        applyTheme(data.theme);

    }

}



// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getInputValue(index) {

    return document.querySelectorAll("input")[index].value;

}

function setInputValue(index, value) {

    if (document.querySelectorAll("input")[index]) {

        document.querySelectorAll("input")[index].value = value || "";

    }

}

function getSelectValue(index) {

    return document.querySelectorAll("select")[index].value;

}

function setSelectValue(index, value) {

    if (document.querySelectorAll("select")[index]) {

        document.querySelectorAll("select")[index].value = value || "";

    }

}



// ==========================================
// WELCOME MESSAGE
// ==========================================

function showWelcomeMessage() {

    setTimeout(() => {

        showToast("⚙️ Welcome to Account Settings");

    }, 800);

}
/*==================================================
        AI JOB PORTAL
            SETTINGS PAGE
            JAVASCRIPT - PART 2
==================================================*/


// ==========================================
// PASSWORD VALIDATION
// ==========================================

function validatePassword() {

    const passwordFields = document.querySelectorAll(

        'input[type="password"]'

    );

    if (passwordFields.length < 3) return true;

    const currentPassword = passwordFields[0].value.trim();

    const newPassword = passwordFields[1].value.trim();

    const confirmPassword = passwordFields[2].value.trim();

    if (currentPassword === "") {

        showToast("⚠ Please enter your current password.");

        return false;

    }

    if (newPassword.length < 8) {

        showToast("🔒 New password must be at least 8 characters.");

        return false;

    }

    if (newPassword !== confirmPassword) {

        showToast("❌ Passwords do not match.");

        return false;

    }

    showToast("✅ Password validated successfully.");

    return true;

}





// ==========================================
// DOWNLOAD USER DATA
// ==========================================

function downloadData() {

    showLoading("Preparing your data...");

    setTimeout(() => {

        hideLoading();

        const data = localStorage.getItem("userSettings") || "{}";

        const blob = new Blob([data], {

            type: "application/json"

        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = "user_settings.json";

        link.click();

        URL.revokeObjectURL(url);

        showToast("📥 Data downloaded successfully.");

    }, 1500);

}





// ==========================================
// EXPORT RESUME
// ==========================================

function exportResume() {

    showLoading("Generating resume...");

    setTimeout(() => {

        hideLoading();

        showToast("📄 Resume exported successfully.");

    }, 1500);

}





// ==========================================
// DELETE ACCOUNT
// ==========================================

function deleteAccount() {

    const confirmDelete = confirm(

        "This action is permanent.\nDo you really want to delete your account?"

    );

    if (!confirmDelete) return;

    localStorage.clear();

    showToast("🗑 Account deleted.");

    setTimeout(() => {

        window.location.href = "../login.html";

    }, 1800);

}





// ==========================================
// LOGOUT
// ==========================================

function logout(){ if(window.hirenovaLogout) return window.hirenovaLogout(); if(window.hirenovaApi&&window.hirenovaApi.logout) return window.hirenovaApi.logout(); try{["hirenova_access_token","hirenova_refresh_token","hirenova_token","user"].forEach(function(k){localStorage.removeItem(k);sessionStorage.removeItem(k);});}catch(e){} window.location.href="../login.html"; }





// ==========================================
// LOADING OVERLAY
// ==========================================

function showLoading(message = "Loading...") {

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

    toast.style.padding = "16px 22px";

    toast.style.background = "#2563eb";

    toast.style.color = "#ffffff";

    toast.style.borderRadius = "12px";

    toast.style.fontWeight = "600";

    toast.style.boxShadow =

        "0 10px 25px rgba(0,0,0,.20)";

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
/*==================================================
        AI JOB PORTAL
            SETTINGS PAGE
            JAVASCRIPT - PART 3
==================================================*/


// ==========================================
// AUTO SAVE ON CHANGE
// ==========================================

document.querySelectorAll("input, select").forEach(element => {

    element.addEventListener("change", () => {

        saveSettings();

    });

});





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

topButton.style.boxShadow = "0 10px 25px rgba(0,0,0,.20)";

document.body.appendChild(topButton);

window.addEventListener("scroll", () => {

    if (window.scrollY > 300) {

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
// KEYBOARD SHORTCUTS
// ==========================================

document.addEventListener("keydown", (event) => {

    if (event.ctrlKey && event.key.toLowerCase() === "s") {

        event.preventDefault();

        saveSettings();

    }

    if (event.key === "Escape") {

        hideLoading();

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

    ".settings-card, .stat-card, .help-card"

).forEach(card => {

    card.style.opacity = "0";

    card.style.transform = "translateY(40px)";

    card.style.transition = ".6s ease";

    observer.observe(card);

});





// ==========================================
// PAGE VISIT COUNTER
// ==========================================

let visitCount = Number(

    localStorage.getItem("settingsPageVisits")

) || 0;

visitCount++;

localStorage.setItem(

    "settingsPageVisits",

    visitCount

);

console.log(

    "Settings Page Visits:",

    visitCount

);





// ==========================================
// RANDOM CAREER TIP
// ==========================================

const careerTips = [

    "🚀 Keep your resume updated every month.",

    "💼 Complete your profile to improve AI recommendations.",

    "📄 Upload a professional resume for better matches.",

    "🎯 Enable notifications to never miss job opportunities.",

    "🤖 Use AI Resume Analysis before applying."

];

function showCareerTip() {

    const randomIndex = Math.floor(

        Math.random() * careerTips.length

    );

    setTimeout(() => {

        showToast(careerTips[randomIndex]);

    }, 2500);

}

showCareerTip();





// ==========================================
// FORM VALIDATION BEFORE SAVE
// ==========================================

const saveButton = document.querySelector(".save-btn");

if (saveButton) {

    saveButton.addEventListener("click", (event) => {

        if (!validatePassword()) {

            event.preventDefault();

            return;

        }

    });

}





// ==========================================
// FINAL PAGE LOAD
// ==========================================

window.addEventListener("load", () => {

    console.log("Settings Page Loaded Successfully.");

    showToast("⚙️ Your settings are ready.");

});