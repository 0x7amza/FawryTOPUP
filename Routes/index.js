const express = require("express");
const router = express.Router();

router.use("/recharge", require("./recharge.routes"));
router.use("/hook", require("./hook.routes"));

module.exports = router;
