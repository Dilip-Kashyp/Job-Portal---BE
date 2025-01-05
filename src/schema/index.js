// models/index.js
const { Sequelize } = require("sequelize");
const User = require("./userSchema");
const Job = require("./jobSchema");
const Applicant = require("./applicantSchema");

const sequelize = new Sequelize("job", "postgres", "New_password", {
  host: "localhost",
  dialect: "postgres",
});

const models = {
  User: User(sequelize),
  Job: Job(sequelize),
  Applicant: Applicant(sequelize),
};

models.User.hasMany(models.Job, { foreignKey: "recruiterId", as: "jobs" });
models.Job.belongsTo(models.User, {
  foreignKey: "recruiterId",
  as: "recruiter",
});

models.User.hasMany(models.Applicant, {
  foreignKey: "jobSeekerId",
  as: "applications",
});
models.Applicant.belongsTo(models.User, {
  foreignKey: "jobSeekerId",
  as: "jobSeeker",
});

models.Job.hasMany(models.Applicant, { foreignKey: "jobId", as: "applicants" });
models.Applicant.belongsTo(models.Job, { foreignKey: "jobId", as: "job" });

module.exports = { sequelize, ...models };
