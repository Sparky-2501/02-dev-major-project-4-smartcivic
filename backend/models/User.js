import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    default: ""
  },

  city: {
    type: String,
    default: ""
  },

  role: {
    type: String,
    enum: ["citizen", "authority", "admin"],
    default: "citizen"
  },

  domain: {
    type: String
  },

  avatar: {
    type: String,
    default: ""
  },

  bio: {
    type: String,
    default: ""
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", UserSchema);

export default User;