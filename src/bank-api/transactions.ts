import { Elysia, t } from "elysia";
import {
  TransactionSchema,
  TransactionCreateSchema,
  TransactionUpdateSchema,
  ErrorResponseSchema,
} from "./types";

export function transactionsRoutes(app: Elysia, prisma: any) {
  return app
    // Create Transaction
    .post(
      "/bank-api/transactions",
      async ({ body, set }) => {
        try {
          // Verify user exists
          const user = await prisma.user.findUnique({
            where: { person_code: body.person_code },
            select: { id: true },
          });

          if (!user) {
            set.status = 404;
            return {
              message: "User not found",
              error: `User with person_code ${body.person_code} not found`,
            };
          }

          // Create transaction
          const transaction = await prisma.transaction.create({
            data: {
              amount: body.amount,
              type: body.type,
              category: body.category,
              note: body.note,
              date: body.date ? new Date(body.date) : new Date(),
              userId: user.id,
              commitmentId: body.commitmentId || undefined,
            },
          });

          // Update user balance
          const diff = body.type === "income" ? body.amount : -body.amount;
          await prisma.user.update({
            where: { id: user.id },
            data: { balance: { increment: diff } },
          });

          // If linked to commitment, update commitment progress
          if (body.commitmentId) {
            await prisma.commitment.update({
              where: { id: body.commitmentId },
              data: { currentAmount: { increment: body.amount } },
            });
          }

          set.status = 201;
          return {
            id: transaction.id,
            amount: Number(transaction.amount),
            type: transaction.type,
            category: transaction.category,
            note: transaction.note,
            date: transaction.date.toISOString().split("T")[0],
            userId: transaction.userId,
            commitmentId: transaction.commitmentId,
            createdAt: transaction.createdAt.toISOString(),
          };
        } catch (error) {
          set.status = 500;
          return {
            message: "Failed to create transaction",
            error: String(error),
          };
        }
      },
      {
        body: t.Object({
          person_code: t.String(),
          amount: t.Number(),
          type: t.Union([t.Literal("income"), t.Literal("expense")]),
          category: t.String(),
          note: t.Optional(t.String()),
          date: t.Optional(t.String()),
          commitmentId: t.Optional(t.String()),
        }),
        response: {
          201: TransactionSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      }
    )

    // Get Transactions by User
    .get(
      "/bank-api/transactions/:person_code",
      async ({ params: { person_code }, query, set }) => {
        try {
          const user = await prisma.user.findUnique({
            where: { person_code },
            select: { id: true },
          });

          if (!user) {
            set.status = 404;
            return {
              message: "User not found",
              error: `User with person_code ${person_code} not found`,
            };
          }

          const limit = query.limit ? parseInt(query.limit as string) : 50;
          const skip = query.skip ? parseInt(query.skip as string) : 0;

          const transactions = await prisma.transaction.findMany({
            where: { userId: user.id },
            orderBy: { date: "desc" },
            take: limit,
            skip: skip,
          });

          return transactions.map((tx: any) => ({
            id: tx.id,
            amount: Number(tx.amount),
            type: tx.type,
            category: tx.category,
            note: tx.note,
            date: tx.date.toISOString().split("T")[0],
            userId: tx.userId,
            commitmentId: tx.commitmentId,
            createdAt: tx.createdAt.toISOString(),
          }));
        } catch (error) {
          set.status = 500;
          return {
            message: "Failed to fetch transactions",
            error: String(error),
          };
        }
      }
    )

    // Get Transaction by ID
    .get(
      "/bank-api/transactions/:person_code/:transaction_id",
      async ({ params: { person_code, transaction_id }, set }) => {
        try {
          const user = await prisma.user.findUnique({
            where: { person_code },
            select: { id: true },
          });

          if (!user) {
            set.status = 404;
            return {
              message: "User not found",
              error: `User with person_code ${person_code} not found`,
            };
          }

          const transaction = await prisma.transaction.findFirst({
            where: {
              id: transaction_id,
              userId: user.id,
            },
          });

          if (!transaction) {
            set.status = 404;
            return {
              message: "Transaction not found",
              error: `Transaction with ID ${transaction_id} not found`,
            };
          }

          return {
            id: transaction.id,
            amount: Number(transaction.amount),
            type: transaction.type,
            category: transaction.category,
            note: transaction.note,
            date: transaction.date.toISOString().split("T")[0],
            userId: transaction.userId,
            commitmentId: transaction.commitmentId,
            createdAt: transaction.createdAt.toISOString(),
          };
        } catch (error) {
          set.status = 500;
          return {
            message: "Failed to fetch transaction",
            error: String(error),
          };
        }
      }
    )

    // Update Transaction
    .patch(
      "/bank-api/transactions/:person_code/:transaction_id",
      async ({
        params: { person_code, transaction_id },
        body,
        set,
      }: {
        params: { person_code: string; transaction_id: string };
        body: any;
        set: any;
      }) => {
        try {
          const user = await prisma.user.findUnique({
            where: { person_code },
            select: { id: true },
          });

          if (!user) {
            set.status = 404;
            return {
              message: "User not found",
              error: `User with person_code ${person_code} not found`,
            };
          }

          // Get old transaction to calculate diff
          const oldTx = await prisma.transaction.findFirst({
            where: {
              id: transaction_id,
              userId: user.id,
            },
          });

          if (!oldTx) {
            set.status = 404;
            return {
              message: "Transaction not found",
              error: `Transaction with ID ${transaction_id} not found`,
            };
          }

          // Calculate balance diff
          const oldDiff =
            oldTx.type === "income" ? Number(oldTx.amount) : -Number(oldTx.amount);
          const newAmount = body.amount || Number(oldTx.amount);
          const newDiff =
            oldTx.type === "income" ? newAmount : -newAmount;
          const balanceDiff = newDiff - oldDiff;

          // Update transaction
          const updated = await prisma.transaction.update({
            where: { id: transaction_id },
            data: {
              amount: body.amount,
              category: body.category,
              note: body.note,
              date: body.date ? new Date(body.date) : undefined,
            },
          });

          // Update user balance
          await prisma.user.update({
            where: { id: user.id },
            data: { balance: { increment: balanceDiff } },
          });

          return {
            id: updated.id,
            amount: Number(updated.amount),
            type: updated.type,
            category: updated.category,
            note: updated.note,
            date: updated.date.toISOString().split("T")[0],
            userId: updated.userId,
            commitmentId: updated.commitmentId,
            createdAt: updated.createdAt.toISOString(),
          };
        } catch (error) {
          set.status = 500;
          return {
            message: "Failed to update transaction",
            error: String(error),
          };
        }
      }
    )

    // Delete Transaction
    .delete(
      "/bank-api/transactions/:person_code/:transaction_id",
      async ({ params: { person_code, transaction_id }, set }) => {
        try {
          const user = await prisma.user.findUnique({
            where: { person_code },
            select: { id: true },
          });

          if (!user) {
            set.status = 404;
            return {
              message: "User not found",
              error: `User with person_code ${person_code} not found`,
            };
          }

          const transaction = await prisma.transaction.findFirst({
            where: {
              id: transaction_id,
              userId: user.id,
            },
          });

          if (!transaction) {
            set.status = 404;
            return {
              message: "Transaction not found",
              error: `Transaction with ID ${transaction_id} not found`,
            };
          }

          // Delete transaction
          await prisma.transaction.delete({
            where: { id: transaction_id },
          });

          // Reverse balance update
          const diff =
            transaction.type === "income"
              ? -Number(transaction.amount)
              : Number(transaction.amount);
          await prisma.user.update({
            where: { id: user.id },
            data: { balance: { increment: diff } },
          });

          // If linked to commitment, reverse commitment update
          if (transaction.commitmentId) {
            await prisma.commitment.update({
              where: { id: transaction.commitmentId },
              data: { currentAmount: { decrement: Number(transaction.amount) } },
            });
          }

          return {
            message: "Transaction deleted successfully",
            id: transaction_id,
          };
        } catch (error) {
          set.status = 500;
          return {
            message: "Failed to delete transaction",
            error: String(error),
          };
        }
      },
      {
        response: {
          200: t.Object({
            message: t.String(),
            id: t.String(),
          }),
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      }
    );
}
