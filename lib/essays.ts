import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Essay } from '@/types'

const contentDir = path.join(process.cwd(), 'content')

export function getAllEssays(): Essay[] {
  if (!fs.existsSync(contentDir)) return []

  const filenames = fs.readdirSync(contentDir).filter(f => f.endsWith('.mdx'))

  const essays = filenames.map(filename => {
    const filePath = path.join(contentDir, filename)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(fileContent)

    if (!data.slug) throw new Error(`Missing slug in ${filename}`)
    if (!data.coverImage) throw new Error(`Missing coverImage in ${filename}`)

    return data as Essay
  })

  return essays.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getAllSlugs(): string[] {
  return getAllEssays().map(e => e.slug)
}

export function getEssayBySlug(slug: string): Essay | undefined {
  return getAllEssays().find(e => e.slug === slug)
}
