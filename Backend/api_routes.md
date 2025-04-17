# API Endpoints for Scope Scheduler

Based on `Promps.md`, the following API endpoints are required:

## Authentication
- `POST /api/auth/login/` - User login (handles temporary password check).
- `POST /api/auth/change-password/` - Force user to change temporary password on first login.

## Admin - User Management
- `POST /api/admin/users/` - Create a new user (admin only).
- `GET /api/admin/users/` - List users (admin only).
- `GET /api/admin/users/{user_id}/` - Get user details.
- `PUT /api/admin/users/{user_id}/` - Update user.
- `DELETE /api/admin/users/{user_id}/` - Delete user.

## Academic Structure
- `GET, POST /api/specialities/` - List/Create Specialities.
- `GET, PUT, DELETE /api/specialities/{speciality_id}/` - Retrieve/Update/Delete Speciality.
- `GET, POST /api/promos/` - List/Create Promos (likely requires `speciality_id`).
- `GET, PUT, DELETE /api/promos/{promo_id}/` - Retrieve/Update/Delete Promo.
- `GET, POST /api/sections/` - List/Create Sections (likely requires `promo_id`).
- `GET, PUT, DELETE /api/sections/{section_id}/` - Retrieve/Update/Delete Section.
- `GET, POST /api/classes/` - List/Create Classes (likely requires `section_id`).
- `GET, PUT, DELETE /api/classes/{class_id}/` - Retrieve/Update/Delete Class.

## Modules
- `GET, POST /api/modules/base/` - List/Create Base Modules.
- `GET, PUT, DELETE /api/modules/base/{module_id}/` - Retrieve/Update/Delete Base Module.
- `GET, POST /api/modules/version/` - List/Create Version Modules (requires `base_module_id`).
- `GET, PUT, DELETE /api/modules/version/{version_module_id}/` - Retrieve/Update/Delete Version Module.

## Teachers & Assignments
- `GET /api/teachers/` - List teachers (users with teacher role).
- `GET /api/teachers/{teacher_id}/schedule/` - Get teacher's dynamic schedule.
- `POST /api/teachers/preferences/` - Allow teachers to select Base Modules they want to teach.
- `POST /api/admin/assignments/` - Admin assigns modules to teachers for specific promos/semesters.

## Semesters & Exams
- `GET, POST /api/semesters/` - List/Create Semesters.
- `GET, PUT, DELETE /api/semesters/{semester_id}/` - Retrieve/Update/Delete Semester.
- `POST /api/semesters/{semester_id}/modules/` - Assign modules to a semester.
- `POST /api/semesters/{semester_id}/exams/` - Define exam periods.

## Schedule Generation
- `POST /api/schedule/generate/` - Trigger automatic schedule generation (needs promo, semester, teacher assignments).
- `GET /api/schedule/section/{section_id}/` - View weekly schedule for a specific section. 