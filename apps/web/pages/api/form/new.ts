// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import clientPromise from "../../../lib/mongodb";
import { authOptions } from "../auth/[...nextauth]";
import { Form } from "types/dist/database";
import { randomBytes } from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.headers["content-type"] != "application/json") {
    res.status(400).json({ error: "Bad request" });
    return;
  }
  const body = req.body;
  if (!body.name) {
    res.status(400).json({ error: "Bad request" });
    return;
  }
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<Form>("forms");
  const result = await collection.insertOne({
    name: body.name,
    createdBy: session.user.id,
    createdAt: new Date(),
    updateToken: randomBytes(48).toString("hex"),
    permissions: {
      owners: [session.user.id],
      editors: [],
      viewers: [],
    },
    submissionsPaused: false,
    notifications: {
      email: [],
      discord: [],
    },
  });
  if (result.insertedId) {
    res.status(200).json({ _id: result.insertedId });
  } else {
    res.status(500).json({ error: "Internal server error" });
  }
}
