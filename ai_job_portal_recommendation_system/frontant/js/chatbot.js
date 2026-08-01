// ===========================================
// AI JOB PORTAL - CHATBOT JAVASCRIPT
// ===========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("🤖 AI Career Chatbot Loaded Successfully!");

    // ===========================================
    // ELEMENTS
    // ===========================================

    const chatBody = document.querySelector(".chat-body");
    const input = document.querySelector(".chat-input input");
    const sendBtn = document.querySelector(".send");
    const attachBtn = document.querySelector(".attach");
    const emojiBtn = document.querySelector(".emoji");
    const voiceBtn = document.querySelector(".voice");
    const notification = document.querySelector(".notification");



    // ===========================================
    // SEND MESSAGE
    // ===========================================

    function sendMessage(){

        let message = input.value.trim();

        if(message==="") return;

        const userMessage = document.createElement("div");

        userMessage.className="message user";

        userMessage.innerHTML=`

            <div class="text">

                <p>${message}</p>

                <span>${currentTime()}</span>

            </div>

        `;

        chatBody.appendChild(userMessage);

        chatBody.scrollTop=chatBody.scrollHeight;

        input.value="";

        typingAnimation();

        setTimeout(()=>{

            botReply(message);

        },1800);

    }



    // ===========================================
    // BOT REPLY
    // ===========================================

    function botReply(message){

        document.querySelector(".typing")?.remove();

        let reply="";

        message=message.toLowerCase();

        if(message.includes("resume")){

            reply="📄 Improve your ATS Resume by adding projects, skills and certifications.";

        }

        else if(message.includes("job")){

            reply="💼 Based on your profile I found multiple matching jobs. Visit the Recommendation page.";

        }

        else if(message.includes("interview")){

            reply="🎯 Practice DSA, HR questions and explain your projects confidently.";

        }

        else if(message.includes("salary")){

            reply="💰 Freshers generally receive 4 LPA - 12 LPA depending on company and skills.";

        }

        else if(message.includes("react")){

            reply="⚛️ React.js is one of the most demanded frontend skills. Keep building projects.";

        }

        else{

            reply="🤖 Thank you! I understand your query. I'm always ready to help with jobs, resumes and career guidance.";

        }

        const bot=document.createElement("div");

        bot.className="message bot";

        bot.innerHTML=`

            <img src="../images/chatbot.png">

            <div class="text">

                <p>${reply}</p>

                <span>${currentTime()}</span>

            </div>

        `;

        chatBody.appendChild(bot);

        chatBody.scrollTop=chatBody.scrollHeight;

    }



    // ===========================================
    // CURRENT TIME
    // ===========================================

    function currentTime(){

        const date=new Date();

        return date.toLocaleTimeString([],{

            hour:'2-digit',

            minute:'2-digit'

        });

    }



    // ===========================================
    // AI TYPING
    // ===========================================

    function typingAnimation(){

        const typing=document.createElement("div");

        typing.className="message bot typing";

        typing.innerHTML=`

            <img src="../images/chatbot.png">

            <div class="text">

                <p>🤖 AI is typing...</p>

            </div>

        `;

        chatBody.appendChild(typing);

        chatBody.scrollTop=chatBody.scrollHeight;

    }



    // ===========================================
    // BUTTON EVENTS
    // ===========================================

    sendBtn.addEventListener("click",sendMessage);

    input.addEventListener("keypress",function(e){

        if(e.key==="Enter"){

            sendMessage();

        }

    });



    // ===========================================
    // ATTACHMENT BUTTON
    // ===========================================

    attachBtn.addEventListener("click",()=>{

        alert("📎 File Upload Feature Coming Soon!");

    });



    // ===========================================
    // EMOJI BUTTON
    // ===========================================

    emojiBtn.addEventListener("click",()=>{

        input.value+=" 😊 ";

        input.focus();

    });



    // ===========================================
    // VOICE BUTTON
    // ===========================================

    voiceBtn.addEventListener("click",()=>{

        alert("🎤 Voice Assistant Coming Soon!");

    });



    // ===========================================
    // NOTIFICATION
    // ===========================================

    if(notification){

        notification.addEventListener("click",()=>{

            alert("🔔 No New Notifications");

        });

    }



    // ===========================================
    // HERO BUTTONS
    // ===========================================

    const heroButtons=document.querySelectorAll(".hero-buttons button");

    heroButtons.forEach(btn=>{

        btn.addEventListener("click",()=>{

            alert("🚀 AI Feature Activated!");

        });

    });



    // ===========================================
    // QUICK QUESTIONS
    // ===========================================

    const questions=document.querySelectorAll(".question-list button");

    questions.forEach(btn=>{

        btn.addEventListener("click",()=>{

            input.value=btn.innerText;

            sendMessage();

        });

    });



    // ===========================================
    // SIDEBAR ACTIVE
    // ===========================================

    const menu=document.querySelectorAll(".sidebar ul li");

    menu.forEach(item=>{

        item.addEventListener("click",()=>{

            menu.forEach(li=>{

                li.classList.remove("active");

            });

            item.classList.add("active");

        });

    });



    // ===========================================
    // CARD HOVER EFFECT
    // ===========================================

    const cards=document.querySelectorAll(

        ".feature-card,.status-card,.insight-card,.resource-card,.achievement-card"

    );

    cards.forEach(card=>{

        card.addEventListener("mouseenter",()=>{

            card.style.transform="translateY(-10px)";

        });

        card.addEventListener("mouseleave",()=>{

            card.style.transform="translateY(0px)";

        });

    });



    // ===========================================
    // AUTO SCROLL
    // ===========================================

    chatBody.scrollTop=chatBody.scrollHeight;



    console.log("✅ AI Career Assistant Ready!");

});