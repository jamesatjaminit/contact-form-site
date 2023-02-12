// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import clientPromise from "../../lib/mongodb";
import { authOptions } from "./auth/[...nextauth]";
import { Form, Response, User } from "types/dist/database";

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
  const stats = await getStats();
  res.status(200).json(stats);
}

export interface StatsResponse {
  totalResponses: number;
  totalForms: number;
  totalUsers: number;
}

export async function getStats(): Promise<StatsResponse> {
  const client = await clientPromise;
  const db = client.db();
  const responseCollection = db.collection<Response>("responses");
  const totalResponses = await responseCollection.countDocuments();
  const formCollection = db.collection<Form>("forms");
  const totalForms = await formCollection.countDocuments();
  const usersCollection = db.collection<User>("users");
  const totalUsers = await usersCollection.countDocuments();
  return {
    totalResponses,
    totalForms,
    totalUsers,
  };
}
