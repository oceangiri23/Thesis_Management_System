module.exports = (sequelize, DataTypes) => {
  const Supervisor = sequelize.define('Supervisor', {
    email: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false
    },
    no_of_group_supervised: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'supervisor',
      allowNull: false
    }
  });

  Supervisor.associate = function(models) {
    Supervisor.hasMany(models.StudentGroup, {
      foreignKey: 'SupervisorEmail',
      sourceKey: 'email'
    });
  };

  return Supervisor;
}; 