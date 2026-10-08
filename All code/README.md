# 🏛️ Associa — Narsingdi District Student Council, MBSTU
### Multi-Page Full-Stack Web Application | University Web Development Lab Final Project

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063.svg?logo=node.js)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-v4.19+-000000.svg?logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%20v8-47a248.svg?logo=mongodb)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT%20%2B%20bcryptjs-blue.svg)](https://jwt.io/)
[![Frontend](https://img.shields.io/badge/Frontend-MPA%20%7C%20HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-f58220.svg)]()

---

## 📌 Project Overview

**Associa (Narsingdi District Student Council, MBSTU)** is an enterprise-grade, multi-page full-stack web application designed for students from Narsingdi district studying at **Mawlana Bhashani Science and Technology University (MBSTU)**.

The application has evolved from a single-page prototype into a modular **Multi-Page Application (MPA)** with comprehensive student registration, secure authentication, dedicated user dashboards, profile management, and a centralized administrative control center.

### 🌟 Key Highlights
- **Multi-Page Architecture (MPA)**: Clean, dedicated HTML pages for landing, directory, announcements, events, authentication, dashboard, profile, and administration.
- **Unified Navigation & Auth State**: Shared navigation bar dynamically adapts across all pages based on JWT authentication status and user roles.
- **General Student Authentication**: Public registration and login with bcrypt password encryption, input validation, and 24-hour JWT token sessions.
- **Protected User Dashboard & Profile**: Personalized student dashboard with profile summary, recent council notices, and profile updating capabilities.
- **Executive Admin Control Center**: Dedicated administrative portal (`admin.html`) featuring tabbed CRUD management for members, notices, events, and registered accounts.
- **RESTful API**: Robust Express.js backend with Mongoose ORM, strict input sanitization, error handling, and role-based access control (RBAC).

---

## 💻 Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Backend Runtime** | Node.js (v18 or higher) |
| **Backend Framework** | Express.js (v4.19+) |
| **Database & ODM** | MongoDB & Mongoose ORM (v8+) |
| **Security & Auth** | JSON Web Tokens (JWT), `bcryptjs` password hashing, Role-Based Access Control |
| **Email & OTP Service** | Nodemailer with Gmail SMTP |
| **Frontend Architecture** | Multi-Page Application (MPA) with shared styles and modular scripts |
| **UI Design System** | Modern Glassmorphism, CSS Custom Properties, CSS Grid, Flexbox, Responsive Design |
| **Frontend Scripting** | Vanilla JavaScript (ES6+, Fetch API, Async/Await, Token Management) |
| **Iconography & Typography** | Lucide Icons, Google Fonts (*Outfit* and *Inter*) |

---

## 📁 Repository Directory Structure

```text
narsingdi-district-student-council/
├── models/
│   ├── User.js              # Mongoose Schema & Model for General Students & Administrators
│   ├── Member.js            # Mongoose Schema & Model for Council Directory members
│   ├── Notice.js            # Mongoose Schema & Model for Announcements & News notices
│   └── Event.js             # Mongoose Schema & Model for Council Programs & Events
├── assets/
│   ├── images/              # Council logos, advisor photos, event imagery
│   └── icons/               # SVG vectors and council branding
├── .env                     # Local environment variables (Port, Mongo URI, JWT secret, Admin)
├── .env.example             # Template for required environment variables
├── .gitignore               # Excludes node_modules, .env, and local logs
├── package.json             # Node dependencies and lifecycle scripts
├── README.md                # Project documentation and user guide
├── server.js                # Express app entry point, DB seeding & REST API routes
├── style.css                # Global stylesheet with Glassmorphism UI design system
│
├── auth.js                  # Shared Auth & Dynamic Navigation helper for all MPA pages
│
├── index.html               # Public Landing Page & Council Overview
├── script.js                # Landing page dynamic rendering and interactions
│
├── members.html             # Dedicated Member Directory page
├── members.js               # Member filtering, live search, and admin controls
│
├── notices.html             # Dedicated Notices & Announcements page
├── notices.js               # Notice category filtering, details modal reader
│
├── events.html              # Dedicated Events Calendar page
├── events.js                # Upcoming & Past tabs, event modals
│
├── login.html               # General User & Admin Sign-In page
├── register.html            # General Student Registration page
├── dashboard.html           # Protected User Dashboard
├── dashboard.js             # Dashboard statistics, recent notices widget, sign out
│
├── profile.html             # Protected User Profile viewer & editor
├── profile.js               # Profile form loader, validator, and PUT updates
│
├── admin.html               # Protected Executive Admin Portal (Admin role only)
└── admin.js                 # Admin tabbed CRUD center for members, notices, events, users
```

---

## 📄 Application Pages (MPA)

### 1. `index.html` (Landing & Home)
- Public portal showcasing council identity, leadership message, executive committee, advisor board, gallery, quick stats, and contact office.
- Features direct action buttons to dedicated Member, Notice, and Event subpages.
- Integrates the shared navigation bar that reflects live authentication state.

### 2. `members.html` (Member Directory)
- Full council directory with multi-parameter search (name, phone) and filters (Upazila, Department, Academic Session).
- Click-to-call and WhatsApp instant chat action buttons for all council members.
- Displays admin control bar to add new members directly if logged in as an administrator.

### 3. `notices.html` (Notices & Announcements)
- Filterable announcements by categories: `ALL`, `NOTICE`, `NEWS`, `EVENT`.
- Full-text interactive modal reader with category badges and publish timestamps.
- Admin button to publish official notices directly to the board.

### 4. `events.html` (Events Calendar)
- Interactive tabbed view: **Upcoming Events** and **Completed / Past Programs**.
- Event cards with date badges, venue locations, and detailed program summaries.
- Admin button to schedule and create new events with date pickers.

### 5. `register.html` (Student Registration)
- Comprehensive registration form for MBSTU students from Narsingdi district.
- Captures Full Name, Email, Password, Department, Session, Upazila, Phone, and WhatsApp.
- Validates password length (min 6 chars), matching passwords, and unique email addresses.
- Auto-redirects to `login.html` upon successful account creation.

### 6. `login.html` (Sign In)
- Single entry point for both general students and council administrators.
- Password visibility toggle (`eye` / `eye-off`).
- Stores JWT token and user profile in `localStorage`.
- Intelligently redirects administrators to `admin.html`, general users to `dashboard.html`, or to a previously requested protected URL.

### 7. `dashboard.html` (Protected Student Dashboard)
- Route guard: Automatically redirects unauthenticated visitors to `login.html`.
- Welcome banner with student avatar initials, academic meta, and role badge.
- Quick link cards to Profile, Members Directory, Events Calendar, and Notice Board.
- Personal information card displaying department, session, upazila, contact number, and joined date.
- Real-time widget fetching the latest 3 announcements from the database.

### 8. `profile.html` (Protected Profile Management)
- Route guard: Restricts access to authenticated users.
- Live view of current account details with an editable profile form.
- Allows students to update their Name, Department, Academic Session, Upazila, Phone, WhatsApp, and Profile Picture URL.
- Keeps email, password, and security role protected against unauthorized tampering.

### 9. `admin.html` (Protected Admin Portal)
- Strict route guard: Requires both valid authentication AND `admin` / `superadmin` role (redirects general users to `dashboard.html`).
- Executive metric counters: Total Members, Published Notices, Active Events, Registered Accounts.
- Tabbed management console:
  - **Members Directory**: Searchable table with delete actions and Add Member modal.
  - **Notices & News**: Manage published notices with live deletion and Add Notice modal.
  - **Events Calendar**: Review upcoming/past events and schedule new ones.
  - **Registered Accounts**: Overview of all signed-up user accounts with role indicators and registration dates.

---

## 📡 REST API Documentation

Base URL: `http://localhost:5000`

### 🔐 1. General User Authentication Routes
| Method | Endpoint | Access Level | Description | Payload |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/users/register` | Public | Registers a new student account | `{ name, email, password, department, session, upazila, phone, whatsapp }` |
| `POST` | `/api/users/login` | Public | Authenticates user/admin with email & password; returns 24h JWT token | `{ email, password }` |
| `GET` | `/api/users/me` | Protected (User/Admin JWT) | Returns profile of current authenticated user | Header: `Authorization: Bearer <token>` |
| `PUT` | `/api/users/me` | Protected (User/Admin JWT) | Updates user profile information (name, dept, session, upazila, phone, whatsapp, pic) | Profile update fields |
| `GET` | `/api/users` | Protected (Admin only) | Returns list of all registered student accounts | Header: `Authorization: Bearer <token>` |

### 🛡️ 2. Legacy / Admin Auth Routes
| Method | Endpoint | Access Level | Description | Payload |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Admin login with username/email and password | `{ username, password }` |
| `GET` | `/api/auth/verify` | Protected (JWT) | Validates active token & returns admin user info | Header: `Authorization: Bearer <token>` |

### 👥 3. Member Directory Routes
| Method | Endpoint | Access Level | Description | Query / Payload |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/members` | Public | Returns all council members (supports filters) | `?upazila=...&department=...&search=...` |
| `POST` | `/api/members` | Protected (Admin) | Adds a new member to the directory | `{ name, department, session, upazila, phone, whatsapp }` |
| `PUT` | `/api/members/:id` | Protected (Admin) | Updates an existing member record | Full or partial member payload |
| `DELETE` | `/api/members/:id` | Protected (Admin) | Deletes a member record from MongoDB | URL param: `id` |

### 📢 4. Notices & Announcements Routes
| Method | Endpoint | Access Level | Description | Query / Payload |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/notices` | Public | Retrieves all active notices | `?category=NOTICE` / `?category=NEWS` |
| `POST` | `/api/notices` | Protected (Admin) | Publishes a new announcement | `{ title, category, date, content }` |
| `DELETE` | `/api/notices/:id` | Protected (Admin) | Deletes a notice by ID | URL param: `id` |

### 📅 5. Events Calendar Routes
| Method | Endpoint | Access Level | Description | Query / Payload |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Public | Retrieves council events list | `?type=Upcoming` / `?type=Completed` |
| `POST` | `/api/events` | Protected (Admin) | Schedules a new event | `{ title, type, date, location, description }` |
| `DELETE` | `/api/events/:id` | Protected (Admin) | Deletes an event by ID | URL param: `id` |

### ✉️ 6. Contact & OTP Verification Routes
| Method | Endpoint | Access Level | Description | Payload |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/send-otp` | Public | Sends a 6-digit OTP code to the sender's email | `{ name, email, subject, message }` |
| `POST` | `/submit-message` | Public | Verifies the OTP and delivers the message to council inbox | `{ name, email, subject, message, otp }` |

---

## ⚙️ Environment Variables Setup

Ensure a `.env` file exists in the root directory (based on `.env.example`):

```bash
# Server Port
PORT=5000

# MongoDB Database Connection String
MONGO_URI=mongodb://127.0.0.1:27017/ndsc_db
# Or MongoDB Atlas:
# MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/ndsc_db?retryWrites=true&w=majority

# JWT Secret Key
JWT_SECRET=ndsc_super_secret_jwt_key_2026_mbstu

# Default Administrator Credentials (Auto-seeded if no admin exists)
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@ndsc.mbstu.ac.bd

# Gmail SMTP for OTP service
EMAIL_APP_PASSWORD=your_16_char_app_password
```

---

## 🚀 How to Run & Test the Application

### 1. Start the Server
In PowerShell or Terminal:
```bash
npm install
npm start
```
The server will start on `http://localhost:5000` and automatically connect to MongoDB. If the database is new, it seeds default admin credentials and initial members, notices, and events.

---

### 2. Step-by-Step Feature Testing Guide

#### Test A: Public Multi-Page Navigation
1. Open `http://localhost:5000` in your browser.
2. Verify the navbar displays: **Home**, **Members**, **Notices**, **Events**, and **Login / Register** buttons.
3. Click **Members** &rarr; verify navigation to `members.html` with working search and Upazila filters.
4. Click **Notices** &rarr; verify navigation to `notices.html` and click on any notice card to open the details modal.
5. Click **Events** &rarr; verify navigation to `events.html` and toggle between *Upcoming* and *Completed* tabs.

#### Test B: General Student Registration
1. Click **Register** in the navbar (or visit `http://localhost:5000/register.html`).
2. Fill out the registration form:
   - Full Name: `Rakibul Hasan`
   - Email: `rakib@mbstu.ac.bd`
   - Department: `CSE`
   - Session: `2021-2022`
   - Native Upazila: `Shibpur`
   - Mobile: `01700112233`
   - WhatsApp: `01700112233`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click **Create Member Account**.
4. Verify success banner displays and you are redirected to `login.html?registered=true`.

#### Test C: User Login & Session Persistence
1. On `login.html`, enter:
   - Email: `rakib@mbstu.ac.bd`
   - Password: `password123`
2. Click **Sign In to Account**.
3. Verify successful redirection to `dashboard.html`.
4. Observe the navbar: It now dynamically shows **Dashboard**, the user's name badge, and a **Logout** button (instead of Login/Register).

#### Test D: User Dashboard & Profile Editing
1. In `dashboard.html`, verify your welcome greeting, department, session, native upazila, and recent announcements widget.
2. Click **View Full Profile** (or visit `profile.html`).
3. Change Department to `ICT` and update Phone number.
4. Click **Save Changes**. Verify the green success notification appears and the new details persist upon page refresh.

#### Test E: Route Protection & Security Guards
1. Log out using the **Logout** button.
2. Attempt to manually navigate to `http://localhost:5000/dashboard.html` or `http://localhost:5000/profile.html`.
3. Verify immediate redirection back to `login.html?redirect=...`.
4. Log back in as a general user, then attempt to open `http://localhost:5000/admin.html`.
5. Verify access is denied and you are redirected to `dashboard.html`.

#### Test F: Administrative Control Center
1. Sign out and log in with administrator credentials:
   - Username/Email: `admin` (or `admin@ndsc.mbstu.ac.bd`)
   - Password: `admin123`
2. You will be redirected to `admin.html`.
3. Observe the admin navbar containing the gold **Admin Portal** link.
4. On `admin.html`:
   - Check the metric counters (Members, Notices, Events, Registered Accounts).
   - Switch between the tabs: **Members Directory**, **Notices & News**, **Events Calendar**, and **Registered Accounts**.
   - Under **Registered Accounts**, locate the recently registered student (`Rakibul Hasan`).
   - Click **+ Add Member** under Members Directory, fill in sample details, submit, and verify the record is added to the table.
   - Click the red **Delete** button next to a test record and confirm deletion.
5. Visit `members.html`, `notices.html`, or `events.html` while logged in as admin &rarr; observe that the administrative action buttons (`+ Add Member`, `+ Publish Announcement`, `+ Create Event`) are visible on each page!

---

## 🎓 University Web Development Lab Project Information

- **Course**: Web Application Development Lab Final
- **Institution**: Mawlana Bhashani Science and Technology University (MBSTU)
- **Organization Represented**: Narsingdi District Student Council, MBSTU
- **Developer**: Monirojjaman Ayoive (Dept. of Information and Communication Technology - ICT)
- **Session**: 2022-2023
- **Role**: General Member & Full-Stack Web Developer

---

© 2026 **Narsingdi District Student Council (NDSC), MBSTU**. All rights reserved.
