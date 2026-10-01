import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

import MockTests from "./pages/mocktest/MockTests";
import MockTestDetails from "./pages/mocktest/MockTestDetails";
import TakeTest from "./pages/mocktest/TakeTest";
import TestResult from "./pages/mocktest/TestResult";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ChatProvider>

                    <Routes>

                        {/* =========================
                            Public Routes
                        ========================= */}

                        <Route
                            path="/login"
                            element={<Login />}
                        />

                        <Route
                            path="/register"
                            element={<Register />}
                        />

                        <Route
                            path="/unauthorized"
                            element={<Unauthorized />}
                        />


                        {/* =========================
                            Protected Routes
                        ========================= */}

                        <Route element={<ProtectedRoute />}>

                            <Route element={<DashboardLayout />}>

                                {/* Dashboard */}
                                <Route
                                    path="/dashboard"
                                    element={<Dashboard />}
                                />

                                {/* Profile */}
                                <Route
                                    path="/profile"
                                    element={<Profile />}
                                />

                                {/* Mock Tests */}
                                <Route
                                    path="/mock-tests"
                                    element={<MockTests />}
                                />

                                {/* Mock Test Details */}
                                <Route
                                    path="/mock-tests/:id"
                                    element={<MockTestDetails />}
                                />

                                {/* Take Test */}
                                <Route
                                    path="/mock-tests/:id/take"
                                    element={<TakeTest />}
                                />

                                {/* Test Result */}
                                <Route
                                    path="/mock-tests/:id/result/:resultId"
                                    element={<TestResult />}
                                />

                            </Route>

                        </Route>


                        {/* =========================
                            Default Route
                        ========================= */}

                        <Route
                            path="/"
                            element={
                                <Navigate
                                    to="/dashboard"
                                    replace
                                />
                            }
                        />


                        {/* =========================
                            404
                        ========================= */}

                        <Route
                            path="*"
                            element={<NotFound />}
                        />

                    </Routes>

                </ChatProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;