module.exports = (sequelize, DataTypes) => {
  const ThesisSubmission = sequelize.define("ThesisSubmission", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "approved",
        "needs_revision",
        "final_approved"
      ),
      defaultValue: "pending",
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    finalGrade: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  ThesisSubmission.associate = function (models) {
    ThesisSubmission.belongsTo(models.StudentGroup, {
      foreignKey: "groupId",
      as: "group",
    });
  };

  return ThesisSubmission;
};
