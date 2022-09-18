// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import clientPromise from "../../lib/mongodb";
import { authOptions } from "./auth/[...nextauth]";
import type { User } from "types/dist/database";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!session.admin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<User>("users");
  const users = collection.find().sort({ createdAt: 1 }).toArray();
  res.status(200).json(users);
}
