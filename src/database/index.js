import "dotenv/config";

import Sequelize from "sequelize";

import Category from "../app/models/Category.js";
import Order from "../app/models/Order.js";
import OrderItems from "../app/models/OrderItems.js";
import Product from "../app/models/Product.js";
import User from "../app/models/User.js";
import ConfigDatabase from "../config/database.js";

const models = [User, Product, Category, Order, OrderItems];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(process.env.DB_URL, { ConfigDatabase });
    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models)
      );
  }
}

export default new Database();
