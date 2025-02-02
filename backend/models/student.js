module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
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
    rollno: {
      type: DataTypes.STRING,
      allowNull: false
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'student',
      allowNull: false
    },
    StudentGroupId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'StudentGroups',
        key: 'id'
      }
    }
  });

  Student.associate = function(models) {
    Student.belongsTo(models.StudentGroup, {
      foreignKey: 'StudentGroupId'
    });
    Student.hasMany(models.JoinRequest, {
      foreignKey: 'StudentEmail',
      sourceKey: 'email'
    });
  };

  return Student;
}; 