import api from "./api";

const register = async (userData) => {
    const response = await api.post("/auth/register", {
        name: userData.name,
        email: userData.email,
        password: userData.password,
    });

    return response.data;
};

const login = async (credentials) => {
    const response = await api.post("/auth/login", {
        email: credentials.email,
        password: credentials.password,
    });

    return response.data;
};

const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("student");
};

const getStoredStudent = () => {
    const student = localStorage.getItem("student");

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

const authService = {
    register,
    login,
    logout,
    getStoredStudent,
};

export default authService;