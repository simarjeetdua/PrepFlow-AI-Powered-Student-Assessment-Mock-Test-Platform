
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const token = localStorage.getItem("token");
  const savedStudent = localStorage.getItem("student");

  if (!token || !savedStudent) {
    return <Navigate to="/login" replace />;
  }

  try {
    const student = JSON.parse(savedStudent);

    if (student.role !== "admin") {
      return <Navigate to="/unauthorized" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
