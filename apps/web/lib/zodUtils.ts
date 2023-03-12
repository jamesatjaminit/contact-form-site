import { ObjectId } from "mongodb";
import { z } from "zod";
export const objectIdSchema = z.custom<string>((val) => {
  try {
    new ObjectId(String(val));
    return true;
  } catch {
    return false;
  }
});
