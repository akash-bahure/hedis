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
 *       400:
 *         description: Invalid request
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
 *     description: Update organization details such as name and active status.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Acme Updated
 *               is_active:
 *                 type: boolean
 *                 example: false
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
 *               role:
 *                 type: string
 *                 example: Org Admin
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

module.exports = router;