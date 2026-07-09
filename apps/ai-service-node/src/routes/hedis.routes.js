const express = require("express");
const multer = require("multer");
const { analyzeChart, getEvaluations, qaReviewAnalysis, analyzeSingleMeasure } = require("../controllers/hedis.controller");
const clinicalTimelineController = require("../controllers/clinicalTimeline.controller");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post("/analyze", upload.single("file"), analyzeChart);
router.post("/analyze-single", analyzeSingleMeasure);
router.post("/qa-review-analysis", qaReviewAnalysis);

router.post("/clinical-timeline/extract", upload.single("file"), clinicalTimelineController.extractTimeline);

module.exports = router;
