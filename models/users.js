import mongoose from 'mongoose';

const AddressSchema = mongoose.Schema({
  city: { type: String },
  area: { type: String },
  district: { type: String },
  pinCode: { type: String },
  state: { type: String },
  country: { type: String },
});

const UserSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      lowercase: true,
      required: [true, "Please Enter Your Name"],
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, "Please Enter Your Email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please Enter Yoour Password"],
    },
    phone: {
      type: Number,
      min: 10,
    },
    address:[AddressSchema],
    profilePic: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
  },
  { timestamps: true }
);

const User= mongoose.model("User", UserSchema);
export default User;