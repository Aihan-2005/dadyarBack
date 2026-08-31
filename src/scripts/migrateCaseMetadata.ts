import mongoose, { Types } from "mongoose";

import { Database } from "../config/db";

import { CaseModel } from "../models/case.model";

import { LawyerClientModel } from "../models/lawyerClient.model";

import { CasePaymentModel } from "../models/casePayment.model";

import { CaseExpenseModel } from "../models/caseExpense.model";

type DuplicateCaseNumber = {
  _id: {
    lawyerId: Types.ObjectId;

    caseNumber: string;
  };

  count: number;

  ids: Types.ObjectId[];
};

type LegacyCase = {
  _id: Types.ObjectId;

  court?: {
    archiveNumberBranch?: string | null;
  } | null;

  branchHistory?: Array<{
    archiveNumberBranch?: string | null;

    isActive?: boolean;
  }>;

  clientAssignments?: Array<{
    clientId: Types.ObjectId;

    assignedAmount: number;

    birthDate?: Date | null;

    role?: string | null;

    represent?: string | null;
  }>;
};

function normalizeOptionalText(
  value: string | null | undefined,
): string | undefined {
  const normalized = value?.trim();

  return normalized || undefined;
}

async function assertNoDuplicateCaseNumbers(): Promise<void> {
  const duplicates = await CaseModel.aggregate<DuplicateCaseNumber>([
    {
      $group: {
        _id: {
          lawyerId: "$lawyerId",

          caseNumber: "$caseNumber",
        },

        count: {
          $sum: 1,
        },

        ids: {
          $push: "$_id",
        },
      },
    },
    {
      $match: {
        count: {
          $gt: 1,
        },
      },
    },
    {
      $limit: 20,
    },
  ]);

  if (duplicates.length === 0) {
    return;
  }

  console.error(
    "Duplicate case numbers were found. Resolve them before creating indexes:",
  );

  for (const duplicate of duplicates) {
    console.error({
      lawyerId: duplicate._id.lawyerId.toString(),

      caseNumber: duplicate._id.caseNumber,

      caseIds: duplicate.ids.map((id) => id.toString()),
    });
  }

  throw new Error("CASE_NUMBER_DUPLICATES_FOUND");
}

async function backfillLegacyCaseMetadata(): Promise<{
  scannedCases: number;
  updatedCases: number;
  birthDatesBackfilled: number;
  branchArchiveNumbersBackfilled: number;
}> {
  let scannedCases = 0;

  let updatedCases = 0;

  let birthDatesBackfilled = 0;

  let branchArchiveNumbersBackfilled = 0;

  const cursor = CaseModel.find({})
    .select("_id court branchHistory clientAssignments")
    .lean()
    .cursor();

  for await (const rawCase of cursor) {
    scannedCases += 1;

    const caseItem = rawCase as unknown as LegacyCase;

    const assignments = caseItem.clientAssignments ?? [];

    const missingBirthDateClientIds = assignments
      .filter((assignment) => !assignment.birthDate)
      .map((assignment) => assignment.clientId);

    const clients =
      missingBirthDateClientIds.length > 0
        ? await LawyerClientModel.find({
            _id: {
              $in: missingBirthDateClientIds,
            },

            birthday: {
              $type: "date",
            },
          })
            .select("_id birthday")
            .lean()
            .exec()
        : [];

    const birthdaysByClientId = new Map(
      clients.map(
        (client) => [client._id.toString(), client.birthday] as const,
      ),
    );

    let assignmentsChanged = false;

    const nextAssignments = assignments.map((assignment) => {
      if (assignment.birthDate) {
        return assignment;
      }

      const birthday = birthdaysByClientId.get(assignment.clientId.toString());

      if (!birthday) {
        return assignment;
      }

      assignmentsChanged = true;

      birthDatesBackfilled += 1;

      return {
        ...assignment,
        birthDate: birthday,
      };
    });

    const currentCourtArchive = normalizeOptionalText(
      caseItem.court?.archiveNumberBranch,
    );

    const activeBranchArchive = normalizeOptionalText(
      caseItem.branchHistory?.find((history) => history.isActive === true)
        ?.archiveNumberBranch,
    );

    const setData: Record<string, unknown> = {};

    if (assignmentsChanged) {
      setData.clientAssignments = nextAssignments;
    }

    if (!currentCourtArchive && activeBranchArchive) {
      setData["court.archiveNumberBranch"] = activeBranchArchive;

      branchArchiveNumbersBackfilled += 1;
    }

    if (Object.keys(setData).length === 0) {
      continue;
    }

    await CaseModel.updateOne(
      {
        _id: caseItem._id,
      },
      {
        $set: setData,
      },
      {
        runValidators: true,
      },
    ).exec();

    updatedCases += 1;
  }

  return {
    scannedCases,
    updatedCases,
    birthDatesBackfilled,
    branchArchiveNumbersBackfilled,
  };
}

async function ensureIndexes(): Promise<void> {
  /**
   * createIndexes creates missing indexes but does not drop unrelated legacy
   * indexes. That makes this migration safer than syncIndexes for production.
   */
  await Promise.all([
    CaseModel.createIndexes(),
    LawyerClientModel.createIndexes(),
    CasePaymentModel.createIndexes(),
    CaseExpenseModel.createIndexes(),
  ]);
}

async function main(): Promise<void> {
  const database = new Database();

  try {
    await database.connect();

    await assertNoDuplicateCaseNumbers();

    const result = await backfillLegacyCaseMetadata();

    await ensureIndexes();

    console.log("Case metadata migration completed successfully", result);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await database.disconnect();
    }
  }
}

void main().catch((error: unknown) => {
  console.error("Case metadata migration failed:", error);

  process.exitCode = 1;
});

