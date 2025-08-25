import bcrypt from "bcryptjs";
import Sequelize, { DataTypes, Model } from "sequelize";

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        pass_reset_token: Sequelize.STRING,
        pass_reset_token_expires: Sequelize.DATE,
        admin: Sequelize.BOOLEAN,
        google_id: Sequelize.STRING,
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
        tableName: "users",
      }
    );

    this.addHook("beforeSave", async (user) => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 10);
      }
    });

    this.addHook("beforeUpdate", async (user) => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 10);
      }
    });

    return this;
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }

  createResetPasswordToken() {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.pass_reset_token = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    this.pass_reset_token_expires = Date.now() + 10 * 60 * 1000;

    console.log({
      Token: resetToken,
      HashToken: this.pass_reset_token,
    });

    return resetToken;
  }
}

export default User;
