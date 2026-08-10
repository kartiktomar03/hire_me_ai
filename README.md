# 🚀 HireMe.AI - Interactive AI Portfolio

Welcome to **HireMe.AI**, a full-stack AI-powered personal portfolio! This project is not just a standard resume website; it features a custom AI agent built to interact with visitors, answer questions about my skills, experience, and projects, and act as a virtual representative.

Built by **Kartik Tomar**, an aspiring B.Tech CSE student and developer passionate about combining web development with artificial intelligence.

## ✨ Features

- **🤖 AI Agent Integration:** A customized backend AI that parses my resume data (`parsed_resume.json`) to answer recruiter queries in real-time.
- **⚡ Fast & Modern Frontend:** Built with React and Vite for a seamless and responsive user interface.
- **⚙️ Robust Backend:** Powered by Python and FastAPI to handle AI requests efficiently.
- **📄 Dynamic Resume Parsing:** Automatically processes and updates the AI's knowledge base whenever a new PDF resume is uploaded.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Python, FastAPI, Uvicorn
- **Deployment:** Vercel (Frontend), Render (Backend) _[Coming Soon]_

## 💻 Local Setup Instructions

Want to run this project locally? Follow these steps:

### 1. Clone the repository

```bash
git clone [https://github.com/kartiktomar03/hire_me_ai.git](https://github.com/kartiktomar03/hire_me_ai.git)
cd hire_me_ai
2. Backend Setup
Navigate to the main directory and activate the virtual environment:

Bash
.\.venv\Scripts\activate
Start the FastAPI server:

Bash
uvicorn backend.main:app --reload
(The backend will run at http://localhost:8000)

3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install dependencies:

Bash
cd frontend
npm install
Start the Vite development server:

Bash
npm run dev
(The frontend will be accessible at http://localhost:5173)

📬 Contact
Feel free to reach out if you have any questions or just want to connect!

Email: kartiktomar3405@gmail.com

GitHub: kartiktomar03
```

