import "dotenv/config";

import { Router } from "express";
import multer from "multer";

import CategoryController from "./app/controllers/CategoryController.js";
import authMiddleware from "./app/middlewares/auth.js";
import isAdmin from "./app/middlewares/isAdmin.js";
import multerConfig from "./config/multer.js";
import DataBase from "./database/index.js";

const routes = new Router();
const upload = multer(multerConfig);

routes.get("/", (req, res) => {
  DataBase.connection
    .authenticate()
    .then(() => {
      return res.send(
        `🚀 Server started on port: ${process.env.PORT} <br/> <br/> 
        ✅ Connection to the database stablished successfully.`
      );
    })
    .catch((error) => {
      return res.send(`❌ Error connecting to database: ${error}`);
    });
});

routes.get("/categories", CategoryController.index);

export default routes;
