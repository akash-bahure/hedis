const express = require("express");
const multer = require("multer");
const { analyzeChart, getEvaluations, qaReviewAnalysis } = require("../controllers/hedis.controller");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post("/analyze", upload.single("file"), analyzeChart);
router.post("/qa-review-analysis", qaReviewAnalysis);

module.exports = router;
