import "dotenv/config";

import { Router } from "express";
import multer from "multer";

import CategoryController from "./app/controllers/CategoryController.js";
import OrderController from "./app/controllers/OrderController.js";
import ProductController from "./app/controllers/ProductController.js";
import SessionController from "./app/controllers/SessionController.js";
import UserController from "./app/controllers/UserController.js";
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
      const redirectUrl = process.env.API_CONSUMER;
      const port = process.env.PORT;
      return res.send(`
         <html>
          <head>
            <meta charset="UTF-8" />
            <title>Redirecionando...</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                margin-top: 50px;
              }
              .countdown {
                font-size: 2em;
                color: #007bff;
              }
            </style>
            <script>
              let segundos = 5;
              function atualizarContagem() {
                document.getElementById("contador").textContent = segundos;
                if (segundos === 0) {
                  window.location.href = "${redirectUrl}";
                }
                segundos--;
              }
              setInterval(atualizarContagem, 1000);
              window.onload = atualizarContagem;
            </script>
          </head>
          <body>
            <h2>🚀 Server started on port: ${port}</h2>
            <p>✅ Conexão com o banco de dados estabelecida com sucesso.</p>
            <p>🔄 Redirecionando em <span class="countdown" id="contador">5</span> segundos...</p>
          </body>
        </html>
      `);
    })
    .catch((error) => {
      return res.send(`❌ Error connecting to database: ${error}`);
    });
});

routes.post("/users", UserController.store);

routes.post("/sessions", SessionController.store);

routes.post("/forgot-password", SessionController.forgotPass);

routes.get("/auth/google/url", SessionController.googleUrl);
routes.get("/auth/google/callback", SessionController.googleCallback);

routes.use(authMiddleware);
routes.put("/users/:email", UserController.update);

routes.get("/products", ProductController.index);

routes.get("/categories", CategoryController.index);

routes.post("/orders", OrderController.store);
routes.get("/orders/:user", OrderController.index);

routes.use(isAdmin);
routes.post("/products", upload.single("file"), ProductController.store);
routes.put("/products/:id", upload.single("file"), ProductController.update);

routes.post("/categories", upload.single("file"), CategoryController.store);
routes.put("/categories/:id", upload.single("file"), CategoryController.update);

routes.put("/orders/:id", OrderController.update);
routes.delete("/orders/:id", OrderController.del);

export default routes;
