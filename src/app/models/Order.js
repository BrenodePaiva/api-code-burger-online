import Sequelize, { Model } from 'sequelize'

class Order extends Model {
  static init(sequelize) {
    super.init(
      {
        status: Sequelize.STRING,
      },
      { sequelize }
    )
    return this
  }

  static associate(model) {
    this.belongsTo(model.User, {
      foreignKey: 'user_id',
      as: 'user',
    })
  }
}

export default Order
