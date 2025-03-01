const express = require("express");
const router = express.Router();
const db = require("../Models");
const rechargeService = require("../Services/recharge.service");

/**
 * @swagger
 * tags:
 *   name: Recharge
 *   description: Recharge management APIs
 */

/**
 * @swagger
 * /api/recharge:
 *   post:
 *     summary: Create a new recharge request
 *     tags: [Recharge]
 *     description: This endpoint allows creating a new recharge request for a phone number with specified details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               RequestId:
 *                 type: integer
 *                 description: Unique identifier for the recharge request.
 *               PhoneNumber:
 *                 type: string
 *                 description: Phone number to be recharged.
 *               Amount:
 *                 type: integer
 *                 description: Recharge amount.
 *               CompanyId:
 *                 type: integer
 *                 description: ID of the company providing the recharge service.
 *               Type:
 *                 type: string
 *                 enum: ["GB", "topup", "gift"]
 *                 description: Type of recharge (e.g., "GB", "topup", or "gift").
 *               PIN:
 *                 type: string
 *                 description: PIN code for gift-type recharges (optional unless Type is "gift").
 *               serial:
 *                 type: string
 *                 description: Serial number for gift-type recharges (optional unless Type is "gift").
 *             required:
 *               - RequestId
 *               - PhoneNumber
 *               - Amount
 *               - CompanyId
 *               - Type
 *     responses:
 *       200:
 *         description: Recharge request processed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recharge'
 *       202:
 *         description: Recharge request is pending.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recharge'
 *       400:
 *         description: Missing required fields in the request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating missing fields.
 *       500:
 *         description: Recharge request failed due to an error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recharge'
 */

router.post("/", async (req, res) => {
  const { RequestId, PhoneNumber, Amount, CompanyId, Type, PIN, serial } =
    req.body;

  if (
    !RequestId ||
    !PhoneNumber ||
    !Amount ||
    !CompanyId ||
    !Type ||
    (Type === "gift" && !PIN && !serial)
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const checkID = await db.Recharge.findOne({
    where: { RequestId },
  });
  if (checkID) {
    return res.status(200).json({ recharge: checkID });
  }

  await db.Recharge.create({
    RequestId,
    phoneNumber: PhoneNumber,
    amount: Amount,
    companyID: CompanyId,
    type: Type,
    status: "pending",
    PIN: PIN || null,
    portID: null,
    serial: serial || null,
  });
  const response = await rechargeService.recharge({
    PhoneNumber,
    Amount,
    CompanyId: CompanyId,
    Type,
    PIN,
  });

  if (response.success) {
    if (Type != "gift") {
      await db.Recharge.update(
        {
          response: response.result,
          status: "success",
          serial: response.data.transactionNumber,
          portID: response.data.portID,
        },
        { where: { RequestId } }
      );
      await db.Ports.update(
        {
          balance: response.data.currentBalance
            .replaceAll(",", "")
            .replace(".000", ""),
        },
        { where: { id: response.data.portID } }
      );
    } else {
      await db.Recharge.update(
        {
          response: response.result,
          status: "success",
        },
        { where: { RequestId } }
      );
    }
  } else {
    if (response.data) {
      await db.Recharge.update(
        {
          response: response.result,
          status: "failed",
          portID: response.data.portID,
        },
        { where: { RequestId } }
      );
    } else {
      await db.Recharge.update(
        {
          response: response.result,
          status: "failed",
          portID: null,
        },
        { where: { RequestId } }
      );
    }
  }

  const recharge = await db.Recharge.findOne({
    where: { RequestId },
  });
  var statuscode = 200;
  if (recharge.status === "failed") {
    statuscode = 500;
  } else if (recharge.status === "pending") {
    statuscode = 202;
  }
  res.status(statuscode).json(recharge);
});

module.exports = router;
