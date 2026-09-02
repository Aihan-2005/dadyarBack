import type {
  UserRecord,
  UserRole,
  UserStatus,
} from "../interfaces/user.interface";

export interface PublicUserDTO {
  id: string;

  email: string | null;

  phone: string | null;

  role: UserRole;

  status: UserStatus;

  verification: {
    email: {
      verified: boolean;
      verifiedAt: string | null;
    };

    phone: {
      verified: boolean;
      verifiedAt: string | null;
    };
  };

  lastLoginAt: string | null;
}

function toISODate(value?: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function toPublicUserDTO(user: UserRecord): PublicUserDTO {
  const emailVerifiedAt = toISODate(user.emailVerifiedAt);

  const phoneVerifiedAt = toISODate(user.phoneVerifiedAt);

  return {
    id: user._id.toString(),

    email: user.email ?? null,

    phone: user.phone ?? null,

    role: user.role,

    status: user.status,

    verification: {
      email: {
        verified: emailVerifiedAt !== null,

        verifiedAt: emailVerifiedAt,
      },

      phone: {
        verified: phoneVerifiedAt !== null,

        verifiedAt: phoneVerifiedAt,
      },
    },

    lastLoginAt: toISODate(user.lastLoginAt),
  };
}
