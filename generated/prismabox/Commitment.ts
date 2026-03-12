import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const CommitmentPlain = t.Object(
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
);

export const CommitmentRelations = t.Object(
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
    transactions: t.Array(
      t.Object(
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
      ),
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const CommitmentPlainInputCreate = t.Object(
  {
    title: t.String(),
    targetAmount: t.Number(),
    currentAmount: t.Optional(t.Number()),
    type: t.String(),
    person: t.Optional(__nullable__(t.String())),
    category: t.Optional(t.String()),
  },
  { additionalProperties: false },
);

export const CommitmentPlainInputUpdate = t.Object(
  {
    title: t.Optional(t.String()),
    targetAmount: t.Optional(t.Number()),
    currentAmount: t.Optional(t.Number()),
    type: t.Optional(t.String()),
    person: t.Optional(__nullable__(t.String())),
    category: t.Optional(t.String()),
  },
  { additionalProperties: false },
);

export const CommitmentRelationsInputCreate = t.Object(
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
    transactions: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export const CommitmentRelationsInputUpdate = t.Partial(
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
      transactions: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
          },
          { additionalProperties: false },
        ),
      ),
    },
    { additionalProperties: false },
  ),
);

export const CommitmentWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          title: t.String(),
          targetAmount: t.Number(),
          currentAmount: t.Number(),
          type: t.String(),
          person: t.String(),
          category: t.String(),
          userId: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Commitment" },
  ),
);

export const CommitmentWhereUnique = t.Recursive(
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
              title: t.String(),
              targetAmount: t.Number(),
              currentAmount: t.Number(),
              type: t.String(),
              person: t.String(),
              category: t.String(),
              userId: t.String(),
              createdAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Commitment" },
);

export const CommitmentSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      title: t.Boolean(),
      targetAmount: t.Boolean(),
      currentAmount: t.Boolean(),
      type: t.Boolean(),
      person: t.Boolean(),
      category: t.Boolean(),
      userId: t.Boolean(),
      user: t.Boolean(),
      transactions: t.Boolean(),
      createdAt: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const CommitmentInclude = t.Partial(
  t.Object(
    { user: t.Boolean(), transactions: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const CommitmentOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      title: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      targetAmount: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      currentAmount: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      type: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      person: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      category: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Commitment = t.Composite([CommitmentPlain, CommitmentRelations], {
  additionalProperties: false,
});

export const CommitmentInputCreate = t.Composite(
  [CommitmentPlainInputCreate, CommitmentRelationsInputCreate],
  { additionalProperties: false },
);

export const CommitmentInputUpdate = t.Composite(
  [CommitmentPlainInputUpdate, CommitmentRelationsInputUpdate],
  { additionalProperties: false },
);
