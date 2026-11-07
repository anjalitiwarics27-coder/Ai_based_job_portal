// ==========================================
// AI JOB PORTAL
// JOBS PAGE JAVASCRIPT
// ==========================================





// ===============================
// JOB DATABASE
// ===============================


const jobs = [


    {

        title:"AI Engineer",

        company:"Google",

        location:"Bangalore",

        skills:[
            "Python",
            "Machine Learning",
            "TensorFlow"
        ],

        match:92

    },



    {

        title:"Full Stack Developer",

        company:"Microsoft",

        location:"Hyderabad",

        skills:[
            "HTML",
            "CSS",
            "JavaScript"
        ],

        match:88

    },



    {

        title:"Data Scientist",

        company:"Amazon",

        location:"Delhi",

        skills:[
            "Python",
            "SQL",
            "Data Science"
        ],

        match:85

    }


];









// ===============================
// SEARCH JOBS
// ===============================


function searchJobs(){



    let keyword =

    document.getElementById(
        "searchJob"
    ).value.toLowerCase();




    let location =

    document.getElementById(
        "location"
    ).value.toLowerCase();





    let filteredJobs =
    jobs.filter((job)=>{


        return (

            job.title
            .toLowerCase()
            .includes(keyword)

            ||

            job.company
            .toLowerCase()
            .includes(keyword)


        )

        &&

        (

            job.location
            .toLowerCase()
            .includes(location)

            ||

            location===""

        );


    });





    displaySearchResult(filteredJobs);


}









// ===============================
// DISPLAY SEARCH RESULT
// ===============================


function displaySearchResult(result){



    if(result.length===0){


        alert(
            "No matching jobs found!"
        );


        return;


    }



    let message =

    "AI Recommended Jobs:\n\n";




    result.forEach((job)=>{


        message +=

        job.title +

        " - "

        +

        job.company

        +

        " ("+

        job.match

        +

        "% Match)\n";



    });




    alert(message);


}









// ===============================
// FILTER SYSTEM
// ===============================


const filterButton =

document.querySelector(
".filter-btn"
);



if(filterButton){



filterButton.addEventListener(
"click",
()=>{



    alert(

    "Filters applied successfully!"

    );



});



}









// ===============================
// VIEW JOB DETAILS
// ===============================


const viewButtons =

document.querySelectorAll(

".job-actions button:first-child"

);




viewButtons.forEach(
(button)=>{


    button.addEventListener(
    "click",
    ()=>{


        window.location.href =
        "job_details.html";


    });


});









// ===============================
// APPLY JOB
// ===============================


const applyButtons =

document.querySelectorAll(
".apply-btn"
);





applyButtons.forEach(
(button)=>{


    button.addEventListener(
    "click",
    ()=>{


        alert(

        "Redirecting to application form..."

        );



        window.location.href =

        "job_details.html";



    });


});









// ===============================
// AI RECOMMENDATION BUTTON
// ===============================


const recommendButton =

document.querySelector(

".ai-banner button"

);




if(recommendButton){



recommendButton.addEventListener(

"click",

()=>{


    window.scrollTo({

        top:700,

        behavior:"smooth"

    });



    alert(

    "AI is finding best jobs for your profile!"

    );



}


);



}









// ===============================
// NEWSLETTER SUBSCRIBE
// ===============================


function subscribeNewsletter(){



    let email =

    document.getElementById(

        "newsletterEmail"

    ).value;





    if(email===""){


        alert(

        "Please enter your email"

        );


        return;


    }





    localStorage.setItem(

        "newsletterEmail",

        email

    );





    alert(

    "Subscribed successfully! You will receive job updates."

    );





    document.getElementById(

        "newsletterEmail"

    ).value="";



}









// ===============================
// LOGOUT FUNCTION
// ===============================


function logout(){



    localStorage.removeItem(

        "user"

    );



    localStorage.removeItem(

        "profile"

    );





    alert(

        "Logout Successfully!"

    );





    window.location.href =

    "../login.html";



}









// ===============================
// PAGE LOAD MESSAGE
// ===============================


window.addEventListener(

"load",

()=>{


    console.log(

        "AI Jobs Page Loaded Successfully"

    );


});