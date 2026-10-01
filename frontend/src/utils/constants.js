// API
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5001/api";

// Application
export const APP_NAME = "Student Portal";
export const APP_DESCRIPTION =
    "Student Authentication & Mock Test Management System";

// Routes
export const ROUTES = {
    LOGIN: "/login",
    REGISTER: "/register",
    DASHBOARD: "/dashboard",
    MOCK_TESTS: "/mock-tests",
    PROFILE: "/profile",
    UNAUTHORIZED: "/unauthorized",
};

// Mock Test
export const DIFFICULTY_LEVELS = {
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Hard",
};

export const TEST_STATUS = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
};

// Authentication
export const STORAGE_KEYS = {
    TOKEN: "token",
    STUDENT: "student",
};

// AI Assistant
export const AI_CONFIG = {
    TITLE: "AI Assistant",
    WELCOME_MESSAGE:
        "Hi! I'm your AI Assistant. I can help you with mock tests, subjects, and your exam preparation.",
};

// Timer
export const TIMER = {
    WARNING_SECONDS: 60,
};

// Pagination / UI
export const DEFAULT_PAGE_SIZE = 10;