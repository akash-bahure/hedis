const express = require("express");

const router = express.Router();

const pool = require("../config/db");

router.get("/:patientId", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM timeline_events
      WHERE patient_id = $1
      ORDER BY event_date DESC
      `,
      [req.params.patientId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
