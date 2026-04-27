interface Props {
  tag: string
  variant?: 'default' | 'light'
}

export default function TagChip({ tag, variant = 'default' }: Props) {
  const base = 'text-xs px-2 py-0.5 rounded-full'
  const styles =
    variant === 'light'
      ? `${base} bg-white/20 text-white`
      : `${base} bg-gray-100 text-gray-600`

  return <span className={styles}>{tag}</span>
}
