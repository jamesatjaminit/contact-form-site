// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { User } from "types/dist/database";
import clientPromise from "../../../lib/mongodb";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (req.headers["content-type"] != "application/json") {
    res.status(400).json({ error: "Bad request" });
    return;
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!session.user.admin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<User>("users");
  const result = await collection.insertOne({
    name: req.body.email,
    email: req.body.email,
    admin: req.body.admin,
    emailVerified: new Date(),
  });
  if (result.insertedId) {
    res.status(200).json({ _id: result.insertedId });
  } else {
    res.status(500).json({ error: "Internal server error" });
    return;
  }
}
