# School ERP - Online Examination Engine (MERN Stack)

A production-grade, full-stack ** ERP Online Examination Engine** built with MongoDB, Express.js, React, Node.js, Tailwind CSS, and JWT authentication. Engineered as a robust college-level examination management platform with 100% server-side evaluation, dynamic countdown timer synchronization, student question randomization, real-time auto-saving, and role-based access control.

---

## 🌟 Key Features

### 1. 🛡️ Role-Based Access Control (RBAC)
- **Admin**: Full oversight over users, subjects, examinations, question banks, student attempts, and institutional analytics.
- **Teacher**: Author examinations, configure scoring rules, build questions (MCQs and True/False), publish exams, and inspect student attempts.
- **Student**: Portal for available tests, distraction-free exam taking viewport, timer synchronization, answer review, and historical performance tracking.

### 2. ⚡ Secure Examination Engine
- **Zero Correct Answer Leakage**: Correct answers and solution explanations are completely stripped from question objects sent to students during active exam sessions.
- **Deterministic Question Shuffling**: When an attempt starts, a randomized question sequence is generated once and stored in `ExamAttempt.questionOrder`. Page refreshes maintain the exact question order and selection states.
- **Server-Synced Countdown Timer**: Remaining time is calculated using `startedAt` and exam duration on the backend, preventing client-side timer manipulation.
- **Real-Time Answer Auto-Saving**: Choices and "Mark for Review" flags are persisted incrementally to MongoDB.
- **Automatic Submission on Expiry**: When the exam timer reaches zero, the server automatically finalizes and grades the attempt (`AUTO_SUBMITTED`).
- **100% Server-Side Evaluation**: Grades are computed strictly against database questions with support for positive marks, negative marking deductions, and pass/fail thresholds.

### 3. 📊 Analytics & Reporting
- Comprehensive KPI scorecards (Total Students, Teachers, Exams, Attempts, Pass Rates, Average Scores).
- Question-by-question post-submission review with correct answers, student choices, and explanations.

---

## 🏗️ Architecture & Technology Stack

```
                    ┌─────────────────────────────────────────┐
                    │          React Frontend (Vite)          │
                    │  - React Router (Role Protected Routes) │
                    │  - Auth Context & Axios Interceptors    │
                    │  - Tailwind CSS + Lucide Icons          │
                    │  - TakeExam Engine + Sync Timer         │
                    └────────────────────┬────────────────────┘
                                         │ HTTPS / JSON REST
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │           Express.js Backend            │
                    │  - JWT Authentication Middleware        │
                    │  - Role Middleware (Admin/Teacher/Stu)  │
                    │  - Centralized Error Handling           │
                    │  - Controller / Service Architecture    │
                    └─────────┬───────────────────┬───────────┘
                              │                   │
                     ┌────────┴────────┐ ┌────────┴────────┐
                     │ Server-Side     │ │ MongoDB Data    │
                     │ Evaluation &    │ │ Persistence     │
                     │ Timer Sync      │ │ (Mongoose ODM)  │
                     └─────────────────┘ └─────────────────┘
```

- **Frontend**: React 18, Vite, React Router 6, Axios, Tailwind CSS, Lucide Icons, Context API
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JSON Web Tokens (JWT), BcryptJS, CORS, Dotenv

---

## 📁 Project Structure

```
online-examination-engine/
│
├── client/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Timer.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   ├── QuestionNavigator.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Toast.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Exams.jsx
│   │   │   ├── CreateExam.jsx
│   │   │   ├── EditExam.jsx
│   │   │   ├── QuestionManager.jsx
│   │   │   ├── TakeExam.jsx
│   │   │   ├── ExamResult.jsx
│   │   │   ├── Results.jsx
│   │   │   ├── Subjects.jsx
│   │   │   └── Profile.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
└── server/
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── User.js
    │   ├── Subject.js
    │   ├── Exam.js
    │   ├── Question.js
    │   └── ExamAttempt.js
    ├── controllers/
    │   ├── authController.js
    │   ├── subjectController.js
    │   ├── examController.js
    │   ├── questionController.js
    │   ├── attemptController.js
    │   └── dashboardController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── subjectRoutes.js
    │   ├── examRoutes.js
    │   ├── questionRoutes.js
    │   ├── attemptRoutes.js
    │   └── dashboardRoutes.js
    ├── middleware/
    │   ├── auth.js
    │   ├── role.js
    │   └── errorHandler.js
    ├── utils/
    │   ├── generateToken.js
    │   ├── shuffle.js
    │   └── evaluation.js
    ├── seed/
    │   └── seed.js
    ├── .env.example
    ├── package.json
    └── server.js
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or higher)
- [MongoDB](https://www.mongodb.com/) (running locally on port 27017 or a MongoDB Atlas URI)

---

### 2. Backend Setup

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd online-examination-engine/server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (a `.env` file with defaults is already created):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/online_examination_engine
   JWT_SECRET=super_secret_jwt_key_school_erp_exam_engine_2026
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```
4. Seed the database with subjects, demo users, and full exams with questions:
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   Backend runs at: `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd online-examination-engine/client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Frontend runs at: `http://localhost:5173`

