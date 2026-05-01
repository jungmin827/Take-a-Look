export interface Essay {
  id: string
  slug: string
  title: string
  excerpt: string
  coverImage: string
  alt: string
  content: string   // JSON string (Tiptap doc)
  date: string      // ISO string
  readingTime: string
  published: boolean
  tags: string[]
}
