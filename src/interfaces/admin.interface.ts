import { z } from "zod";
import { AdminListUserQuerySchema } from "../validators/user.validator";

export type AdminUserListOptions = Partial<
  z.output<typeof AdminListUserQuerySchema>
>;
