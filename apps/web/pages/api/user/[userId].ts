// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { Form, User, WithStringId } from "types/dist/database";
import clientPromise from "../../../lib/mongodb";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "GET" && req.method != "DELETE" && req.method != "PUT") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.query.userId != session.user.id && !session.user.admin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  try {
    new ObjectId(String(req.query.userId));
  } catch {
    res.status(400).json({ error: "Invalid Form ID" });
    return;
  }
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<User>("users");
  const user = await collection.findOne({
    _id: new ObjectId(String(req.query.userId)),
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (req.method == "GET") {
    res.status(200).json(user);
  } else if (req.method == "DELETE") {
    const result = await collection.deleteOne({
      _id: new ObjectId(String(req.query.userId)),
    });
    if (result.deletedCount == 1) {
      const formsCollection = db.collection<Form>("forms");
      await formsCollection.deleteMany({
        createdBy: req.query.userId,
      });
      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ success: false });
    }
  } else {
    const result = await collection.updateOne(
      { _id: new ObjectId(String(req.query.userId)) },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          image: req.body.image,
        },
      }
    );
    if (result.modifiedCount == 1) {
      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ success: false });
    }
  }
}

export async function getUser(
  userId: string
): Promise<WithStringId<User> | null> {
  try {
    new ObjectId(userId);
  } catch {
    return null;
  }
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<User>("users");
  const user = await collection.findOne({
    _id: new ObjectId(userId),
  });
  if (!user) {
    return null;
  }
  return JSON.parse(JSON.stringify(user));
}
