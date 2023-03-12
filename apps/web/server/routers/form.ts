import { isAuthed, procedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import clientPromise from "../../lib/mongodb";
import { Form } from "types/dist/database";
import { randomBytes } from "crypto";
import { objectIdSchema } from "../../lib/zodUtils";
import { ObjectId } from "mongodb";

const formRouter = router({
  new: procedure
    .use(isAuthed)
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async (req) => {
      if (
        process.env.NEXT_PUBLIC_ADMIN_ONLY_CREATE_FORMS == "true" &&
        !req.ctx.session.user.admin
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to create forms.",
        });
      }
      const client = await clientPromise;
      const db = client.db();
      const collection = db.collection<Form>("forms");
      const result = await collection.insertOne({
        name: req.input.name,
        createdBy: req.ctx.session.user.id,
        createdAt: new Date(),
        updateToken: randomBytes(48).toString("hex"),
        permissions: {
          owners: [req.ctx.session.user.id],
          editors: [],
          viewers: [],
        },
        submissionsPaused: false,
        notifications: {
          email: [],
          discord: [],
          ntfy: [],
          mattermost: [],
        },
      });
      if (result.insertedId) {
        return { _id: result.insertedId };
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new form in database",
        });
      }
    }),
  getFormInfoById: procedure
    .use(isAuthed)
    .input(
      z.object({
        id: objectIdSchema,
      })
    )
    .query(async (req) => {
      const client = await clientPromise;
      const db = client.db();
      const collection = db.collection<Form>("forms");
      const form = await collection.findOne({
        _id: new ObjectId(String(req.input.id)),
      });
      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }
      return {
        submissionsPaused: form.submissionsPaused,
      };
    }),
});

export default formRouter;
