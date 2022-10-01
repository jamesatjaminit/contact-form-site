import * as dotenv from "dotenv";
dotenv.config();
import handler from "./handler";
import { MongoClient } from "mongodb";
const mongoUri = String(process.env.MONGODB_URI);
if (!mongoUri) {
  throw new Error("No MongoDB URI found.");
}
async function main() {
  const client = new MongoClient(mongoUri);
  await client.connect();
  process.on("exit", async () => {
    await client.close();
  });
  await handler(client);
}

main();
