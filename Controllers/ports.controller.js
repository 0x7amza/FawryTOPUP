const { where } = require("sequelize");
const db = require("../Models");
const Ports = db.Ports;
const Op = db.Sequelize.Op;
const Asiacell = require("../Services/asiacell.service");
const Zain = require("../Services/zain.service");
const korek = require("../Services/korek.service");
const { error } = require("winston");

// Create and Save a new Port
const create = (req, res) => {
  // Validate request
  if (
    req.body.portNumber == undefined ||
    req.body.serverID == undefined ||
    req.body.companyID == undefined ||
    req.body.type == undefined ||
    req.body.balance == undefined ||
    req.body.phoneNumber == undefined ||
    req.body.simPassword == undefined ||
    req.body.maxDailyRechargeAmount == undefined
  ) {
    console.log(req.body);

    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Create a Port
  const port = {
    serverID: req.body.serverID,
    portNumber: req.body.portNumber,
    companyID: req.body.companyID,
    type: req.body.type,
    balance: req.body.balance,
    status: req.body.status || "active",
    phoneNumber: req.body.phoneNumber,
    simPassword: req.body.simPassword,
    maxDailyRechargeAmount: req.body.maxDailyRechargeAmount,
    dailyRechargeCount: 0,
    processingCount: 0,
    isDeleted: false,
  };

  // Save Port in the database
  Ports.create(port)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Port.",
      });
    });
};

// Retrieve all Ports from the database.
const findAll = (req, res) => {
  const status = req.query.status || "";
  var condition = status ? { status: { [Op.eq]: status } } : null;
  Ports.findAll({ include: ["Server"], where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving ports.",
      });
    });
};

// Find a single Port with an id
const findOne = (req, res) => {
  const id = req.params.id;

  Ports.findByPk(id, { include: ["Server"] })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: "Not found Port with id " + id,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Port with id=" + id,
      });
    });
};

// find all Ports with a server id
const findAllByServer = (req, res) => {
  const serverID = req.params.serverID;
  var condition = serverID ? { serverID: { [Op.eq]: serverID } } : null;

  Ports.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving ports.",
      });
    });
};

// Update a Port by the id in the request
const update = (req, res) => {
  const id = req.params.id;

  Ports.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Port was updated successfully.",
        });
      } else {
        res.status(404).send({
          message: `Cannot update Port with id=${id}. Maybe Port was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Port with id=" + id,
      });
    });
};

const togglePortDeletion = (req, res) => {
  const id = req.params.id;

  Ports.update(
    { isDeleted: db.Sequelize.literal("NOT isDeleted") },
    { where: { id: id } }
  )
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Port toggled successfully!",
        });
      } else {
        res.status(400).send({
          message: `Cannot toggle Port with id=${id}. Maybe Port was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error toggling Port with id=" + id,
      });
    });
};

const updateBalance = async (req, res) => {
  const id = req.params.id;
  const port = await Ports.findByPk(id, {
    include: ["Server", "Company"],
  });

  if (!port) {
    return res.status(404).send({
      message: "Port not found with id " + id,
    });
  }

  let newBalance;
  switch (port.Company.name) {
    case "اسياسيل":
      newBalance = await Asiacell.updateBalance(port);
      break;
    case "زين":
      newBalance = await Zain.updateBalance(port).balance;
      break;
    case "كورك":
      newBalance = await korek.checkBalance(port).balance;
      break;
    default:
      return res.status(400).send({
        message: "Unsupported company",
      });
  }

  if (typeof newBalance === "number" && !isNaN(newBalance)) {
    port.balance = newBalance;
    await port.save();
    return res.status(200).send({
      message: "Balance updated successfully",
      balance: newBalance,
      portID: port.id,
    });
  } else {
    return res.status(500).send({
      message: "Failed to update balance",
      error: "Invalid response from service",
      rawBalance: newBalance,
    });
  }
};

const remove = (req, res) => {
  const id = req.params.id;

  Ports.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Port was deleted successfully!",
        });
      } else {
        res.status(404).send({
          message: `Cannot delete Port with id=${id}. Maybe Port was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Port with id=" + id,
      });
    });
};

module.exports = {
  create,
  findAll,
  findOne,
  update,
  findAllByServer,
  togglePortDeletion,
  updateBalance,
  remove,
};
