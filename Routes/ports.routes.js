const router = require("express").Router();
const portsController = require("../Controllers/ports.controller");

/**
 * @swagger
 * tags:
 *   name: Ports
 *   description: Ports management APIs
 */

/**
 * @swagger
 * /api/ports:
 *   post:
 *     summary: Create a new port
 *     tags: [Ports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Port'
 *     responses:
 *       200:
 *         description: The created port object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Port'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
router.post("/", portsController.create);

/**
 * @swagger
 * /api/ports:
 *   get:
 *     summary: Retrieve all ports
 *     tags: [Ports]
 *     responses:
 *       200:
 *         description: A list of ports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Port'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
router.get("/", portsController.findAll);

/**
 * @swagger
 * /api/ports/{id}:
 *   get:
 *     summary: Retrieve a single port by ID
 *     tags: [Ports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the port to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The requested port object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Port'
 *       404:
 *         description: Port not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
router.get("/:id", portsController.findOne);

/**
 * @swagger
 * /api/ports/{id}:
 *   put:
 *     summary: Update a port by ID
 *     tags: [Ports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the port to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Port'
 *     responses:
 *       200:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       404:
 *         description: Port not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
router.put("/:id", portsController.update);

/**
 * @swagger
 * /api/ports/{id}:
 *   delete:
 *     summary: Toggle the deletion status of a port by ID
 *     tags: [Ports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the port to toggle its deletion status
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success message indicating the toggle was successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message (e.g., "Port toggled successfully!")
 *       404:
 *         description: Port not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message (e.g., "Port with id=1 not found!")
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message (e.g., "Error toggling port status")
 */
router.delete("/:id", portsController.togglePortDeletion);

/**
 * @swagger
 * /api/ports/server/{serverID}:
 *   get:
 *     summary: Retrieve all ports associated with a specific server
 *     tags: [Ports]
 *     parameters:
 *       - in: path
 *         name: serverID
 *         required: true
 *         description: Numeric ID of the server to retrieve ports for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of ports associated with the server
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Port'
 *       404:
 *         description: No ports found for the given server ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
router.get("/server/:serverID", portsController.findAllByServer);

/**
 * @swagger
 * /api/ports/balance/{id}:
 *   put:
 *     summary: Update the balance of a port by ID
 *     tags:
 *       - Ports
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the port to update its balance
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Port'
 *     responses:
 *       200:
 *         description: Success message indicating the balance was updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message (e.g., "Port balance updated successfully!")
 *       404:
 *         description: Port not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message (e.g., "Port with id=1 not found!")
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message (e.g., "Error updating port balance")
 */

router.put("/balance/:id", portsController.updateBalance);

module.exports = router;
