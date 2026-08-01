// ==========================================
// AI JOB PORTAL
// JOB DETAILS JAVASCRIPT
// ==========================================




// ===============================
// JOB DATA
// ===============================


const jobData = {


    title:"AI Engineer",

    company:"Google",

    location:"Bangalore",

    type:"Full Time",

    salary:"8-12 LPA",


    skills:[
        "Python",
        "Machine Learning",
        "Deep Learning",
        "TensorFlow",
        "SQL"
    ]

};








// ===============================
// PAGE LOAD
// ===============================


document.addEventListener(
"DOMContentLoaded",
()=>{


    loadJobDetails();


    generateMatchScore();


});









// ===============================
// LOAD JOB DETAILS
// ===============================


function loadJobDetails(){


    const title =
    document.getElementById(
        "jobTitle"
    );


    const company =
    document.getElementById(
        "companyName"
    );



    if(title){

        title.innerText =
        jobData.title;

    }



    if(company){

        company.innerText =
        jobData.company;

    }


}









// ===============================
// APPLY JOB BUTTON
// ===============================


function applyJob(){



    const modal =
    document.getElementById(
        "applyModal"
    );



    if(modal){


        modal.style.display =
        "flex";


    }


}









// ===============================
// CLOSE APPLY FORM
// ===============================


function closeApplyForm(){


    const modal =
    document.getElementById(
        "applyModal"
    );



    if(modal){


        modal.style.display =
        "none";


    }


}









// ===============================
// APPLICATION SUBMIT
// ===============================


const applyForm =
document.getElementById(
"applyForm"
);



if(applyForm){


applyForm.addEventListener(
"submit",
function(e){



    e.preventDefault();




    const application = {


        name:
        document.getElementById(
            "applicantName"
        ).value,



        email:
        document.getElementById(
            "applicantEmail"
        ).value,



        job:
        jobData.title,



        company:
        jobData.company,



        date:
        new Date()
        .toLocaleDateString()



    };





    let applications =
    JSON.parse(
        localStorage.getItem(
            "applications"
        )
    ) || [];




    applications.push(
        application
    );





    localStorage.setItem(

        "applications",

        JSON.stringify(
            applications
        )

    );





    alert(
        "Application submitted successfully!"
    );



    closeApplyForm();



    applyForm.reset();



});


}









// ===============================
// AI RESUME MATCH SCORE
// ===============================


function generateMatchScore(){



    let score =
    Math.floor(
        Math.random()*20
    ) + 80;



    const match =
    document.getElementById(
        "matchScore"
    );



    if(match){


        match.innerText =
        score+"%";


    }



}









// ===============================
// SIMILAR JOB VIEW BUTTONS
// ===============================


const similarButtons =
document.querySelectorAll(
".similar-job-card button"
);



similarButtons.forEach(
(button)=>{


    button.addEventListener(
    "click",
    ()=>{


        alert(
            "Opening job details..."
        );


    });


});









// ===============================
// CLOSE MODAL OUTSIDE CLICK
// ===============================


window.onclick =
function(event){



    const modal =
    document.getElementById(
        "applyModal"
    );



    if(event.target === modal){


        modal.style.display =
        "none";


    }



}









// ===============================
// LOGOUT
// ===============================


function logout(){



    localStorage.removeItem(
        "user"
    );



    localStorage.removeItem(
        "profile"
    );



    alert(
        "Logged out successfully!"
    );



    window.location.href =
    "index.html";


}