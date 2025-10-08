// src/lib/prisma.ts
import { PrismaClient } from "../generated/prisma"; // or "@prisma/client" if you switch back
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

