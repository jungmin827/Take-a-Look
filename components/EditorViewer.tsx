import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Typography from '@tiptap/extension-typography'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

interface Props {
  content: string
}

export default function EditorViewer({ content }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Typography, Image, Link],
    content: content ? JSON.parse(content) : undefined,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'prose prose-gray max-w-none' },
    },
  })

  return <EditorContent editor={editor} />
}
