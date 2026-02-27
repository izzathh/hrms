# HRMS Lite 🏢

A lightweight Human Resource Management System built with FastAPI, React (Vite), and MongoDB.

## Live Demo
- **Frontend**: https://hrms-iota-one.vercel.app (Takes 1 minute to load on initial render because of Render.com's Free Tier nature)
- **Backend API**: https://hrms-backend-lk26.onrender.com
- **API Docs**: `<backend-url>/docs` (Swagger UI)

🔴 Render Free Tier Notice: The backend sleeps after 15 min inactivity. First request after sleep takes ~1 min to wake up—wait a bit for faster subsequent responses!

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Axios, Lucide React |
| Backend | FastAPI (Python), Motor (async MongoDB driver) |
| Database | MongoDB Atlas (cloud) |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## Features

### Core
- **Employee Management** — Add, view, and delete employees with full server-side and client-side validation
- **Attendance Tracking** — Mark daily attendance (Present / Absent) per employee
- **Attendance History** — Per-employee records with date filtering and live dynamic updates (no page refresh needed)

### Bonus
- **Dashboard** — Total employee count, today's present / absent / not-marked stats
- **Department Breakdown** — Visual bar chart of employees per department
- **Attendance Rate** — Circular gauge showing today's attendance percentage
- **Total Present Days** — Shown per employee in the attendance detail panel
- **Dark / Light Mode** — Theme toggle in the topbar, persisted across sessions via localStorage

---

## Project Structure

```
hrms-lite/
├── hrms-backend/
│   ├── main.py              # FastAPI app with all routes and validation
│   ├── requirements.txt
│   ├── .env.example
│   ├── Procfile             # For Render deployment
│   └── render.yaml
│
└── hrms-frontend/
    ├── public/              # Static assets
    ├── src/
    │   ├── api/
    │   │   └── index.js     # Axios API calls
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Employees.jsx
    │   │   └── Attendance.jsx
    │   ├── App.jsx          # Router + layout + theme context
    │   ├── index.js         # Entry point
    │   └── index.css        # Global design system (dark + light themes)
    ├── vite.config.js
    ├── index.html
    ├── package.json
    ├── vercel.json
    └── .env.example
```

---

## Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Atlas account (free tier) OR local MongoDB

---

### Backend Setup

```bash
cd hrms-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env and set your MONGO_URL

# Run development server
uvicorn main:app --reload --port 8000
```

Backend will be available at: `http://localhost:8000`  
Swagger docs at: `http://localhost:8000/docs`

---

### Frontend Setup

```bash
cd hrms-frontend

# Install dependencies
npm install

# Set environment variable
cp .env.example .env
# Edit .env:
# VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

Frontend will open at: `http://localhost:3000`

> Vite starts in ~300ms compared to Create React App's 30+ second startup.

---

## Environment Variables

### Backend (`.env`)
```
MONGO_URL=mongodb+srv://<username>:<password>@hrms.ycqxigx.mongodb.net/?appName=HRMS
DB_NAME=HRMS
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:8000
```

> Note: Vite requires the `VITE_` prefix instead of `REACT_APP_`. Variables are accessed via `import.meta.env.VITE_API_URL`.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| POST | `/api/employees` | Create new employee |
| DELETE | `/api/employees/{employee_id}` | Delete employee + their attendance |
| POST | `/api/attendance` | Mark or update attendance |
| GET | `/api/attendance/{employee_id}` | Get attendance records for an employee |
| GET | `/api/attendance?date=YYYY-MM-DD` | Get all attendance (optional date filter) |
| GET | `/api/dashboard` | Get dashboard summary stats |

---

## Deployment Guide

### Step 1 — MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) → Sign Up / Log In
2. Create a **Free Cluster** (M0 Sandbox)
3. Under **Database Access** → Add a user with a password
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all)
5. Click **Connect** → **Drivers(Python)** → Copy the connection string
   - Replace `<username>` & `<password>` with your user's credentials
   - Example: `mongodb+srv://<username>:<password>@hrms.ycqxigx.mongodb.net/?appName=HRMS`

---

### Step 2 — Deploy Backend to Render

1. Go to [render.com](https://render.com) → Sign Up / Log In
2. Click **New** → **Web Service**
3. Connect your GitHub repo and select it
4. Configure:
   - **Name**: `hrms-lite-api`
   - **Root Directory**: `hrms-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add **Environment Variables**:
   - `MONGO_URL` → your MongoDB Atlas connection string
   - `DB_NAME` → `HRMS`
6. Click **Create Web Service**
7. Wait ~2 minutes. Copy the live URL: `https://hrms-lite-api.onrender.com`

> **Note**: Free tier Render services spin down after inactivity. The first request after a period of inactivity may take ~30 seconds (cold start).

---

### Step 3 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → Sign Up / Log In
2. Click **Add New** → **Project**
3. Import your GitHub repo
4. Configure:
   - **Root Directory**: `hrms-frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add **Environment Variable**:
   - `VITE_API_URL` → your Render backend URL (e.g. `https://hrms-lite-api.onrender.com`)
6. Click **Deploy**
7. Your app will be live at: `https://hrms-lite-xxx.vercel.app`

---

### Step 4 — Verify Deployment

1. Open your Vercel URL
2. Go to **Employees** → Add a test employee
3. Go to **Attendance** → Mark attendance for that employee — the table should update instantly without a page refresh
4. Go to **Dashboard** → Confirm all stats reflect correctly
5. Toggle the **dark / light mode** button in the topbar
6. Visit `<backend-url>/docs` to test the API directly via Swagger UI

---

## Assumptions & Limitations

- **No authentication** — single admin user, no login required (as per spec)
- **No leave / payroll** — out of scope per requirements
- **Attendance upsert** — marking attendance for the same employee + date updates the existing record rather than creating a duplicate
- **Department list** is pre-defined in the frontend (Engineering, Product, Design, etc.)
- **Free tier Render** spins down after 15 minutes of inactivity — cold start may take ~30 seconds

---

## Validation Rules

### Employee
- `employee_id` — required, unique across all employees
- `email` — required, valid format, unique across all employees
- `full_name` — required
- `department` — required

### Attendance
- `employee_id` — must reference an existing employee
- `date` — required, must be in `YYYY-MM-DD` format
- `status` — must be exactly `Present` or `Absent`

---

## Design System

| Property | Value |
|----------|-------|
| Heading font | Outfit (Google Fonts) |
| Body font | Plus Jakarta Sans (Google Fonts) |
| Themes | Dark (default) + Light — toggled via topbar button, saved in localStorage |
| Icons | Lucide React (replaces all emoji icons) |
| Color system | CSS custom properties with full dark/light variable sets |
| UI states | Loading spinners, empty states, error alerts, success toasts |
| Layout | Fixed sidebar + scrollable main content |

---