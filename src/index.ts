import { Elysia, t } from 'elysia'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

import { PrismaClient } from '../generated/prisma/client'
import {
  ProductPlain,
  ProductPlainInputCreate,
  ProductPlainInputUpdate
} from '../generated/prismabox/Product'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

// แปลง Decimal เป็น number สำหรับ JSON response
const toResponse = (product: { id: string; name: string; detail: string; price: { toNumber: () => number } | null }) => ({
  id: product.id,
  name: product.name,
  detail: product.detail,
  price: product.price?.toNumber() ?? null
})

const app = new Elysia()

// CREATE - สร้างสินค้าใหม่
  .post(
    '/products',
    async ({ body }) => {
      const product = await prisma.product.create({ data: body })
      return toResponse(product)
    },
    {
      body: ProductPlainInputCreate,
      response: ProductPlain
    }
  )

// READ - ดึงสินค้าทั้งหมด
  .get(
    '/products',
    async () => {
      const products = await prisma.product.findMany()
      return products.map(toResponse)
    },
    {
      response: t.Array(ProductPlain)
    }
  )

// READ - ดึงสินค้าตาม ID
  .get(
    '/products/:id',
    async ({ params: { id }, status }) => {
      const product = await prisma.product.findUnique({ where: { id } })
      if (!product) return status(404, 'Product not found')
      return toResponse(product)
    },
    {
      response: {
        200: ProductPlain,
        404: t.String()
      }
    }
  )

// UPDATE - อัปเดตสินค้า
  .patch(
    '/products/:id',
    async ({ params: { id }, body, set }) => {
      try {
        const product = await prisma.product.update({
          where: { id },
          data: body
        })
        return toResponse(product)
      } catch {
        set.status = 404
        return 'Product not found'
      }
    },
    {
      body: ProductPlainInputUpdate,
      response: {
        200: ProductPlain,
        404: t.String()
      }
    }
  )

// DELETE - ลบสินค้า
  .delete(
    '/products/:id',
    async ({ params: { id }, set }) => {
      try {
        await prisma.product.delete({ where: { id } })
        return { message: 'Product deleted' }
      } catch {
        set.status = 404
        return { message: 'Product not found' }
      }
    },
    {
      response: t.Object({ message: t.String() })
    }
  )

// For Vercel: export as default
export default app

// For local dev: start server
if (import.meta.main || process.env.NODE_ENV !== 'production') {
  app.listen(3000)
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  )
}