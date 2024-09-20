import { CategoryType } from '@prisma/client'
import { z } from 'zod'
import { db } from '~/server/db' // 确保这个路径是正确的
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const ingestSettingsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async () => {
    return db.ingestSettings.findMany()
  }),

  getByType: protectedProcedure
    .input(z.nativeEnum(CategoryType))
    .query(async ({ input }) => {
      return db.ingestSettings.findFirst({
        where: { type: input },
      })
    }),

  create: protectedProcedure
    .input(
      z.object({
        type: z.nativeEnum(CategoryType),
        endpoint: z.string(),
        apiKey: z.string(),
        isEnabled: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      return db.ingestSettings.create({
        data: input,
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        endpoint: z.string().optional(),
        apiKey: z.string().optional(),
        isEnabled: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      return db.ingestSettings.update({
        where: { id },
        data,
      })
    }),

  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    return db.ingestSettings.delete({
      where: { id: input },
    })
  }),
})
