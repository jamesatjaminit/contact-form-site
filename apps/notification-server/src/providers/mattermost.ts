import { MongoClient, WithId } from "mongodb";
import { Form, Response } from "types/dist/database";

const handler = async (
  mongoClient: MongoClient,
  response: Response,
  form: WithId<Form>
) => {
  const mattermostWebhookUrls = form.notifications.mattermost;
  if (!mattermostWebhookUrls) return;
  for (const webhookUrl of mattermostWebhookUrls) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: 'There is a new response on your form "' + form.name + '"',
          props: {
            attachments: [
              {
                title: "View",
                title_link:
                  String(process.env.CONTACT_SITE_URL) +
                  "/form/" +
                  form._id.toString(),
              },
            ],
          },
        }),
      });
    } catch (err) {
      console.error("Mattermost failed: " + webhookUrl);
      console.log(err);
    }
  }
};

export default handler;
