const express = require("express");
const {
  createNotification,
  getNotifications,
  markAsRead,
  GetallnotificationByUser,
} = require("../controllers/notification");
const router = express.Router();

router.post("/create/notification", createNotification);
router.get("/", getNotifications);
router.put("/:id/markAsRead", markAsRead);
router.get("/notification/:userId", GetallnotificationByUser);

module.exports = router;

/**
 * @openapi
 * /create/notification:
 *   post:
 *     summary: Create a new notification
 *     tags:
 *       - Notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - message
 *             retry:
 *                rabbitmq if failed to send notification to user
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The user ID to whom the notification is sent
 *               message:
 *                 type: string
 *                 description: The notification message content
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Invalid request parameters
 *
 * /:
 *   get:
 *     summary: Retrieve all notifications
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: A list of all notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *
 *
 * /{id}/markAsRead:
 *   put:
 *     summary: Mark a notification as read
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the notification
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *
 * /notification/{userId}:
 *   get:
 *     summary: Get all notifications for a specific user pagination stuff here with 0 to 10 data in one page and with sort and search
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The user ID to retrieve notifications for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of notifications for the specified user
 *       404:
 *         description: User not found
 */
