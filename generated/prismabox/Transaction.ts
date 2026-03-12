import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const TransactionPlain = t.Object(
  {
    id: t.String(),
    amount: t.Number(),
    type: t.String(),
    category: t.String(),
    note: __nullable__(t.String()),
    date: t.Date(),
    userId: t.String(),
    commitmentId: __nullable__(t.String()),
    createdAt: t.Date(),
  },
  { additionalProperties: false },
);

export const TransactionRelations = t.Object(
  {
    user: t.Object(
      {
        id: t.String(),
        person_code: t.String(),
        fullname: __nullable__(t.String()),
        bank_name: __nullable__(t.String()),
        bank_account: __nullable__(t.String()),
        balance: t.Number(),
        createdAt: t.Date(),
      },
      { additionalProperties: false },
    ),
    commitment: __nullable__(
      t.Object(
        {
          id: t.String(),
          title: t.String(),
          targetAmount: t.Number(),
          currentAmount: t.Number(),
          type: t.String(),
          person: __nullable__(t.String()),
          category: t.String(),
          userId: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export const TransactionPlainInputCreate = t.Object(
  {
    amount: t.Number(),
    type: t.String(),
    category: t.String(),
    note: t.Optional(__nullable__(t.String())),
    date: t.Optional(t.Date()),
  },
  { additionalProperties: false },
);

export const TransactionPlainInputUpdate = t.Object(
  {
    amount: t.Optional(t.Number()),
    type: t.Optional(t.String()),
    category: t.Optional(t.String()),
    note: t.Optional(__nullable__(t.String())),
    date: t.Optional(t.Date()),
  },
  { additionalProperties: false },
);

export const TransactionRelationsInputCreate = t.Object(
  {
    user: t.Object(
      {
        connect: t.Object(
          {
            id: t.String({ additionalProperties: false }),
          },
          { additionalProperties: false },
        ),
      },
      { additionalProperties: false },
    ),
    commitment: t.Optional(
      t.Object(
        {
          connect: t.Object(
            {
              id: t.String({ additionalProperties: false }),
            },
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export const TransactionRelationsInputUpdate = t.Partial(
  t.Object(
    {
      user: t.Object(
        {
          connect: t.Object(
            {
              id: t.String({ additionalProperties: false }),
            },
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
      commitment: t.Partial(
        t.Object(
          {
            connect: t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            disconnect: t.Boolean(),
          },
          { additionalProperties: false },
        ),
      ),
    },
    { additionalProperties: false },
  ),
);

export const TransactionWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          amount: t.Number(),
          type: t.String(),
          category: t.String(),
          note: t.String(),
          date: t.Date(),
          userId: t.String(),
          commitmentId: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Transaction" },
  ),
);

export const TransactionWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object({ id: t.String() }, { additionalProperties: false }),
          { additionalProperties: false },
        ),
        t.Union([t.Object({ id: t.String() })], {
          additionalProperties: false,
        }),
        t.Partial(
          t.Object({
            AND: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            NOT: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            OR: t.Array(Self, { additionalProperties: false }),
          }),
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object(
            {
              id: t.String(),
              amount: t.Number(),
              type: t.String(),
              category: t.String(),
              note: t.String(),
              date: t.Date(),
              userId: t.String(),
              commitmentId: t.String(),
              createdAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Transaction" },
);

export const TransactionSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      amount: t.Boolean(),
      type: t.Boolean(),
      category: t.Boolean(),
      note: t.Boolean(),
      date: t.Boolean(),
      userId: t.Boolean(),
      user: t.Boolean(),
      commitmentId: t.Boolean(),
      commitment: t.Boolean(),
      createdAt: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const TransactionInclude = t.Partial(
  t.Object(
    { user: t.Boolean(), commitment: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const TransactionOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      amount: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      type: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      category: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      note: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      date: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      commitmentId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Transaction = t.Composite(
  [TransactionPlain, TransactionRelations],
  { additionalProperties: false },
);

export const TransactionInputCreate = t.Composite(
  [TransactionPlainInputCreate, TransactionRelationsInputCreate],
  { additionalProperties: false },
);

export const TransactionInputUpdate = t.Composite(
  [TransactionPlainInputUpdate, TransactionRelationsInputUpdate],
  { additionalProperties: false },
);
