import "dotenv/config";

import crypto from "crypto";
import fs from "fs";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import path from "path";
import { Sequelize } from "sequelize";
import { v4 } from "uuid";
import * as Yup from "yup";

import { oauth2client } from "../../config/google.js";
import sendEmail from "../../utils/Email.js";
import User from "../models/User.js";

class SessionController {
  // information session
  async store(request, response) {
    const schema = Yup.object().shape({
      email: Yup.string().required().email(),
      password: Yup.string().required(),
    });

    const userIncorrect = () => {
      response
        .status(401)
        .json({ error: "Make sure your password and email are correct" });
    };

    // information is valid ?
    if (!(await schema.isValid(request.body))) return userIncorrect();

    const { email, password } = request.body;

    // find user
    const user = await User.findOne({
      where: { email },
    });

    if (!user || user.google_id) return userIncorrect();

    // password correct ?
    if (!(await user.checkPassword(password))) return userIncorrect();

    return response.json({
      id: user.id,
      email,
      name: user.name,
      admin: user.admin,
      token: jwt.sign(
        { id: user.id, name: user.name },
        process.env.SESSION_SECRET,
        {
          expiresIn: process.env.SESSION_EXPIRES,
        }
      ),
    });
  }

  // ____________________________________________________________________

  async googleUrl(request, response) {
    const url = oauth2client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["profile", "email"],
    });

    return response.json({ url });
  }

  // ___________________________________________________________________

  async googleCallback(request, response) {
    try {
      const { code } = request.query;

      const { tokens } = await oauth2client.getToken(code);
      oauth2client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: "v2", auth: oauth2client });
      const { data } = await oauth2.userinfo.get();

      // Aqui você pode salvar o usuário no banco, criar JWT etc.
      const { name, email, id } = data;
      let user = await User.findOne({ where: { email } });

      if (!user) {
        await User.create({
          id: v4(),
          name,
          email,
          password: crypto.randomBytes(4).toString("hex"),
          google_id: id,
        });

        user = await User.findOne({ where: { email } });
      }

      const token = jwt.sign(
        { id: user.id, name: user.name },
        process.env.SESSION_SECRET,
        {
          expiresIn: process.env.SESSION_EXPIRES,
        }
      );
      // Depois redirecione para a sua aplicação (React), com ou sem token na URL
      return response.redirect(
        `${process.env.API_CONSUMER}/?email=${user.email}&name=${user.name}&token=${token}&id=${user.id}&google=${user?.google_id}`
      );
    } catch (error) {
      return response.redirect(
        `${process.env.API_CONSUMER}/?error=google-auth`
      );
    }
  }

  // ___________________________________________________________________

  async forgotPass(request, response) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
    });

    try {
      await schema.validateSync(request.body);
    } catch (err) {
      return response.status(400).json({ Error: err });
    }

    // const { email } = request.body
    const email = request.body.email?.trim().toLowerCase();
    let htmlmail;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      htmlmail = fs.readFileSync(
        path.join(__dirname, "..", "..", "utils", "mailerror.html"),
        "utf8"
      );
      const text =
        "não conseguimos identificar um usuário associado a este endereço de e-mail.";
      htmlmail = htmlmail.replace("[text]", text);

      try {
        await sendEmail({
          to: email,
          subject: "Redefinir Senha",
          htmlmail,
          category: "Reset Password Erro",
        });
        return response.status(404).json({ message: "E-mail not found" });
      } catch (err) {
        return response
          .status(500)
          .json({ Error: "There is a error sending e-mail. " + err });
      }
    } else if (user.google_id) {
      htmlmail = fs.readFileSync(
        path.join(__dirname, "..", "..", "utils", "mailerror.html"),
        "utf8"
      );
      const text =
        "o método utilizado para o cadastro deste e-mail não permite a redefinição de senha.";
      htmlmail = htmlmail.replace("[text]", text);

      try {
        await sendEmail({
          to: email,
          subject: "Redefinir Senha",
          htmlmail,
          category: "Reset Password Erro",
        });
        return response.status(401).json({ message: "Unauthorized action" });
      } catch (err) {
        return response
          .status(500)
          .json({ Error: "There is a error sending e-mail. " + err });
      }
    }

    const resetToken = user.createResetPasswordToken();
    await user.save({ validate: false });

    const resetUrl = `${process.env.API_CONSUMER}/resetar-senha/${resetToken}`;

    htmlmail = fs.readFileSync(
      path.join(__dirname, "..", "..", "utils", "mail.html"),
      "utf8"
    );

    htmlmail = htmlmail.replace("[linkButton]", resetUrl);

    try {
      await sendEmail({
        to: email,
        subject: "Redefinir Senha",
        htmlmail,
        category: "Reset Password",
      });
    } catch (err) {
      ((user.pass_reset_token = null), (user.pass_reset_token_expires = null));
      user.save({ validate: false });

      return response
        .status(500)
        .json({ Error: "There is a error sending e-mail. " + err });
    }
    return response.status(200).json({ message: "password reset link send" });
  }

  // ___________________________________________________________________________

  async resetPass(request, response) {
    const token = crypto
      .createHash("sha256")
      .update(request.params.token)
      .digest("hex");

    const date = Date.now();
    const user = await User.findOne({
      where: {
        pass_reset_token: token,
        pass_reset_token_expires: {
          [Sequelize.Op.gt]: new Date(date), // Converte para um objeto Date
        },
      },
    });

    if (!user) {
      return response.status(400).json({
        message: `Token is invalid or has expired!`,
      });
    } else if (user.google_id) {
      return response.status(401).json({
        message: `Unauthorized action!`,
      });
    }

    const schema = Yup.object().shape({
      password: Yup.string().required().min(6),
    });

    try {
      await schema.validateSync(request.body);
    } catch (err) {
      return response.status(400).json({ Error: err });
    }

    const { password } = request.body;

    ((user.password = password), (user.pass_reset_token = null));
    user.pass_reset_token_expires = null;
    user.save();

    return response.status(200).json({ message: "The password has changed" });
  }
}

export default new SessionController();
