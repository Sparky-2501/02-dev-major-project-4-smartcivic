import express from "express";
import Issue from "../models/Issue.js";

const router = express.Router();

// GET all issues
router.get("/", async (req, res) => {
  const issues = await Issue.find().sort({ created_at: -1 });
  res.json(issues);
});

// GET issues by domain
router.get("/domain/:domain", async (req, res) => {
  const issues = await Issue.find({ domain: req.params.domain });
  res.json(issues);
});

// GET issues by user
router.get("/user/:userId", async (req, res) => {
  const issues = await Issue.find({ created_by: req.params.userId });
  res.json(issues);
});

// CREATE issue
router.post("/", async (req, res) => {
  const issue = new Issue(req.body);
  await issue.save();
  res.json(issue);
});

// UPDATE issue status
router.put("/:id", async (req, res) => {
  const updated = await Issue.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  res.json(updated);
});

export default router;