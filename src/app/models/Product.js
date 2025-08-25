import "dotenv/config";

import Sequelize, { DataTypes, Model } from "sequelize";

class Product extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        price: Sequelize.DECIMAL,
        path: Sequelize.STRING,
        offer: Sequelize.BOOLEAN,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `${process.env.API_URL}/product-file/${this.path}`;
          },
        },
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
        tableName: "products",
      }
    );
    return this;
  }

  static associate(model) {
    this.belongsTo(model.Category, {
      foreignKey: "category_id",
      as: "category",
    });
  }
}

export default Product;
