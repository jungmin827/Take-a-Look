import * as path from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') })
const prisma = new PrismaClient({ adapter })

// 중복 Qdrant 글 중 나중에 등록된 것 삭제
const DELETE_IDS = ['cmpfjkf6a00002o9kku4mu1f5']

async function main() {
  const deleted = await prisma.essay.deleteMany({
    where: { id: { in: DELETE_IDS } },
  })
  console.log(`${deleted.count}개 삭제 완료`)

  const remaining = await prisma.essay.count()
  console.log(`남은 에세이: ${remaining}개`)
}

main().finally(() => prisma.$disconnect())
