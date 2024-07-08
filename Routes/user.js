const express = require("express");
const { register, login } = require("../controllers/user");
const { checkRole } = require("../middleware/roles");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/admin/data", checkRole(["admin"]), (req, res) => {
  res.send("Admin data access granted");
});

module.exports = router;

/**
 * @openapi
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request parameters
 *
 * /login:
 *   post:
 *     summary: User login
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized
 *
 * /admin/data:
 *   post:
 *     summary: Access admin data
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin data access granted
 *       403:
 *         description: Forbidden access
 */
