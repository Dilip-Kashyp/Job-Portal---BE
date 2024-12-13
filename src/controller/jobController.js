const asyncHandler = require("../utils/asyncHandler");
const db = require("../database/db");
const {
  RESPONSE_ERROR,
  RESPONSE_JOB_CREATED,
  RESPONSE_INVALID_STATUS,
  RESPONSE_JOB_NOT_FOUND,
  RESPONSE_STATUS_UPDATED,
  RESPONSE_INVALID_ACTION,
  RESPONSE_APPLICATION_NOT_FOUND,
  RESPONSE_INVALID_OFFER_STATUS,
  RESPONSE_OFFER_ACCEPTED,
  RESPONSE_OFFER_REJECTED,
  RESPONSE_NO_APPLICANTS,
  RESPONSE_APPLICATION_SUCCESS,
  RESPONSE_NO_APPLIED_JOBS,
} = require("../constants/constants");

const createJob = asyncHandler(async (req, res) => {
  const user = req.user;
  const { jobName } = req.body;

  try {
    await db.query("INSERT INTO jobs (recruiterId, jobname) VALUES ($1, $2)", [
      user.id,
      jobName,
    ]);

    res.json({
      message: RESPONSE_JOB_CREATED,
    });
  } catch (error) {
    console.error(RESPONSE_ERROR, error.message);
    res.status(500).json({ message: RESPONSE_ERROR });
  }
});

const listJobs = asyncHandler(async (req, res) => {
  const user = req.user;

  try {
    let jobs;
    if (user.role == "applicant") {
      jobs = await db.query("SELECT * FROM jobs");
    } else {
      jobs = await db.query("SELECT * FROM jobs WHERE recruiterId = $1", [
        user.id,
      ]);
    }

    res.json(jobs.rows);
  } catch (error) {
    console.error(RESPONSE_ERROR, error.message);
    res.status(500).json({ message: RESPONSE_ERROR });
  }
});

const getApplicants = asyncHandler(async (req, res) => {
  const { jobId } = req.body;

  try {
    const query = `
    SELECT 
      u.name, 
      u.email,
      u.id,
      a.applied_status
    FROM 
      applicants a
    JOIN 
      users u
    ON 
      a.jobseeker_id = u.id
    WHERE 
      a.job_id = $1
    `;

    const { rows: applicants } = await db.query(query, [jobId]);

    if (applicants.length === 0) {
      return res.status(404).json({
        success: false,
        message: RESPONSE_NO_APPLICANTS,
      });
    }

    res.status(200).json({
      success: true,
      data: applicants,
    });
  } catch (error) {
    console.error(RESPONSE_ERROR, error);
    res.status(500).json({
      success: false,
      message: RESPONSE_ERROR,
    });
  }
});

const applyJob = asyncHandler(async (req, res) => {
  const { jobId } = req.body;
  const user = req.user;

  if (!jobId) {
    return res.status(400).json({ message: RESPONSE_ERROR });
  }

  try {
    const job = await db.query("SELECT * FROM jobs WHERE id = $1", [jobId]);
    if (job.rows.length === 0) {
      return res.status(404).json({ message: RESPONSE_JOB_NOT_FOUND });
    }

    const application = await db.query(
      "INSERT INTO applicants (job_id, jobseeker_id, applied_status) VALUES ($1, $2, $3) RETURNING *",
      [jobId, user.id, "applied"]
    );

    res.status(201).json({ 
      message: RESPONSE_APPLICATION_SUCCESS, 
      data: application.rows 
    });
  } catch (error) {
    console.error(RESPONSE_ERROR, error);
    res.status(500).json({ message: RESPONSE_ERROR });
  }
});

const appliedJob = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const query = `
    SELECT 
      j.jobname,
      j.id,
      j.recruiterid,
      a.applied_status
    FROM 
      applicants a
    JOIN 
      jobs j
    ON 
      a.job_id = j.id
    WHERE 
      a.jobseeker_id = $1
    `;

    const { rows: appliedJobs } = await db.query(query, [userId]);

    if (appliedJobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: RESPONSE_NO_APPLIED_JOBS,
      });
    }

    res.status(200).json({
      success: true,
      data: appliedJobs,
    });
  } catch (error) {
    console.error(RESPONSE_ERROR, error);
    res.status(500).json({
      success: false,
      message: RESPONSE_ERROR,
    });
  }
});

const updateJobStatus = asyncHandler(async (req, res) => {
  const { jobId, status } = req.body;

  if (!["job_offered", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: RESPONSE_INVALID_STATUS,
    });
  }

  try {
    const job = await db.query("SELECT * FROM applicants WHERE job_id = $1", [jobId]);
    if (job.rows.length === 0) {
      return res.status(404).json({ success: false, message: RESPONSE_JOB_NOT_FOUND });
    }

    await db.query(
      "UPDATE applicants SET applied_status = $1 WHERE job_id = $2",
      [status, jobId]
    );

    res.status(200).json({ success: true, message: RESPONSE_STATUS_UPDATED });
  } catch (error) {
    console.error(RESPONSE_ERROR, error);
    res.status(500).json({ success: false, message: RESPONSE_ERROR });
  }
});

const acceptOffer = asyncHandler(async (req, res) => {
  const { jobId, action } = req.body;

  if (!["accept", "reject"].includes(action)) {
    return res.status(400).json({
      success: false,
      message: RESPONSE_INVALID_ACTION,
    });
  }

  try {
    const application = await db.query(
      "SELECT * FROM applicants WHERE job_id = $1 AND jobseeker_id = $2",
      [jobId, req.user.id]
    );

    if (application.rows.length === 0) {
      return res.status(404).json({ success: false, message: RESPONSE_APPLICATION_NOT_FOUND });
    }

    const currentStatus = application.rows[0].applied_status;
    if (currentStatus !== "job_offered") {
      return res.status(400).json({
        success: false,
        message: RESPONSE_INVALID_OFFER_STATUS,
      });
    }

    const newStatus = action === "accept" ? "accepted" : "reject";
    await db.query(
      "UPDATE applicants SET applied_status = $1 WHERE job_id = $2 AND jobseeker_id = $3",
      [newStatus, jobId, req.user.id]
    );

    const message = action === "accept" ? RESPONSE_OFFER_ACCEPTED : RESPONSE_OFFER_REJECTED;

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error(RESPONSE_ERROR, error);
    res.status(500).json({ success: false, message: RESPONSE_ERROR });
  }
});

module.exports = {
  createJob,
  listJobs,
  getApplicants,
  applyJob,
  appliedJob,
  updateJobStatus,
  acceptOffer,
};