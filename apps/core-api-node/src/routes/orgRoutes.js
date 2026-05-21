const express = require("express");
const router = express.Router();

const orgController = require("../controllers/orgController");

const superAdminAuth = require("../middlewares/superAdminAuth");

/**
 * @swagger
 * /admin/orgs:
 *   get:
 *     summary: Get all organizations
 *     description: Fetch all tenant organizations in the system.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organizations fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 550e8400-e29b-41d4-a716-446655440000
 *                   name:
 *                     type: string
 *                     example: Acme Corp
 *                   subdomain:
 *                     type: string
 *                     example: acme
 *                   schema_name:
 *                     type: string
 *                     example: acme_schema
 *                   is_active:
 *                     type: boolean
 *                     example: true
 *                   is_archived:
 *                     type: boolean
 *                     example: false
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get("/", superAdminAuth, orgController.getOrganizations);

/**
 * @swagger
 * /admin/orgs:
 *   post:
 *     summary: Create organization
 *     description: Creates a new organization and dynamically provisions a tenant schema.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
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
 *                 description: Organization name (required)
 *               subdomain:
 *                 type: string
 *                 example: acme
 *                 description: Organization subdomain, must be unique (required)
 *               is_active:
 *                 type: boolean
 *                 example: true
 *                 description: Organization active status (optional, defaults to true)
 *               api_key:
 *                 type: string
 *                 example: null
 *                 description: API key for the organization (optional, defaults to null)
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
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     name:
 *                       type: string
 *                       example: Acme Corp
 *                     subdomain:
 *                       type: string
 *                       example: acme
 *                     schema_name:
 *                       type: string
 *                       example: acme_schema
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *                     is_archived:
 *                       type: boolean
 *                       example: false
 *                     api_key:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request - name and subdomain are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post("/", superAdminAuth, orgController.createOrg);

/**
 * @swagger
 * /admin/orgs/{id}:
 *   patch:
 *     summary: Update organization
 *     description: Update organization details. Supports partial updates for name and is_active fields. At least one field is required.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Organization ID (UUID)
 *         schema:
 *           type: string
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: At least one field is required
 *             properties:
 *               name:
 *                 type: string
 *                 example: Acme Updated
 *                 description: New organization name (optional)
 *               is_active:
 *                 type: boolean
 *                 example: false
 *                 description: Organization active status (optional)
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization updated
 *                 organization:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     name:
 *                       type: string
 *                       example: Acme Updated
 *                     subdomain:
 *                       type: string
 *                       example: acme
 *                     schema_name:
 *                       type: string
 *                       example: acme_schema
 *                     is_active:
 *                       type: boolean
 *                       example: false
 *                     is_archived:
 *                       type: boolean
 *                       example: false
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - at least one field (name or is_active) is required for update
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", superAdminAuth, orgController.updateOrg);

/**
 * @swagger
 * /admin/orgs/{id}:
 *   delete:
 *     summary: Archive organization
 *     description: Soft archive an organization. Archived organizations cannot be accessed.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Organization ID
 *         schema:
 *           type: string
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Organization archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Organization archived
 *                 organization:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     subdomain:
 *                       type: string
 *                     schema_name:
 *                       type: string
 *                     is_active:
 *                       type: boolean
 *                     is_archived:
 *                       type: boolean
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", superAdminAuth, orgController.archiveOrg);

/**
 * @swagger
 * /admin/orgs/{org_id}/tenant-admins:
 *   post:
 *     summary: Create tenant admin
 *     description: Creates an admin user inside a tenant organization schema.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         description: Organization ID
 *         schema:
 *           type: string
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: Acme Admin
 *               email:
 *                 type: string
 *                 example: admin@acme.com
 *     responses:
 *       201:
 *         description: Tenant admin created successfully
 *       400:
 *         description: User already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Organization inactive
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:org_id/tenant-admins",
  superAdminAuth,
  require("../controllers/adminUserController").createTenantAdmin
);

/**
 * @swagger
 * /admin/orgs/{id}/sync-medical-coding:
 *   post:
 *     summary: Sync medical coding data
 *     description: |
 *       Fetches projects, patients, charts, and related metadata
 *       from the external AI Medical Coding system using the
 *       tenant's configured API endpoint and API key.
 *
 *       The synced data is normalized and stored into the tenant schema tables:
 *       - patients
 *       - patient_charts
 *       - projects
 *
 *       This endpoint is restricted to super admins only.
 *
 *     tags:
 *       - Organizations
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Tenant / Organization ID
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *
 *     responses:
 *       200:
 *         description: Medical coding sync completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Medical coding sync completed
 *
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *
 *       403:
 *         description: Forbidden - Only super admins can perform sync
 *
 *       404:
 *         description: Tenant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tenant not found
 *
 *       500:
 *         description: Internal server error or external API failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed external API
 */
router.post(
  "/:id/sync-medical-coding",
  superAdminAuth,
  orgController.syncExternalCharts
);

module.exports = router;
