// import jwt from "jsonwebtoken"
// import Student from "../models/Student.js"

//  export const protect = async (req, res, next) => {
//   try {
//     let token;
//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer")
//     ) {
//       token = req.headers.authorization.split(" ")[1];
//     }
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Access denied. No token provided.",
//       });
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.student = await Student.findById(decoded.id).select("-password");
//     next();
//   } catch (error) {
//     return res.status(401).json({
//       success: false,
//       message: "Invalid token.",
//     });
//   }
// };


import jwt from "jsonwebtoken";
import Student from "../models/Student.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const student = await Student.findById(decoded.id)
      .select("-password");

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    req.student = student;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
