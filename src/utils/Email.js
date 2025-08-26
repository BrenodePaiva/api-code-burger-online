import "dotenv/config";

import { MailtrapClient } from "mailtrap";

const sendEmail = async (options) => {
  const client = new MailtrapClient({ token: process.env.MAILTRAP_TOKEN });

  await client
    .send({
      from: {
        email: "hello@brenopaiva.net.br",
        name: "CodeBurge Login",
      },
      to: [{ email: options.to }],
      subject: options.subject,
      html: options.htmlmail,
      category: options.category,
    })
    .then(console.log, console.error);
};

export default sendEmail;
