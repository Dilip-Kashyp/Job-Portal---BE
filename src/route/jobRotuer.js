const Router = require("express");
const { verifyJWT } = require("../middleware/auth.js");
const {
  createJob,
  listJobs,
  getApplicants,
  applyJob,
  appliedJob,
  updateJobStatus,
  acceptOffer,
} = require("../controller/jobController.js");
const router = Router();

router.route("/create-job").post(verifyJWT, createJob);
router.route("/list-job").post(verifyJWT, listJobs);
router.route("/get-applicants").post(verifyJWT, getApplicants);
router.route("/apply-job").post(verifyJWT, applyJob);
router.route("/applied-job").post(verifyJWT, appliedJob);
router.route("/update-job-status").post(verifyJWT, updateJobStatus);
router.route("/accept-offer").post(verifyJWT, acceptOffer);

module.exports = router;