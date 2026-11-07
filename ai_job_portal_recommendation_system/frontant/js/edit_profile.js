// =====================================
// AI JOB PORTAL
// EDIT PROFILE JAVASCRIPT
// =====================================



document.addEventListener("DOMContentLoaded", () => {


    loadProfile();


    calculateProfileScore();


});







// ===============================
// LOAD EXISTING PROFILE DATA
// ===============================


function loadProfile(){


    const user = JSON.parse(
        localStorage.getItem("user")
    );



    const profile = JSON.parse(
        localStorage.getItem("profile")
    );



    if(user){


        document.getElementById("fullName").value =
        user.name || "";


        document.getElementById("email").value =
        user.email || "";


    }



    if(profile){


        document.getElementById("phone").value =
        profile.phone || "";


        document.getElementById("degree").value =
        profile.degree || "";


        document.getElementById("college").value =
        profile.college || "";


        document.getElementById("graduationYear").value =
        profile.graduationYear || "";


        document.getElementById("skills").value =
        profile.skills || "";


        document.getElementById("experience").value =
        profile.experience || "";


        document.getElementById("linkedin").value =
        profile.linkedin || "";


        document.getElementById("github").value =
        profile.github || "";



        if(profile.image){


            document.getElementById("profilePreview")
            .src = profile.image;


        }


    }


}









// ===============================
// PROFILE IMAGE PREVIEW
// ===============================


const imageInput =
document.getElementById("profileImage");



if(imageInput){


imageInput.addEventListener(
"change",
function(){


    const file = this.files[0];


    if(file){


        const reader = new FileReader();



        reader.onload = function(e){


            document.getElementById(
                "profilePreview"
            ).src = e.target.result;


        }



        reader.readAsDataURL(file);


    }



});


}









// ===============================
// SAVE PROFILE
// ===============================


const profileForm =
document.getElementById("profileForm");



if(profileForm){


profileForm.addEventListener(
"submit",
function(e){


    e.preventDefault();



    const profileData = {


        phone:
        document.getElementById("phone").value,


        degree:
        document.getElementById("degree").value,


        college:
        document.getElementById("college").value,


        graduationYear:
        document.getElementById("graduationYear").value,


        skills:
        document.getElementById("skills").value,


        experience:
        document.getElementById("experience").value,


        linkedin:
        document.getElementById("linkedin").value,


        github:
        document.getElementById("github").value,


        image:
        document.getElementById("profilePreview").src



    };




    localStorage.setItem(
        "profile",
        JSON.stringify(profileData)
    );



    calculateProfileScore();



    alert(
        "Profile Updated Successfully!"
    );



});


}









// ===============================
// AI PROFILE COMPLETION SCORE
// ===============================


function calculateProfileScore(){



    let fields = [


        "fullName",

        "email",

        "phone",

        "degree",

        "college",

        "graduationYear",

        "skills",

        "experience",

        "linkedin",

        "github"


    ];



    let completed = 0;



    fields.forEach(field => {



        let value =
        document.getElementById(field);



        if(value && value.value.trim() !== ""){


            completed++;


        }


    });




    let percentage =
    Math.round(
        (completed / fields.length) * 100
    );




    let progress =
    document.getElementById(
        "profileProgress"
    );



    let text =
    document.getElementById(
        "profilePercentage"
    );



    if(progress){


        progress.style.width =
        percentage + "%";


    }



    if(text){


        text.innerText =
        percentage + "% Complete";


    }


}









// ===============================
// CANCEL EDIT
// ===============================


function cancelEdit(){


    let confirmBack =
    confirm(
        "Discard changes?"
    );



    if(confirmBack){


        window.location.href =
        "profile.html";


    }


}









// ===============================
// LOGOUT
// ===============================


function logout(){


    localStorage.removeItem("user");


    localStorage.removeItem("profile");



    alert(
        "Logged out successfully!"
    );



    window.location.href =
    "../login.html";


}
