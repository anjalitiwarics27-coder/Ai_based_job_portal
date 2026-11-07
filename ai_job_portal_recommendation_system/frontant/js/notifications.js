// ==========================================
// AI JOB PORTAL
// notifications.js
// ==========================================

// ==============================
// PAGE LOAD
// ==============================

document.addEventListener("DOMContentLoaded", () => {

    initializeFilters();

    initializeReadButtons();

    updateNotificationCount();

    loadSettings();

});



// ==============================
// FILTER BUTTONS
// ==============================

function initializeFilters() {

    const buttons = document.querySelectorAll(".notification-filter button");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            buttons.forEach(btn => {

                btn.classList.remove("filter-active");

            });

            button.classList.add("filter-active");

            const filter = button.innerText.toLowerCase();

            filterNotifications(filter);

        });

    });

}



// ==============================
// FILTER NOTIFICATIONS
// ==============================

function filterNotifications(filter) {

    const cards = document.querySelectorAll(".notification-card");

    cards.forEach(card => {

        if (filter === "all") {

            card.style.display = "flex";

            return;

        }

        const text = card.innerText.toLowerCase();

        if (text.includes(filter)) {

            card.style.display = "flex";

        }

        else {

            card.style.display = "none";

        }

    });

}



// ==============================
// MARK ALL READ
// ==============================

function markAllRead() {

    const unreadCards = document.querySelectorAll(".notification-card.unread");

    unreadCards.forEach(card => {

        card.classList.remove("unread");

    });

    const readButtons = document.querySelectorAll(".read-btn");

    readButtons.forEach(btn => {

        btn.innerText = "Read";

        btn.disabled = true;

    });

    updateNotificationCount();

    alert("All notifications marked as read.");

}



// ==============================
// INDIVIDUAL READ BUTTON
// ==============================

function initializeReadButtons() {

    const buttons = document.querySelectorAll(".read-btn");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const card = button.closest(".notification-card");

            card.classList.remove("unread");

            button.innerText = "Read";

            button.disabled = true;

            updateNotificationCount();

        });

    });

}



// ==============================
// UPDATE COUNTERS
// ==============================

function updateNotificationCount() {

    const unread = document.querySelectorAll(".notification-card.unread").length;

    const total = document.querySelectorAll(".notification-card").length;

    const job = document.getElementById("jobAlertCount");
    const app = document.getElementById("applicationCount");
    const ai = document.getElementById("aiRecommendationCount");
    const interview = document.getElementById("interviewCount");

    if (job)
        job.innerText = unread + " New Opportunities";

    if (app)
        app.innerText = "5 Status Updates";

    if (ai)
        ai.innerText = "8 AI Matches";

    if (interview)
        interview.innerText = "2 Upcoming";

    console.log("Unread :", unread);
    console.log("Total :", total);

}



// ==============================
// CLEAR NOTIFICATIONS
// ==============================

function clearNotifications() {

    const confirmDelete = confirm("Clear all notifications?");

    if (!confirmDelete)
        return;

    const list = document.querySelector(".notification-list");

    if (list) {

        list.innerHTML = `

        <div class="notification-card">

            <div class="notification-content">

                <h2>No Notifications</h2>

                <p>You are all caught up 🎉</p>

            </div>

        </div>

        `;

    }

    updateNotificationCount();

}



// ==============================
// SAVE SETTINGS
// ==============================

function saveSettings() {

    const switches = document.querySelectorAll(".switch input");

    const settings = [];

    switches.forEach((item, index) => {

        settings.push({

            id: index,

            checked: item.checked

        });

    });

    localStorage.setItem(

        "notificationSettings",

        JSON.stringify(settings)

    );

    alert("Settings saved successfully.");

}



// ==============================
// LOAD SETTINGS
// ==============================

function loadSettings() {

    const data = JSON.parse(

        localStorage.getItem("notificationSettings")

    );

    if (!data)
        return;

    const switches = document.querySelectorAll(".switch input");

    switches.forEach((item, index) => {

        if (data[index]) {

            item.checked = data[index].checked;

        }

    });

}



// ==============================
// ACTION BUTTONS
// ==============================

const actionButtons = document.querySelectorAll(".notification-actions button");

actionButtons.forEach(button => {

    button.addEventListener("click", () => {

        const text = button.innerText;

        if (text.includes("View Job")) {

            window.location.href = "job_details.html";

        }

        else if (text.includes("View Application")) {

            alert("Opening application details...");

        }

        else if (text.includes("Prepare")) {

            window.location.href = "interview_prep.html";

        }

        else if (text.includes("Start Learning")) {

            alert("Opening AI Learning Dashboard...");

        }

        else if (text.includes("View Profile")) {

            alert("Opening recruiter activity...");

        }

    });

});



// ==============================
// LOGOUT
// ==============================

function logout() {

    localStorage.removeItem("user");
    localStorage.removeItem("profile");

    alert("Logged out successfully.");

    window.location.href = "../login.html";

}



// ==============================
// DEMO AUTO NOTIFICATION
// ==============================

setTimeout(() => {

    console.log("New notification received.");

}, 5000);



// ==============================
// PAGE READY
// ==============================

console.log("Notifications Page Loaded Successfully");