// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Form } from "types/dist/database";
import clientPromise from "../../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "GET") {
    res.status(405).json({ error: "Method not allowed" });
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
  const collection = db.collection<Form>("forms");
  const form = await collection.findOne({
    _id: new ObjectId(String(req.query.id)),
  });
  if (!form) {
    res.status(404).json({ error: "Form not found" });
    return;
  }
  res.status(200).json({
    submissionsPaused: form.submissionsPaused,
  });
}
