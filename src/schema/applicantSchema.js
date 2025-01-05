// models/Applicant.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Applicant extends Model {}

  Applicant.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      jobSeekerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      appliedStatus: {
        type: DataTypes.STRING(50),
      },
    },
    {
      sequelize,
      modelName: 'Applicant',
      tableName: 'applicants',
      timestamps: true,
    }
  );

  return Applicant;
};
