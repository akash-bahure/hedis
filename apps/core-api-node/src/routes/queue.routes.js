const express = require("express");
const router = express.Router();
const chartQueue = require("../queue/chart.queue");

/**
 * @swagger
 * /api/charts/jobs/{jobId}:
 *   get:
 *     summary: Get queue job status
 *     tags: [Queue]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job status retrieved
 */
router.get("/jobs/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await chartQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    
    const state = await job.getState();
    return res.json({ jobId, status: state });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
