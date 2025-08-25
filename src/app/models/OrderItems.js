import Sequelize, { Model } from 'sequelize'

class OrderItems extends Model {
  static init(sequelize) {
    super.init(
      {
        unit_price: Sequelize.DECIMAL,
        quantity: Sequelize.INTEGER,
      },
      { sequelize }
    )
    return this
  }

  static associate(model) {
    this.belongsTo(model.Order, {
      foreignKey: 'order_id',
      as: 'order',
    })

    this.belongsTo(model.Product, {
      foreignKey: 'product_id',
      as: 'product',
    })
  }
}

export default OrderItems
