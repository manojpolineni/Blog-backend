import User from "../models/users.js";
import Blog from "../models/blogs.js";
import mongoose from "mongoose";
import Comment from "../models/comments.js";
import Notification from "../models/notification.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { type } from "os";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imageDir = path.join(__dirname, "..");

export const createBlog = async (req, res) => {
  try {
    const userid = req.user.id;
    const { title, content, image } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and Content fields are Required" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded! Images is Required" });
    }
    
    const blog = await Blog.create({
      title,
      content,
      image:req.file.path,
      user_id: userid,
    });

    await blog.save();
    return res.status(201).json({ message: "Blog Created Successfully", blogid:blog._id });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// GET /api/blogs - Get all blog posts
export const getAllBlogs = async (req, res) => {
  try {
    // const blogs = await Blog.find().populate('comments').populate('user');
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get single blog based on userid
export const getBlog = async (req, res) => {
  try {
    const userId = req.user.id;
    const userBlogs = await Blog.find({ user_id: userId });
    res.json(userBlogs);
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const userId = req.user.id;
    const blogid = req.params.id;

    const existingBlog = await Blog.findById(blogid);
    if (!existingBlog) return res.status(404).json({ error: "Blog not found" });

    // Check if the authenticated user owns the blog
    if (
      !existingBlog.user_id ||
      !userId ||
      existingBlog.user_id.toString() !== userId.toString()
    ) {
      return res
        .status(403)
        .json({ error: "You are not authorized to update this blog" });
    }

    const { title, content, image } = req.body;

    if (title) existingBlog.title = title;
    if (content) existingBlog.content = content;
    if (image) existingBlog.image = image;

    const updatedBlog = await existingBlog.save();
    return res.status(200).json({ message: "Blog updated", blog: updatedBlog });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const userid = req.user.id;
    const blogid = req.params.id;
    const existingBlog = await Blog.findById(blogid);

    if (!existingBlog)
      return res.status(404).json({ error: "Blog Not Found!" });

    // check if authenticated user owns the blog
    if (
      !existingBlog.user_id ||
      !userid ||
      existingBlog.user_id.toString() !== userid.toString()
    ) {
      return res .status(403).json({ error: "You are not authorized to delete this blog" });
    }

    
    await Comment.deleteMany({ blogId: blogid });
    await Notification.deleteMany({ itemId: blogid, type: 'comment' });
    await Notification.deleteMany({ itemId: blogid, type: 'like' });

    // Delete the associated image file from the server
    const imagePath = path.join(__dirname, "..", existingBlog.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    } else {
      console.log("File not found at:", imagePath);
    }

    // Delete the blog from the database
    await Blog.findByIdAndDelete(blogid);

    return res.status(200).json({ message: "Blog Deleted Sccessfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

//blog like endpoint
export const likeblog = async (req, res) => {
  try {
    const userId = req.user.id;
    const blogId = req.params.id;

    const existingBlog = await Blog.findById(blogId);
    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not Found" });
    }

    // Check if the user has already liked the blog
    if (existingBlog.likes.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You have already liked this blog" });
    }

    // Add the user ID to the likes array and update likesCount
    existingBlog.likes.push(userId);
    existingBlog.likesCount += 1;
    await existingBlog.save();

    // Create a notification for the like
    const user = await User.findById(userId);
    const notification = new Notification({
      recipient: existingBlog.user_id, // User who owns the blog post
      sender: userId,
      type: "like",
      itemId: blogId,
      title: `${user.userName} liked your blog post`,
      content: `${user.userName} liked your blog post "${existingBlog.title}".`,
    });
    await notification.save();

    res.status(200).json({
      message: "Blog liked successfully",
      likesCount: existingBlog.likesCount,
      likedBy: { userName: user.userName, blogTitle: existingBlog.title },
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Comment on single Blog blog based on user id
export const commentSingleBlog = async (req, res) => {
  try {
    const userid = req.user.id;
    const blogid = req.params.id;
    const { content } = req.body;

    // Check if blogid is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(blogid)) {
      return res.status(400).json({ message: "Invalid blog ID" });
    }

    // Finding the existing blog by its _id
    const existingBlog = await Blog.findById(blogid);
    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Create a new comment document
    const newComment = new Comment({
      user: userid,
      blogId: blogid,
      content: content,
    });

    await newComment.save();

    //push newCommnet to blog comments Array 
    existingBlog.comments.push(newComment);

    await existingBlog.save();

    // Create a notification for the comment
    const user = await User.findById(userid);

    const newNotification = new Notification({
      recipient: existingBlog.user_id,
      sender: userid,
      type: "comment",
      itemId: newComment._id,
      title: `${user.userName} commented on your blog post`,
      content: `${user.userName} commented on your blog post "${existingBlog.title}".`,
    });

    await newNotification.save();

    res.status(201).json({
      message: "Comment added successfully",
      CommentedBy: {
        userName: user.userName,
        blogTitle: existingBlog.title,
        comment: newComment.content,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

// Get comments for single blog by blog id
export const getSingleBlogComments = async (req, res) => {
    try {
      const blogid = req.params.id;
      const blog = await Blog.findById(blogid).populate({
          path: 'comments',
          populate: {
            path: 'user',
            select:'userName'
          }
        });

        if (!blog) {
          return res.status(404).json({ error: "Blog not found" });
      }
      
      const comments = blog.comments.map((comment) => ({
        _id: comment._id,
        content: comment.content,
        userId: comment.user._id,
        blogId: comment.blogId,
        username: comment.user.userName,
        createdAt: comment.createdAt,
      }));

      res.status(200).json(comments);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}


//get all comments
export const getAllComments = async (req, res) => {
  try {
    const allComments = await Comment.find();
    return res.status(200).json(allComments);
    
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// delete single comment on specific blog
export const deleteSinglecomment = async (req, res) => {
    try {
      const { blogId, commentId } = req.params;

      // Check if blogId and commentId are valid ObjectIds
      if (!mongoose.Types.ObjectId.isValid(blogId)) {
        return res.status(400).json({ message: "Invalid blog ID" });
      }

      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }

      // Find blog by its ID
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      // Find index of the comment within the comments array
      const commentIndex = blog.comments.findIndex((comment) =>
        comment.equals(commentId)
      );

      if (commentIndex === -1) {
        return res
          .status(404)
          .json({ message: "Comment not found in the blog" });
      }

      // Remove the comment ObjectId from the blog's comments array
      blog.comments.splice(commentIndex, 1);
      await blog.save();

      await Comment.findByIdAndDelete(commentId);

      const notification = await Notification.findOneAndDelete({
        itemId: commentId,
        type: "comment",
      });

      if (notification) {
        console.log("Notification deleted for the comment", notification);
      } else {
        console.log("Notification not found for the deleted comment", commentId);
      }

      return res.status(200).json({ message: "Comment Deleted Successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
}

// get notifications for like and comments
export const getNotifications = async (req, res) => {
  try {
    const userID = req.user.id;

    const notifications = await Notification.find({ recipient: userID })
      .sort({ createdAt: -1 })
      .populate("sender");

    // Initialize counters for likes and comments
    let totalLikes = 0;
    let totalComments = 0;

    // Prepare arrays to store notification details for likes and comments
    const likeNotifications = [];
    const commentNotifications = [];

    for (const notification of notifications) {
      const blog = await Blog.findById(notification.itemId);

      if (!blog) {
         console.log(`Blog not found for itemId: ${notification.itemId}`);
        continue; 
      }

      if (notification.type === "like") {
        totalLikes++;
        likeNotifications.push({
          type: "like",
          userName: notification.sender.userName,
          blogTitle: blog.title,
          createdAt: notification.createdAt,
        });
      } else if (notification.type === "comment") {
        totalComments++;
        commentNotifications.push({
          type: "comment",
          userName: notification.sender.userName,
          blogTitle: blog.title,
          createdAt: notification.createdAt,
        });
      }
    }


    console.log('likes', totalLikes );
    console.log('comments', totalComments);
    return res.status(200).json({
      likes: totalLikes,
      comments: totalComments,
      likeNotifications,
      commentNotifications,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export default {
  createBlog,
  getAllBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  likeblog,
  commentSingleBlog,
  getAllComments,
  getSingleBlogComments,
  deleteSinglecomment,
  getNotifications
};
