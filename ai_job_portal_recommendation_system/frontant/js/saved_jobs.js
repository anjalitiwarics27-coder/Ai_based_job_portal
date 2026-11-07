/*==================================================
        AI JOB PORTAL
        SAVED JOBS PAGE
        JAVASCRIPT - PART 1
==================================================*/


// ==========================================
// PAGE INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    initializePage();

});



function initializePage() {

    initializeSearch();

    initializeFilters();

    initializeSorting();

    animateProgressBars();

    showWelcomeMessage();

}



// ==========================================
// SMOOTH SCROLL
// ==========================================

function scrollToJobs() {

    const section = document.getElementById("savedJobsSection");

    if (section) {

        section.scrollIntoView({

            behavior: "smooth"

        });

    }

}



// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================

function initializeSearch() {

    const searchInput = document.getElementById("searchJob");

    if (!searchInput) return;

    searchInput.addEventListener("keyup", searchJobs);

}



function searchJobs() {

    const input = document.getElementById("searchJob");

    const filter = input.value.toLowerCase();

    const cards = document.querySelectorAll(".job-card");

    cards.forEach(card => {

        const text = card.innerText.toLowerCase();

        if (text.includes(filter)) {

            card.style.display = "block";

        }

        else {

            card.style.display = "none";

        }

    });

}



// ==========================================
// FILTERS
// ==========================================

function initializeFilters() {

    const typeFilter = document.getElementById("jobType");

    const locationFilter = document.getElementById("locationFilter");

    if (typeFilter) {

        typeFilter.addEventListener("change", filterJobs);

    }

    if (locationFilter) {

        locationFilter.addEventListener("change", filterJobs);

    }

}



function filterJobs() {

    const type = document.getElementById("jobType").value.toLowerCase();

    const location = document.getElementById("locationFilter").value.toLowerCase();

    const cards = document.querySelectorAll(".job-card");

    cards.forEach(card => {

        const text = card.innerText.toLowerCase();

        const typeMatch =

            type === "all job types" ||

            text.includes(type);

        const locationMatch =

            location === "all locations" ||

            text.includes(location);

        if (typeMatch && locationMatch) {

            card.style.display = "block";

        }

        else {

            card.style.display = "none";

        }

    });

}



// ==========================================
// SORTING
// ==========================================

function initializeSorting() {

    const sort = document.getElementById("sortJobs");

    if (!sort) return;

    sort.addEventListener("change", sortJobs);

}



function sortJobs() {

    const container = document.querySelector(".job-grid");

    const cards = Array.from(document.querySelectorAll(".job-card"));

    const value = document.getElementById("sortJobs").value;

    if (value === "Company Name") {

        cards.sort((a, b) => {

            const companyA =

                a.querySelector("h4").innerText;

            const companyB =

                b.querySelector("h4").innerText;

            return companyA.localeCompare(companyB);

        });

    }

    if (value === "Highest Match") {

        cards.sort((a, b) => {

            const matchA =

                parseInt(a.innerText.match(/\d+%/)[0]);

            const matchB =

                parseInt(b.innerText.match(/\d+%/)[0]);

            return matchB - matchA;

        });

    }

    container.innerHTML = "";

    cards.forEach(card => {

        container.appendChild(card);

    });

}



// ==========================================
// PROGRESS BAR ANIMATION
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

        }, 20);

    });

}



// ==========================================
// WELCOME MESSAGE
// ==========================================

function showWelcomeMessage() {

    setTimeout(() => {

        showToast("❤️ Welcome to your Saved Jobs Dashboard");

    }, 800);

}
/*==================================================
        AI JOB PORTAL
        SAVED JOBS PAGE
        JAVASCRIPT - PART 2
==================================================*/


// ==========================================
// APPLY JOB
// ==========================================

function applyJob() {

    showLoading("Submitting your application...");

    setTimeout(() => {

        hideLoading();

        showToast("🎉 Application submitted successfully!");

    }, 2000);

}





// ==========================================
// VIEW JOB DETAILS
// ==========================================

function viewDetails() {

    showLoading("Opening job details...");

    setTimeout(() => {

        hideLoading();

        window.location.href = "job_details.html";

    }, 800);

}





// ==========================================
// REMOVE SAVED JOB
// ==========================================

function removeJob() {

    const confirmDelete = confirm(

        "Are you sure you want to remove this job from Saved Jobs?"

    );

    if (!confirmDelete) return;

    const button = event.target;

    const card = button.closest(".job-card");

    if (card) {

        card.style.transition = "0.4s";

        card.style.opacity = "0";

        card.style.transform = "scale(.9)";

        setTimeout(() => {

            card.remove();

            showToast("🗑️ Job removed successfully.");

        }, 400);

    }

}





// ==========================================
// NEWSLETTER
// ==========================================

