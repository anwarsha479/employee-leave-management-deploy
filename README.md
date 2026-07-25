# Employee Leave Management System

A full-stack **Employee Leave Management System** that streamlines employee leave requests, department management, and employee administration through a secure role-based authentication system.

This project was built using **React.js**, **NestJS**, **PostgreSQL**, and **JWT Authentication**, and is deployed on **Vercel**, **Render**, and **Neon PostgreSQL**.

---

# 🚀 Live Demo

**Frontend**

https://employee-leave-management-deploy-tau.vercel.app

---

# 👤 Demo Credentials

## Admin

**Email:** admin@demo.com

**Password:** Password@123

### Admin Features

- Dashboard
- Department Management
- Employee Management
- Leave Approval & Rejection
- Profile Management

---

## Employee

**Email:** employee@demo.com

**Password:** Password@123

### Employee Features

- Dashboard
- Apply Leave
- View Leave History
- Update Profile
- Change Password
- Forgot Password (OTP)

---

# ✨ Features

## Authentication

- JWT Authentication
- Role-Based Access Control
- Secure Password Hashing using bcrypt
- Forgot Password with OTP Verification
- Password Change

## Admin

- Dashboard
- Department CRUD
- Employee CRUD
- Leave Approval & Rejection
- Profile Management

## Employee

- Apply Leave
- View Leave Status
- Update Profile
- Change Password
- Forgot Password

---

# 🛠 Tech Stack

## Frontend

- React.js
- TypeScript
- Material UI (MUI)
- React Router
- Axios

## Backend

- NestJS
- TypeORM
- JWT
- bcrypt
- Resend Email API

## Database

- PostgreSQL (Neon)

## Deployment

- Frontend → Vercel
- Backend → Render
- Database → Neon PostgreSQL

---

# 📸 Screenshots

## Login Page

![Login](screenshots/Login.png)

---

## Admin Dashboard

![Admin Dashboard](screenshots/Admin-Dashboard.png)

---

## Department Management

![Department Management](screenshots/Department.png)

---

## Employee Management

![Employee Management](screenshots/Employees.png)

---

## Admin Leave Management

![Admin Leave Management](screenshots/Admin-Leave-Management.png)

---

## Employee Dashboard

![Employee Dashboard](screenshots/Employee-Dashboard.png)

---

## Employee Leave Management

![Employee Leave Management](screenshots/Employee-Leave-Management.png)

---

## Profile

![Profile](screenshots/Profile.png)

---

## Forgot Password

![Forgot Password](screenshots/Forgot-Password.png)

---

# 📁 Project Structure

```
employee-leave-management-deploy
│
├── Backend
│   ├── src
│   ├── package.json
│   └── ...
│
├── Frontend
│   ├── src
│   ├── package.json
│   └── ...
│
├── screenshots
│   ├── Login.png
│   ├── Admin-Dashboard.png
│   ├── Department.png
│   ├── Employees.png
│   ├── Admin-Leave-Management.png
│   ├── Employee-Dashboard.png
│   ├── Employee-Leave-Management.png
│   ├── Profile.png
│   └── Forgot-Password.png
│
└── README.md
```

---

# ⚙️ Installation

## Clone the repository

```bash
git clone https://github.com/anwarsha479/employee-leave-management-deploy.git
```

Navigate into the project:

```bash
cd employee-leave-management-deploy
```

---

## Backend Setup

```bash
cd Backend
npm install
npm run start:dev
```

---

## Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

---

# 🔐 Environment Variables

Configure the following environment variables for the backend:

```env
PORT=
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=

RESEND_API_KEY=

USE_KEYCLOAK=

KEYCLOAK_URL=
KEYCLOAK_REALM=
KEYCLOAK_CLIENT_ID=
KEYCLOAK_CLIENT_SECRET=
```

---

# 🔒 Authentication

This project uses:

- JWT Authentication
- Role-Based Authorization
- bcrypt Password Hashing
- OTP-based Password Reset

---

# 🚀 Future Improvements

- Leave Balance Management
- Email Notifications
- Holiday Calendar
- Attendance Management
- Dashboard Analytics
- Employee Search Filters
- File Upload for Leave Documents

---

# 👨‍💻 Author

**Anwarsha K**

GitHub: https://github.com/anwarsha479

---

# ⭐ Support

If you found this project helpful, please consider giving it a **⭐ Star** on GitHub.