// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
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
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const client = await clientPromise;
  const db = client.db();
  const formCollection = db.collection<Form>("forms");
  try {
    new ObjectId(String(req.query.id));
  } catch {
    res.status(400).json({ error: "Invalid Form ID" });
    return;
  }
  const form = await formCollection.findOne({
    $and: [
      { _id: new ObjectId(String(req.query.id)) },
      {
        $or: [
          { "permissions.owners": session.user.id },
          { "permissions.editors": session.user.id },
          { "permissions.viewers": session.user.id },
        ],
      },
    ],
  });
  if (!form) {
    res.status(404).json({ error: "Form not found" });
    return;
  }
  const responsesCollection = db.collection<Response>("responses");
  const responses = await responsesCollection
    .find({ form: req.query.id })
    .sort({ createdAt: -1 }, -1)
    .toArray();
  res.status(200).json(responses);
}
