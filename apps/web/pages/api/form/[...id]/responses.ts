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
  const formCollection = db.collection<Form>("responses");
  const form = await formCollection.findOne({
    $and: [
      { _id: new ObjectId(String(req.query.id)) },
      {
        $or: [
          { "permissions.owners": session.user.id },
          { "permissions.editors": session.user.id },
        ],
      },
    ],
  });
  if (!form) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const responsesCollection = db.collection<Response>("responses");
  const responses = await responsesCollection
    .find({ form: form._id })
    .sort({ createdAt: 1 })
    .toArray();
  res.status(200).json(responses);
}
