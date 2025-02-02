module.exports = (sequelize, DataTypes) => {
  const DefenceCall = sequelize.define('DefenceCall', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    date: DataTypes.DATE,
    status: DataTypes.STRING,
    StudentGroupId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'StudentGroups',
        key: 'id'
      }
    }
  });

  DefenceCall.associate = function(models) {
    DefenceCall.belongsTo(models.StudentGroup, {
      foreignKey: 'StudentGroupId'
    });
  };

  return DefenceCall;
}; 