---

## 🔑 Demo Login Credentials

You can use the one-click autofill buttons on the login screen or enter these credentials manually:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@erp.com` | `Admin@123` | Full access across subjects, exams, attempts, analytics |
| **Teacher** | `teacher@erp.com` | `Teacher@123` | Exam authoring, question management, student results |
| **Student 1** | `student1@erp.com` | `Student@123` | Take tests, view real-time timer, review evaluated results |
| **Student 2** | `student2@erp.com` | `Student@123` | Standard student access |
| **Student 3** | `student3@erp.com` | `Student@123` | Standard student access |
| **Student 4** | `student4@erp.com` | `Student@123` | Standard student access |
| **Student 5** | `student5@erp.com` | `Student@123` | Standard student access |

---

## 📚 Seeded Academic Examinations

The seed script creates 3 comprehensive exams with 10 questions each:
1. **Introduction to Computer Science & Algorithms Exam** (`CS101`)
   - 10 Questions (MCQs & True/False), 30 Mins, 20 Total Marks, Negative Marking: -0.5.
2. **Full Stack Web Development & React Exam** (`WEB201`)
   - 10 Questions (MCQs & True/False), 25 Mins, 20 Total Marks, No Negative Penalty.
3. **Relational Databases & SQL Mastery Test** (`DBMS301`)
   - 10 Questions (MCQs & True/False), 30 Mins, 20 Total Marks, Negative Marking: -0.5.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new user (`name`, `email`, `password`, `role`).
- `POST /api/auth/login`: Authenticate and return JWT token + user profile.
- `GET /api/auth/me`: Get current authenticated user profile.

### Subjects (`/api/subjects`)
- `GET /api/subjects`: List all subjects.
- `POST /api/subjects`: Create subject (Admin only).
- `GET /api/subjects/:id`: Get single subject.
- `PUT /api/subjects/:id`: Update subject (Admin only).
- `DELETE /api/subjects/:id`: Delete subject (Admin only).

### Exams (`/api/exams`)
- `GET /api/exams`: List exams (filtered by role & status).
- `GET /api/exams/:id`: Get exam details with question count.
- `POST /api/exams`: Create exam draft (Admin & Teacher).
- `PUT /api/exams/:id`: Update exam configuration (Admin or Owner).
- `DELETE /api/exams/:id`: Delete exam and associated questions (Admin or Owner).
- `POST /api/exams/:id/publish`: Publish exam to make it accessible to students.

### Questions (`/api/questions`)
- `GET /api/questions/exam/:examId`: Get questions for an exam (Admin & Teacher).
- `POST /api/questions`: Create question (MCQ or TRUE_FALSE).
- `PUT /api/questions/:id`: Update question.
- `DELETE /api/questions/:id`: Delete question.

### Exam Attempt & Engine (`/api/attempts`)
- `POST /api/attempts/start`: Initialize or resume an attempt. Returns sanitized questions without `correctAnswer` + `remainingSeconds`.
- `PUT /api/attempts/:id/answer`: Auto-save an answer selection and review flag.
- `POST /api/attempts/:id/submit`: Manually submit and trigger server-side evaluation.
- `POST /api/attempts/:id/auto-submit`: Auto-submit triggered upon timer expiry.
- `GET /api/attempts/:id`: Get detailed result breakdown with answers and explanations.
- `GET /api/attempts/my-results`: Get logged-in student's completed results history.
- `GET /api/attempts/exam/:examId`: Get all candidate submissions for an exam (Teacher/Admin).

### Dashboard Analytics (`/api/dashboard`)
- `GET /api/dashboard/stats`: Returns role-tailored performance KPIs and recent activity.

---

## 🧪 Running Integration Tests

To run the automated backend and exam engine integration test:
```bash
cd online-examination-engine/server
node test-integration.js
```
This tests:
1. Server health check
2. Admin authentication
3. Student authentication
4. Fetching published exams
5. Starting attempt and validating zero leak of correct answers
6. Auto-saving answers for 10 questions
7. Evaluating submission and calculating score with negative marking
8. Reviewing graded breakdown
9. Admin & student dashboard KPI statistics

---

## 🔮 Future Enhancements
- Question Bank repository with difficulty tags (Easy, Medium, Hard).
- Webcam-based online proctoring and tab-switch monitoring.
- Section-wise timed examinations.
- PDF generation and automated certificate downloads for passing students.
