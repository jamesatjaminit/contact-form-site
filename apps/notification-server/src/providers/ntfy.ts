import { MongoClient, WithId } from "mongodb";
import type { Form, Response } from "types/dist/database";
import { publish, MessagePriority } from "ntfy";

const handler = async (
  mongoClient: MongoClient,
  response: Response,
  form: WithId<Form>
) => {
  const ntfyTopics = form.notifications.ntfy;
  if (!ntfyTopics) return;
  for (const topic of ntfyTopics) {
    try {
      publish({
        topic: topic.topic,
        title: "New Response",
        message: 'There is a new response on your form "' + form.name + '"',
        priority: MessagePriority.DEFAULT,
        authorization: topic.auth,
        server: topic.serverUrl,
        clickURL:
          String(process.env.CONTACT_SITE_URL) + "/form/" + form._id.toString(),
        tags: ["new", form._id.toString()],
        actions: [
          {
            clear: true,
            label: "View",
            url:
              String(process.env.CONTACT_SITE_URL) +
              "/form/" +
              form._id.toString(),
            type: "view",
          },
        ],
      });
    } catch (err) {
      console.error("Ntfy failed: " + topic.topic);
      console.log(err);
    }
  }
};

export default handler;
