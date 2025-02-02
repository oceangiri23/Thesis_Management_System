module.exports = (sequelize, DataTypes) => {
  const Publication = sequelize.define('Publication', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: DataTypes.STRING,
    publication_date: DataTypes.DATE,
    StudentGroupId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'StudentGroups',
        key: 'id'
      }
    }
  });

  Publication.associate = function(models) {
    Publication.belongsTo(models.StudentGroup, {
      foreignKey: 'StudentGroupId'
    });
  };

  return Publication;
}; 