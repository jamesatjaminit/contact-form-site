import { z } from "zod";

export const formSchema = z.object({
  name: z.string(),
  createdBy: z.string(),
  createdAt: z.date(),
  updateToken: z.string().nullable(),
  permissions: z.object({
    owners: z.array(z.string()),
    editors: z.array(z.string()),
    viewers: z.array(z.string()),
  }),
  submissionsPaused: z.boolean(),
  notifications: z.object({
    email: z.array(z.string()),
    discord: z.array(z.string()),
    mattermost: z.array(z.string()),
    ntfy: z.array(
      z.object({
        auth: z
          .object({
            username: z.string(),
            password: z.string(),
          })
          .optional(),
        serverUrl: z.string(),
        topic: z.string(),
      })
    ),
  }),
});
export type Form = z.infer<typeof formSchema>;

export const responseSchema = z.object({
  form: z.string(),
  createdAt: z.date(),
  data: z.record(z.unknown()),
  notified: z.boolean(),
});
export type Response = z.infer<typeof responseSchema>;

export const userSchema = z.object({
  name: z.string(),
  email: z.string(),
  image: z.string().optional(),
  emailVerified: z.date(),
  admin: z.boolean().default(false),
});
export type User = z.infer<typeof userSchema>;

export type WithStringId<T> = T & { _id: string };
