import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { useEffect } from 'react'

interface Props {
  content: string
  onChange: (json: string) => void
}

export default function Editor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: '/ 를 입력해 블록을 추가하세요...' }),
      Typography,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: content ? JSON.parse(content) : undefined,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-gray max-w-none min-h-[400px] outline-none p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()))
    },
  })

  useEffect(() => {
    if (!editor || !content) return
    const current = JSON.stringify(editor.getJSON())
    if (current !== content) {
      editor.commands.setContent(JSON.parse(content), { emitUpdate: false })
    }
  }, [content, editor])

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <EditorContent editor={editor} />
    </div>
  )
}
