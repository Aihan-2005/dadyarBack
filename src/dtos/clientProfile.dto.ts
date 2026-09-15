import type { ClientProfileRecord } from "../interfaces/clientProfile.interface";
import type { UserRecord } from "../interfaces/user.interface";

export interface ClientProfileDTO {
  id: string;
  userId: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toClientProfileDTO(
  profile: ClientProfileRecord,
  user: UserRecord,
): ClientProfileDTO {
  return {
    id: profile._id.toString(),
    userId: user._id.toString(),
    fullName: profile.fullName,
    phone: user.phone ?? null,
    email: user.email ?? null,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}
