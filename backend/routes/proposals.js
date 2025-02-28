const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { ProposalSubmission } = require("../models");

// Set deadline for a group's proposal
router.post("/deadline/:groupId", async (req, res) => {
  try {
    const { deadline } = req.body;
    const { groupId } = req.params;

    // Store deadline in a simple JSON file
    const deadlinesPath = path.join(__dirname, "../uploads/deadlines.json");
    let deadlines = {};

    if (fs.existsSync(deadlinesPath)) {
      deadlines = JSON.parse(fs.readFileSync(deadlinesPath));
    }

    deadlines[groupId] = deadline;
    fs.writeFileSync(deadlinesPath, JSON.stringify(deadlines));

    res.json({ message: "Deadline set successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get deadline for a group
router.get("/deadline/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const deadlinesPath = path.join(__dirname, "../uploads/deadlines.json");

    if (!fs.existsSync(deadlinesPath)) {
      return res.status(404).json({ message: "No deadlines set" });
    }

    const deadlines = JSON.parse(fs.readFileSync(deadlinesPath));
    const deadline = deadlines[groupId];

    if (!deadline) {
      return res
        .status(404)
        .json({ message: "No deadline set for this group" });
    }

    res.json({ deadline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get submission history for a group
router.get("/submissions/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const submissions = await ProposalSubmission.findAll({
      where: { groupId: parseInt(groupId) },
      order: [["submittedAt", "DESC"]],
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current active submission
router.get("/current/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const submission = await ProposalSubmission.findOne({
      where: {
        groupId: parseInt(groupId),
        status: ["pending", "needs_revision"],
      },
      order: [["submittedAt", "DESC"]],
    });

    if (!submission) {
      return res.status(404).json({ message: "No active submission found" });
    }

    res.json({
      filename: submission.filename,
      status: submission.status,
      feedback: submission.feedback,
      deadline: submission.deadline,
      submittedAt: submission.submittedAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle proposal review (approve or request revision)
router.post("/review/:submissionId", async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, feedback, deadline } = req.body;

    const submission = await ProposalSubmission.findByPk(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    await submission.update({
      status,
      feedback,
      deadline: status === "needs_revision" ? deadline : null,
    });

    res.json({
      message:
        status === "approved" ? "Proposal approved" : "Revision requested",
      submission,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload proposal file
router.post("/upload/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { file } = req.body;

    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // Extract base64 data and file extension
    const matches = file.match(/^data:.+\/(.+);base64,(.*)$/);
    const ext = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, "base64");

    // Create filename with timestamp
    const filename = `proposal_${groupId}_${Date.now()}.${ext}`;
    const filepath = path.join(__dirname, "../uploads", filename);

    // Save file
    fs.writeFileSync(filepath, buffer);

    // Create submission record
    const submission = await ProposalSubmission.create({
      groupId: parseInt(groupId),
      filename,
      status: "pending",
    });

    res.json({
      message: "File uploaded successfully",
      filename,
      submission,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download proposal file
router.get("/download/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(__dirname, "../uploads", filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.download(filepath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel submission
router.delete("/cancel/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    // Find the current submission
    const submission = await ProposalSubmission.findOne({
      where: {
        groupId: parseInt(groupId),
        status: ["pending", "needs_revision"],
      },
      order: [["submittedAt", "DESC"]],
    });

    if (!submission) {
      return res.status(404).json({ message: "No active submission found" });
    }

    // Delete the file
    const filepath = path.join(__dirname, "../uploads", submission.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Delete the submission record
    await submission.destroy();

    res.json({ message: "Submission cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
