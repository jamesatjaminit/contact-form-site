// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { Form } from "types/dist/database";
import clientPromise from "../../../../lib/mongodb";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!req.query.userId || typeof req.query.userId != "string") {
    res.status(400).json({ error: "Bad request" });
    return;
  }
  // @ts-expect-error https://github.com/nextauthjs/next-auth/issues/6640
  if (req.query.userId != session.user.id && !session.admin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<Form>("forms");
  const forms = await collection
    .find({
      $or: [
        { "permissions.owners": req.query.userId },
        { "permissions.editors": req.query.userId },
        { "permissions.viewers": req.query.userId },
      ],
    })
    .sort({ createdAt: 1 })
    .toArray();
  res.status(200).json(forms);
}
