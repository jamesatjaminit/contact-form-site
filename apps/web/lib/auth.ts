import clientPromise from "./mongodb";

export async function canUserSignup(email: string | undefined | null) {
  if (!email) return false;
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("users");
  const user = await collection.findOne({ email });
  return user;
}

export async function createUser(email: string) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("users");
  const user = await collection.insertOne({ email, emailVerified: new Date() });
  return user;
}
