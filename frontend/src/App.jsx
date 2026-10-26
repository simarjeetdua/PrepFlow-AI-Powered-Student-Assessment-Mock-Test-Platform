
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import AdminLayout from "./components/admin/AdminLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import AdminRoute from "./components/auth/AdminRoute";

import MockTests from "./pages/mocktest/MockTests";
import MockTestDetails from "./pages/mocktest/MockTestDetails";
import TakeTest from "./pages/mocktest/TakeTest";
import TestResult from "./pages/mocktest/TestResult";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageNotes from "./pages/admin/ManageNotes";
import ManageTests from "./pages/admin/ManageTests";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageVideos from "./pages/admin/ManageVideos";
import StudentPerformance from "./pages/admin/StudentPerformance";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/unauthorized"
              element={<Unauthorized />}
            />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              {/* Student portal */}
              <Route element={<DashboardLayout />}>
                <Route
                  path="/dashboard"
                  element={<Dashboard />}
                />
                <Route
                  path="/profile"
                  element={<Profile />}
                />
                <Route
                  path="/mock-tests"
                  element={<MockTests />}
                />
                <Route
                  path="/mock-tests/:id"
                  element={<MockTestDetails />}
                />
                <Route
                  path="/mock-tests/:id/take"
                  element={<TakeTest />}
                />
                <Route
                  path="/mock-tests/:id/result/:resultId"
                  element={<TestResult />}
                />
              </Route>

              {/* Admin portal */}
              
{/* Admin portal — only admins can access */}
<Route element={<AdminRoute />}>
  <Route element={<AdminLayout />}>
    <Route
      path="/admin"
      element={<AdminDashboard />}
    />
    <Route
      path="/admin/notes"
      element={<ManageNotes />}
    />
    <Route
      path="/admin/videos"
      element={<ManageVideos />}
    />
    <Route
      path="/admin/tests"
      element={<ManageTests />}
    />
    <Route
      path="/admin/users"
      element={<ManageUsers />}
    />
    <Route
      path="/admin/performance"
      element={<StudentPerformance />}
    />
  </Route>
</Route>

            </Route>

            {/* Default route */}
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
