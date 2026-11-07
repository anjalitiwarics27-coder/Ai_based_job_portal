// ==========================================
// AI JOB PORTAL
// INTERVIEW PREPARATION JAVASCRIPT
// ==========================================



// ===============================
// INTERVIEW QUESTIONS DATABASE
// ===============================


const interviewQuestions = {


    "Frontend Developer":[

        "Explain the difference between HTML, CSS and JavaScript.",

        "What is DOM and how does JavaScript interact with it?",

        "Explain responsive web design.",

        "Difference between Flexbox and Grid in CSS."

    ],



    "Backend Developer":[

        "Explain REST API and its working.",

        "What is database normalization?",

        "Difference between SQL and NoSQL databases.",

        "Explain authentication and authorization."

    ],



    "AI Engineer":[

        "Explain the difference between Machine Learning and Deep Learning.",

        "What is overfitting and how can you prevent it?",

        "Explain CNN architecture.",

        "What are different optimization algorithms in Deep Learning?"

    ],



    "Data Analyst":[

        "Explain data cleaning process.",

        "Difference between supervised and unsupervised learning.",

        "What is data visualization?",

        "Explain correlation and regression."

    ],



    "Full Stack Developer":[

        "Explain complete flow of a web application.",

        "What happens when we enter a URL in browser?",

        "Explain frontend and backend communication.",

        "What is middleware?"

    ]

};









// ===============================
// GENERATE AI QUESTION
// ===============================


function generateQuestion(){


    let role =
    document.getElementById("jobRole").value;



    let questions =
    interviewQuestions[role];



    let randomIndex =
    Math.floor(
        Math.random()*questions.length
    );



    document.getElementById(
        "aiQuestion"
    ).innerText =
    questions[randomIndex];



}









// ===============================
// SUBMIT ANSWER
// ===============================


function submitAnswer(){



    let answer =
    document.getElementById(
        "answerInput"
    ).value;



    if(answer.trim()===""){


        alert(
            "Please write your answer first!"
        );


        return;

    }




    let score =
    calculateScore(answer);



    showFeedback(score);



    alert(
        "Answer evaluated successfully!"
    );



}









// ===============================
// AI SCORE CALCULATION
// ===============================


function calculateScore(answer){



    let length =
    answer.length;



    let score = 0;



    if(length > 50){

        score += 30;

    }



    if(length > 150){

        score += 25;

    }



    if(
        answer.includes("because") ||
        answer.includes("example")
    ){

        score += 20;

    }




    score +=
    Math.floor(
        Math.random()*25
    );



    if(score>100){

        score=100;

    }



    return score;


}









// ===============================
// DISPLAY FEEDBACK
// ===============================


function showFeedback(score){



    document.getElementById(
        "score"
    ).innerText =
    score+"%";




    let communication =
    document.getElementById(
        "communication"
    );



    let technical =
    document.getElementById(
        "technical"
    );



    let confidence =
    document.getElementById(
        "confidence"
    );



    let improvement =
    document.getElementById(
        "improvement"
    );






    if(score>=80){



        communication.innerText =
        "Communication: Excellent";



        technical.innerText =
        "Technical Skills: Strong";



        confidence.innerText =
        "Confidence: High";



        improvement.innerText =
        "Improvement: Keep practicing";


    }


    else if(score>=50){



        communication.innerText =
        "Communication: Good";



        technical.innerText =
        "Technical Skills: Average";



        confidence.innerText =
        "Confidence: Improving";



        improvement.innerText =
        "Improvement: Practice more examples";


    }



    else{


        communication.innerText =
        "Communication: Needs Improvement";



        technical.innerText =
        "Technical Skills: Need Revision";



        confidence.innerText =
        "Confidence: Low";



        improvement.innerText =
        "Improvement: Practice daily";


    }


}









// ===============================
// START PRACTICE BUTTON
// ===============================


function startPractice(){


    window.scrollTo({

        top:500,

        behavior:"smooth"

    });



    alert(
        "Your AI Interview Practice Started!"
    );


}









// ===============================
// LOGOUT FUNCTION
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