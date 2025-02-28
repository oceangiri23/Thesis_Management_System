const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { ThesisSubmission, StudentGroup } = require("../models");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/thesis";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `thesis_${req.params.groupId}_${Date.now()}${path.extname(
        file.originalname
      )}`
    );
  },
});

const upload = multer({ storage: storage });

// Submit thesis
router.post("/:groupId/submit", upload.single("file"), async (req, res) => {
  try {
    const { groupId } = req.params;
    const filename = req.file.filename;

    // Get the latest version number for this group
    const latestSubmission = await ThesisSubmission.findOne({
      where: { groupId },
      order: [["version", "DESC"]],
    });

    const version = latestSubmission ? latestSubmission.version + 1 : 1;

    const submission = await ThesisSubmission.create({
      groupId,
      filename,
      version,
      status: "pending",
    });

    res.json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit thesis" });
  }
});

// Get current thesis submission for a group
router.get("/current/:groupId", async (req, res) => {
  try {
    const submission = await ThesisSubmission.findOne({
      where: { groupId: req.params.groupId },
      order: [["submittedAt", "DESC"]],
    });
    res.json(submission || null); // Return null if no submission found
  } catch (error) {
    console.error('Error fetching current thesis:', error);
    res.status(500).json({ error: "Failed to fetch thesis submission" });
  }
});

// Get all thesis submissions for a group
router.get("/history/:groupId", async (req, res) => {
  try {
    const submissions = await ThesisSubmission.findAll({
      where: { groupId: req.params.groupId },
      order: [["submittedAt", "DESC"]],
    });
    res.json(submissions || []); // Return empty array if no submissions found
  } catch (error) {
    console.error('Error fetching thesis history:', error);
    res.status(500).json({ error: "Failed to fetch thesis history" });
  }
});

// Download thesis file
router.get("/download/:filename", (req, res) => {
  const file = path.join(__dirname, "../uploads/thesis", req.params.filename);
  res.download(file);
});

// Update thesis status and provide feedback
router.post("/:submissionId/review", async (req, res) => {
  try {
    const { status, feedback, deadline, finalGrade } = req.body;
    const submission = await ThesisSubmission.findByPk(req.params.submissionId);

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    await submission.update({
      status,
      feedback,
      deadline,
      finalGrade,
    });

    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: "Failed to update thesis status" });
  }
});

// Get all pending thesis submissions for supervisor
router.get("/supervisor/:email", async (req, res) => {
  try {
    const groups = await StudentGroup.findAll({
      where: { SupervisorEmail: req.params.email },
      include: [
        {
          model: ThesisSubmission,
          as: "ThesisSubmissions",
          order: [["submittedAt", "DESC"]],
        },
      ],
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch thesis submissions" });
  }
});

// Set thesis deadline
router.post('/deadline/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { deadline } = req.body;

    const group = await StudentGroup.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    await group.update({ thesisDeadline: deadline });
    res.json({ message: 'Deadline set successfully', deadline });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set deadline' });
  }
});

// Get thesis deadline
router.get('/deadline/:groupId', async (req, res) => {
  try {
    const group = await StudentGroup.findByPk(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.json({ deadline: group.thesisDeadline });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deadline' });
  }
});

module.exports = router;
