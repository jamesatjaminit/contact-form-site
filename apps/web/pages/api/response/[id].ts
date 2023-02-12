// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import clientPromise from "../../../lib/mongodb";
import { authOptions } from "../auth/[...nextauth]";
import { Form, Response } from "types/dist/database";
import { ObjectId } from "mongodb";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "DELETE" && req.method != "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    new ObjectId(String(req.query.id));
  } catch {
    res.status(400).json({ error: "Invalid Form ID" });
    return;
  }
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<Response>("responses");
  if (req.method == "GET") {
    const response = await collection.findOne({
      _id: new ObjectId(String(req.query.id)),
    });
    if (!response) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const formsCollection = db.collection<Form>("forms");
    const form = await formsCollection.findOne({
      $and: [
        { _id: new ObjectId(String(response.form)) },
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
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(200).json(response);
  } else if (req.method == "DELETE") {
    const response = await collection.findOne({
      _id: new ObjectId(String(req.query.id)),
    });
    if (!response) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const formsCollection = db.collection<Form>("forms");
    const form = await formsCollection.findOne({
      $and: [
        { _id: new ObjectId(String(response.form)) },
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
    const result = await collection.deleteOne({
      _id: new ObjectId(String(req.query.id)),
    });
    if (result.deletedCount == 0) {
      res.status(404).json({ error: "Error deleting response" });
      return;
    }
    res.status(200).json({ success: true });
  }
}
