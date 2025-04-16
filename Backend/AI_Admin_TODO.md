# AI Admin Chat - TODO List

This file tracks the remaining admin actions to be implemented in the `ai_admin_chat_view` function in `Backend/Acadimic/views.py`.

**Already Implemented:**

- [x] `create_location`
- [x] `list_locations`
- [x] `find_teacher`
- [x] `create_user`
- [x] `list_users`
- [x] `generate_class_schedule`
- [x] `update_user`
- [x] `delete_user`
- [x] `create_speciality`
- [x] `list_specialities`
- [x] `update_speciality`
- [x] `delete_speciality`
- [x] `create_promo`
- [x] `list_promos`
- [x] `update_promo`
- [x] `delete_promo`
- [x] `create_section`
- [x] `list_sections`
- [x] `update_section`
- [x] `delete_section`
- [x] `create_module`
- [x] `list_modules`
- [x] `update_module`
- [x] `delete_module`
- [x] `create_course`
- [x] `list_courses`
- [x] `update_course`
- [x] `delete_course`

**Remaining Actions:**

**Academic Structure (`Acadimic/admin.py`)**
- [ ] `create_classroom`
- [ ] `list_classrooms` (filter by location, type)
- [ ] `update_classroom`
- [ ] `delete_classroom`
- [ ] `create_base_module`
- [ ] `list_base_modules`
- [ ] `update_base_module`
- [ ] `delete_base_module`
- [ ] `create_version_module` (requires base module)
- [ ] `list_version_modules` (filter by base module)
- [ ] `update_version_module`
- [ ] `delete_version_module`
- [ ] `create_academic_year`
- [ ] `list_academic_years`
- [ ] `update_academic_year`
- [ ] `delete_academic_year` (Consider restrictions)
- [ ] `list_semesters` (filter by academic year)
- [ ] `update_semester` (dates, modules?)
- [ ] `create_exam` (requires module, semester, section, date)
- [ ] `list_exams` (filter by semester, promo, section)
- [ ] `update_exam`
- [ ] `delete_exam`
- [ ] `create_teacher_assignment` (teacher, module, semester, promo)
- [ ] `list_teacher_assignments` (filter by teacher, semester, module)
- [ ] `update_teacher_assignment`
- [ ] `delete_teacher_assignment`
- [ ] `create_schedule_entry` (Manual creation - less common)
- [ ] `list_schedule_entries` (filter by promo, semester, section, teacher)
- [ ] `update_schedule_entry`
- [ ] `delete_schedule_entry`
- [ ] `create_exam_surveillance` (Manual creation - less common)
- [ ] `list_exam_surveillances` (filter by exam, teacher, semester)
- [ ] `update_exam_surveillance`
- [ ] `delete_exam_surveillance`

**Custom Actions (`Acadimic/views.py`)**
- [ ] `generate_exam_schedule` (Single Promo)
- [ ] `generate_all_promos_exam_schedule`
- [ ] `generate_exam_surveillance_schedule`
- [ ] `export_schedule_pdf`
- [ ] `export_schedule_excel` 