const express = require("express");
const router = express.Router();
const db = require("../Models");
/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: "Get all companies"
 *     description: "Retrieve a list of all stored companies from the database."
 *     tags:
 *       - Companies
 *     responses:
 *       200:
 *         description: "Successful response - returns a list of companies"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Company"
 *       500:
 *         description: "Internal Server Error"
 */
router.get("/", async (req, res) => {
  try {
    const companies = await db.Company.findAll();
    res.send(companies);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while retrieving companies" });
  }
});

module.exports = router;
