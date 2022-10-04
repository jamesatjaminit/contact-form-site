// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ObjectId, WithId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { Form, Response } from "types/dist/database";
import clientPromise from "../../../lib/mongodb";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (
    req.method != "POST" &&
    req.method != "GET" &&
    req.method != "PUT" &&
    req.method != "DELETE"
  ) {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const session = await unstable_getServerSession(req, res, authOptions);
  const client = await clientPromise;
  const db = client.db();
  if (req.method == "GET") {
    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const collection = db.collection<Form>("forms");
    // Get form information
    try {
      new ObjectId(String(req.query.id));
    } catch {
      res.status(400).json({ error: "Invalid Form ID" });
      return;
    }
    const form = await collection.findOne({
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
      res.status(404).json({ error: "Not found" });
      return;
    } else {
      if (!form.permissions.owners.includes(session.user.id)) {
        form.permissions = { owners: [], editors: [], viewers: [] };
        form.notifications = { discord: [], email: [] };
        form.updateToken = "";
      }
      res.status(200).json(form);
    }
  } else if (req.method == "PUT") {
    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    // Update form information
    if (req.headers["content-type"] != "application/json") {
      res.status(400).json({ error: "Bad request" });
      return;
    }
    const body = req.body;
    if (!body) {
      res.status(400).json({ error: "Bad request" });
      return;
    }
    const collection = db.collection<Form>("forms");
    const form = await collection.findOne({
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
      res.status(404).json({ error: "Form not found" });
      return;
    }
    let updateBody: Partial<WithId<Form>> = {};
    if (form.permissions.owners.includes(session.user.id)) {
      updateBody = {
        name: body.name,
        updateToken: body.updateToken,
        submissionsPaused: body.submissionsPaused,
      };
    } else {
      updateBody = {
        submissionsPaused: body.submissionsPaused,
      };
    }
    const result = await collection.updateOne(
      { _id: new ObjectId(String(req.query.id)) },
      {
        $set: updateBody,
      }
    );
    if (result.matchedCount == 1) {
      res.status(200).json({ status: "Success" });
    } else {
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  } else if (req.method == "POST") {
    if (
      req.headers["content-type"] != "application/json" &&
      req.headers["content-type"] != "application/x-www-form-urlencoded"
    ) {
      res.status(400).json({ error: "Bad request" });
      return;
    }
    try {
      new ObjectId(String(req.query.id));
    } catch {
      res.status(400).json({ error: "Invalid Form ID" });
      return;
    }
    const formCollection = db.collection<Form>("forms");
    const form = await formCollection.findOne({
      _id: new ObjectId(String(req.query.id)),
    });
    if (!form) {
      res.status(404).json({ error: "Form not found" });
      return;
    }
    if (!form.updateToken) {
      res.status(400).json({ error: "No token has been configured" });
      return;
    }
    if (form.updateToken != req.headers.authorization) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (form.submissionsPaused) {
      res.status(403).json({ error: "Submissions are paused" });
      return;
    }
    let body;
    if (req.headers["content-type"] == "application/x-www-form-urlencoded") {
      const data = new URLSearchParams(req.body);
      body = Object.fromEntries(data.entries());
    } else {
      body = req.body;
    }
    const collection = db.collection<Response>("responses");
    const result = await collection.insertOne({
      form: String(req.query.id),
      createdAt: new Date(),
      data: body ?? {},
      notified: false,
    });
    if (result.insertedId) {
      res.status(200).json({ _id: result.insertedId });
      return;
    } else {
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  } else if (req.method == "DELETE") {
    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const collection = db.collection<Form>("forms");
    const form = await collection.findOne({
      $and: [
        { _id: new ObjectId(String(req.query.id)) },
        { "permissions.owners": session.user.id },
      ],
    });
    if (!form) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const result = await collection.deleteOne({
      _id: new ObjectId(String(req.query.id)),
    });
    if (result.deletedCount == 1) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  }
}

export async function getForm(
  formid: string,
  userId?: string
): Promise<Form | null> {
  const client = await clientPromise;
  const db = client.db();
  try {
    new ObjectId(formid);
  } catch {
    return null;
  }
  const formCollection = db.collection<Form>("forms");
  const form = await formCollection.findOne({
    _id: new ObjectId(formid),
  });
  if (!form) return null;
  if (userId) {
    if (!form.permissions.owners.includes(userId)) {
      form.notifications = { discord: [], email: [] };
      form.updateToken = "";
    }
  }

  return JSON.parse(JSON.stringify(form));
}
