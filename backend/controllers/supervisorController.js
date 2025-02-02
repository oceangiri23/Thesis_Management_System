const { Supervisor } = require('../models');

exports.getAllSupervisors = async (req, res) => {
    try {
        const supervisors = await Supervisor.findAll({
            attributes: ['email', 'username', 'department', 'no_of_group_supervised']
        });
        res.json(supervisors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 