import { Types } from "mongoose";

import type {
  FinancialClientCasesQuery,
  FinancialClientReportQuery,
} from "../interfaces/financialReport.interface";

import { CaseModel } from "../models/case.model";

import { CasePaymentModel } from "../models/casePayment.model";

import { CaseExpenseModel } from "../models/caseExpense.model";

import ClientModel from "../models/client.model";

export class FinancialReportRepository {
  // ---------------- Helpers ----------------

  private toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // ---------------- Lawyer Summary ----------------

  public async getLawyerSummary(lawyerId: string) {
    const lawyerObjectId = this.toObjectId(lawyerId);

    const now = new Date();

    const [caseResult, paymentResult, expenseResult] = await Promise.all([
      // ---------------- Cases ----------------

      CaseModel.aggregate<{
        totalCaseValue: number;
      }>([
        {
          $match: {
            lawyerId: lawyerObjectId,
          },
        },
        {
          $group: {
            _id: null,

            totalCaseValue: {
              $sum: "$value",
            },
          },
        },
      ]),

      // ---------------- Payments ----------------

      CasePaymentModel.aggregate<{
        totalPaidPayments: number;

        totalOverduePayments: number;
      }>([
        {
          $match: {
            lawyerId: lawyerObjectId,
          },
        },
        {
          $group: {
            _id: null,

            totalPaidPayments: {
              $sum: {
                $cond: ["$isPaid", "$amount", 0],
              },
            },

            totalOverduePayments: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $eq: ["$isPaid", false],
                      },

                      {
                        $ne: ["$dueDate", null],
                      },

                      {
                        $lt: ["$dueDate", now],
                      },
                    ],
                  },

                  "$amount",

                  0,
                ],
              },
            },
          },
        },
      ]),

      // ---------------- Expenses ----------------

      CaseExpenseModel.aggregate<{
        totalExpenses: number;

        totalPaidExpenses: number;
      }>([
        {
          $match: {
            lawyerId: lawyerObjectId,
          },
        },
        {
          $group: {
            _id: null,

            totalExpenses: {
              $sum: "$amount",
            },

            totalPaidExpenses: {
              $sum: {
                $cond: ["$isPaid", "$amount", 0],
              },
            },
          },
        },
      ]),
    ]);

    return {
      totalCaseValue: caseResult[0]?.totalCaseValue ?? 0,

      totalPaidPayments: paymentResult[0]?.totalPaidPayments ?? 0,

      totalOverduePayments: paymentResult[0]?.totalOverduePayments ?? 0,

      totalExpenses: expenseResult[0]?.totalExpenses ?? 0,

      totalPaidExpenses: expenseResult[0]?.totalPaidExpenses ?? 0,
    };
  }

  // ---------------- Client Financial Report ----------------

  public async getClientFinancialReport(
    lawyerId: string,
    options: FinancialClientReportQuery,
  ) {
    const lawyerObjectId = this.toObjectId(lawyerId);

    const page = Math.max(options.page ?? 1, 1);

    const limit = Math.min(Math.max(options.limit ?? 10, 1), 100);

    const skip = (page - 1) * limit;

    const match: Record<string, unknown> = {
      lawyerId: lawyerObjectId,
    };

    const search = options.search?.trim();

    if (search) {
      const safeSearch = this.escapeRegex(search);

      match.$or = [
        {
          fullName: {
            $regex: safeSearch,

            $options: "i",
          },
        },

        {
          phone: {
            $regex: safeSearch,

            $options: "i",
          },
        },

        {
          nationalId: {
            $regex: safeSearch,

            $options: "i",
          },
        },
      ];
    }

    const now = new Date();

    const [result] = await ClientModel.aggregate([
      {
        $match: match,
      },

      {
        $sort: {
          updatedAt: -1,
        },
      },

      {
        $facet: {
          // ---------------- Pagination Metadata ----------------

          metadata: [
            {
              $count: "total",
            },
          ],

          // ---------------- Clients ----------------

          items: [
            {
              $skip: skip,
            },

            {
              $limit: limit,
            },

            // ---------------- Case Assignments ----------------

            {
              $lookup: {
                from: CaseModel.collection.name,

                let: {
                  clientId: "$_id",

                  lawyerId: "$lawyerId",
                },

                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$lawyerId", "$$lawyerId"],
                      },
                    },
                  },

                  {
                    $unwind: "$clientAssignments",
                  },

                  {
                    $match: {
                      $expr: {
                        $eq: ["$clientAssignments.clientId", "$$clientId"],
                      },
                    },
                  },

                  {
                    $group: {
                      _id: null,

                      caseCount: {
                        $sum: 1,
                      },

                      assignedAmount: {
                        $sum: "$clientAssignments.assignedAmount",
                      },
                    },
                  },
                ],

                as: "caseFinancial",
              },
            },

            // ---------------- Payments ----------------

            {
              $lookup: {
                from: CasePaymentModel.collection.name,

                let: {
                  clientId: "$_id",

                  lawyerId: "$lawyerId",
                },

                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ["$lawyerId", "$$lawyerId"],
                          },

                          {
                            $eq: ["$clientId", "$$clientId"],
                          },
                        ],
                      },
                    },
                  },

                  {
                    $group: {
                      _id: null,

                      paidAmount: {
                        $sum: {
                          $cond: ["$isPaid", "$amount", 0],
                        },
                      },

                      overdueAmount: {
                        $sum: {
                          $cond: [
                            {
                              $and: [
                                {
                                  $eq: ["$isPaid", false],
                                },

                                {
                                  $ne: ["$dueDate", null],
                                },

                                {
                                  $lt: ["$dueDate", now],
                                },
                              ],
                            },

                            "$amount",

                            0,
                          ],
                        },
                      },
                    },
                  },
                ],

                as: "paymentFinancial",
              },
            },

            // ---------------- Flatten Values ----------------

            {
              $set: {
                caseCount: {
                  $ifNull: [
                    {
                      $arrayElemAt: ["$caseFinancial.caseCount", 0],
                    },

                    0,
                  ],
                },

                assignedAmount: {
                  $ifNull: [
                    {
                      $arrayElemAt: ["$caseFinancial.assignedAmount", 0],
                    },

                    0,
                  ],
                },

                paidAmount: {
                  $ifNull: [
                    {
                      $arrayElemAt: ["$paymentFinancial.paidAmount", 0],
                    },

                    0,
                  ],
                },

                overdueAmount: {
                  $ifNull: [
                    {
                      $arrayElemAt: ["$paymentFinancial.overdueAmount", 0],
                    },

                    0,
                  ],
                },
              },
            },

            // ---------------- Derived Values ----------------

            {
              $set: {
                remainingAmount: {
                  $subtract: ["$assignedAmount", "$paidAmount"],
                },

                collectionRate: {
                  $cond: [
                    {
                      $gt: ["$assignedAmount", 0],
                    },

                    {
                      $multiply: [
                        {
                          $divide: ["$paidAmount", "$assignedAmount"],
                        },

                        100,
                      ],
                    },

                    0,
                  ],
                },
              },
            },

            // ---------------- Final Shape ----------------

            {
              $project: {
                _id: 0,

                clientId: {
                  $toString: "$_id",
                },

                fullName: 1,

                phone: 1,

                caseCount: 1,

                assignedAmount: 1,

                paidAmount: 1,

                remainingAmount: 1,

                overdueAmount: 1,

                collectionRate: 1,
              },
            },
          ],
        },
      },
    ]);

    const total = result?.metadata?.[0]?.total ?? 0;

    return {
      items: result?.items ?? [],

      pagination: {
        page,

        limit,

        total,

        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getClientCaseFinancialReport(
    lawyerId: string,
    clientId: string,
    options: FinancialClientCasesQuery,
  ) {
    const lawyerObjectId = this.toObjectId(lawyerId);

    const clientObjectId = this.toObjectId(clientId);

    const page = Math.max(options.page ?? 1, 1);

    const limit = Math.min(Math.max(options.limit ?? 10, 1), 100);

    const skip = (page - 1) * limit;

    const now = new Date();

    const [result] = await CaseModel.aggregate([
      // ---------------- Cases Belonging To Lawyer ----------------

      {
        $match: {
          lawyerId: lawyerObjectId,

          "clientAssignments.clientId": clientObjectId,
        },
      },

      // ---------------- Get Only This Client Assignment ----------------

      {
        $set: {
          clientAssignment: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$clientAssignments",

                  as: "assignment",

                  cond: {
                    $eq: ["$$assignment.clientId", clientObjectId],
                  },
                },
              },

              0,
            ],
          },
        },
      },

      {
        $sort: {
          updatedAt: -1,
        },
      },

      // ---------------- Pagination ----------------

      {
        $facet: {
          metadata: [
            {
              $count: "total",
            },
          ],

          items: [
            {
              $skip: skip,
            },

            {
              $limit: limit,
            },

            // ---------------- Payments For This Client + Case ----------------

            {
              $lookup: {
                from: CasePaymentModel.collection.name,

                let: {
                  caseId: "$_id",

                  lawyerId: "$lawyerId",
                },

                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ["$lawyerId", "$$lawyerId"],
                          },

                          {
                            $eq: ["$caseId", "$$caseId"],
                          },

                          {
                            $eq: ["$clientId", clientObjectId],
                          },
                        ],
                      },
                    },
                  },

                  {
                    $sort: {
                      dueDate: 1,

                      createdAt: 1,
                    },
                  },
                ],

                as: "payments",
              },
            },

            // ---------------- Financial Calculations ----------------

            {
              $set: {
                assignedAmount: {
                  $ifNull: ["$clientAssignment.assignedAmount", 0],
                },

                paidAmount: {
                  $sum: {
                    $map: {
                      input: "$payments",

                      as: "payment",

                      in: {
                        $cond: ["$$payment.isPaid", "$$payment.amount", 0],
                      },
                    },
                  },
                },

                overdueAmount: {
                  $sum: {
                    $map: {
                      input: "$payments",

                      as: "payment",

                      in: {
                        $cond: [
                          {
                            $and: [
                              {
                                $eq: ["$$payment.isPaid", false],
                              },

                              {
                                $ne: ["$$payment.dueDate", null],
                              },

                              {
                                $lt: ["$$payment.dueDate", now],
                              },
                            ],
                          },

                          "$$payment.amount",

                          0,
                        ],
                      },
                    },
                  },
                },
              },
            },

            // ---------------- Derived Values ----------------

            {
              $set: {
                remainingAmount: {
                  $subtract: ["$assignedAmount", "$paidAmount"],
                },

                collectionRate: {
                  $cond: [
                    {
                      $gt: ["$assignedAmount", 0],
                    },

                    {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: ["$paidAmount", "$assignedAmount"],
                            },

                            100,
                          ],
                        },

                        2,
                      ],
                    },

                    0,
                  ],
                },
              },
            },

            // ---------------- Response Shape ----------------

            {
              $project: {
                _id: 0,

                caseId: {
                  $toString: "$_id",
                },

                caseNumber: 1,

                title: 1,

                state: 1,

                caseValue: "$value",

                assignedAmount: 1,

                paidAmount: 1,

                remainingAmount: 1,

                overdueAmount: 1,

                collectionRate: 1,

                payments: {
                  $map: {
                    input: "$payments",

                    as: "payment",

                    in: {
                      paymentId: {
                        $toString: "$$payment._id",
                      },

                      method: "$$payment.method",

                      amount: "$$payment.amount",

                      description: "$$payment.description",

                      dueDate: "$$payment.dueDate",

                      isPaid: "$$payment.isPaid",
                    },
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    const total = result?.metadata?.[0]?.total ?? 0;

    return {
      items: result?.items ?? [],

      pagination: {
        page,

        limit,

        total,

        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
