import { TRPCError } from "@trpc/server";
import { Form, User, userSchema } from "types/dist/database";
import clientPromise from "../../lib/mongodb";
import { isAdmin, isAuthed, procedure, router } from "../trpc";
import { z } from "zod";
import { AUTHENTICATION_METHOD } from "../../lib/consts";
import { objectIdSchema } from "../../lib/zodUtils";
import { ObjectId } from "mongodb";
import { isRequestingUser } from "../../lib/utils";

const userRouter = router({
  listAllUsers: procedure
    .use(isAuthed)
    .use(isAdmin)
    .query(async (req) => {
      const client = await clientPromise;
      const db = client.db();
      const collection = db.collection<User>("users");
      const users = await collection.find().sort({ createdAt: 1 }).toArray();
      return users;
    }),
  invite: procedure
    .use(isAuthed)
    .use(isAdmin)
    .input(
      z.object({
        name: z.string(),
        email: z.string(),
        admin: z.boolean(),
      })
    )
    .mutation(async (req) => {
      if (AUTHENTICATION_METHOD != "EMAIL") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot invite users when email signin is disabled",
        });
      }
      const client = await clientPromise;
      const db = client.db();
      const collection = db.collection<User>("users");
      const result = await collection.insertOne({
        name: req.input.name,
        email: req.input.email,
        admin: req.input.admin,
        emailVerified: new Date(),
      });
      if (result.insertedId) {
        return {
          _id: result.insertedId,
        };
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating new user in database",
        });
      }
    }),
  getUserById: procedure
    .use(isAuthed)
    .input(
      z.object({
        id: objectIdSchema,
      })
    )
    .query(async (req) => {
      if (
        !isRequestingUser(
          req.ctx.session.user.id,
          req.input.id,
          req.ctx.session.user.admin
        )
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }
      const client = await clientPromise;
      const db = client.db();
      const collection = db.collection<User>("users");
      const user = await collection.findOne({
        _id: new ObjectId(req.input.id),
      });
      if (user) {
        return user;
      } else {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
    }),
  deleteUserById: procedure
    .use(isAuthed)
    .input(
      z.object({
        id: objectIdSchema,
      })
    )
    .mutation(async (req) => {
      const user = await caller.getUserById({ id: req.input.id });
      if (user._id) {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection<User>("users");
        const result = await collection.deleteOne({
          _id: new ObjectId(String(req.input.id)),
        });
        if (result.deletedCount == 1) {
          const formsCollection = db.collection<Form>("forms");
          await formsCollection.deleteMany({
            createdBy: req.input.id,
          });
          return {
            success: true,
          };
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error deleting user",
          });
        }
      }
    }),
  updateUserById: procedure
    .use(isAuthed)
    .input(
      z.object({
        id: objectIdSchema,
        user: userSchema,
      })
    )
    .mutation(async (req) => {
      const client = await clientPromise;
      const db = client.db();
      const collection = db.collection<User>("users");
      const result = await collection.updateOne(
        { _id: new ObjectId(String(req.input.id)) },
        {
          $set: {
            name: req.input.user.name,
            email: req.input.user.email,
            image: req.input.user.image,
          },
        }
      );
      if (result.modifiedCount == 1) {
        return {
          success: true,
        };
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error updating user",
        });
      }
    }),
});

const caller = userRouter.createCaller({});
export default userRouter;
