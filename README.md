# Nexora

> **AI-Powered Enterprise Operations & Intelligence Platform**

Nexora is a full-stack enterprise operations and intelligence platform designed to help organizations manage workspaces, users, activity, audit logs, analytics, and data-driven operational insights from a centralized interface.

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Shubhampanwar20/nexora)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 📌 Overview

Nexora provides a centralized workspace for managing enterprise operations and understanding organizational activity.

The platform currently includes:

- Secure authentication
- Role-based access control
- Organization and workspace management
- User management
- Executive dashboard
- AI-powered operational insights
- Activity analytics
- Audit logging
- Workspace-specific settings
- Organization-level data isolation

The project follows a modular full-stack architecture designed to support additional enterprise capabilities over time.

---

## ✨ Key Features

### 🔐 Authentication & Authorization

- JWT-based authentication
- Secure password hashing
- Role-based access control (RBAC)
- Admin and Member roles
- Protected API endpoints
- Organization-level authorization
- Role-aware frontend navigation

### 🏢 Organization & Workspace Management

- Create and manage organizations
- Organization-based workspace selection
- Organization-specific users and activity
- Admin-only organization management
- Workspace-level data isolation
- Organization-aware dashboard, analytics, and insights

### 👥 User Management

- Create users within an organization
- View organization users
- View individual user details
- Track active users
- Organization-level user isolation
- Admin-only user management

### 📊 Executive Dashboard

The Nexora dashboard provides a high-level view of workspace operations.

It includes:

- Total users
- Active users
- Audit events
- AI insight count
- System health
- Recent activity
- Selected workspace context

### 🤖 AI-Powered Operational Insights

Nexora generates data-driven operational insights from organization activity.

The insight engine analyzes:

- Total users
- Active users
- Audit events
- Recent activity
- Previous-period activity
- Active-user rate
- Most common audit action

Insights are generated for the selected organization and displayed through the dedicated **AI Insights** interface.

> **Note:** The current insight engine is data-driven and rule-based. ML-based anomaly detection and more advanced intelligence capabilities are planned for future development.

### 📈 Analytics

Nexora provides organization-level activity analytics, including:

- Daily activity trends
- Audit-event counts
- Workspace-specific analytics
- Configurable analysis periods
- Activity trend visualization
- Analysis periods from 7 to 90 days

### 📋 Audit Logs

Nexora records important operational events such as authentication and administrative activity.

Audit logs are:

- Organization-scoped
- Admin-accessible
- Available through the REST API
- Integrated with operational monitoring workflows

### ⚙️ Workspace Settings

Settings are maintained independently for each organization.

Available preferences include:

- Notifications
- Activity alerts
- Security alerts
- Unsaved-change detection
- Persistent browser-based preferences
- Save-state feedback

---

## 🔑 Role-Based Access Control

Nexora uses role-based authorization to control access to administrative and workspace functionality.

| Feature | Admin | Member |
|---|:---:|:---:|
| Dashboard | ✅ | ✅ |
| AI Insights | ✅ | ✅ |
| Analytics | ✅ | ✅ |
| Settings | ✅ | ✅ |
| Organizations | ✅ | ❌ |
| Users | ✅ | ❌ |
| Audit Logs | ✅ | ❌ |
| Create Users | ✅ | ❌ |
| Create Organizations | ✅ | ❌ |

