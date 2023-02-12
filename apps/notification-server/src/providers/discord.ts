import { MongoClient, WithId } from "mongodb";
import type { Form, Response } from "types/dist/database";
import { EmbedBuilder } from "@discordjs/builders";
import axios from "axios";

const handler = async (
  mongoClient: MongoClient,
  response: Response,
  form: WithId<Form>
) => {
  const discordWebhooks = form.notifications.discord;
  if (!discordWebhooks) return;
  for (const webhook of discordWebhooks) {
    const embed = new EmbedBuilder()
      .setTitle("New Response")
      .setDescription(
        `There is a new response on your form "**${
          form.name
        }**". Click [here](${
          String(process.env.CONTACT_SITE_URL) + "/form/" + form._id.toString()
        }) to view it.`
      )
      .setURL(
        String(process.env.CONTACT_SITE_URL) + "/form/" + form._id.toString()
      );
    try {
      const fetchResponse = await axios.request({
        url: webhook,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          username: "Form Site",
          embeds: [embed],
        }),
      });
      if (fetchResponse.status != 204) {
        throw new Error("Invalid status code");
      }
    } catch (err) {
      console.error("Discord webhook failed: " + webhook);
      console.log(err);
    }
  }
};

export default handler;
