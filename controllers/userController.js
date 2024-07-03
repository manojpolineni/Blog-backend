import User from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imageDir = path.join(__dirname, '..',);

dotenv.config();
const { MY_SECRETE_TOKEN, MY_REFRESH_TOKEN_SECRET } = process.env;
import nodemailer from "nodemailer";

//get all users
export const getUsers = async (req, res) => {
  const users = await User.find();
  res.status(200).json({ users });
};

// User Register
export const userRegister = async (req, res) => {
  const { userName, email, password, gender, phone } = req.body;
  if (!userName || !email || !password) {
    return res.status(400).json({ message: "All fileds are required" });
  }
  const userExist = await User.findOne({ email });
  if (userExist) {
    return res
      .status(400)
      .json({ message: "User Email Already Exist! Please login" });
  }
  const hashPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({
      userName,
      email,
      password: hashPassword,
      gender,
      phone,
    });
    return res.status(200).json({
      _id: user.id,
      email: user.email,
      message: "User Created Successfully",
    });
  } catch (err) {
    return res.status(400).json({ err: "User data was not valid" });
  }
};

// User Login
export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email && email == "") {
      return res.status(400).json({ message: "Email is Required " });
    }
    if (!password && password === "") {
      return res.status(400).json({ message: "Password is Required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "User Email id Not found! Please Register" });
    }
    const ispasswordMatch= await bcrypt.compare(password, user.password)
    if (!ispasswordMatch) {
      return res.status(401).json({ message: "Password doesn't match! Try Again" });
    }
      if (user && ispasswordMatch) {
        const accessToken = jwt.sign(
          {
            user: {
              id: user.id,
              userName: user.userName,
              email: user.email,
            },
          },
          process.env.MY_SECRETE_TOKEN,
          { expiresIn: "1d" }
        );
        return res.status(200).json({
          message: "User login Successfully",
          id: user._id,
          accessToken,
        });
      } else {
        return res
          .status(400)
          .json({ message: "User Email id Not found! Please Register" });
      }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

//get single User
export const singleUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }
    const addressDetails = user.address.length > 0 ? user.address[0] : {};
    const singleUser = {
      id: user._id,
      userName: user.userName,
      email: user.email,
      address: {
        city: addressDetails.city || "",
        area: addressDetails.area || "",
        district: addressDetails.district || "",
        pinCode: addressDetails.pinCode || "",
        state: addressDetails.state || "",
        country: addressDetails.country || "",
      },
      profilePic: user.profilePic,
      gender: user.gender,
      phone: user.phone,
    };
    return res.status(200).json({ singleUser });
  }
  catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//updaet user image
export const updateProfiliePic = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    user.profilePic = req.file.path;
    await user.save();
    return res.status(200).json({ message: "User Profile Picture Updated Successfully", user });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

//get profilepic
export const userProfilePic = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }
    const imagePath = path.join(imageDir, user.profilePic);
    res.sendFile( imagePath );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const deleteProfilePic = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    user.profilePic = undefined;
    await user.save();

    return res
      .status(200)
      .json({ message: "Profile picture deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//update user
export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }
    const { userName, email, address, gender, phone } = req.body;

    if (userName) user.userName = userName;
    if (email) user.email = email;
    if (address) user.address = address;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;

    // // Handle file upload if profilePic is provided in the request
    // if (req.file) {
    //   user.profilePic = req.file.path; // Save file path in profilePic
    // }

    await user.save();

    return res.status(200).json({ message: "User Updated Successfully", user });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

//Delete User
export const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: err });
  }
};

//Update Password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "currentPassword and newPassword required" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect Current Password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password Changed Successfully" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

// Nodemailer setup (replace with your email service provider details)
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "manuquess06@gmail.com",
    pass: "qcjq mdkh huyq jvjt",
  },
});

// Temporary storage for OTP (example, use a cache or session storage in production)
const otpStore = {};

// OTP generation function
function generateOTP(length = 6) {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

//Routes for sendig otp for password reset
export const sendOtp = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User Not Found" });
    }
    const otp = generateOTP();
    otpStore[email] = { otp, timestamp: Date.now() }; // Store OTP and timestamp

    const mailOptions = {
      from: "manuquess06@gmail.com",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(400).json({ message: error });
      }
      return res.status(200).json({ message: "OTP Sent Successfully" });
    });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Route for Verify OTP and resetting Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findById({ email });
    const storedOtp = otpStore[email];
    if (
      !storedOtp ||
      otp !== storedOtp.otp ||
      Date.now() - storedOtp.timestamp > 600000
    ) {
      // OTP not found or expired (10 minutes validity in this example)
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    // OTP is valid, reset password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();
    // Clear OTP from storage
    delete otpStore[email];
      return res.status(200).json({ message: "Password Reset Successfully" });
      
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default {
  getUsers,
  userRegister,
  userLogin,
  singleUser,
  updateUser,
  updateProfiliePic,
  userProfilePic,
  deleteProfilePic,
  deleteUser,
  updatePassword,
  sendOtp,
  resetPassword,

};
