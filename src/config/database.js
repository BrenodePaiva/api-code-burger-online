require("dotenv").config();

module.exports = {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // necessário para conexões seguras com Neon
    },
  },
};
