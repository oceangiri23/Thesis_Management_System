module.exports = (sequelize, DataTypes) => {
  const ProposalSubmission = sequelize.define("ProposalSubmission", {
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
      type: DataTypes.ENUM("pending", "approved", "needs_revision"),
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
  });

  ProposalSubmission.associate = function (models) {
    ProposalSubmission.belongsTo(models.StudentGroup, {
      foreignKey: "groupId",
      as: "group",
    });
  };

  return ProposalSubmission;
};
