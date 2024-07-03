import express from 'express';
const router = express.Router();
import multer from "multer";
import {
  createBlog,
  getAllBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  likeblog,
  getAllComments,
  commentSingleBlog,
  getSingleBlogComments,
  deleteSinglecomment,
  getNotifications
} from "../controllers/blogController.js";
import { validateToken } from '../middleware/authenticateToken.js';


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "blogimages");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.post("/createblog", validateToken, upload.single("image"), createBlog);
router.get("/", validateToken, getAllBlogs);
router.get("/userblogs", validateToken, getBlog);
router.put("/update-blog/:id", validateToken,upload.single("image"), updateBlog);
router.delete("/deleteblog/:id", validateToken, deleteBlog);
router.post("/like/:id", validateToken, likeblog);
router.post("/addcomment/:id", validateToken, commentSingleBlog);

router.get("/getallcomments", validateToken, getAllComments);
router.get("/getsingleblogcomments/:id", validateToken, getSingleBlogComments);

//delete single comment for specific blog
router.delete("/deletesinglecomment/:commentId/:blogId", validateToken, deleteSinglecomment);

//get notifications
router.get('/notifications', validateToken, getNotifications);

export default router;