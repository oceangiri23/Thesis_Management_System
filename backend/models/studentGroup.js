module.exports = (sequelize, DataTypes) => {
  const StudentGroup = sequelize.define("StudentGroup", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    team_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thesis_name: DataTypes.STRING,
    description: DataTypes.TEXT,
    department: DataTypes.STRING,
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    project_status: {
      type: DataTypes.ENUM("pending", "active", "completed"),
      defaultValue: "pending",
    },
    number_of_member: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        max: 4,
      },
    },
    approval_status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    thesisDeadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  StudentGroup.associate = function (models) {
    StudentGroup.belongsTo(models.Supervisor, {
      foreignKey: "SupervisorEmail",
      targetKey: "email",
    });
    StudentGroup.hasMany(models.Student, {
      foreignKey: "StudentGroupId",
    });
    StudentGroup.hasMany(models.JoinRequest, {
      foreignKey: "GroupId",
    });
    StudentGroup.hasMany(models.ThesisSubmission, {
      foreignKey: "groupId",
      as: "ThesisSubmissions",
    });
  };

  return StudentGroup;
};
