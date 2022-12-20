// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
import { MongoClient } from "mongodb";

const uri = String(process.env.MONGODB_URI);
const options = {};
let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error("No MongoDB URI found.");
}

if (process.env.NODE_ENV == "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  // @ts-expect-error
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    try {
      // @ts-expect-error
      global._mongoClientPromise = client.connect();
    } catch (e) {
      console.log(e);
    }
  }
  // @ts-expect-error
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
