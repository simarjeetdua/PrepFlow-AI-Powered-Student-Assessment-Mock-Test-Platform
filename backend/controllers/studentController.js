import Student from "../models/Student.js"

// we fetch the profile of student by get - http

export const getProfile = async(req,res)=>{
    try {
        const student = await Student.findById(req.student.id).select("-password");
        res.status(200).json({
            success:true,
            student,
        });
    } catch (error) {
         res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateProfile = async(req,res)=>{
    try {
        const {name,email} = req.body;
        const student = await Student.findById(req.student.id);
        if(!student)
        {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }
        student.name = name || student.name;
        student.email = email || student.email;

        await student.save();

          const updatedStudent = await Student.findById(student._id)
            .select("-password");

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            student: updatedStudent,
        });
    } catch (error) {
         res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}