const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const auth = require("../middleware/auth");

router.get("/", groupController.getAllGroups);
router.get("/supervised", auth, groupController.getSupervisorGroups);
router.post("/", auth, groupController.createGroup);
router.post("/:groupId/join-requests", auth, groupController.createJoinRequest);
router.put(
  "/join-requests/:requestId",
  auth,
  groupController.handleJoinRequest
);
router.get("/:groupId", auth, groupController.getGroupDetails);
router.put("/:groupId/approval", auth, groupController.handleGroupApproval);
router.post("/:groupId/members", auth, groupController.addGroupMember);
router.get(
  "/:groupId/available-students",
  auth,
  groupController.getAvailableStudents
);

router.post("/:groupId/finalapprove", async (req, res) => {
  try {
    const group = await ThesisSubmission.findByPk(req.params.groupId);

    if (!group) {
      return res.status(404).json({ error: "group not found" });
    }

    await group.update({
      project_status: "completed",
    });

    res.json(group, { message: "Thesis status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update thesis status" });
  }
});

module.exports = router;
