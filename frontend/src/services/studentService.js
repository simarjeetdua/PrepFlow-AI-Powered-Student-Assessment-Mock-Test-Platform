import api from "./api";

// Get logged-in student's profile
const getProfile = async () => {
    const response = await api.get("/students/profile");

    return response.data;
};

// Update logged-in student's profile
const updateProfile = async (profileData) => {
    const response = await api.put(
        "/students/profile",
        {
            name: profileData.name,
            email: profileData.email,
        }
    );

    return response.data;
};

const studentService = {
    getProfile,
    updateProfile,
};

export default studentService;