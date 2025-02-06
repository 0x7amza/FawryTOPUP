const express = require("express");
const router = express.Router();
const hookUtils = require("../utils/hookUtils");
const ZainService = require("../Services/zain.service");

router.get("/", async (req, res) => {
  const { query } = req;
  const { sender } = query;

  const ip = req.ip || req.connection.remoteAddress;
  console.log(`IP المرسل: ${ip}`);

  const ContentTemp = query.content.split(/\r?\n/);
  const portNumber = query.port.replace(/\D/g, "");
  const Content = ContentTemp[ContentTemp.length - 1]
    .trim()
    .replace(/^'|'\s*$/g, "");

  switch (sender) {
    case "ZAIN-IQ":
      hookUtils.save({ sender, content: Content });
      ZainService.webhook({ content: Content, portNumber, portID: 2 });
      break;
    default:
      break;
  }

  res.send("hook");
});

module.exports = router;
