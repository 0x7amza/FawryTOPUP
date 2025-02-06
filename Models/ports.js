module.exports = (Sequelize, DataTypes) => {
  const Ports = Sequelize.define(
    "Ports",
    {
      serverID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Servers",
          key: "id",
        },
      },
      portNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      companyID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Companies",
          key: "id",
        },
      },
      type: {
        type: DataTypes.ENUM("GB", "TopUp"),
        allowNull: false,
      },
      balance: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      simPassword: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      maxDailyRechargeAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      dailyRechargeCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      processingCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["serverID", "portNumber"],
        },
      ],
    }
  );

  Ports.associate = (models) => {
    Ports.belongsTo(models.Company, {
      foreignKey: "companyID",
      targetKey: "id",
    });
    Ports.belongsTo(models.Server, {
      foreignKey: "serverID",
      targetKey: "id",
    });
    Ports.hasMany(models.Recharge, {
      foreignKey: "portID",
      sourceKey: "id",
    });
  };

  return Ports;
};
