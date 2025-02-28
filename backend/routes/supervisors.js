const express = require("express");
const router = express.Router();
const supervisorController = require("../controllers/supervisorController");
const auth = require("../middleware/auth");
const { StudentGroup, Student, JoinRequest } = require("../models");

router.get("/", auth, supervisorController.getAllSupervisors);

// Get all groups for a supervisor
router.get("/groups/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const groups = await StudentGroup.findAll({
      where: { SupervisorEmail: email },
      include: [
        {
          model: Student,
          attributes: ["email", "username"],
        },
        {
          model: JoinRequest,
          include: [
            {
              model: Student,
              attributes: ["username", "email"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(groups);
  } catch (error) {
    console.error("Error fetching supervisor groups:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
