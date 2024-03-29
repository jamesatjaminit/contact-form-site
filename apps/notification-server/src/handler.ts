import { MongoClient, ObjectId, WithId } from "mongodb";
import { Form, Response } from "types/dist/database";
import { incrementResponsesCounter } from "./prom";

import discordHandler from "./providers/discord";
import emailHandler from "./providers/email";
import ntfyHandler from "./providers/ntfy";
import mattermostHandler from "./providers/mattermost";

const handler = async (mongoClient: MongoClient) => {
  const responsesCollection = mongoClient
    .db()
    .collection<WithId<Response>>("responses");
  const stream = responsesCollection.watch(
    [
      {
        $match: {
          operationType: "insert",
          "fullDocument.notified": false,
        },
      },
    ],
    {
      fullDocument: "updateLookup",
    }
  );
  stream.on("change", async (change) => {
    if (change.operationType != "insert") return;
    incrementResponsesCounter(change.fullDocument.form);
    await handleResponse(mongoClient, change.fullDocument);
  });
  const responsesToDo = await responsesCollection
    .find({
      notified: false,
    })
    .toArray();
  for await (const response of responsesToDo) {
    await handleResponse(mongoClient, response);
  }
};

export default handler;

async function handleResponse(
  mongoClient: MongoClient,
  response: WithId<Response>
) {
  console.log("Handling response: " + response._id);
  const formsCollection = mongoClient.db().collection<WithId<Form>>("forms");
  const form = await formsCollection.findOne({
    _id: new ObjectId(response.form),
  });
  if (!form) {
    console.log("No form found for response: " + response._id);
    return;
  }
  try {
    await ntfyHandler(mongoClient, response, form);
    await discordHandler(mongoClient, response, form);
    await emailHandler(mongoClient, response, form);
    await mattermostHandler(mongoClient, response, form);
    const responsesCollection = mongoClient
      .db()
      .collection<Response>("responses");
    const result = await responsesCollection.updateOne(
      { _id: new ObjectId(response._id) },
      { $set: { notified: true } }
    );
    if (result.modifiedCount < 1) {
      throw new Error("Failed to update response");
    }
  } catch (err) {
    console.error("Error handling response: " + response._id);
    console.log(err);
  }
}
