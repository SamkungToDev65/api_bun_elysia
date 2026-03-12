import { Elysia, t } from "elysia";
import {
  CommitmentSchema,
  CommitmentCreateSchema,
  CommitmentUpdateSchema,
  ErrorResponseSchema,
} from "./types";

export function commitmentsRoutes(app: Elysia, prisma: any) {
  return app
    // Create Commitment
    .post(
      "/bank-api/commitments",
      async ({ body, set }) => {
        try {
          // Verify user exists
          const user = await prisma.user.findUnique({
            where: { person_code: body.person_code },
            select: { id: true, balance: true },
          });

          if (!user) {
            set.status = 404;
            return {
              message: "User not found",
              error: `User with person_code ${body.person_code} not found`,
            };
          }

          // Create commitment
          const commitment = await prisma.commitment.create({
            data: {
              title: body.title,
              targetAmount: body.targetAmount,
              currentAmount: 0,
              type: body.type,
              person: body.person,
              category: body.category || "การยืม/ผ่อน",
              userId: user.id,
            },
          });

          // Optionally deduct initial amount from balance
          await prisma.user.update({
            where: { id: user.id },
            data: { balance: { decrement: body.targetAmount } },
          });

          set.status = 201;
          return {
            id: commitment.id,
            title: commitment.title,
            targetAmount: Number(commitment.targetAmount),
            currentAmount: Number(commitment.currentAmount),
            type: commitment.type,
            person: commitment.person,
            category: commitment.category,
            userId: commitment.userId,
            createdAt: commitment.createdAt.toISOString(),
          };
        } catch (error) {
          set.status = 500;
          return {
            message: "Failed to create commitment",
            error: String(error),
          };
        }
      },
      {
        body: t.Object({
          person_code: t.String(),
          title: t.String(),
          targetAmount: t.Number(),
          type: t.Union([t.Literal("lend"), t.Literal("installment")]),
          person: t.Optional(t.String()),
          category: t.Optional(t.String()),
        }),
        response: {
          201: CommitmentSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      }
    )

    // Get Commitments by User
    .get(
      "/bank-api/commitments/:person_code",
      async ({ params: { person_code }, set }) => {
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

          const commitments = await prisma.commitment.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
          });

          return commitments.map((cm: any) => ({
            id: cm.id,
            title: cm.title,
            targetAmount: Number(cm.targetAmount),
            currentAmount: Number(cm.currentAmount),
            type: cm.type,
            person: cm.person,
            category: cm.category,
            userId: cm.userId,
            createdAt: cm.createdAt.toISOString(),
          }));
        } catch (error) {
          set.status = 500;
          return {
            message: "Failed to fetch commitments",
            error: String(error),
          };
        }
      }
    )

    // Get Commitment by ID
    .get(
      "/bank-api/commitments/:person_code/:commitment_id",
      async ({ params: { person_code, commitment_id }, set }) => {
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

          const commitment = await prisma.commitment.findFirst({
            where: {
              id: commitment_id,
              userId: user.id,
            },
          });

          if (!commitment) {
            set.status = 404;
            return {
              message: "Commitment not found",
              error: `Commitment with ID ${commitment_id} not found`,
            };
          }

          return {
            id: commitment.id,
            title: commitment.title,
            targetAmount: Number(commitment.targetAmount),
            currentAmount: Number(commitment.currentAmount),
            type: commitment.type,
            person: commitment.person,
            category: commitment.category,
            userId: commitment.userId,
            createdAt: commitment.createdAt.toISOString(),
          };
        } catch (error) {
          set.status = 500;
          return {
            message: "Failed to fetch commitment",
            error: String(error),
          };
        }
      }
    )

    // Update Commitment
    .patch(
      "/bank-api/commitments/:person_code/:commitment_id",
      async ({
        params: { person_code, commitment_id },
        body,
        set,
      }: {
        params: { person_code: string; commitment_id: string };
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

          const commitment = await prisma.commitment.findFirst({
            where: {
              id: commitment_id,
              userId: user.id,
            },
          });

          if (!commitment) {
            set.status = 404;
            return {
              message: "Commitment not found",
              error: `Commitment with ID ${commitment_id} not found`,
            };
          }

          const updated = await prisma.commitment.update({
            where: { id: commitment_id },
            data: {
              title: body.title,
              targetAmount: body.targetAmount,
              type: body.type,
              person: body.person,
              category: body.category,
            },
          });

          return {
            id: updated.id,
            title: updated.title,
            targetAmount: Number(updated.targetAmount),
            currentAmount: Number(updated.currentAmount),
            type: updated.type,
            person: updated.person,
            category: updated.category,
            userId: updated.userId,
            createdAt: updated.createdAt.toISOString(),
          };
        } catch (error) {
          set.status = 500;
          return {
            message: "Failed to update commitment",
            error: String(error),
          };
        }
      }
    )

    // Delete Commitment
    .delete(
      "/bank-api/commitments/:person_code/:commitment_id",
      async ({ params: { person_code, commitment_id }, set }) => {
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

          const commitment = await prisma.commitment.findFirst({
            where: {
              id: commitment_id,
              userId: user.id,
            },
          });

          if (!commitment) {
            set.status = 404;
            return {
              message: "Commitment not found",
              error: `Commitment with ID ${commitment_id} not found`,
            };
          }

          // Delete commitment
          await prisma.commitment.delete({
            where: { id: commitment_id },
          });

          // Refund the amount back to user balance
          await prisma.user.update({
            where: { id: user.id },
            data: { balance: { increment: Number(commitment.targetAmount) } },
          });

          return {
            message: "Commitment deleted successfully",
            id: commitment_id,
          };
        } catch (error) {
          set.status = 500;
          return {
            message: "Failed to delete commitment",
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
    )

    // Get Commitment Progress
    .get(
      "/bank-api/commitments/:person_code/:commitment_id/progress",
      async ({ params: { person_code, commitment_id }, set }) => {
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

          const commitment = await prisma.commitment.findFirst({
            where: {
              id: commitment_id,
              userId: user.id,
            },
          });

          if (!commitment) {
            set.status = 404;
            return {
              message: "Commitment not found",
              error: `Commitment with ID ${commitment_id} not found`,
            };
          }

          const targetAmount = Number(commitment.targetAmount);
          const currentAmount = Number(commitment.currentAmount);
          const remainingAmount = Math.max(0, targetAmount - currentAmount);
          const progressPercent = Math.min(100, (currentAmount / targetAmount) * 100);

          return {
            commitmentId: commitment_id,
            title: commitment.title,
            targetAmount,
            currentAmount,
            remainingAmount,
            progressPercent: Math.round(progressPercent),
            isCompleted: progressPercent >= 100,
          };
        } catch (error) {
          set.status = 500;
          return {
            message: "Failed to fetch commitment progress",
            error: String(error),
          };
        }
      },
      {
        response: {
          200: t.Object({
            commitmentId: t.String(),
            title: t.String(),
            targetAmount: t.Number(),
            currentAmount: t.Number(),
            remainingAmount: t.Number(),
            progressPercent: t.Number(),
            isCompleted: t.Boolean(),
          }),
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      }
    );
}
