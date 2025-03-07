const express = require("express");
const router = express.Router();

router.use("/recharge", require("./recharge.routes"));
router.use("/hook", require("./hook.routes"));
router.use("/ports", require("./ports.routes"));
router.use("/servers", require("./server.routes"));
router.use("/companies", require("./companies.routes"));

module.exports = router;
