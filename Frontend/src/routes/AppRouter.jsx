import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import AdminLayout from '../components/Layout/AdminLayout';

// Auth Pages
import Login from '../components/Login/Login.jsx';

// Admin Pages
import AdminDashboardPage from '../pages/Admin/DashboardPage';
import UserManagementPage from '../pages/Admin/UserManagementPage';
import SpecialityListPage from '../pages/Admin/SpecialityListPage.jsx';
import PromoListPage from '../pages/Admin/PromoListPage.jsx';
import SectionListPage from '../pages/Admin/SectionListPage.jsx';
import ClassroomListPage from '../pages/Admin/ClassroomListPage.jsx';
import BaseModuleListPage from '../pages/Admin/BaseModuleListPage.jsx';
import VersionModuleListPage from '../pages/Admin/VersionModuleListPage.jsx';
import TeacherAssignmentPage from '../pages/Admin/TeacherAssignmentPage';
import SemesterManagementPage from '../pages/Admin/SemesterManagementPage';
import ExamDefinitionPage from '../pages/Admin/ExamDefinitionPage';
import ScheduleGenerationPage from '../pages/Admin/ScheduleGenerationPage';
import AdminTeacherScheduleViewerPage from '../pages/Admin/AdminTeacherScheduleViewerPage';
import AdminPromoScheduleViewerPage from '../pages/Admin/AdminPromoScheduleViewerPage';

// Teacher Pages
import TeacherDashboardPage from '../pages/Teacher/TeacherDashboardPage';
import ModuleSelectionPage from '../pages/Teacher/ModuleSelectionPage';
import TeacherSchedulePage from '../pages/Teacher/TeacherSchedulePage';
import TeacherScheduleViewPage from '../pages/Teacher/TeacherScheduleViewPage';

// Protected Route Component for Admins
const ProtectedAdminRoute = () => {
  const { isAuthenticated, isAdmin, isLoading, needsPasswordChange } = useAuth();

  if (isLoading) return <div>Loading...</div>; // Wait for auth check
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (needsPasswordChange) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/unauthorized" replace />;

  return <Outlet />; // Renders nested routes
};

// Protected Route Component for Teachers
const ProtectedTeacherRoute = () => {
  const { isAuthenticated, isTeacher, isLoading, needsPasswordChange } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (needsPasswordChange) return <Navigate to="/login" replace />;
  if (!isTeacher) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

// Public Routes Component
const PublicRoutes = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
};

function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="specialities" element={<SpecialityListPage />} />
            <Route path="promos" element={<PromoListPage />} />
            <Route path="sections" element={<SectionListPage />} />
            <Route path="classrooms" element={<ClassroomListPage />} />
            <Route path="base-modules" element={<BaseModuleListPage />} />
            <Route path="version-modules" element={<VersionModuleListPage />} />
            <Route path="assignments" element={<TeacherAssignmentPage />} />
            <Route path="semesters" element={<SemesterManagementPage />} />
            <Route path="exams" element={<ExamDefinitionPage />} />
            <Route path="schedule/generate" element={<ScheduleGenerationPage />} />
            <Route path="schedules/teachers" element={<AdminTeacherScheduleViewerPage />} />
            <Route path="schedules/promos" element={<AdminPromoScheduleViewerPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        {/* Teacher Routes */}
        <Route element={<ProtectedTeacherRoute />}>
          <Route path="/teacher" element={<Outlet />}>
            <Route path="dashboard" element={<TeacherDashboardPage />} />
            <Route path="preferences" element={<ModuleSelectionPage />} />
            <Route path="schedule" element={<TeacherScheduleViewPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        {/* Fallback Routes */}
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRouter; 