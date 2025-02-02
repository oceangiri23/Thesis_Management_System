const { StudentGroup, Student, Supervisor, JoinRequest } = require('../models');
const { Op } = require('sequelize');

exports.getAllGroups = async (req, res) => {
    try {
        const groups = await StudentGroup.findAll({
            include: [
                {
                    model: Student,
                    attributes: ['email', 'username']
                },
                {
                    model: Supervisor,
                    attributes: ['email', 'username']
                },
                {
                    model: JoinRequest,
                    include: [{
                        model: Student,
                        attributes: ['email', 'username']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSupervisorGroups = async (req, res) => {
    try {
        const supervisorEmail = req.user.id; // Changed from req.params.supervisorEmail
        
        const groups = await StudentGroup.findAll({
            where: { SupervisorEmail: supervisorEmail },
            include: [
                {
                    model: Student,
                    attributes: ['email', 'username']
                },
                {
                    model: JoinRequest,
                    where: { status: 'pending' },
                    required: false,
                    include: [{
                        model: Student,
                        attributes: ['email', 'username']
                    }]
                }
            ]
        });
        res.json(groups);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

exports.createGroup = async (req, res) => {
    try {
        const { team_name, thesis_name, description, SupervisorEmail, creatorEmail } = req.body;

        // Get creator's details
        const creator = await Student.findByPk(creatorEmail);
        if (!creator) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if student is already in a group
        if (creator.StudentGroupId) {
            return res.status(400).json({ message: 'You are already in a group' });
        }

        // Create group with creator's department and semester
        const group = await StudentGroup.create({
            team_name,
            thesis_name,
            description,
            department: creator.department,
            semester: creator.semester,
            SupervisorEmail,
            number_of_member: 1,
            approval_status: 'pending'
        });

        // Add creator as first member
        await creator.update({ StudentGroupId: group.id });

        // Get the complete group data with associations
        const completeGroup = await StudentGroup.findByPk(group.id, {
            include: [
                {
                    model: Student,
                    attributes: ['email', 'username', 'semester', 'department']
                },
                {
                    model: Supervisor,
                    attributes: ['email', 'username']
                }
            ]
        });

        res.status(201).json(completeGroup);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};

exports.createJoinRequest = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { studentEmail } = req.body;

        // Get the student and group details
        const student = await Student.findByPk(studentEmail);
        const group = await StudentGroup.findByPk(groupId, {
            include: [{
                model: Student,
                attributes: ['email', 'semester', 'department']
            }]
        });

        if (!student || !group) {
            return res.status(404).json({ message: 'Student or group not found' });
        }

        // Check if student is already in a group
        if (student.StudentGroupId) {
            return res.status(400).json({ message: 'You are already in a group' });
        }

        // Check if group is full
        if (group.number_of_member >= 4) {
            return res.status(400).json({ message: 'Group is already full' });
        }

        // Check semester match
        if (student.semester !== group.semester) {
            return res.status(400).json({ message: 'You can only join groups from your semester' });
        }

        // Check department match
        if (student.department !== group.department) {
            return res.status(400).json({ message: 'You can only join groups from your department' });
        }

        // Check if request already exists
        const existingRequest = await JoinRequest.findOne({
            where: {
                GroupId: groupId,
                StudentEmail: studentEmail,
                status: 'pending'
            }
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Join request already exists' });
        }

        // Create the join request
        const request = await JoinRequest.create({
            GroupId: groupId,
            StudentEmail: studentEmail
        });

        res.status(201).json(request);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};

exports.handleJoinRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body;

        const request = await JoinRequest.findByPk(requestId, {
            include: [
                {
                    model: StudentGroup,
                    include: [{
                        model: Student,
                        attributes: ['email', 'semester', 'department']
                    }]
                },
                {
                    model: Student,
                    attributes: ['email', 'semester', 'department', 'StudentGroupId']
                }
            ]
        });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // If accepting, do additional checks
        if (status === 'accepted') {
            const group = request.StudentGroup;
            const student = request.Student;
            
            // Check if group is still under 4 members
            if (group.number_of_member >= 4) {
                await request.update({ status: 'rejected' });
                return res.status(400).json({ message: 'Group is now full' });
            }

            // Check if student is still available
            if (student.StudentGroupId) {
                await request.update({ status: 'rejected' });
                return res.status(400).json({ message: 'Student is already in another group' });
            }

            // Check semester match
            if (student.semester !== group.semester) {
                await request.update({ status: 'rejected' });
                return res.status(400).json({ message: 'Student must be from the same semester' });
            }

            // Check department match
            if (student.department !== group.department) {
                await request.update({ status: 'rejected' });
                return res.status(400).json({ message: 'Student must be from the same department' });
            }

            // Update student's group
            await student.update({ StudentGroupId: request.GroupId });

            // Update group member count
            await group.update({
                number_of_member: group.number_of_member + 1
            });
        }

        await request.update({ status });

        res.json({ message: `Request ${status}` });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};

// Add a new method to get group details
exports.getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await StudentGroup.findByPk(groupId, {
            include: [
                {
                    model: Student,
                    attributes: ['email', 'username', 'rollno', 'semester']
                },
                {
                    model: Supervisor,
                    attributes: ['email', 'username', 'department']
                },
                {
                    model: JoinRequest,
                    where: { status: 'pending' },
                    required: false,
                    include: [{
                        model: Student,
                        attributes: ['email', 'username', 'rollno']
                    }]
                }
            ]
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.handleGroupApproval = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { status, rejection_reason } = req.body;
        const supervisorEmail = req.user.id; // Changed from req.user.email to req.user.id

        // First check if the group exists
        const group = await StudentGroup.findByPk(groupId);
        
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Then check if the supervisor is authorized
        if (group.SupervisorEmail !== supervisorEmail) {
            return res.status(403).json({ 
                message: 'You are not authorized to approve/reject this group' 
            });
        }

        await group.update({ 
            approval_status: status,
            rejection_reason: status === 'rejected' ? rejection_reason : null,
            project_status: status === 'approved' ? 'active' : 'pending'
        });

        // If rejected, notify students or handle as needed
        if (status === 'rejected') {
            // You could implement notification logic here
        }

        res.json({ 
            message: `Group ${status}`,
            group
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

exports.addGroupMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { studentEmail } = req.body;
        const requestingUserEmail = req.user.id;

        // Get the group with its members
        const group = await StudentGroup.findByPk(groupId, {
            include: [{
                model: Student,
                attributes: ['email', 'username', 'semester', 'department']
            }]
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if requesting user is a member of the group
        const isMember = group.Students.some(s => s.email === requestingUserEmail);
        if (!isMember) {
            return res.status(403).json({ message: 'Only group members can add new members' });
        }

        // Get the student to be added
        const studentToAdd = await Student.findByPk(studentEmail);
        if (!studentToAdd) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if student is already in a group
        if (studentToAdd.StudentGroupId) {
            return res.status(400).json({ message: 'Student is already in a group' });
        }

        // Check if group is full
        if (group.number_of_member >= 4) {
            return res.status(400).json({ message: 'Group is already full' });
        }

        // Check semester match
        if (studentToAdd.semester !== group.semester) {
            return res.status(400).json({ message: 'Student must be from the same semester' });
        }

        // Check department match
        if (studentToAdd.department !== group.department) {
            return res.status(400).json({ message: 'Student must be from the same department' });
        }

        // Add student to group
        await studentToAdd.update({ StudentGroupId: groupId });
        await group.update({ number_of_member: group.number_of_member + 1 });

        // Get updated group data
        const updatedGroup = await StudentGroup.findByPk(groupId, {
            include: [{
                model: Student,
                attributes: ['email', 'username', 'semester', 'department']
            }]
        });

        res.json({
            message: 'Member added successfully',
            group: updatedGroup
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
};

// Add a method to get available students
exports.getAvailableStudents = async (req, res) => {
    try {
        const { groupId } = req.params;

        // Get the group to check semester and department
        const group = await StudentGroup.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Find students from same semester and department who aren't in any group
        const students = await Student.findAll({
            where: {
                semester: group.semester,
                department: group.department,
                StudentGroupId: null
            },
            attributes: ['email', 'username', 'rollno']
        });

        res.json(students);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}; 