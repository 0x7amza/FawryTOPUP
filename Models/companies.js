module.exports = (Sequelize, DataTypes) => {
  const Company = Sequelize.define("Company", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Company.associate = (models) => {
    Company.hasMany(models.Ports, {
      foreignKey: "companyID",
    });
    Company.hasMany(models.Recharge, {
      foreignKey: "companyID",
    });
  };

  return Company;
};
