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
      type: DataTypes.ENUM("GB", "topup", "gift"),
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
    PIN: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    portID: {
      type: DataTypes.INTEGER,
      allowNull: false,
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

  Recharge.beforeValidate((recharge, options) => {
    if (recharge.type === "gift" && !recharge.PIN) {
      throw new Error("The 'pin' field is required when the type is 'gift'.");
    }
    if (recharge.type !== "gift" && recharge.PIN) {
      throw new Error(
        "The 'pin' field should only be used when the type is 'gift'."
      );
    }
  });

  return Recharge;
};
