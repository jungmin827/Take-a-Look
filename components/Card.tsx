import Image from 'next/image'
import Link from 'next/link'
import { Essay } from '@/types'
import TagChip from './TagChip'

interface Props {
  essay: Essay
}

export default function Card({ essay }: Props) {
  return (
    <Link href={`/${essay.slug}`} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={essay.coverImage}
          alt={essay.alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h2 className="text-white font-bold text-lg mb-2 leading-snug">
            {essay.title}
          </h2>
          <div className="flex flex-wrap gap-1">
            {essay.tags.map(tag => (
              <TagChip key={tag} tag={tag} variant="light" />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 px-0.5">
        <p className="text-xs text-gray-400">
          {essay.date} · {essay.readingTime}
        </p>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{essay.excerpt}</p>
      </div>
    </Link>
  )
}
