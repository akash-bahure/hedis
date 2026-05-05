const express = require("express");
const router = express.Router();
const orgController = require("../controllers/orgController");

/**
 * @swagger
 * /admin/create-org:
 *   post:
 *     summary: Create a new organization (tenant)
 *     description: Creates a new tenant by generating a dedicated schema and storing tenant metadata.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - subdomain
 *             properties:
 *               name:
 *                 type: string
 *                 example: Acme Corp
 *               subdomain:
 *                 type: string
 *                 example: acme
 *     responses:
 *       201:
 *         description: Organization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization created
 *                 tenant:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "b3f8c8c2-1234-4abc-9def-123456789abc"
 *                     name:
 *                       type: string
 *                       example: Acme Corp
 *                     subdomain:
 *                       type: string
 *                       example: acme
 *                     schema_name:
 *                       type: string
 *                       example: acme_schema
 *       400:
 *         description: Invalid input or duplicate subdomain
 *       500:
 *         description: Server error
 */
router.post("/create-org", orgController.createOrg);

module.exports = router;
