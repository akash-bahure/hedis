const express = require("express");
const router = express.Router();
const text2sqlController = require("../controllers/text2sql.controller");

router.post("/generate", text2sqlController.generateSql);

module.exports = router;
