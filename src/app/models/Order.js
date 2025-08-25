import Sequelize, { DataTypes, Model } from "sequelize";

class Order extends Model {
  static init(sequelize) {
    super.init(
      {
        status: Sequelize.STRING,
        createdAt: {
          type: DataTypes.DATE,
          field: "created_at",
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: "updated_at",
        },
      },
      {
        sequelize,
        tableName: "orders",
      }
    );
    return this;
  }

  static associate(model) {
    this.belongsTo(model.User, {
      foreignKey: "user_id",
      as: "user",
    });
  }
}

export default Order;
