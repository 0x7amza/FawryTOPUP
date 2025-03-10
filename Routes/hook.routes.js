const express = require("express");
const router = express.Router();
const hookUtils = require("../utils/hookUtils");
const ZainService = require("../Services/zain.service");
const KorekService = require("../Services/korek.service");
const db = require("../Models");
const Ports = db.Ports;

const getIPv4 = (ip) => {
  if (ip.includes(".")) return ip.replace(/^::ffff:/, "");
  return "IPv6 Detected";
};

router.get("/", async (req, res) => {
  const { query } = req;
  const { sender } = query;

  const ip = getIPv4(
    req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress
  );
  console.log(`IP المرسل: ${ip}`);

  const ContentTemp = query.content.split(/\r?\n/);
  const portNumber = query.port.replace(/\D/g, "");
  const Content = ContentTemp[ContentTemp.length - 1]
    .trim()
    .replace(/^'|'\s*$/g, "");
  console.log(sender, Content, portNumber);
  const port = await db.Ports.findOne({
    where: { portNumber },
    include: [
      {
        model: db.Server,
        where: { host: ip },
      },
    ],
  });
  if (!port) {
    res.send("hook");
    return;
  }
  const portID = port.id;
  switch (sender) {
    case "ZAIN-IQ":
      hookUtils.save({ sender, content: Content });
      ZainService.webhook({ content: Content, portNumber, portID: portID });
      break;
    case "Korek":
      hookUtils.save({ sender, content: Content });
      KorekService.webhook({ content, portID });
    default:
      break;
  }

  res.send("hook");
});

module.exports = router;
