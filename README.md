<div align="center">

# 🌟 HireNova AI

### *Igniting Careers. Empowering Recruiters. Powered by AI.*

An intelligent, full-stack job portal that leverages **Artificial Intelligence** to connect job seekers with the right opportunities and help recruiters discover the best-fit candidates — faster, smarter, and with far less manual effort.

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Made with](https://img.shields.io/badge/made%20with-❤️-red.svg)
![AI Powered](https://img.shields.io/badge/AI-Powered-purple.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

</div>

---

## ✨ Why "HireNova"?

**Nova** means a star that suddenly becomes far brighter — and that's exactly what HireNova AI aims to do for your career or your hiring pipeline: create a sudden, powerful spark of opportunity. 🌠

Traditional job boards make you search endlessly. **HireNova AI flips the model** — using resume intelligence, semantic job matching, and candidate ranking algorithms, the *right opportunities find you*, and the *right candidates find recruiters*.

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Project](#running-the-project)
- [Folder Structure](#-folder-structure)
- [API Endpoints](#-api-endpoints)
- [AI/ML Modules](#-aiml-modules)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 📖 About the Project

**HireNova AI** is a modern, full-stack job portal built to bridge the gap between job seekers and employers through intelligent automation. Unlike traditional job boards, HireNova AI uses **AI/ML-driven resume parsing, semantic job matching, and candidate ranking systems** to deliver highly relevant results — saving time and effort for everyone on the platform.

The platform supports two primary user roles:

- 👤 **Job Seekers** – Create a profile, upload a resume, receive AI-powered job recommendations, and track every application in one place.
- 🏢 **Recruiters/Employers** – Post job openings, get AI-ranked candidate shortlists, and manage the entire hiring pipeline effortlessly.

---

## ✨ Key Features

### For Job Seekers
- 🔐 Secure registration/login (JWT-based authentication)
- 📄 Resume upload & AI-based resume parsing
- 🎯 Smart job recommendations based on skills, experience & interests
- 🔍 Advanced search & filters (location, salary, experience, job type)
- 📊 Application tracking dashboard
- 🔔 Real-time notifications for application status

### For Recruiters
- 🏢 Company profile & job posting management
- 🤖 AI-based candidate ranking & shortlisting
- 📈 Applicant analytics dashboard
- 💬 In-app messaging with shortlisted candidates
- 🧠 Automated skill-matching score for each applicant

### AI-Powered Core
- 🧠 **Resume Parser** – Extracts skills, education, and experience using NLP
- 🎯 **Recommendation Engine** – Suggests jobs/candidates using ML-based similarity scoring
- 💡 **Skill Gap Analysis** – Highlights missing skills for a desired job role
- 🗣️ **Chatbot Assistant** – Helps users navigate the platform and answer FAQs

---

## 🛠 Tech Stack

| Layer            | Technology                                    |
|-------------------|-----------------------------------------------|
| **Frontend**      | React.js, Tailwind CSS / Bootstrap            |
| **Backend**       | Node.js, Express.js                           |
| **Database**      | MongoDB / MySQL                               |
| **AI/ML**         | Python, Scikit-learn, NLTK/spaCy, Pandas      |
| **Authentication**| JWT, bcrypt                                   |
| **File Storage**  | Cloudinary / AWS S3 (for resumes & documents) |
| **Deployment**    | Vercel / Render / AWS / Docker                |
| **Version Control**| Git & GitHub                                 |

> ⚠️ Update this table with HireNova AI's actual tech stack for accuracy.

---

## 🏗 System Architecture

```
┌────────────┐       ┌────────────┐       ┌────────────────┐
│  Frontend  │  <->  │  Backend   │  <->  │    Database     │
│  (React)   │       │ (Node/Exp) │       │ (MongoDB/MySQL) │
└────────────┘       └─────┬──────┘       └────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  AI/ML Engine │
                    │ (Python API)  │
                    │ Resume Parser │
                    │ Recommender   │
                    └───────────────┘
```

---

## 📸 Screenshots

> Add screenshots/GIFs of your Home Page, Dashboard, Job Listings, and Recommendation results here.

| Home Page | Dashboard |
|-----------|-----------|
| _add image_ | _add image_ |

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+)
- [Python](https://www.python.org/) (v3.9+)
- [MongoDB](https://www.mongodb.com/) or MySQL
- npm / yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/hirenova-ai.git
   cd hirenova-ai
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Install AI/ML module dependencies**
   ```bash
   cd ../ai-engine
   pip install -r requirements.txt
   ```

### Environment Variables

Create a `.env` file in the `backend` folder and add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
AI_ENGINE_URL=http://localhost:8000
```

### Running the Project

**Start the backend server**
```bash
cd backend
npm run dev
```

**Start the frontend**
```bash
cd frontend
npm start
```

**Start the AI/ML engine**
```bash
cd ai-engine
python app.py
```

The app should now be running at:
- Frontend → `http://localhost:3000`
- Backend API → `http://localhost:5000`
- AI Engine → `http://localhost:8000`

---

## 📂 Folder Structure

```
hirenova-ai/                # 🌟 Project root
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/ (or context)
│   │   └── App.js
│
├── backend/                 # Node.js + Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
├── ai-engine/                # Python AI/ML services
│   ├── resume_parser.py
│   ├── recommendation_engine.py
│   ├── models/
│   └── app.py
│
├── .env
├── README.md
└── package.json
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint             | Description          |
|--------|----------------------|-----------------------|
| POST   | `/api/auth/register` | Register new user    |
| POST   | `/api/auth/login`    | Login user            |

### Jobs
| Method | Endpoint             | Description              |
|--------|----------------------|---------------------------|
| GET    | `/api/jobs`           | Get all jobs              |
| POST   | `/api/jobs`           | Post a new job (recruiter)|
| GET    | `/api/jobs/:id`       | Get job by ID              |
| GET    | `/api/jobs/recommend` | Get AI-recommended jobs   |

### Applications
| Method | Endpoint                   | Description                  |
|--------|-----------------------------|-------------------------------|
| POST   | `/api/applications`         | Apply to a job                |
| GET    | `/api/applications/user`    | Get user's applications      |
| GET    | `/api/applications/rank`    | Get AI-ranked candidates     |

> Update this table to match your actual API routes.

---

## 🤖 AI/ML Modules

1. **Resume Parser**
   - Extracts structured data (skills, experience, education) from PDF/DOCX resumes using NLP.
2. **Job Recommendation Engine**
   - Uses content-based/collaborative filtering to recommend jobs based on user profile & behavior.
3. **Candidate Ranking System**
   - Scores and ranks applicants for a job posting based on skill-match percentage.
4. **Chatbot (optional)**
   - NLP-powered assistant to guide users through the platform.

---

## 🗺 Roadmap

- [ ] Add resume builder tool
- [ ] Integrate video interview scheduling
- [ ] Add multilingual support
- [ ] Improve recommendation accuracy with deep learning
- [ ] Add mobile app (React Native)
- [ ] Add admin analytics dashboard

---

## 🤝 Contributing

Contributions are always welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

**Anjali Tiwari**
📧 anjali.tiwari.cs27@example.com
🔗 [LinkedIn](https://www.linkedin.com/in/anjali-tiwari-988374285/) 
---

<div align="center">

### ⭐ If you like HireNova AI, give this repo a star — it helps a lot!

**HireNova AI** — *Where Talent Meets Opportunity, Instantly.*

Made with ❤️, ☕, and a lot of `console.log()`

</div>
