// ===============================
// AI RECOMMENDATION PAGE JS
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    // ==========================
    // Welcome Message
    // ==========================

    console.log("🤖 AI Recommendation Dashboard Loaded Successfully!");



    // ==========================
    // Animated Dashboard Numbers
    // ==========================

    const cards = document.querySelectorAll(".card h2");

    cards.forEach(card => {

        let text = card.innerText;

        if(text.includes("%")){

            let target = parseInt(text);

            let count = 0;

            card.innerHTML = "0%";

            let interval = setInterval(()=>{

                count++;

                card.innerHTML = count + "%";

                if(count>=target){

                    clearInterval(interval);

                }

            },20);

        }

    });



    // ==========================
    // Search Jobs
    // ==========================

    const searchInput = document.querySelector(".search-box input");

    const jobs = document.querySelectorAll(".job-card");

    if(searchInput){

        searchInput.addEventListener("keyup",()=>{

            let value = searchInput.value.toLowerCase();

            jobs.forEach(job=>{

                let title = job.innerText.toLowerCase();

                if(title.includes(value)){

                    job.style.display="block";

                }

                else{

                    job.style.display="none";

                }

            });

        });

    }



    // ==========================
    // Apply Button
    // ==========================

    const applyBtn = document.querySelectorAll(".apply");

    applyBtn.forEach(button=>{

        button.addEventListener("click",()=>{

            alert("🎉 Congratulations!\n\nApplication Submitted Successfully.");

        });

    });




    // ==========================
    // Save Job
    // ==========================

    const saveBtn = document.querySelectorAll(".save");

    saveBtn.forEach(button=>{

        button.addEventListener("click",()=>{

            if(button.innerHTML=="Save"){

                button.innerHTML="Saved ❤️";

                button.style.background="#00e5ff";

                button.style.color="#000";

            }

            else{

                button.innerHTML="Save";

                button.style.background="transparent";

                button.style.color="#00e5ff";

            }

        });

    });




    // ==========================
    // Hero Buttons
    // ==========================

    const heroButtons = document.querySelectorAll(".hero-buttons button");

    heroButtons.forEach(btn=>{

        btn.addEventListener("mouseover",()=>{

            btn.style.transform="scale(1.05)";

        });

        btn.addEventListener("mouseout",()=>{

            btn.style.transform="scale(1)";

        });

    });




    // ==========================
    // Notification Bell
    // ==========================

    const bell = document.querySelector(".notification");

    if(bell){

        bell.addEventListener("click",()=>{

            alert("🔔 No New Notifications");

        });

    }




    // ==========================
    // Sidebar Active Menu
    // ==========================

    const menu = document.querySelectorAll(".sidebar ul li");

    menu.forEach(item=>{

        item.addEventListener("click",()=>{

            menu.forEach(li=>{

                li.classList.remove("active");

            });

            item.classList.add("active");

        });

    });




    // ==========================
    // Progress Bar Animation
    // ==========================

    const bars = document.querySelectorAll(".progress-bar");

    bars.forEach(bar=>{

        let width = bar.style.width;

        bar.style.width="0";

        setTimeout(()=>{

            bar.style.width=width;

        },500);

    });




    // ==========================
    // AI Suggestions Hover
    // ==========================

    const tips = document.querySelectorAll(".ai-suggestions li");

    tips.forEach(tip=>{

        tip.addEventListener("mouseenter",()=>{

            tip.style.background="#00bcd4";

        });

        tip.addEventListener("mouseleave",()=>{

            tip.style.background="rgba(255,255,255,.05)";

        });

    });




    // ==========================
    // Smooth Scroll
    // ==========================

    document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

        anchor.addEventListener("click",function(e){

            e.preventDefault();

            const target=document.querySelector(this.getAttribute("href"));

            if(target){

                target.scrollIntoView({

                    behavior:"smooth"

                });

            }

        });

    });

});