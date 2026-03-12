import { Elysia, t } from 'elysia';
import { PrismaClient } from '../generated/prisma'; // ปรับ path ตามโฟลเดอร์จริง
import { 
  TransactionPlainInputCreate, 
  TransactionPlain,
} from '../../generated/prismabox/Transaction'; // Path ที่ prismabox เจนไว้

import { CommitmentPlainInputCreate, CommitmentPlain } from '../../generated/prismabox/Commitment';
import { UserPlain } from '../../generated/prismabox/User';

const prisma = new PrismaClient();

const bagApi = new Elysia({ prefix: '/bag-api' })
  
  // 1. ดึงข้อมูล User และยอดเงินคงเหลือ
  .get('/users/:person_code', async ({ params: { person_code }, set }) => {
    const user = await prisma.user.findUnique({
      where: { person_code },
      include: { _count: { select: { transactions: true } } }
    });
    if (!user) {
      set.status = 404;
      return { message: 'User not found' };
    }
    return user;
  })

  // 2. ดึงรายการธุรกรรมทั้งหมดของผู้ใช้
  .get('/transactions', async ({ query: { personCode } }) => {
    return await prisma.transaction.findMany({
      where: { user: { person_code: personCode as string } },
      orderBy: { date: 'desc' },
      take: 50
    });
  })

  // 3. บันทึกธุรกรรม (รายรับ-รายจ่าย) + อัปเดต Balance อัตโนมัติ
  .post('/transactions', async ({ body, set }) => {
    const { person_code, amount, type, ...rest } = body as any;

    try {
      // ใช้ Prisma Transaction เพื่อความปลอดภัยของข้อมูล
      return await prisma.$transaction(async (tx) => {
        // หา User ก่อน
        const user = await tx.user.findUnique({ where: { person_code } });
        if (!user) throw new Error('User not found');

        // 1. สร้าง Transaction
        const newTransaction = await tx.transaction.create({
          data: {
            ...rest,
            amount,
            type,
            userId: user.id
          }
        });

        // 2. อัปเดต Balance ใน User
        const diff = type === 'income' ? amount : -amount;
        await tx.user.update({
          where: { id: user.id },
          data: { balance: { increment: diff } }
        });

        // 3. ถ้ามีการผูกกับ Commitment (การผ่อน/ชำระหนี้)
        if (rest.commitmentId) {
          await tx.commitment.update({
            where: { id: rest.commitmentId },
            data: { currentAmount: { increment: amount } }
          });
        }

        return { success: true, data: newTransaction };
      });
    } catch (err: any) {
      set.status = 400;
      return { success: false, message: err.message };
    }
  })

  // 4. ดึงรายการผ่อน/ยืม (Commitments)
  .get('/commitments', async ({ query: { personCode } }) => {
    return await prisma.commitment.findMany({
      where: { user: { person_code: personCode as string } },
      orderBy: { createdAt: 'desc' }
    });
  })

  // 5. สร้างรายการผ่อน/ยืม ใหม่
  .post('/commitments', async ({ body, set }) => {
    const { person_code, targetAmount, ...rest } = body as any;
    try {
      const user = await prisma.user.findUnique({ where: { person_code } });
      if (!user) throw new Error('User not found');

      return await prisma.commitment.create({
        data: {
          ...rest,
          targetAmount,
          userId: user.id
        }
      });
    } catch (err: any) {
      set.status = 400;
      return { message: err.message };
    }
  });

export default bagApi;