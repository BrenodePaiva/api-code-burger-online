import "dotenv/config";

import { Router } from "express";

const routes = new Router();

routes.get("/", (req, res) => {
  return res.send(`🚀 Server started on port: ${process.env.PORT}`);
});

export default routes;
