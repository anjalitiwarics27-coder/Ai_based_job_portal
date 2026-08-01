// =========================================
// APPLIED JOBS PAGE JAVASCRIPT
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 Applied Jobs Dashboard Loaded Successfully!");

    // =========================================
    // DASHBOARD COUNTER ANIMATION
    // =========================================

    const cards = document.querySelectorAll(".card h2");

    cards.forEach(card => {

        let text = card.innerText;

        if (text.includes("%")) {

            let target = parseInt(text);
            let count = 0;

            card.innerText = "0%";

            let interval = setInterval(() => {

                count++;

                card.innerText = count + "%";

                if (count >= target) {

                    clearInterval(interval);

                }

            }, 20);

        }

        else {

            let target = parseInt(text);

            if (!isNaN(target)) {

                let count = 0;

                card.innerText = "0";

                let interval = setInterval(() => {

                    count++;

                    card.innerText = count;

                    if (count >= target) {

                        clearInterval(interval);

                    }

                }, 50);

            }

        }

    });


    // =========================================
    // SEARCH APPLIED JOBS
    // =========================================

    const search = document.querySelector(".search-box input");

    const jobs = document.querySelectorAll(".job-card");

    if (search) {

        search.addEventListener("keyup", () => {

            let value = search.value.toLowerCase();

            jobs.forEach(job => {

                if (job.innerText.toLowerCase().includes(value)) {

                    job.style.display = "block";

                }

                else {

                    job.style.display = "none";

                }

            });

        });

    }


    // =========================================
    // VIEW DETAILS
    // =========================================

    const details = document.querySelectorAll(".details");

    details.forEach(btn => {

        btn.addEventListener("click", () => {

            const company =
                btn.closest(".job-card").querySelector("h3").innerText;

            alert(
                "📄 Job Details\n\n" +
                "Company : " + company +
                "\n\nApplication Status : Active\n\nKeep checking your dashboard for updates."
            );

        });

    });


    // =========================================
    // WITHDRAW APPLICATION
    // =========================================

    const withdraw = document.querySelectorAll(".withdraw");

    withdraw.forEach(btn => {

        btn.addEventListener("click", () => {

            let confirmBox = confirm(
                "Are you sure you want to withdraw this application?"
            );

            if (confirmBox) {

                btn.closest(".job-card").remove();

                alert("Application Withdrawn Successfully.");

            }

        });

    });


    // =========================================
    // NOTIFICATION
    // =========================================

    const bell = document.querySelector(".notification");

    if (bell) {

        bell.addEventListener("click", () => {

            alert("🔔 You have 2 new application updates.");

        });

    }


    // =========================================
    // SIDEBAR ACTIVE
    // =========================================

    const menu = document.querySelectorAll(".sidebar ul li");

    menu.forEach(item => {

        item.addEventListener("click", () => {

            menu.forEach(li => {

                li.classList.remove("active");

            });

            item.classList.add("active");

        });

    });


    // =========================================
    // PROGRESS BAR ANIMATION
    // =========================================

    const bars = document.querySelectorAll(".progress-bar");

    bars.forEach(bar => {

        let width = bar.style.width;

        bar.style.width = "0";

        setTimeout(() => {

            bar.style.width = width;

        }, 400);

    });


    // =========================================
    // INTERVIEW TIPS HOVER
    // =========================================

    const tips = document.querySelectorAll(".tip-card");

    tips.forEach(card => {

        card.addEventListener("mouseenter", () => {

            card.style.transform = "translateY(-10px) scale(1.03)";

        });

        card.addEventListener("mouseleave", () => {

            card.style.transform = "translateY(0px) scale(1)";

        });

    });


    // =========================================
    // HERO BUTTONS
    // =========================================

    const heroButtons = document.querySelectorAll(".hero-buttons button");

    heroButtons.forEach(btn => {

        btn.addEventListener("click", () => {

            alert("🚀 Feature Coming Soon!");

        });

    });


    // =========================================
    // SMOOTH SCROLL
    // =========================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            e.preventDefault();

            const target = document.querySelector(this.getAttribute("href"));

            if (target) {

                target.scrollIntoView({

                    behavior: "smooth"

                });

            }

        });

    });


    // =========================================
    // PAGE LOADED MESSAGE
    // =========================================

    setTimeout(() => {

        console.log("✅ Applied Jobs Dashboard Ready");

    }, 1000);

});