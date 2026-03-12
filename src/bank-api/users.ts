import { Elysia, t } from "elysia";
import { UserSchema, ErrorResponseSchema } from "./types";

export function usersRoutes(app: Elysia, prisma: any) {
  return app
    // ดึงข้อมูล User หลักคนเดียว (ใช้แทนการ login)
    .get(
      "/bank-api/users/me",
      async ({ set }) => {
        try {
          // ดึง User คนแรกที่เจอในระบบ
          let user = await prisma.user.findFirst();

          // ถ้ายังไม่มี User เลย (รันครั้งแรก) ให้สร้างไว้ 1 คน
          if (!user) {
            user = await prisma.user.create({
              data: {
                person_code: "ADMIN-001",
                fullname: "Main Wallet",
                balance: 0,
              }
            });
          }

          return {
            id: user.id,
            person_code: user.person_code,
            fullname: user.fullname,
            bank_name: user.bank_name,
            bank_account: user.bank_account,
            balance: Number(user.balance), // แปลง Decimal เป็น Number
            createdAt: user.createdAt.toISOString(),
          };
        } catch (error) {
          set.status = 500;
          return {
            message: "Failed to fetch main user",
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
    );
}