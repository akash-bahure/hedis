const express = require("express");
const router = express.Router();
const controller = require("../controllers/profile.controller");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get logged in user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data fetched successfully
 *       404:
 *         description: Profile not found
 */
router.get("/me", authMiddleware, controller.getProfile);
router.get("/me", authMiddleware, controller.getProfile);

/**
 * @swagger
 * /api/profile/{id}:
 *   patch:
 *     summary: Update user profile information
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Sarah
 *               last_name:
 *                 type: string
 *                 example: Johnson
 *               credentials:
 *                 type: string
 *                 example: RHIA, CPC, CPHQ
 *               email:
 *                 type: string
 *                 example: s.johnson@hedisplatform.com
 *               phone:
 *                 type: string
 *                 example: (617) 555-0142
 *               mobile_phone:
 *                 type: string
 *                 example: (617) 555-0187
 *               department:
 *                 type: string
 *                 example: Clinical Operations
 *               job_title:
 *                 type: string
 *                 example: HEDIS Lead Abstractor
 *               location:
 *                 type: string
 *                 example: Boston, MA
 *               bio:
 *                 type: string
 *                 example: Experienced HEDIS abstractor...
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     issuer:
 *                       type: string
 *                     issued_year:
 *                       type: string
 *                     status:
 *                       type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch("/:id", controller.updateProfile);

/**
 * @swagger
 * /api/profile/{id}/preferences:
 *   patch:
 *     summary: Update user preferences
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appearance:
 *                 type: object
 *                 properties:
 *                   colorTheme:
 *                     type: string
 *                     example: Light
 *                   sidebarDensity:
 *                     type: string
 *                     example: Comfortable
 *               workflowDefaults:
 *                 type: object
 *                 properties:
 *                   defaultLandingPage:
 *                     type: string
 *                     example: Dashboard
 *                   defaultMeasurementYear:
 *                     type: string
 *                     example: HEDIS MY2026
 *                   itemsPerPage:
 *                     type: integer
 *                     example: 25
 *                   dateFormat:
 *                     type: string
 *                     example: MM/DD/YYYY
 *                   timezone:
 *                     type: string
 *                     example: Eastern Time (ET)
 *               workspaceBehavior:
 *                 type: object
 *                 properties:
 *                   autoSave:
 *                     type: boolean
 *                     example: true
 *                   confirmBeforeSubmission:
 *                     type: boolean
 *                     example: true
 *                   showQuickStats:
 *                     type: boolean
 *                     example: true
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.patch("/:id/preferences", controller.updatePreferences);

/**
 * @swagger
 * /api/profile/{id}/notifications:
 *   patch:
 *     summary: Update user notifications
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventNotifications:
 *                 type: object
 *                 properties:
 *                   memberAssignments:
 *                     type: object
 *                     properties:
 *                       inApp:
 *                         type: boolean
 *                         example: true
 *                       email:
 *                         type: boolean
 *                         example: true
 *                   qaFeedback:
 *                     type: object
 *                     properties:
 *                       inApp:
 *                         type: boolean
 *                         example: true
 *                       email:
 *                         type: boolean
 *                         example: true
 *                   abstractionDeadlines:
 *                     type: object
 *                     properties:
 *                       inApp:
 *                         type: boolean
 *                         example: true
 *                       email:
 *                         type: boolean
 *                         example: false
 *                   ncqaSubmissions:
 *                     type: object
 *                     properties:
 *                       inApp:
 *                         type: boolean
 *                         example: true
 *                       email:
 *                         type: boolean
 *                         example: true
 *                   systemUpdates:
 *                     type: object
 *                     properties:
 *                       inApp:
 *                         type: boolean
 *                         example: false
 *                       email:
 *                         type: boolean
 *                         example: false
 *               weeklyDigest:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                     example: true
 *                   day:
 *                     type: string
 *                     example: Monday
 *     responses:
 *       200:
 *         description: Notifications updated successfully
 */
router.patch("/:id/notifications", controller.updateNotifications);

/**
 * @swagger
 * /api/profile/{id}/security:
 *   patch:
 *     summary: Update security settings
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: oldPassword123
 *               newPassword:
 *                 type: string
 *                 example: newPassword123
 *               security:
 *                 type: object
 *                 properties:
 *                   two_factor_auth:
 *                     type: boolean
 *                     example: true
 *                   session_timeout:
 *                     type: integer
 *                     example: 30
 *                   login_alerts:
 *                     type: boolean
 *                     example: true
 *     responses:
 *       200:
 *         description: Security settings updated successfully
 *       404:
 *         description: Profile not found
 */
router.patch("/:id/security", controller.updateSecurity);

module.exports = router;
