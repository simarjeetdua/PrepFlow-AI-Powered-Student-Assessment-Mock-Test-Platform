import { STORAGE_KEYS } from "./constants";

// Save token
export const setToken = (token) => {
    if (!token) {
        return;
    }

    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
};

// Get token
export const getToken = () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

// Remove token
export const removeToken = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
};

// Save student
export const setStudent = (student) => {
    if (!student) {
        return;
    }

    localStorage.setItem(
        STORAGE_KEYS.STUDENT,
        JSON.stringify(student)
    );
};

// Get student
export const getStudent = () => {
    const student = localStorage.getItem(
        STORAGE_KEYS.STUDENT
    );

    if (!student) {
        return null;
    }

    try {
        return JSON.parse(student);
    } catch (error) {
        console.error(
            "Failed to parse stored student:",
            error
        );

        return null;
    }
};

// Remove student
export const removeStudent = () => {
    localStorage.removeItem(STORAGE_KEYS.STUDENT);
};

// Clear authentication storage
export const clearAuthStorage = () => {
    removeToken();
    removeStudent();
};

// Check whether token exists
export const hasToken = () => {
    return Boolean(getToken());
};