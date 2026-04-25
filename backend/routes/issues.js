import express from "express";
import Issue from "../models/Issue.js";

const router = express.Router();

// GET all issues (optionally filter by city)
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.city) filter.city = req.query.city;
    const issues = await Issue.find(filter).sort({ created_at: -1 });
    res.json(issues);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET issues by city
router.get("/city/:city", async (req, res) => {
  try {
    const issues = await Issue.find({ city: req.params.city }).sort({ created_at: -1 });
    res.json(issues);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET issues by domain
router.get("/domain/:domain", async (req, res) => {
  try {
    const filter = { domain: req.params.domain };
    if (req.query.city) filter.city = req.query.city;
    const issues = await Issue.find(filter);
    res.json(issues);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET issues by user
router.get("/user/:userId", async (req, res) => {
  try {
    const issues = await Issue.find({ created_by: req.params.userId }).sort({ created_at: -1 });
    res.json(issues);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE issue
router.post("/", async (req, res) => {
  try {
    const issue = new Issue(req.body);
    await issue.save();
    res.json(issue);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE issue status
router.put("/:id", async (req, res) => {
  try {
    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPVOTE issue
router.put("/:id/upvote", async (req, res) => {
  try {
    const { userId } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Not found" });

    const alreadyVoted = issue.upvoted_by.includes(userId);
    if (alreadyVoted) {
      issue.upvoted_by = issue.upvoted_by.filter(id => id !== userId);
      issue.upvote_count = Math.max(0, issue.upvote_count - 1);
    } else {
      issue.upvoted_by.push(userId);
      issue.upvote_count += 1;
    }
    await issue.save();
    res.json(issue);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;