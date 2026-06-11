const express = require("express");
const multer = require("multer");

const { uploadChart } = require("../controllers/upload.controller");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post("/chart", upload.single("file"), uploadChart);

module.exports = router;
