import { Elysia, t } from "elysia";
import {
  TransactionSchema,
  ErrorResponseSchema,
} from "./types";

export function transactionsRoutes(app: Elysia, prisma: any) {
  return app
    // --- 1. Create Transaction (บันทึกรายรับ-รายจ่าย) ---
    .post(
      "/bank-api/transactions",
      async ({ body, set }) => {
        try {
          // ดึง User หลักคนเดียวเสมอ
          const user = await prisma.user.findFirst();

          if (!user) {
            set.status = 404;
            return {
              message: "User not found",
              error: "Please run /users/me first to initialize the main account.",
            };
          }

          // บันทึกธุรกรรมลงใน Database
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

          // อัปเดตยอดเงินในบัญชีหลัก (Increment/Decrement ตามประเภท)
          const diff = body.type === "income" ? body.amount : -body.amount;
          await prisma.user.update({
            where: { id: user.id },
            data: { balance: { increment: diff } },
          });

          // ถ้ามีการระบุการผ่อน (Commitment) ให้ไปเพิ่มยอดที่จ่ายแล้ว
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

    // --- 2. Get All Transactions (ดึงประวัติทั้งหมด) ---
    .get(
      "/bank-api/transactions/all",
      async ({ query, set }) => {
        try {
          const user = await prisma.user.findFirst();
          if (!user) {
            set.status = 404;
            return { message: "User not found", error: "Main account not found" };
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

    // --- 3. Delete Transaction (ลบรายการและคืนค่า Balance) ---
    .delete(
      "/bank-api/transactions/:transaction_id",
      async ({ params: { transaction_id }, set }) => {
        try {
          const user = await prisma.user.findFirst();
          if (!user) {
            set.status = 404;
            return { message: "User not found", error: "Main account not found" };
          }

          // ค้นหาข้อมูลเดิมก่อนลบเพื่อนำมาคำนวณเงินคืน
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
              error: `ID ${transaction_id} not found`,
            };
          }

          // ลบข้อมูล
          await prisma.transaction.delete({
            where: { id: transaction_id },
          });

          // คืนเงินเข้า Balance (ย้อนกลับ Logic เดิม)
          const diff = transaction.type === "income"
              ? -Number(transaction.amount) // รายได้ถูกลบ = เงินลด
              : Number(transaction.amount);  // รายจ่ายถูกลบ = เงินเพิ่ม
          
          await prisma.user.update({
            where: { id: user.id },
            data: { balance: { increment: diff } },
          });

          // ถ้ามีการผูกผ่อนชำระ ให้ลดค่าที่จ่ายไปแล้วลงด้วย
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