import { MongoClient, WithId } from "mongodb";
import type { Form, Response } from "types/dist/database";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
const mailer = nodemailer.createTransport({
  url: process.env.EMAIL_SERVER,
});
const handler = async (
  mongoClient: MongoClient,
  response: Response,
  form: WithId<Form>
) => {
  const emails = form.notifications.email;
  if (!emails) return;
  for (const email of emails) {
    const message: Mail.Options = {
      to: email,
      from: `NoReply <${process.env.EMAIL_FROM}>`,
      subject: `${form.name} - New Response`,
      text: `Hey,\nThere is a new response on your contact form "${
        form.name
      }". Click here to view it: ${String(
        process.env.CONTACT_SITE_URL
      )}/form/${form._id.toString()}.\nKind Regards,\nContact Form Site`,
      html: `<p>Hey,</p><p>There is a new response on your contact form "${
        form.name
      }". Click <a href="${String(
        process.env.CONTACT_SITE_URL
      )}/form/${form._id.toString()}">here</a> to view it.</p><p>Kind Regards,</p><p>Contact Form Site</p>`,
    };
    try {
      await mailer.sendMail(message);
    } catch (err) {
      console.error("Email failed: " + email);
      console.log(err);
    }
  }
};

export default handler;
