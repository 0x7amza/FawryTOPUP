const db = require("../Models");
const Server = db.Server;
const Op = db.Sequelize.Op;

// Create and Save a new Server
const create = (req, res) => {
  // Validate request
  if (
    !req.body.name ||
    !req.body.host ||
    !req.body.port ||
    !req.body.username ||
    !req.body.password ||
    !req.body.maxPortCount
  ) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Create a Server
  const server = {
    name: req.body.name,
    host: req.body.host,
    port: req.body.port,
    username: req.body.username,
    password: req.body.password,
    status: "active",
    maxPortCount: req.body.maxPortCount,
    isDeleted: false,
  };

  // Save Server in the database
  Server.create(server)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);

      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Server.",
      });
    });
};

// Retrieve all Servers from the database.
const findAll = (req, res) => {
  Server.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving servers.",
      });
    });
};

// Find a single Server with an id
const findOne = (req, res) => {
  const id = req.params.id;

  Server.findByPk(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: "Not found Server with id " + id,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Server with id=" + id,
      });
    });
};

// Update a Server by the id in the request
const update = (req, res) => {
  const id = req.params.id;

  Server.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Server was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Server with id=${id}. Maybe Server was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Server with id=" + id,
      });
    });
};

// Delete || unDelete a Server with the specified id (soft delete)
const invertServerDeletion = (req, res) => {
  const id = req.params.id;

  Server.update(
    { isDeleted: db.Sequelize.literal("NOT isDeleted") },
    { where: { id: id } }
  )
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Server toggled successfully!",
        });
      } else {
        res.send({
          message: `Server with id=${id} not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error toggling server with id=" + id,
      });
    });
};

const remove = async (req, res) => {
  const id = req.params.id;

  Server.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Server was deleted successfully!",
        });
      } else {
        res.status(404).send({
          message: `Cannot delete Server with id=${id}. Maybe Server was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Server with id=" + id,
      });
    });
};

module.exports = {
  create,
  findAll,
  findOne,
  update,
  remove,
};
