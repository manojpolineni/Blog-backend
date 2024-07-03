import User from "../models/users.js";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

const { MY_SECRETE_TOKEN } = process.env;

// export const validateToken = async (req, res, next) => {
//   try {
//     let accessToken;
//     let authHeader = req.headers.authorization;

//     if (authHeader && authHeader.startsWith("Bearer")) {
//       accessToken = authHeader.split(" ")[1];
//     }

//     if (!accessToken) {
//       return res.status(401).json({ message: "Access token is missing" });
//     }

//     jwt.verify(accessToken, process.env.MY_SECRETE_TOKEN, (err, decode) => {
//       if (err) {
//         if (err.name === "JsonWebTokenError") {
//           return res.status(401).json({ message: "Invalid access token or Token Expired" });
//         } else {
//           return res.status(500).json({ message: "Token verification failed" });
//         }
//       }
//       res.user = decode.user;
//       next();
//     });
//   } catch (err) {
//     return res.status(500).json({ message: "Something Went Wrong" });
//   }
// };

export const validateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res
        .status(401)
        .json({ message: "Access token is missing or invalid" });
    }
    const accessToken = authHeader.split(" ")[1];
    const decoded = await jwt.verify(accessToken, process.env.MY_SECRETE_TOKEN);
    req.user = decoded.user;
    
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ message: "Invalid access token or Token Expired" });
    }
    return res.status(500).json({ message: "Token verification failed" });
  }
};




export default validateToken;