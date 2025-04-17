# 🗓️ Scope Scheduler Admin Panel (Django + React)

## 🧠 Context for AI
This is a university schedule management system. Our platform allows only **admins** to create users. We need a full **Admin Dashboard** and supporting features.

You must **implement the full working backend and frontend** — not just the design or UI. Every model, API, service, and UI component must be fully functional and testable.

Use:
- **Django** for backend (with Django Rest Framework)
- **React** for frontend (functional components)
- Keep everything modular, scalable, and maintainable
-dont use tokens and cookies

---

## 🔐 Admin Features

Create an **Admin Panel** where the admin can:

- Access the dashboard with a **React NavBar**
- **Create users** manually with:
  - `full_name` (string)
  - `username` (string)
  - `personnel_email` (personal email of the user)
  - Automatically generate:
    - `scope_email` → format: `fullname@scope.com`
    - `temporary_password` → random string (8–12 chars & numbers)
  - Send credentials (scope_email + temp password) via email
  - On first login, user must **change temporary password**

✅ **Must be fully functional, not just UI**

---

## 🎓 Academic Structure

Support the following entities (with full CRUD + relations):

### 1. Specialities
- Example: `Informatique`, `Génie Civil`, `Electronique`

### 2. Promos
- Belongs to a Speciality
- Example: `1st year Informatique`

### 3. Sections
- Belongs to a Promo
- Example: Section A, B, C

### 4. Classes
Each class has:
- `type`: `Cours`, `TD`, `TP`
- `has_projector`: boolean
- `tp_computers`: integer (only if TP)

---

## 📚 Modules

### Base Modules
- Example: Analyse, Programmation
- Fields:
  - `name`
  - `code` (e.g., ANAL)
  - `coef`

### Version Modules
- Belongs to a base module
- Example: ANAL1, ANAL2
- Fields:
  - `cours_hours`
  - `td_hours`
  - `tp_hours`

---

## 👨‍🏫 Teachers & Assignments

- Admin assigns modules to teachers
- Teachers can **select Base Modules** they want to teach
- Multiple teachers can be assigned to the same module in a promo
- Teachers have their own **dynamic schedule** which updates when the section schedule is generated

---

## 📆 Semesters & Exams

- Admin can:
  - Create semesters
  - Assign modules to a semester
  - Define exam periods per semester

---

## ⚙️ Schedule Generation

Build a fully functional automatic schedule generator:

- Admin selects:
  - Promo
  - Semester
  - Teachers for each module
- System generates:
  - A weekly schedule for each **section**
  - Each class type (Cours, TD, TP) is auto-placed
  - Teachers' schedules are updated
- Support:
  - Teachers teaching multiple modules
  - Conflict-free scheduling (no double bookings)
  - Resource-aware planning (rooms, computers)

✅ Must update backend data
✅ Must reflect in frontend views
✅ Re-generating schedules must respect teacher load and availability

---

## 🤖 AI Integration Suggestion

Integrate AI/optimization tools (optional):

- Use **Google OR-Tools** or **Genetic Algorithms**
- Goals:
  - Conflict-free schedules
  - Even workload
  - Respect room/equipment availability
  - Compact timetables

---

## 📦 Tech Stack

- Backend: Django + Django Rest Framework
- Frontend: React + Axios + TailwindCSS (or MUI)
- DB: PostgreSQL (preferred)
- Auth: Django Auth or JWT
- Email: SMTP via Django

---

## ✅ Tasks for AI (You Must Fully Implement)

### Backend (Django)
- [ ] Models: All entities above (users, modules, promos, etc.)
- [ ] Auth flow: temp password + forced change
- [ ] Email sender
- [ ] APIs for CRUD on all entities
- [ ] Schedule generation logic
- [ ] Teacher/module/schedule relations

### Frontend (React)
- [ ] Admin Dashboard with:
  - Create user form
  - Semester/module manager
  - Promo/section manager
  - Schedule generator
- [ ] Teacher Panel:
  - Module selection
  - Schedule viewer
- [ ] Forms must connect to API and persist data
- [ ] All pages should be responsive

---

## ☑️ Important

🚨 You must **build fully functional logic** — not mockups or placeholders.  
🚨 All features must work: database, API, frontend actions, schedule generation.  
🚨 Don’t leave functionality unimplemented. This is a real working web app.

---

Please structure your code clearly and make it easy to maintain. Comment important logic, especially schedule generation.
