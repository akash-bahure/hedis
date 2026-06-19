const express = require("express");
const multer = require("multer");

const { uploadChart } = require("../controllers/upload.controller");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post("/chart", (req, res, next) => {
  console.log(`[AI] Upload Request Connection Initialized`);
  next();
}, upload.single("file"), (req, res, next) => {
  console.log(`[AI] Upload Request Body Parsed`);
  next();
}, uploadChart);

module.exports = router;
