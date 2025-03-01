const db = require("../Models");
const Ports = db.Ports;
const Op = db.Sequelize.Op;

// Create and Save a new Port
const create = (req, res) => {
  // Validate request
  if (!req.body.portNumber) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Create a Port
  const port = {
    portNumber: req.body.portNumber,
    status: req.body.status ? req.body.status : "active",
    serverID: req.body.serverID,
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
  Ports.findAll({ include: ["server"] })
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

  Ports.findByPk(id, { include: ["server"] })
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
        res.send({
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

// Delete a Port with the specified id in the request
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
        res.send({
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
  remove,
};
