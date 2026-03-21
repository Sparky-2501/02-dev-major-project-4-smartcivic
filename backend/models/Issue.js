import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  domain: String,
  location: String,
  created_by: String,

  status: {
    type: String,
    default: "reported"
  },

  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Issue", IssueSchema);