Members are restricted to their assigned organization, while administrators can manage and switch between authorized workspaces.

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────────┐
                         │       Nexora Web UI      │
                         │   React + TypeScript     │
                         │          + Vite          │
                         └────────────┬─────────────┘
                                      │
                                   /api/*
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │       FastAPI API        │
                         │         Backend          │
                         └────────────┬─────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
      ┌────────────────┐    ┌────────────────┐     ┌────────────────┐
      │ Authentication │    │ Business Logic │     │ Analytics &    │
      │     & RBAC     │    │ & Organizations│     │  AI Insights   │
      └────────────────┘    └────────┬───────┘     └────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │   PostgreSQL     │
                            │     Database     │
                            └──────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

- **React**
- **TypeScript**
- **Vite**
- **React Router**
- **Recharts**
- **CSS**

### Backend

- **Python 3.11**
- **FastAPI**
- **SQLAlchemy**
- **Alembic**
- **Pydantic**
- **JWT Authentication**

### Database

- **PostgreSQL**

### Development Tools

- **Git**
- **GitHub**
- **VS Code**
- **npm**
- **Python Virtual Environment**

---

## 📁 Project Structure

```text
nexora/
│
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   ├── env.py
│   │   ├── README
│   │   └── script.py.mako
│   │
│   ├── app/
│   │   ├── api/
│   │   │   ├── analytics.py
│   │   │   ├── audit_logs.py
│   │   │   ├── auth.py
│   │   │   ├── auth_dependencies.py
│   │   │   ├── dashboard.py
│   │   │   ├── dependencies.py
│   │   │   ├── insights.py
│   │   │   ├── organizations.py
│   │   │   └── users.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── tokens.py
│   │   │
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── dependencies.py
│   │   │   └── session.py
│   │   │
│   │   ├── middleware/
│   │   ├── models/
│   │   │   ├── audit_log.py
│   │   │   ├── organization.py
│   │   │   └── user.py
│   │   │
│   │   ├── repositories/
│   │   │   ├── audit_log.py
│   │   │   ├── organization.py
│   │   │   └── user.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── analytics.py
│   │   │   ├── audit_log.py
│   │   │   ├── auth.py
│   │   │   ├── dashboard.py
│   │   │   ├── insights.py
│   │   │   ├── organization.py
│   │   │   └── user.py
│   │   │
│   │   ├── services/
│   │   │   ├── analytics.py
│   │   │   ├── audit_log.py
│   │   │   ├── auth.py
│   │   │   ├── dashboard.py
│   │   │   ├── insights.py
│   │   │   ├── organization.py
│   │   │   └── user.py
│   │   │
│   │   ├── utils/
│   │   └── workers/
│   │
│   ├── alembic.ini
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── tsconfig.app.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

Nexora exposes REST API endpoints for authentication, organizations, users, dashboard data, audit logs, analytics, and operational insights.

### Authentication

```http
POST /auth/login
```

### Organizations

```http
GET /organizations
POST /organizations
```

### Users

```http
GET /users
POST /users
GET /users/me
GET /users/{user_id}
```

### Dashboard

```http
GET /dashboard/summary
```

### Audit Logs

```http
GET /audit-logs
```

### Analytics

```http
GET /analytics/activity
```

### AI Insights

```http
GET /insights
```

Interactive API documentation is available through FastAPI Swagger UI during local development.

---

## 🔒 Security

Nexora implements application-level security controls including:

- JWT-based authentication
- Password hashing
- Role-based authorization
- Protected administrative endpoints
- Organization-level data isolation
- Environment-based configuration
- Secrets excluded from version control

Sensitive configuration values should be stored in a local `.env` file and should never be committed to Git.

A safe configuration template is provided in:

```text
.env.example
```

---

## 🗄️ Database & Migrations

Nexora uses **PostgreSQL** for persistent application data.

Database schema changes are managed through **Alembic migrations**.

Apply the latest migrations with:

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

---

## 🚀 Local Development

### Prerequisites

Make sure the following are installed:

- Python 3.11+
- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Shubhampanwar20/nexora.git
cd nexora
```

### 2. Backend Setup

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Configure the required environment variables in:

```text
backend/.env
```

Use `.env.example` as the configuration template.

### 3. Database Setup

Create a PostgreSQL database named:

```text
nexora
```

Then apply the database migrations:

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

### 4. Start the Backend

From the `backend` directory:

```bash
python -m uvicorn app.main:app --reload --reload-dir app
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

### 5. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

The Vite development server proxies `/api` requests to the FastAPI backend.

---

## 🧪 Validation & Build

### Backend Compilation

```bash
cd backend
source .venv/bin/activate
python -m compileall app
```

### Frontend TypeScript Check

```bash
cd frontend
npx tsc -b --pretty false
```

### Frontend Production Build

```bash
cd frontend
npm run build
```

---

## 📊 Current Implementation

Nexora currently provides a working full-stack foundation containing:

- JWT authentication
- Role-based authorization
- Admin and Member access levels
- Organization management
- User management
- Organization-level data isolation
- Executive dashboard
- Audit logging
- Activity analytics
- Data-driven AI insights
- Workspace-specific settings
- REST API
- PostgreSQL persistence
- Alembic database migrations
- React + TypeScript frontend
- FastAPI backend

---

## 🎯 Project Goals

Nexora is designed around four primary goals:

### 1. Centralize Enterprise Operations

Provide a single workspace for managing organizations, users, and operational activity.

### 2. Improve Operational Visibility

Surface meaningful activity through dashboards, analytics, and audit logs.

### 3. Apply Intelligent Insights

Transform operational data into actionable, data-driven insights.

### 4. Maintain Secure Workspace Isolation

Ensure users access only the organizations and functionality permitted by their role.

---

## 🔮 Roadmap

Future improvements may include:

- [ ] Real-time notifications
- [ ] Advanced analytics dashboards
- [ ] ML-based anomaly detection
- [ ] Automated report generation
- [ ] Background job processing
- [ ] Advanced organization administration
- [ ] Expanded automated test coverage
- [ ] CI/CD automation
- [ ] Production deployment configuration
- [ ] Additional enterprise integrations

---

## 📸 Screenshots

Screenshots can be added here as the project presentation is expanded.

Example:

```markdown
![Nexora Dashboard](docs/screenshots/dashboard.png)
```

---

## 🤝 Contributing

This project is currently maintained as a personal portfolio and development project.

Suggestions, improvements, and technical feedback are welcome.

---

## 👨‍💻 Author

### Shubham Panwar

**BCA — Artificial Intelligence & Data Science**

- GitHub: [Shubhampanwar20](https://github.com/Shubhampanwar20)
- LinkedIn: [Shubham Panwar](https://www.linkedin.com/in/shubham-panwar-a7a7502a8/)

---

## 📄 License

No open-source license has been specified for this repository at this time.

---

## ⭐ Support

If you find the project useful or interesting, consider giving the repository a ⭐ on GitHub.

**Nexora — Turning enterprise operations into actionable intelligence.**
