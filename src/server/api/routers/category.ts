// src/server/api/routers/category.ts
import { CategoryType } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const categoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.category.findMany()
  }),

  getByType: publicProcedure
    .input(z.object({ type: z.nativeEnum(CategoryType) }))
    .query(({ ctx, input }) => {
      return ctx.db.category.findMany({
        where: { type: input.type },
      })
    }),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input.id },
      })

      if (!category) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No category with id '${input.id}'`,
        })
      }

      return category
    }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.nativeEnum(CategoryType),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.category.create({
        data: input,
      })
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        type: z.nativeEnum(CategoryType),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.category.update({
        where: { id },
        data,
      })
    }),

  delete: publicProcedure.input(z.number()).mutation(({ ctx, input }) => {
    return ctx.db.category.delete({
      where: { id: input },
    })
  }),
})
