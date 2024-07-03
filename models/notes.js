import mongoose from "mongoose";
import User from "./users.js";

const NotesSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please Enter a Title"],
      unique: true,
    },
    content: {
      type: String,
      required: [true, "Please Enter content"],
    },
    tags: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },

    createdOn: {
      type: Date,
      default: new Date().getTime(),
    },
  },
  {
    timestamps: true,
  }
);

const Notes = mongoose.model("Notes", NotesSchema);

export default Notes;
