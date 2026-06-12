const express = require("express");
const multer = require("multer");
const { analyzeChart, getEvaluations } = require("../controllers/hedis.controller");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post("/analyze", upload.single("file"), analyzeChart);

module.exports = router;
