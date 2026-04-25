import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  location: {
    type: String
  },
  city: {
    type: String,
    default: ""
  },
  created_by: {
    type: String
  },
  status: {
    type: String,
    default: "reported"
  },
  upvote_count: {
    type: Number,
    default: 0
  },
  upvoted_by: {
    type: [String],
    default: []
  },
  image_url: {
    type: String,
    default: ""
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Issue = mongoose.model("Issue", IssueSchema);

export default Issue;