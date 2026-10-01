import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const loadStudent = async () => {
            if (!token) {
                setStudent(null);
                setLoading(false);
                return;
            }

            try {
                const response = await api.get("/students/profile");

                const studentData = response.data.student;

                setStudent(studentData);

                if (studentData) {
                    localStorage.setItem(
                        "student",
                        JSON.stringify(studentData)
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to load authenticated student:",
                    error
                );

                // Token may be invalid/expired.
                localStorage.removeItem("token");
                localStorage.removeItem("student");
                setStudent(null);
            } finally {
                setLoading(false);
            }
        };

        loadStudent();
    }, [token]);

    const login = (token, studentData = null) => {
        localStorage.setItem("token", token);

        if (studentData) {
            localStorage.setItem(
                "student",
                JSON.stringify(studentData)
            );

            setStudent(studentData);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("student");

        setStudent(null);
    };

    const isAuthenticated = Boolean(
        localStorage.getItem("token")
    );

    const value = {
        student,
        loading,
        isAuthenticated,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};

export default AuthContext;