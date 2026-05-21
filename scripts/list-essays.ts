import * as path from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') })
const prisma = new PrismaClient({ adapter })

async function main() {
  const essays = await prisma.essay.findMany({
    select: { id: true, slug: true, title: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  essays.forEach((e, i) => console.log(`${i + 1} | ${e.id} | ${e.title}`))
}

main().finally(() => prisma.$disconnect())
