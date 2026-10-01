import { Outlet } from "react-router-dom";
import { useState } from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import AIButton from "../ai/AIButton";
import AIAssistant from "../ai/AIAssistant";

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const openAI = () => {
        setAiOpen(true);
    };

    const closeAI = () => {
        setAiOpen(false);
    };

    return (
        <div className="dashboard-layout">

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={closeSidebar}
            />

            {/* Main content */}
            <div className="dashboard-main">

                {/* Navbar */}
                <Navbar
                    onMenuClick={() => setSidebarOpen(true)}
                />

                {/* Page */}
                <main className="dashboard-content">
                    <Outlet />
                </main>

            </div>

            {/* AI Assistant */}
            {!aiOpen && (
                <AIButton onClick={openAI} />
            )}

            {aiOpen && (
                <AIAssistant onClose={closeAI} />
            )}

        </div>
    );
};

export default DashboardLayout;