module.exports = (sequelize, DataTypes) => {
  const JoinRequest = sequelize.define("JoinRequest", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
    },
  });

  JoinRequest.associate = function (models) {
    JoinRequest.belongsTo(models.Student, {
      foreignKey: "StudentEmail",
      targetKey: "email",
    });
    JoinRequest.belongsTo(models.StudentGroup, {
      foreignKey: "GroupId",
    });
  };

  return JoinRequest;
};
