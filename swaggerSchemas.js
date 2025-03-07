/**
 * @swagger
 * components:
 *   schemas:
 *     Recharge:
 *       type: object
 *       properties:
 *         RequestId:
 *           type: integer
 *           description: Unique identifier for the recharge request.
 *         phoneNumber:
 *           type: string
 *           description: Phone number to be recharged.
 *         amount:
 *           type: integer
 *           description: Recharge amount.
 *         companyID:
 *           type: integer
 *           description: ID of the company providing the recharge service.
 *         type:
 *           type: string
 *           enum: ["GB", "topup", "gift"]
 *           description: Type of recharge (e.g., "GB", "topup", or "gift").
 *         response:
 *           type: string
 *           description: Response message from the recharge service.
 *         serial:
 *           type: string
 *           description: Serial number for the recharge transaction.
 *         PIN:
 *           type: string
 *           description: PIN code for gift-type recharges.
 *         portID:
 *           type: integer
 *           description: ID of the port associated with the recharge.
 *         status:
 *           type: string
 *           enum: ["pending", "success", "failed"]
 *           description: Status of the recharge request.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Port:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the port.
 *         serverID:
 *           type: integer
 *           description: The ID of the server associated with the port.
 *         portNumber:
 *           type: integer
 *           description: The port number.
 *         companyID:
 *           type: integer
 *           description: The ID of the company associated with the port.
 *         type:
 *           type: string
 *           enum: ["GB", "TopUp"]
 *           description: The type of the port (e.g., "GB" or "TopUp").
 *         balance:
 *           type: number
 *           format: float
 *           description: The current balance of the port.
 *         status:
 *           type: string
 *           enum: ["active", "inactive"]
 *           description: The status of the port.
 *         phoneNumber:
 *           type: string
 *           description: The phone number associated with the port.
 *         simPassword:
 *           type: string
 *           description: The SIM card password for the port.
 *         maxDailyRechargeAmount:
 *           type: integer
 *           description: The maximum daily recharge amount allowed for the port.
 *         dailyRechargeCount:
 *           type: integer
 *           description: The number of recharges made on the current day.
 *         processingCount:
 *           type: integer
 *           description: The number of transactions currently being processed.
 *       required:
 *         - serverID
 *         - portNumber
 *         - companyID
 *         - type
 *         - phoneNumber
 *         - simPassword
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Server:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the server.
 *         name:
 *           type: string
 *           description: The name of the server.
 *         host:
 *           type: string
 *           description: The host address of the server.
 *         port:
 *           type: string
 *           description: The port number of the server.
 *         username:
 *           type: string
 *           description: The username for accessing the server.
 *         password:
 *           type: string
 *           description: The password for accessing the server.
 *         status:
 *           type: string
 *           enum: ["active", "inactive"]
 *           description: The status of the server.
 *         maxPortCount:
 *           type: integer
 *           description: The maximum number of ports allowed on the server.
 *       required:
 *         - name
 *         - host
 *         - port
 *         - username
 *         - password
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "اسياسيل"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-03-07T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-03-07T12:30:00Z"
 */
