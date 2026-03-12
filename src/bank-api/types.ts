import { t } from "elysia";

// User Types
export const UserSchema = t.Object({
  id: t.String(),
  person_code: t.String(),
  fullname: t.Union([t.String(), t.Null()]),
  bank_name: t.Union([t.String(), t.Null()]),
  bank_account: t.Union([t.String(), t.Null()]),
  balance: t.Number(),
  createdAt: t.String(),
});

export const UserCreateSchema = t.Object({
  person_code: t.String(),
  fullname: t.Optional(t.String()),
  bank_name: t.Optional(t.String()),
  bank_account: t.Optional(t.String()),
});

// Transaction Types
export const TransactionSchema = t.Object({
  id: t.String(),
  amount: t.Number(),
  type: t.Union([t.Literal("income"), t.Literal("expense")]),
  category: t.String(),
  note: t.Union([t.String(), t.Null()]),
  date: t.String(),
  userId: t.String(),
  commitmentId: t.Union([t.String(), t.Null()]),
  createdAt: t.String(),
});

export const TransactionCreateSchema = t.Object({
  amount: t.Number(),
  type: t.Union([t.Literal("income"), t.Literal("expense")]),
  category: t.String(),
  note: t.Optional(t.String()),
  date: t.Optional(t.String()),
  commitmentId: t.Optional(t.String()),
});

export const TransactionUpdateSchema = t.Partial(
  t.Omit(TransactionCreateSchema, ["type"])
);

// Commitment Types
export const CommitmentSchema = t.Object({
  id: t.String(),
  title: t.String(),
  targetAmount: t.Number(),
  currentAmount: t.Number(),
  type: t.Union([t.Literal("lend"), t.Literal("installment")]),
  person: t.Union([t.String(), t.Null()]),
  category: t.String(),
  userId: t.String(),
  createdAt: t.String(),
});

export const CommitmentCreateSchema = t.Object({
  title: t.String(),
  targetAmount: t.Number(),
  type: t.Union([t.Literal("lend"), t.Literal("installment")]),
  person: t.Optional(t.String()),
  category: t.Optional(t.String({ default: "การยืม/ผ่อน" })),
});

export const CommitmentUpdateSchema = t.Partial(CommitmentCreateSchema);

// Response Types
export const ErrorResponseSchema = t.Object({
  message: t.String(),
  error: t.String(),
});

export const SuccessResponseSchema = t.Object({
  message: t.String(),
  data: t.Any(),
});
