// ============================================
// AI JOB PORTAL - COVER LETTER JAVASCRIPT
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("✅ Cover Letter Page Loaded Successfully!");

    // =========================================
    // ELEMENTS
    // =========================================

    const generateBtn = document.querySelector(".generate-btn");
    const resetBtn = document.querySelector(".reset-btn");

    const previewBox = document.querySelector(".preview-box");

    const fullName = document.querySelector('input[placeholder="Enter your full name"]');
    const email = document.querySelector('input[placeholder="Enter your email"]');
    const phone = document.querySelector('input[placeholder="Enter phone number"]');
    const company = document.querySelector('input[placeholder="Google, Microsoft, Amazon..."]');
    const position = document.querySelector('input[placeholder="Frontend Developer"]');
    const skills = document.querySelector('input[placeholder="HTML, CSS, JavaScript, React"]');

    const experience = document.querySelectorAll("select")[0];
    const tone = document.querySelectorAll("select")[1];

    const jobDescription = document.querySelector("textarea");

    const templateButtons = document.querySelectorAll(".template-card button");

    // =========================================
    // GENERATE COVER LETTER
    // =========================================

    generateBtn.addEventListener("click", () => {

        if (
            fullName.value.trim() === "" ||
            company.value.trim() === "" ||
            position.value.trim() === ""
        ) {
            alert("⚠ Please fill all required fields.");
            return;
        }

        previewBox.innerHTML = `

        <h3>Dear Hiring Manager,</h3>

        <p>
        I am writing to express my interest in the
        <strong>${position.value}</strong> position at
        <strong>${company.value}</strong>.
        </p>

        <p>
        I am a <strong>${experience.value}</strong> candidate
        with skills in
        <strong>${skills.value}</strong>.
        My experience and passion for technology make me
        confident that I can contribute effectively to your team.
        </p>

        <p>
        I am impressed by the innovation and work culture at
        ${company.value}. I would love the opportunity
        to work with your organization and continue growing
        professionally.
        </p>

        <p>
        My preferred communication style is
        <strong>${tone.value}</strong>,
        and I always strive to deliver high-quality work.
        </p>

        <p>
        Thank you for considering my application.
        I look forward to discussing how I can contribute
        to your organization.
        </p>

        <br>

        <strong>Sincerely,</strong>

        <br><br>

        ${fullName.value}

        <br>

        ${email.value}

        <br>

        ${phone.value}

        `;

        alert("🎉 Cover Letter Generated Successfully!");

    });

    // =========================================
    // RESET
    // =========================================

    resetBtn.addEventListener("click", () => {

        setTimeout(() => {

            previewBox.innerHTML = `

            <h3>Dear Hiring Manager,</h3>

            <p>
            Your AI generated cover letter will appear here...
            </p>

            `;

        }, 200);

    });

    // =========================================
    // TEMPLATE SELECTION
    // =========================================

    templateButtons.forEach((button) => {

        button.addEventListener("click", () => {

            document.querySelectorAll(".template-card").forEach(card => {

                card.style.border = "1px solid rgba(255,255,255,.08)";

            });

            button.parentElement.style.border = "2px solid #00d4ff";

            alert("✅ Template Selected Successfully!");

        });

    });

    // =========================================
    // DOWNLOAD COVER LETTER
    // =========================================

    const downloadBtn = document.createElement("button");

    downloadBtn.innerHTML = "⬇ Download";

    downloadBtn.style.marginTop = "20px";

    downloadBtn.style.padding = "12px 25px";

    downloadBtn.style.border = "none";

    downloadBtn.style.borderRadius = "30px";

    downloadBtn.style.background = "#00d4ff";

    downloadBtn.style.cursor = "pointer";

    previewBox.appendChild(downloadBtn);

    downloadBtn.addEventListener("click", () => {

        const text = previewBox.innerText;

        const blob = new Blob([text], { type: "text/plain" });

        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);

        link.download = "Cover_Letter.txt";

        link.click();

    });

    // =========================================
    // COPY BUTTON
    // =========================================

    const copyBtn = document.createElement("button");

    copyBtn.innerHTML = "📋 Copy";

    copyBtn.style.marginLeft = "10px";

    copyBtn.style.padding = "12px 25px";

    copyBtn.style.border = "none";

    copyBtn.style.borderRadius = "30px";

    copyBtn.style.background = "#00ff99";

    copyBtn.style.cursor = "pointer";

    previewBox.appendChild(copyBtn);

    copyBtn.addEventListener("click", () => {

        navigator.clipboard.writeText(previewBox.innerText);

        alert("📋 Cover Letter Copied!");

    });

    // =========================================
    // CHARACTER COUNTER
    // =========================================

    const counter = document.createElement("p");

    counter.style.marginTop = "10px";

    counter.style.color = "#00d4ff";

    jobDescription.parentElement.appendChild(counter);

    jobDescription.addEventListener("input", () => {

        counter.innerHTML =
            "Characters : " + jobDescription.value.length;

    });

    // =========================================
    // SCORE ANIMATION
    // =========================================

    const scores = document.querySelectorAll(".circle-score");

    scores.forEach(score => {

        let target = parseInt(score.innerText);

        let count = 0;

        score.innerHTML = "0%";

        const interval = setInterval(() => {

            count++;

            score.innerHTML = count + "%";

            if (count >= target)

                clearInterval(interval);

        }, 15);

    });

    // =========================================
    // NOTIFICATION
    // =========================================

    const bell = document.querySelector(".notification");

    if (bell) {

        bell.addEventListener("click", () => {

            alert("🔔 No New Notifications");

        });

    }

    // =========================================
    // HERO BUTTONS
    // =========================================

    const heroButtons = document.querySelectorAll(".hero-buttons button");

    heroButtons.forEach(btn => {

        btn.addEventListener("click", () => {

            if (btn.innerText.includes("Generate")) {

                window.scrollTo({

                    top: document.querySelector(".generator-section").offsetTop,

                    behavior: "smooth"

                });

            }

            else {

                window.scrollTo({

                    top: document.querySelector(".template-section").offsetTop,

                    behavior: "smooth"

                });

            }

        });

    });

    console.log("🚀 AI Cover Letter Generator Ready!");

});