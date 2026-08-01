// ===============================
// AI JOB PORTAL - DASHBOARD JS
// ===============================


// Check User Login
document.addEventListener("DOMContentLoaded", () => {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }


    // Load User Information
    document.getElementById("userName").innerText =
        user.name || "User";

    document.getElementById("userEmail").innerText =
        user.email || "example@gmail.com";


    // Load Dashboard Data
    loadRecommendedJobs();
    updateStats();

});



// ===============================
// Recommended Jobs Data
// ===============================


const jobs = [

    {
        title: "AI Engineer",
        company: "Google",
        location: "Bangalore",
        skills: "Python, Machine Learning, TensorFlow"
    },

    {
        title: "Frontend Developer",
        company: "Microsoft",
        location: "Hyderabad",
        skills: "HTML, CSS, JavaScript, React"
    },


    {
        title: "Data Analyst",
        company: "Amazon",
        location: "Delhi",
        skills: "Python, SQL, Excel"
    },


    {
        title: "ML Intern",
        company: "OpenAI",
        location: "Remote",
        skills: "Python, Deep Learning"
    }

];



// ===============================
// Display Jobs
// ===============================


function loadRecommendedJobs(){

    const container =
    document.getElementById("jobContainer");


    if(!container)
        return;


    container.innerHTML="";


    jobs.forEach((job,index)=>{


        let card = `

        <div class="job-card">

            <h3>${job.title}</h3>

            <h4>${job.company}</h4>

            <p>
            📍 ${job.location}
            </p>


            <p>
            Skills:
            ${job.skills}
            </p>


            <button onclick="applyJob(${index})">
                Apply Now
            </button>


        </div>

        `;


        container.innerHTML += card;


    });


}




// ===============================
// Apply Job Function
// ===============================


function applyJob(index){


    let appliedJobs =
    JSON.parse(localStorage.getItem("appliedJobs"))
    || [];


    appliedJobs.push(jobs[index]);


    localStorage.setItem(
        "appliedJobs",
        JSON.stringify(appliedJobs)
    );


    alert(
        "Application submitted successfully!"
    );

}





// ===============================
// Search Jobs
// ===============================


function searchJobs(){


    let value =
    document.getElementById("searchInput")
    .value
    .toLowerCase();


    let container =
    document.getElementById("jobContainer");


    container.innerHTML="";


    let filtered =
    jobs.filter(job =>

        job.title
        .toLowerCase()
        .includes(value)

    );


    filtered.forEach((job,index)=>{


        container.innerHTML += `

        <div class="job-card">

        <h3>${job.title}</h3>

        <h4>${job.company}</h4>

        <p>
        ${job.location}
        </p>

        <p>
        ${job.skills}
        </p>

        <button onclick="applyJob(${index})">
        Apply Now
        </button>

        </div>

        `;

    });


}



// ===============================
// Dashboard Statistics
// ===============================


function updateStats(){


    let applied =
    JSON.parse(localStorage.getItem("appliedJobs"))
    || [];


    let appliedCount =
    document.getElementById("appliedCount");


    if(appliedCount)
    {
        appliedCount.innerText =
        applied.length;
    }


    let recommended =
    document.getElementById("recommendedCount");


    if(recommended)
    {
        recommended.innerText =
        jobs.length;
    }


}




// ===============================
// Logout Function
// ===============================


function logout(){


    localStorage.removeItem("user");

    localStorage.removeItem("appliedJobs");


    alert("Logged out successfully");


    window.location.href="index.html";

}