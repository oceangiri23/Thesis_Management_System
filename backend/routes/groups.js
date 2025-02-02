const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../middleware/auth');

router.get('/', auth, groupController.getAllGroups);
router.get('/supervised', auth, groupController.getSupervisorGroups);
router.post('/', auth, groupController.createGroup);
router.post('/:groupId/join-requests', auth, groupController.createJoinRequest);
router.put('/join-requests/:requestId', auth, groupController.handleJoinRequest);
router.get('/:groupId', auth, groupController.getGroupDetails);
router.put('/:groupId/approval', auth, groupController.handleGroupApproval);
router.post('/:groupId/members', auth, groupController.addGroupMember);
router.get('/:groupId/available-students', auth, groupController.getAvailableStudents);

module.exports = router; 