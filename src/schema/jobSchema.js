// models/Job.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Job extends Model {}

  Job.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      recruiterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      jobName: {
        type: DataTypes.STRING(255),
      },
    },
    {
      sequelize,
      modelName: 'Job',
      tableName: 'jobs',
      timestamps: true,
    }
  );

  return Job;
};