function subscribeNewsletter() {

    const email = document.querySelector(

        ".newsletter-box input"

    );

    if (!email) return;

    if (email.value.trim() === "") {

        showToast("Please enter your email.");

        return;

    }

    const emailPattern =

        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.value)) {

        showToast("Please enter a valid email.");

        return;

    }

    showToast("📧 Successfully subscribed!");

    email.value = "";

}





// ==========================================
// LOADING SCREEN
// ==========================================

function showLoading(message = "Loading...") {

    let loader = document.getElementById("loader");

    if (loader) return;

    loader = document.createElement("div");

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

    loader.style.background =

        "rgba(255,255,255,.9)";

    loader.style.display = "flex";

    loader.style.alignItems = "center";

    loader.style.justifyContent = "center";

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
// TOAST NOTIFICATION
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

    toast.style.padding = "15px 22px";

    toast.style.borderRadius = "12px";

    toast.style.boxShadow =

        "0 10px 25px rgba(0,0,0,.2)";

    toast.style.fontWeight = "600";

    toast.style.zIndex = "999999";

    toast.style.opacity = "0";

    toast.style.transition = ".4s";

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
// LOGOUT
// ==========================================

function logout() {

    const confirmLogout = confirm(

        "Do you really want to logout?"

    );

    if (!confirmLogout) return;

    localStorage.removeItem("user");

    window.location.href = "../login.html";

}
/*==================================================
        AI JOB PORTAL
        SAVED JOBS PAGE
        JAVASCRIPT - PART 3
==================================================*/


// ==========================================
// SAVE TOTAL JOB COUNT
// ==========================================

function updateSavedJobsCount() {

    const cards = document.querySelectorAll(".job-card");

    const statCard = document.querySelector(".stat-card h2");

    if (statCard) {

        statCard.textContent = cards.length;

    }

    localStorage.setItem("savedJobsCount", cards.length);

}





// ==========================================
// RESTORE SAVED COUNT
// ==========================================

function restoreSavedJobsCount() {

    const count = localStorage.getItem("savedJobsCount");

    const statCard = document.querySelector(".stat-card h2");

    if (count && statCard) {

        statCard.textContent = count;

    }

}

restoreSavedJobsCount();





// ==========================================
// SCROLL ANIMATION
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

    ".job-card, .insight-card, .progress-card, .recommendation-card, .tip-card"

).forEach(card => {

    card.style.opacity = "0";

    card.style.transform = "translateY(40px)";

    card.style.transition = "0.6s ease";

    observer.observe(card);

});





// ==========================================
// BACK TO TOP BUTTON
// ==========================================

const topButton = document.createElement("button");

topButton.innerHTML = "⬆";

topButton.id = "topButton";

topButton.style.position = "fixed";

topButton.style.right = "25px";

topButton.style.bottom = "25px";

topButton.style.width = "50px";

topButton.style.height = "50px";

topButton.style.borderRadius = "50%";

topButton.style.border = "none";

topButton.style.background = "#2563eb";

topButton.style.color = "#ffffff";

topButton.style.fontSize = "20px";

topButton.style.cursor = "pointer";

topButton.style.display = "none";

topButton.style.boxShadow = "0 10px 25px rgba(0,0,0,.2)";

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

    if (event.ctrlKey && event.key.toLowerCase() === "f") {

        event.preventDefault();

        const search = document.getElementById("searchJob");

        if (search) {

            search.focus();

        }

    }

    if (event.key === "Escape") {

        const loader = document.getElementById("loader");

        if (loader) {

            loader.remove();

        }

    }

});





// ==========================================
// UPDATE COUNTER AFTER REMOVE
// ==========================================

document.addEventListener("click", (event) => {

    if (

        event.target.textContent.trim() === "Remove"

    ) {

        setTimeout(updateSavedJobsCount, 500);

    }

});





// ==========================================
// RANDOM CAREER TIP
// ==========================================

const tips = [

    "🚀 Apply to jobs within 48 hours of posting.",

    "📄 Tailor your resume for every application.",

    "💼 Keep your LinkedIn profile updated.",

    "🤖 Use AI Resume Analysis before applying.",

    "🎯 Practice interview questions regularly."

];

function showRandomTip() {

    const random = Math.floor(Math.random() * tips.length);

    setTimeout(() => {

        showToast(tips[random]);

    }, 2500);

}

showRandomTip();





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
// PAGE VISIT COUNT
// ==========================================

let visitCount = Number(

    localStorage.getItem("savedJobsVisit")

) || 0;

visitCount++;

localStorage.setItem(

    "savedJobsVisit",

    visitCount

);

console.log(

    "Saved Jobs Page Visits :",

    visitCount

);





// ==========================================
// FINAL PAGE READY
// ==========================================

window.addEventListener("load", () => {

    console.log("Saved Jobs Page Loaded Successfully.");

});