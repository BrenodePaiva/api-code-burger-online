import "./database/index.js";
import "dotenv/config";

import cors from "cors";
import express from "express";
import { resolve } from "path";

import routes from "./routes.js";

class App {
  constructor() {
    this.app = express();
    this.app.use(
      cors({
        origin: process.env.API_CONSUMER,
        methods: ["GET", "POST", "PATCH", "PUT"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      })
    );
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(express.json());
    this.app.use(
      "/product-file",
      express.static(resolve(__dirname, "..", "uploads"))
    );
    this.app.use(
      "/category-file",
      express.static(resolve(__dirname, "..", "uploads"))
    );
  }

  routes() {
    this.app.use(routes);
  }
}

export default new App().app;
