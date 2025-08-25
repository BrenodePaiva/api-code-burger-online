require('dotenv').config()

module.exports = {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // necessário para conexões seguras com Neon
    },
  },

  // host: process.env.DB_HOST,
  // username: process.env.DB_USER,
  // password: process.env.DB_PASS,
  // database: process.env.DB_NAME,

  // define: {
  //   timespamps: true,
  //   underscored: true,
  //   underscoredAll: true,
  // },
}
