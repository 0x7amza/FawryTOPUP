module.exports = (Sequelize, DataTypes) => {
  const Recharge = Sequelize.define("Recharge", {
    RequestId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    companyID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("GB", "topup"),
      allowNull: false,
    },
    response: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serial: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    portID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Ports",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "success", "failed"),
      defaultValue: "pending",
      allowNull: false,
    },
  });

  Recharge.associate = (models) => {
    Recharge.belongsTo(models.Ports, {
      foreignKey: "portID",
    });
    Recharge.belongsTo(models.Company, {
      foreignKey: "companyID",
    });
  };
  return Recharge;
};
