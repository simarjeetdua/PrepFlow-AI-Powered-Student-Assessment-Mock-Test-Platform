
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [student, setStudent] = useState(() => {
        try {
            const savedUser = localStorage.getItem("student");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setStudent(null);
                setLoading(false);
                return;
            }

            // If user information is already stored,
            // do not assume every user is a student.
            const savedUser = localStorage.getItem("student");

            if (savedUser) {
                setLoading(false);
                return;
            }

            // Only attempt student profile recovery when
            // the backend supports this profile endpoint.
            try {
                const response = await api.get("/students/profile");

                const user =
                    response.data.student ||
                    response.data.user ||
                    response.data.data?.student ||
                    response.data.data?.user ||
                    null;

                if (user) {
                    setStudent(user);
                    localStorage.setItem(
                        "student",
                        JSON.stringify(user)
                    );
                }
            } catch (error) {
                console.error("Profile loading error:", error);

                // Do not automatically delete the token here.
                // A non-student user may not have a student profile.
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = (token, userData = null) => {
        localStorage.setItem("token", token);

        if (userData) {
            localStorage.setItem(
                "student",
                JSON.stringify(userData)
            );

            setStudent(userData);
        } else {
            localStorage.removeItem("student");
            setStudent(null);
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
