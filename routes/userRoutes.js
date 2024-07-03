import express from 'express';
const router = express.Router();
import multer from 'multer';
import {
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
  resetPassword
} from "../controllers/userController.js";
import { validateToken } from '../middleware/authenticateToken.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });


router.get("/",validateToken, getUsers);
router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/user",validateToken, singleUser);
router.put("/updateuser", validateToken, updateUser);
router.put("/profileImage", validateToken, upload.single("profilePic"), updateProfiliePic);
router.delete("/deleteProfilePic", validateToken, deleteProfilePic);
router.get("/getprofileimg", validateToken, userProfilePic);
router.post("/updatepassword/:id",validateToken, updatePassword);
router.delete("/:id", validateToken, deleteUser);
router.post('/sendotp', sendOtp);
router.post('/resetpassword', resetPassword);


export default router;