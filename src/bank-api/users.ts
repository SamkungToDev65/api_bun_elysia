import { Elysia, t } from "elysia";
import { UserSchema, UserCreateSchema, ErrorResponseSchema } from "./types";

export function usersRoutes(app: Elysia, prisma: any) {
  return app
    // Get or Create User by person_code
    .get(
      "/bank-api/users/:person_code",
      async ({ params: { person_code }, set }) => {
        try {
          let user = await prisma.user.findUnique({
            where: { person_code },
            select: {
              id: true,
              person_code: true,
              fullname: true,
              bank_name: true,
              bank_account: true,
              balance: true,
              createdAt: true,
            },
          });

          if (!user) {
            // Auto-create user if not exists
            user = await prisma.user.create({
              data: {
                person_code,
                balance: 0,
              },
              select: {
                id: true,
                person_code: true,
                fullname: true,
                bank_name: true,
                bank_account: true,
                balance: true,
                createdAt: true,
              },
            });
          }

          return {
            id: user.id,
            person_code: user.person_code,
            fullname: user.fullname,
            bank_name: user.bank_name,
            bank_account: user.bank_account,
            balance: Number(user.balance),
            createdAt: user.createdAt.toISOString(),
          };
        } catch (error) {
          set.status = 500;
          return {
            message: "Failed to fetch user",
            error: String(error),
          };
        }
      },
      {
        response: {
          200: UserSchema,
          500: ErrorResponseSchema,
        },
      }
    )

    // Create New User
    .post(
      "/bank-api/users",
      async ({ body, set }) => {
        try {
          // Check if user already exists
          const existing = await prisma.user.findUnique({
            where: { person_code: body.person_code },
          });

          if (existing) {
            set.status = 409;
            return {
              message: "User already exists",
              error: `User with person_code ${body.person_code} already exists`,
            };
          }

          const user = await prisma.user.create({
            data: {
              person_code: body.person_code,
              fullname: body.fullname,
              bank_name: body.bank_name,
              bank_account: body.bank_account,
              balance: 0,
            },
            select: {
              id: true,
              person_code: true,
              fullname: true,
              bank_name: true,
              bank_account: true,
              balance: true,
              createdAt: true,
            },
          });

          set.status = 201;
          return {
            id: user.id,
            person_code: user.person_code,
            fullname: user.fullname,
            bank_name: user.bank_name,
            bank_account: user.bank_account,
            balance: Number(user.balance),
            createdAt: user.createdAt.toISOString(),
          };
        } catch (error) {
          set.status = 500;
          return {
            message: "Failed to create user",
            error: String(error),
          };
        }
      },
      {
        body: UserCreateSchema,
        response: {
          201: UserSchema,
          500: ErrorResponseSchema,
        },
      }
    )

    // Get User Balance
    .get(
      "/bank-api/users/:person_code/balance",
      async ({ params: { person_code }, set }) => {
        try {
          const user = await prisma.user.findUnique({
            where: { person_code },
            select: { id: true, balance: true },
          });

          if (!user) {
            set.status = 404;
            return {
              message: "User not found",
              error: `User with person_code ${person_code} not found`,
            };
          }

          return {
            person_code,
            balance: Number(user.balance),
          };
        } catch (error) {
          set.status = 500;
          return {
            message: "Failed to fetch balance",
            error: String(error),
          };
        }
      },
      {
        response: {
          200: t.Object({
            person_code: t.String(),
            balance: t.Number(),
          }),
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      }
    )

    // Update User Balance
    .patch(
      "/bank-api/users/:person_code/balance",
      async ({ params: { person_code }, body, set }) => {
        try {
          const user = await prisma.user.findUnique({
            where: { person_code },
            select: { id: true, balance: true },
          });

          if (!user) {
            set.status = 404;
            return {
              message: "User not found",
              error: `User with person_code ${person_code} not found`,
            };
          }

          const newBalance = Number(user.balance) + body.amount;

          const updated = await prisma.user.update({
            where: { person_code },
            data: { balance: newBalance },
            select: {
              id: true,
              person_code: true,
              balance: true,
              createdAt: true,
            },
          });

          return {
            person_code: updated.person_code,
            balance: Number(updated.balance),
            message: `Balance updated by ${body.amount}`,
          };
        } catch (error) {
          set.status = 500;
          return {
            message: "Failed to update balance",
            error: String(error),
          };
        }
      },
      {
        body: t.Object({ amount: t.Number() }),
        response: {
          200: t.Object({
            person_code: t.String(),
            balance: t.Number(),
            message: t.String(),
          }),
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      }
    )

    // Update User Profile
    .patch(
      "/bank-api/users/:person_code",
      async ({ params: { person_code }, body, set }) => {
        try {
          const user = await prisma.user.update({
            where: { person_code },
            data: {
              fullname: body.fullname,
              bank_name: body.bank_name,
              bank_account: body.bank_account,
            },
            select: {
              id: true,
              person_code: true,
              fullname: true,
              bank_name: true,
              bank_account: true,
              balance: true,
              createdAt: true,
            },
          });

          return {
            id: user.id,
            person_code: user.person_code,
            fullname: user.fullname,
            bank_name: user.bank_name,
            bank_account: user.bank_account,
            balance: Number(user.balance),
            createdAt: user.createdAt.toISOString(),
          };
        } catch (error) {
          set.status = 500;
          return {
            message: "Failed to update user",
            error: String(error),
          };
        }
      },
      {
        body: t.Partial(
          t.Object({
            fullname: t.String(),
            bank_name: t.String(),
            bank_account: t.String(),
          })
        ),
        response: {
          200: UserSchema,
          500: ErrorResponseSchema,
        },
      }
    );
}
