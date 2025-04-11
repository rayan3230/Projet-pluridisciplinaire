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

// Teacher Pages
import TeacherDashboardPage from '../pages/Teacher/TeacherDashboardPage';
import ModuleSelectionPage from '../pages/Teacher/ModuleSelectionPage';
import TeacherSchedulePage from '../pages/Teacher/TeacherSchedulePage';

// Protected Route Component for Admins
const ProtectedAdminRoute = () => {
  const { isAuthenticated, isAdmin, isLoading, needsPasswordChange } = useAuth();

  if (isLoading) return <div>Loading...</div>; // Wait for auth check
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (needsPasswordChange) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/unauthorized" replace />; // Or redirect teacher to teacher dashboard

  return <AdminLayout />; // Renders nested routes via Outlet in AdminLayout
};

// Protected Route Component for Teachers - Renders Outlet directly
const ProtectedTeacherRoute = () => {
  const { isAuthenticated, isTeacher, isLoading, needsPasswordChange } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (needsPasswordChange) return <Navigate to="/login" replace />;
  if (!isTeacher) return <Navigate to="/unauthorized" replace />; // Or redirect admin to admin dashboard

  // Render child route directly without TeacherLayout
  return <Outlet />; 
};

// Public routes or routes accessible when logged out
const PublicRoutes = () => {
    const { isAuthenticated, isLoading, needsPasswordChange } = useAuth();
    if (isLoading) return <div>Loading...</div>;
    // Allow access to /login even if authenticated, IF password change is needed
    if (isAuthenticated && !needsPasswordChange) return <Navigate to="/" replace />;
    return <Outlet />;
}

function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<PublicRoutes />}>
            <Route path="/login" element={<Login />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedAdminRoute />}>
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
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={<ProtectedTeacherRoute />}>
          <Route path="dashboard" element={<TeacherDashboardPage />} />
          <Route path="preferences" element={<ModuleSelectionPage />} />
          <Route path="schedule" element={<TeacherSchedulePage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Fallback / Redirect Logic */}
        <Route
          path="/"
          element={
            <AuthGuard>
                {(auth) => {
                    // If user needs password change, they MUST stay on Login page
                    // The Login page's internal state handles showing the change form.
                    // Do not navigate them away here.
                    if (auth.needsPasswordChange) {
                        // User is authenticated but needs change -> Should already be on /login page
                        // Returning the element they are currently on (Login) prevents navigation.
                        // This assumes this AuthGuard only runs when navigating TO /.
                        // A better approach might be needed if AuthGuard wraps everything.
                        // For now, let's try navigating explicitly back to /login if somehow accessed /
                        return <Navigate to="/login" replace />;
                    }
                    // Otherwise, navigate to appropriate dashboard
                    if (auth.isAdmin) return <Navigate to="/admin/dashboard" replace />;
                    if (auth.isTeacher) return <Navigate to="/teacher/dashboard" replace />;
                    // Fallback if logged in but no role or target
                    return <Navigate to="/login" replace />; 
                }}
            </AuthGuard>
          }
        />

        {/* Generic Unauthorized Page */}
        <Route path="/unauthorized" element={<div><h1>Unauthorized</h1><p>You do not have permission to access this page.</p></div>} />

        {/* Catch-all for 404 Not Found */}
        <Route path="*" element={<div><h1>404 Not Found</h1></div>} />
      </Routes>
    </Router>
  );
}

// AuthGuard helper: Prevent navigating away from /login if password change needed
const AuthGuard = ({ children }) => {
    const auth = useAuth();
    if (auth.isLoading) return <div>Loading...</div>;
    // If not authenticated at all, redirect to login
    if (!auth.isAuthenticated) return <Navigate to="/login" replace />;
    
    // If authenticated BUT needs password change, let the specific route handle it
    // (especially the logic within the Login component itself). Don't redirect here.
    // The logic inside the <Route path="/" ...> element will handle redirection AWAY
    // from "/" if needsPasswordChange is true.
    // This guard primarily ensures authentication before rendering children.
    
    return children(auth); 
}

export default AppRouter; 