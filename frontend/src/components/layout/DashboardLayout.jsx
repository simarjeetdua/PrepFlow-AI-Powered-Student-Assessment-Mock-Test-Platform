import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import AIButton from "../ai/AIButton";
import AIAssistant from "../ai/AIAssistant";

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);

    // Initial position for draggable AI launcher
    const [aiPosition, setAiPosition] = useState(() => {
        try {
            const saved = localStorage.getItem("prepflow_ai_launcher_pos");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (typeof parsed.x === "number" && typeof parsed.y === "number") {
                    return parsed;
                }
            }
        } catch (e) {}
        return null; // Will compute bottom-right default on mount
    });

    useEffect(() => {
        const handleResize = () => {
            const defaultX = Math.max(16, window.innerWidth - 170);
            const defaultY = Math.max(16, window.innerHeight - 80);

            setAiPosition((current) => {
                if (!current) {
                    return { x: defaultX, y: defaultY };
                }
                // Keep clamped inside viewport on screen resize
                const clampedX = Math.max(16, Math.min(current.x, window.innerWidth - 150));
                const clampedY = Math.max(16, Math.min(current.y, window.innerHeight - 70));
                return { x: clampedX, y: clampedY };
            });
        };

        if (!aiPosition) {
            handleResize();
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handlePositionChange = (newPos) => {
        setAiPosition(newPos);
        try {
            localStorage.setItem("prepflow_ai_launcher_pos", JSON.stringify(newPos));
        } catch (e) {}
    };

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

            {/* Draggable AI Assistant Launcher */}
            {!aiOpen && (
                <AIButton
                    position={aiPosition}
                    onPositionChange={handlePositionChange}
                    onClick={openAI}
                />
            )}

            {/* Floating AI Tutor Drawer positioned relative to launcher */}
            {aiOpen && (
                <AIAssistant
                    launcherPosition={aiPosition}
                    onClose={closeAI}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
