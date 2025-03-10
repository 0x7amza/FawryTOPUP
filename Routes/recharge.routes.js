const express = require("express");
const router = express.Router();

const rechargeController = require("../Controllers/recharge.controller");

/**
 * @swagger
 * /api/recharge:
 *   get:
 *     tags: [Recharge]
 *     summary: Retrieve a list of recharge requests with pagination
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of records to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number to retrieve
 *     responses:
 *       200:
 *         description: A list of recharge requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recharge'
 */
router.get("/", rechargeController.getAll);

/**
 * @swagger
 * /api/recharge/{RequestId}:
 *   get:
 *     tags: [Recharge]
 *     summary: Retrieve a specific recharge request by ID
 *     parameters:
 *       - in: path
 *         name: RequestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique identifier of the recharge request
 *     responses:
 *       200:
 *         description: The recharge request details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recharge'
 *       404:
 *          description: Recharge request not found
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                      message:
 *                      type: string
 *                      description: Error message
 */
router.get("/:RequestId", rechargeController.get);

/**
 * @swagger
 * /api/recharge:
 *   post:
 *     tags: [Recharge]
 *     summary: Create a new recharge request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               RequestId:
 *                 type: integer
 *                 description: Unique identifier for the recharge request
 *               PhoneNumber:
 *                 type: string
 *                 description: Phone number to be recharged
 *               Amount:
 *                 type: integer
 *                 description: Recharge amount
 *               portID:
 *                 type: integer
 *                 description: ID of the port associated with the recharge
 *             required: [RequestId, PhoneNumber, Amount, portID]
 *     responses:
 *       200:
 *         description: Recharge request processed successfully (existing or success)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recharge'
 *       202:
 *         description: Recharge request is pending
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recharge'
 *       500:
 *         description: Recharge request failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recharge'
 */
router.post("/", rechargeController.recharge);

module.exports = router;
